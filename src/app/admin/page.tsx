'use client'

import { useEffect, useState } from 'react'

interface ProductionData {
  apartment_name: string
  total_chapatis: number
}

export default function AdminDashboardPage() {
  const [productionData, setProductionData] = useState<ProductionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProductionData = async () => {
      try {
        const response = await fetch('/api/production/today')
        if (!response.ok) {
          throw new Error('Failed to fetch production data')
        }
        const data = await response.json()
        setProductionData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProductionData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          <div className="text-center">Loading production data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Today's Chapati Production Forecast</h2>

        {productionData.length === 0 ? (
          <div className="text-center text-gray-500">No production data available for today.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productionData.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.apartment_name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Chapatis:</span>
                    <span className="font-medium text-green-600">{item.total_chapatis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Slot:</span>
                    <span className="font-medium text-blue-600">6:00 PM - 8:00 PM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {productionData.reduce((sum, item) => sum + item.total_chapatis, 0)}
              </div>
              <div className="text-gray-600">Total Chapatis Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{productionData.length}</div>
              <div className="text-gray-600">Apartments Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {productionData.length > 0 ? Math.round(productionData.reduce((sum, item) => sum + item.total_chapatis, 0) / productionData.length) : 0}
              </div>
              <div className="text-gray-600">Avg per Apartment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}