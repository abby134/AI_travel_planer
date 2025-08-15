'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

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

export default function SharedPlanPage() {
  const params = useParams()
  const [plan, setPlan] = useState<TravelPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/shared/${params.id}`)
        if (response.ok) {
          const planData = await response.json()
          setPlan(planData)
        } else {
          setError('计划未找到或未公开分享')
        }
      } catch (error) {
        console.error('Error fetching shared plan:', error)
        setError('加载计划失败')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [params.id])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载旅行计划中...</div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error || '计划未找到'}</div>
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            创建您自己的旅行计划
          </Link>
        </div>
      </div>
    )
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
              <span className="text-gray-700">分享计划: {plan.destination}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                创建您的计划
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.destination}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
                  <span>•</span>
                  <span>{getModeLabel(plan.mode)}</span>
                  <span>•</span>
                  <span>{plan.attractions.length} 个景点</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                📤 共享计划
              </div>
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

          <div className="p-6 bg-gray-50 border-t">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                喜欢这个行程吗？使用 AI 旅游规划师创建您自己的个性化旅行计划！
              </p>
              <Link
                href="/"
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 inline-flex items-center"
              >
                开始规划您的旅程
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}