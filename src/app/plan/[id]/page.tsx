'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
})

interface Attraction {
  id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  order: number
  visitTime: string | null
  duration: string | null
}

interface TravelPlan {
  id: string
  destination: string
  startDate: string
  endDate: string
  mode: string
  attractions: Attraction[]
  createdAt: string
}

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [plan, setPlan] = useState<TravelPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    const fetchPlan = async () => {
      if (!session) {
        router.push('/auth/signin')
        return
      }

      try {
        const response = await fetch(`/api/travel-plans/${params.id}`)
        if (response.ok) {
          const planData = await response.json()
          setPlan(planData)
        } else {
          setError('Plan not found')
        }
      } catch (error) {
        console.error('Error fetching plan:', error)
        setError('Failed to load plan')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [params.id, session, router])

  const exportToPDF = async () => {
    if (!plan) return
    
    setIsExporting(true)
    try {
      const element = document.getElementById('plan-content')
      if (!element) {
        console.error('Plan content element not found')
        alert('无法找到要导出的内容')
        return
      }

      console.log('开始生成PDF...')
      
      // 强制使用rgb颜色，避免lab()函数问题
      const tempStyles = document.createElement('style')
      tempStyles.innerHTML = `
        * {
          color: rgb(17, 24, 39) !important;
          background-color: rgb(255, 255, 255) !important;
          border-color: rgb(229, 231, 235) !important;
        }
        .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
        .bg-indigo-600 { background-color: rgb(79, 70, 229) !important; color: white !important; }
        .text-gray-600 { color: rgb(75, 85, 99) !important; }
        .text-gray-500 { color: rgb(107, 114, 128) !important; }
        .text-gray-900 { color: rgb(17, 24, 39) !important; }
        .text-white { color: rgb(255, 255, 255) !important; }
        .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
        .shadow-lg { box-shadow: none !important; }
        .rounded-lg { border-radius: 8px !important; }
        .rounded-full { border-radius: 50% !important; }
      `
      document.head.appendChild(tempStyles)
      
      // 等待样式应用和地图完全加载
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 等待地图瓦片完全加载
      const mapContainer = element.querySelector('.leaflet-container')
      
      if (mapContainer) {
        try {
          console.log('开始等待地图瓦片加载完成...')
          
          // 等待更长时间确保瓦片加载
          await new Promise(resolve => setTimeout(resolve, 5000))
          
          // 检查瓦片是否加载完成
          const tileImages = mapContainer.querySelectorAll('.leaflet-tile')
          console.log(`找到 ${tileImages.length} 个瓦片`)
          
          // 等待所有瓦片图片加载完成
          const tilePromises = Array.from(tileImages).map((img: any) => {
            return new Promise((resolve) => {
              if (img.complete) {
                resolve(true)
              } else {
                img.onload = () => resolve(true)
                img.onerror = () => resolve(false)
                // 超时处理
                setTimeout(() => resolve(false), 3000)
              }
            })
          })
          
          await Promise.all(tilePromises)
          console.log('所有瓦片加载完成，开始生成静态地图...')
          
          // 生成静态地图URL作为备选方案
          const bounds = plan.attractions.reduce((acc, attraction) => {
            return {
              minLat: Math.min(acc.minLat, attraction.latitude),
              maxLat: Math.max(acc.maxLat, attraction.latitude),
              minLng: Math.min(acc.minLng, attraction.longitude),
              maxLng: Math.max(acc.maxLng, attraction.longitude)
            }
          }, {
            minLat: plan.attractions[0].latitude,
            maxLat: plan.attractions[0].latitude,
            minLng: plan.attractions[0].longitude,
            maxLng: plan.attractions[0].longitude
          })
          
          // 计算地图中心和缩放级别
          const centerLat = (bounds.minLat + bounds.maxLat) / 2
          const centerLng = (bounds.minLng + bounds.maxLng) / 2
          const zoom = 12
          
          // 创建带有景点位置信息的可视化地图替代方案
          const attractionsList = plan.attractions.map((attraction, index) => {
            return `
              <div style="display: flex; align-items: center; padding: 10px; margin: 6px 0; background: white; border-radius: 8px; border-left: 4px solid #4f46e5; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="width: 28px; height: 28px; background: #4f46e5; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; margin-right: 12px;">
                  ${index + 1}
                </div>
                <div style="flex-1;">
                  <div style="font-weight: 600; color: #1f2937; font-size: 15px; margin-bottom: 4px;">${attraction.name}</div>
                  <div style="font-size: 12px; color: #6b7280; display: flex; flex-wrap: gap: 12px;">
                    <span>📍 坐标: ${attraction.latitude.toFixed(4)}, ${attraction.longitude.toFixed(4)}</span>
                    ${attraction.visitTime ? `<span>🕒 ${attraction.visitTime}</span>` : ''}
                    ${attraction.duration ? `<span>⏱️ ${attraction.duration}</span>` : ''}
                  </div>
                </div>
              </div>
            `
          }).join('')
          
          console.log('生成景点位置列表用于PDF')
          
          // 用景点位置列表替换地图容器
          if (mapContainer.parentElement) {
            mapContainer.parentElement.innerHTML = `
              <div style="height: 400px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; overflow-y: auto;">
                <div style="text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                  <div style="font-size: 20px; margin-bottom: 4px;">🗺️</div>
                  <div style="font-size: 16px; font-weight: 600; color: #374151;">景点位置信息</div>
                  <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">共 ${plan.attractions.length} 个景点</div>
                </div>
                <div style="max-height: 300px; overflow-y: auto;">
                  ${attractionsList}
                </div>
              </div>
            `
          }
          
        } catch (error) {
          console.error('地图处理失败:', error)
          // 失败时使用景点列表
          if (mapContainer && mapContainer.parentElement) {
            const attractionsList = plan.attractions.map((attraction, index) => 
              `${index + 1}. ${attraction.name}${attraction.visitTime ? ` (${attraction.visitTime})` : ''}`
            ).join('<br>')
            
            mapContainer.parentElement.innerHTML = `
              <div style="height: 400px; background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 8px; padding: 20px; overflow-y: auto;">
                <div style="text-align: center; margin-bottom: 16px;">
                  <div style="font-size: 24px; margin-bottom: 8px;">📍</div>
                  <div style="font-size: 16px; font-weight: 600; color: #374151;">行程路线</div>
                </div>
                <div style="font-size: 14px; line-height: 1.6; color: #6b7280;">
                  ${attractionsList}
                </div>
              </div>
            `
          }
        }
      }
      
      // 改进的html2canvas配置
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // 忽略可能有问题的元素，但保留地图
          return element.tagName === 'SCRIPT' || 
                 element.classList.contains('leaflet-control-container')
        }
      })
      
      // 清理临时样式
      document.head.removeChild(tempStyles)
      
      console.log('Canvas生成完成，尺寸:', canvas.width, 'x', canvas.height)
      
      const imgData = canvas.toDataURL('image/jpeg', 0.8) // 使用JPEG格式压缩
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const margin = 10 // 页边距
      const availableWidth = pdfWidth - (margin * 2)
      const availableHeight = pdfHeight - (margin * 2)
      
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight)
      
      const scaledWidth = imgWidth * ratio
      const scaledHeight = imgHeight * ratio
      const imgX = (pdfWidth - scaledWidth) / 2
      const imgY = margin

      // 如果内容太高，分页处理
      if (scaledHeight > availableHeight) {
        const pageCount = Math.ceil(scaledHeight / availableHeight)
        
        for (let i = 0; i < pageCount; i++) {
          if (i > 0) {
            pdf.addPage()
          }
          
          const sourceY = (imgHeight / pageCount) * i
          const sourceHeight = imgHeight / pageCount
          
          // 创建每页的canvas
          const pageCanvas = document.createElement('canvas')
          const pageCtx = pageCanvas.getContext('2d')
          pageCanvas.width = imgWidth
          pageCanvas.height = sourceHeight
          
          if (pageCtx) {
            pageCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight)
            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.8)
            pdf.addImage(pageImgData, 'JPEG', imgX, imgY, scaledWidth, availableHeight)
          }
        }
      } else {
        pdf.addImage(imgData, 'JPEG', imgX, imgY, scaledWidth, scaledHeight)
      }

      console.log('PDF生成完成，开始下载...')
      const fileName = `${plan.destination}-旅行计划-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      console.log('PDF下载成功')
      alert('PDF导出成功！')
    } catch (error) {
      console.error('PDF导出错误详情:', error)
      alert(`PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    if (!plan) return
    
    try {
      const response = await fetch(`/api/travel-plans/${plan.id}/share`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const { shareUrl } = await response.json()
        setShareUrl(shareUrl)
        setShowShareModal(true)
      } else {
        alert('Failed to generate share link')
      }
    } catch (error) {
      console.error('Error generating share link:', error)
      alert('Failed to generate share link')
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your travel plan...</div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error || 'Plan not found'}</div>
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'COMMANDO': return '特种兵模式'
      case 'NORMAL': return '平衡模式'
      case 'LEISURE': return '悠闲模式'
      default: return mode
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-gray-900">
                AI 旅游规划师
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700">{plan.destination}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/history" className="text-gray-700 hover:text-gray-900">
                我的计划
              </Link>
              <button
                onClick={handleShare}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                分享
              </button>
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? '导出中...' : '保存为PDF'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div id="plan-content" className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.destination}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
              <span>•</span>
              <span>{getModeLabel(plan.mode)} Style</span>
              <span>•</span>
              <span>{plan.attractions.length} 个景点</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">行程安排</h2>
              <div className="space-y-4">
                {plan.attractions.map((attraction, index) => (
                  <div key={attraction.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {attraction.order}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{attraction.name}</h3>
                        {attraction.description && (
                          <p className="text-gray-600 text-sm mt-1">{attraction.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                          {attraction.visitTime && <span>{attraction.visitTime}</span>}
                          {attraction.duration && <span>游览时长: {attraction.duration}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">地图视图</h2>
              <MapDisplay attractions={plan.attractions} />
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">分享您的旅行计划</h3>
            <p className="text-gray-600 mb-4">任何人都可以通过此链接查看您的旅行计划：</p>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
              >
                复制
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}