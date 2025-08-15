'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [mode, setMode] = useState<'COMMANDO' | 'NORMAL' | 'LEISURE'>('NORMAL')
  const [preferences, setPreferences] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handlePlanGeneration = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!destination || !startDate || !endDate) {
      alert('Please fill in all fields')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/travel-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          mode,
          preferences,
        }),
      })

      if (response.ok) {
        const plan = await response.json()
        router.push(`/plan/${plan.id}`)
      } else {
        throw new Error('Failed to generate plan')
      }
    } catch (error) {
      console.error('Error generating plan:', error)
      alert('Failed to generate travel plan. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const modeDescriptions = {
    COMMANDO: '高强度 - 尽可能多的景点安排',
    NORMAL: '平衡节奏 - 观光和休息相结合',
    LEISURE: '悠闲节奏 - 注重体验和舒适度'
  }

  const preferenceOptions = [
    { id: 'nature', label: '自然风光', icon: '🌿' },
    { id: 'history', label: '历史文化', icon: '🏛️' },
    { id: 'modern', label: '现代建筑', icon: '🏙️' },
    { id: 'museum', label: '博物馆', icon: '🎨' },
    { id: 'food', label: '美食体验', icon: '🍜' },
    { id: 'shopping', label: '购物娱乐', icon: '🛍️' },
    { id: 'nightlife', label: '夜生活', icon: '🌃' },
    { id: 'temple', label: '宗教建筑', icon: '⛩️' },
    { id: 'park', label: '公园游乐', icon: '🎢' },
    { id: 'local', label: '本地体验', icon: '🏘️' }
  ]

  const handlePreferenceToggle = (preferenceId: string) => {
    setPreferences(prev => 
      prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    )
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI 旅游规划师</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <Link href="/history" className="text-gray-700 hover:text-gray-900">
                    我的计划
                  </Link>
                  <span className="text-gray-700">欢迎, {session.user?.name || session.user?.email}</span>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <div className="space-x-2">
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            用 AI 规划你的完美旅程
          </h2>
          <p className="text-xl text-gray-600">
            获取根据你的偏好定制的个性化旅行行程
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                目的地
              </label>
              <input
                type="text"
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="例如：北京, 东京, 巴黎"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  开始日期
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  结束日期
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              旅行风格
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['COMMANDO', 'NORMAL', 'LEISURE'] as const).map((modeOption) => (
                <label key={modeOption} className="cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value={modeOption}
                    checked={mode === modeOption}
                    onChange={(e) => setMode(e.target.value as typeof mode)}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-colors ${
                    mode === modeOption 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-semibold text-gray-900 mb-2">
                      {modeOption === 'COMMANDO' ? '特种兵' : modeOption === 'NORMAL' ? '平衡' : '悠闲'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {modeDescriptions[modeOption]}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              兴趣偏好 (可多选)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {preferenceOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handlePreferenceToggle(option.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    preferences.includes(option.id)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-xl mb-1">{option.icon}</div>
                  <div className="font-medium">{option.label}</div>
                </button>
              ))}
            </div>
            {preferences.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                已选择: {preferences.map(id => 
                  preferenceOptions.find(opt => opt.id === id)?.label
                ).join(', ')}
              </div>
            )}
          </div>

          <button
            onClick={handlePlanGeneration}
            disabled={isGenerating || !destination || !startDate || !endDate}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? '正在生成你的完美行程...' : '生成旅行计划'}
          </button>

          {!session && (
            <p className="text-center text-gray-600 mt-4">
              <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
                登录
              </Link>{' '}
              以保存和访问你的旅行计划
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
