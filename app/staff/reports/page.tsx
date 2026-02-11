"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Battery, RefreshCw, DollarSign, AlertTriangle, Loader2 } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { StaffHeader } from "@/components/staff-header"

interface DashboardStats {
  totalTransactions: number
  transactionGrowth: number
  totalRevenue: number
  revenueGrowth: number
  totalBatteries: number
  damagedBatteries: number
}

interface TransactionByDay {
  day: string
  count: number
}

interface RevenueByDay {
  day: string
  revenue: number
}

interface BatteryStatus {
  full: number
  charging: number
  maintenance: number
  damaged: number
}

interface DashboardSummary {
  stats: DashboardStats
  transactionsByDay: TransactionByDay[]
  revenueByDay: RevenueByDay[]
  batteryStatus: BatteryStatus
}

export default function ReportsPage() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("http://localhost:8080/api/transactions/dashboard/summary")
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: DashboardSummary = await response.json()
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
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Transform data for charts
  const getChartData = () => {
    if (!dashboardData) return { transactionData: [], batteryStatusData: [] }

    const transactionData = dashboardData.transactionsByDay.map(t => {
      const revenue = dashboardData.revenueByDay.find(r => r.day === t.day)?.revenue || 0
      return {
        name: t.day,
        transactions: t.count,
        revenue: revenue
      }
    })

    const batteryStatusData = [
      { name: "Full", value: dashboardData.batteryStatus.full, color: "#22c55e" },
      { name: "Charging", value: dashboardData.batteryStatus.charging, color: "#3b82f6" },
      { name: "Maintenance", value: dashboardData.batteryStatus.maintenance, color: "#f97316" },
      { name: "Damaged", value: dashboardData.batteryStatus.damaged, color: "#ef4444" },
    ]

    return { transactionData, batteryStatusData }
  }

  const { transactionData, batteryStatusData } = getChartData()

  const totalRevenue = transactionData.reduce((sum, item) => sum + item.revenue, 0)
  const totalTransactions = dashboardData?.stats.totalTransactions || 0
  const totalBatteries = dashboardData?.stats.totalBatteries || 0
  const damagedBatteries = dashboardData?.stats.damagedBatteries || 0

  const exportReport = () => {
    alert("Export functionality will be implemented soon!")
  }

  if (loading) {
    return (
      <>
        <StaffHeader title="Statistics & Reports" />
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
        <StaffHeader title="Statistics & Reports" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold mb-2">Error loading data</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} className="bg-[#7241CE] hover:bg-[#5a33a6]">
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
        <StaffHeader title="Statistics & Reports" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </>
    )
  }

  return (
    <>
      <StaffHeader title="Statistics & Reports" />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Statistics & Reports</h1>
              <p className="text-gray-600 mt-1">Comprehensive analysis of operations data</p>
            </div>
            <Button onClick={fetchDashboardData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 border-2 border-[#7241CE]/20 bg-[#7241CE]/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalTransactions}</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {dashboardData.stats.transactionGrowth > 0 ? "+" : ""}
                    {dashboardData.stats.transactionGrowth.toFixed(1)}% vs last week
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#7241CE]/20 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-[#7241CE]" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Revenue</p>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    {formatCurrency(dashboardData.stats.totalRevenue)}
                  </p>
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {dashboardData.stats.revenueGrowth > 0 ? "+" : ""}
                    {dashboardData.stats.revenueGrowth.toFixed(1)}% vs last week
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Batteries</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{totalBatteries}</p>
                  <p className="text-sm text-blue-600 mt-1">In inventory</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <Battery className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-red-200 bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Damaged Batteries</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">{damagedBatteries}</p>
                  <p className="text-sm text-red-600 mt-1">Needs attention</p>
                </div>
                <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-700" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Transactions by Day</h3>
                  <p className="text-sm text-gray-600">Number of transactions this week</p>
                </div>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="transactions" fill="#7241CE" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Battery Status Pie Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Battery Status</h3>
                  <p className="text-sm text-gray-600">Distribution by status</p>
                </div>
                <Battery className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={batteryStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {batteryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue by Day</h3>
                <p className="text-sm text-gray-600">Revenue chart for the week</p>
              </div>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Summary Info */}
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Summary</h3>
              <p className="text-sm text-gray-600">Overview of this week's performance</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-l-4 border-[#7241CE] pl-4">
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">Average Transaction</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalTransactions > 0 ? totalRevenue / totalTransactions : 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}