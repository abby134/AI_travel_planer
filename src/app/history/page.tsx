'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TravelPlan {
  id: string
  destination: string
  startDate: string
  endDate: string
  mode: string
  status: string
  createdAt: string
  attractions: {
    id: string
    name: string
  }[]
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plans, setPlans] = useState<TravelPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/travel-plans')
        if (response.ok) {
          const plansData = await response.json()
          setPlans(plansData)
        } else {
          setError('Failed to fetch plans')
        }
      } catch (error) {
        console.error('Error fetching plans:', error)
        setError('Failed to fetch plans')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [session, status, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'COMMANDO': return 'Commando'
      case 'NORMAL': return 'Balanced'
      case 'LEISURE': return 'Leisure'
      default: return mode
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'COMMANDO': return 'bg-red-100 text-red-800'
      case 'NORMAL': return 'bg-blue-100 text-blue-800'
      case 'LEISURE': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            Back to Home
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
                AI Travel Planner
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700">My Plans</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Create New Plan
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Travel Plans</h1>
          <p className="text-gray-600 mt-2">
            {plans.length === 0 
              ? "You haven't created any travel plans yet." 
              : `You have ${plans.length} travel plan${plans.length === 1 ? '' : 's'}.`
            }
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No travel plans yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first AI-powered travel itinerary.</p>
            <Link
              href="/"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 inline-flex items-center"
            >
              Create Your First Plan
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/plan/${plan.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">
                      {plan.destination}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModeColor(plan.mode)}`}>
                      {getModeLabel(plan.mode)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{plan.attractions.length} attractions</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Created {formatDate(plan.createdAt)}
                  </div>

                  {plan.attractions.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">Top attractions:</div>
                      <div className="text-sm text-gray-700">
                        {plan.attractions.slice(0, 3).map(attraction => attraction.name).join(', ')}
                        {plan.attractions.length > 3 && '...'}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}