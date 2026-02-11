"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminHeader } from "@/components/admin-header"
import { MapPin, Battery, Users, TrendingUp, CheckCircle, RefreshCw, Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AdminDashboardStats {
  activeStations: number
  stationsGrowth: number
  totalBatteries: number
  avgBatterySOH: number
  activeUsers: number
  usersGrowth: number
  todaySwaps: number
  swapsGrowth: number
}

interface WeeklySwap {
  day: string
  swaps: number
}

interface DashboardData {
  stats: AdminDashboardStats
  weeklySwaps: WeeklySwap[]
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("http://localhost:8080/api/admin/dashboard/summary")
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: DashboardData = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <>
        <AdminHeader title="Dashboard Overview" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#7241CE] mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <AdminHeader title="Dashboard Overview" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-red-600 font-semibold mb-2">Error loading data</p>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <Button onClick={fetchDashboardData} className="bg-[#7241CE] hover:bg-[#5a33a6]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (!dashboardData) {
    return (
      <>
        <AdminHeader title="Dashboard Overview" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </>
    )
  }

  const { stats, weeklySwaps } = dashboardData

  return (
    <>
      <AdminHeader title="Dashboard Overview" />

      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          {/* Header with Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
              <p className="text-gray-600 mt-1">Real-time monitoring and statistics</p>
            </div>
            <Button onClick={fetchDashboardData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Stations</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.activeStations}</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.stationsGrowth} this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#7241ce]" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Batteries</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalBatteries.toLocaleString()}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{stats.avgBatterySOH.toFixed(1)}% avg SOH</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Battery className="w-6 h-6 text-[#A2F200]" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Users</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.activeUsers.toLocaleString()}
                  </h3>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    stats.usersGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {stats.usersGrowth > 0 ? "+" : ""}{stats.usersGrowth.toFixed(1)}% growth
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Today's Swaps</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.todaySwaps}</h3>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    stats.swapsGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {stats.swapsGrowth > 0 ? "+" : ""}{stats.swapsGrowth.toFixed(1)}% vs yesterday
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Weekly Swap Activity Chart - Full Width */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Weekly Swap Activity</h3>
                <p className="text-sm text-gray-600">Number of battery swaps this week</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#7241ce]">
                  {weeklySwaps.reduce((sum, day) => sum + day.swaps, 0)}
                </p>
                <p className="text-xs text-gray-500">Total this week</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={weeklySwaps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="swaps" fill="#7241ce" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Additional Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="border-l-4 border-[#7241ce] pl-4">
                <p className="text-sm text-gray-600">Weekly Average</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(weeklySwaps.reduce((sum, day) => sum + day.swaps, 0) / 7).toFixed(0)} swaps/day
                </p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600">Battery Utilization</p>
                <p className="text-2xl font-bold text-green-600">
                  {((stats.todaySwaps / stats.totalBatteries) * 100).toFixed(1)}%
                </p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">Users Per Station</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(stats.activeUsers / stats.activeStations).toFixed(0)}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}