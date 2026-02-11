"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/admin-header"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Download, DollarSign, Zap, Users, Battery } from "lucide-react"

export default function ReportsAnalytics() {
  const [timeRange, setTimeRange] = useState("30days")
  const [reportType, setReportType] = useState("overview")

  // Revenue data
  const revenueData = [
    { month: "Jan", revenue: 450, swaps: 21, forecast: 480 },
    { month: "Feb", revenue: 520, swaps: 23, forecast: 510 },
    { month: "Mar", revenue: 480, swaps: 22, forecast: 530 },
    { month: "Apr", revenue: 610, swaps: 28, forecast: 560 },
    { month: "May", revenue: 550, swaps: 25, forecast: 620 },
    { month: "Jun", revenue: 670, swaps: 31, forecast: 680 },
    { month: "Jul", revenue: 730, swaps: 33, forecast: 720 },
  ]

  // Station performance
  const stationPerformance = [
    { name: "Station – District 1", swaps: 17, revenue: 1000, utilization: 92 },
    { name: "Station 1-Di An", swaps: 16, revenue: 500, utilization: 85 },
    { name: "Station 2-Di An", swaps: 6, revenue: 170, utilization: 78 },
    { name: "Station 3-Di An", swaps: 10, revenue: 200, utilization: 68 },
    { name: "Station – Thu Duc", swaps: 6, revenue: 130, utilization: 55 },
  ]

  // Peak hours data
  const peakHoursData = [
    { hour: "00:00", swaps: 12},
    { hour: "03:00", swaps: 5 },
    { hour: "06:00", swaps: 4 },
    { hour: "09:00", swaps: 12 },
    { hour: "12:00", swaps: 9 },
    { hour: "15:00", swaps: 8 },
    { hour: "18:00", swaps: 15 },
    { hour: "21:00", swaps: 7 },
  ]

  // User growth
  const userGrowthData = [
    { month: "Jan", users: 28, active: 21 },
    { month: "Feb", users: 30, active: 23 },
    { month: "Mar", users: 32, active: 25 },
    { month: "Apr", users: 36, active: 29 },
    { month: "May", users: 38, active: 31 },
    { month: "Jun", users: 42, active: 34 },
    { month: "Jul", users: 46, active: 38 },
  ]

  // Subscription distribution
  const subscriptionData = [
    { name: "Pay Per Use", value: 1250, color: "#7241ce" },
    { name: "Basic Monthly", value: 842, color: "#A2F200" },

  ]

  // Battery health distribution
  const batteryHealthData = [
    { range: "90-100%", count: 35, percentage: 26 },
    { range: "80-89%", count: 10, percentage: 36 },
    { range: "70-79%", count: 8, percentage: 22 },
    { range: "60-69%", count: 3, percentage: 12 },
    { range: "<60%", count: 1, percentage: 4 },
  ]

  const exportReport = () => {
    console.log("Exporting report for:", timeRange, reportType)
    // Implement CSV/PDF export logic
  }

  return (
    <>
      <AdminHeader title="Reports & Analytics" />

      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-500">Insights and forecasts for your business</p>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-[#7241ce] text-white hover:bg-[#5d35a8] gap-2" onClick={exportReport}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-100 text-green-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18%
                </Badge>
              </div>
              <p className="text-sm text-gray-500 font-medium">Monthly Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">$2,000</h3>
              <p className="text-xs text-gray-500 mt-1">vs $62,000 last month</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-[#A2F200]" />
                <Badge className="bg-green-100 text-green-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>
              <p className="text-sm text-gray-500 font-medium">Total Swaps</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">55</h3>
              <p className="text-xs text-gray-500 mt-1">vs 2,990 last month</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <Badge className="bg-green-100 text-green-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +10%
                </Badge>
              </div>
              <p className="text-sm text-gray-500 font-medium">Active Users</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">30</h3>
              <p className="text-xs text-gray-500 mt-1">out of 4,680 total</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Battery className="w-8 h-8 text-purple-600" />
                <Badge className="bg-red-100 text-red-800">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -2%
                </Badge>
              </div>
              <p className="text-sm text-gray-500 font-medium">Avg Battery SOH</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">84%</h3>
              <p className="text-xs text-gray-500 mt-1">vs 86% last month</p>
            </Card>
          </div>

          {/* Revenue & Forecast */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue & Forecast</h3>
                <p className="text-sm text-gray-500">Actual revenue vs forecasted growth</p>
              </div>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="swaps">Swaps</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7241ce" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7241ce" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A2F200" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A2F200" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7241ce"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  name="Actual Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="#A2F200"
                  fillOpacity={1}
                  fill="url(#colorForecast)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Forecast"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Station Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Stations</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stationPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} />
                  <Tooltip />
                  <Bar dataKey="swaps" fill="#7241ce" radius={[0, 8, 8, 0]} name="Total Swaps" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Peak Hours */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Usage Hours</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="swaps" stroke="#A2F200" strokeWidth={3} name="Swaps per Hour" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* User Growth */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Total Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Subscription Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Battery Health Report */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Battery Health Distribution</h3>
            <div className="space-y-4">
              {batteryHealthData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.range}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{item.count} batteries</span>
                      <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        item.percentage >= 25
                          ? "bg-green-500"
                          : item.percentage >= 15
                            ? "bg-[#A2F200]"
                            : item.percentage >= 10
                              ? "bg-yellow-500"
                              : "bg-red-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}