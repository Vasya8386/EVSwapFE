"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Battery, AlertTriangle, TrendingDown, TrendingUp, Search, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminHeader } from "@/components/admin-header"

interface BatteryData {
  batteryID: number
  batteryName: string
  status: string
  quantity: number
  capacity: number
  model: string
  usageCount: number
  batteryType: string
  borrowStatus: string
  stationID: number
}

export default function BatteryManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sohFilter, setSOHFilter] = useState<string>("all")
  const [batteries, setBatteries] = useState<BatteryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatteries()
  }, [])

  const fetchBatteries = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/batteries')
      const data = await response.json()
      setBatteries(data)
    } catch (error) {
      console.error('Error fetching batteries:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSOH = (usageCount: number, capacity: number) => {
    if (capacity === 0) return 0
    return Math.max(0, Math.min(100, Math.round((1 - usageCount / (capacity * 10)) * 100)))
  }

  const getSOHBadge = (usageCount: number, capacity: number) => {
    const sohPercentage = calculateSOH(usageCount, capacity)
    if (sohPercentage >= 90) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Excellent</Badge>
    if (sohPercentage >= 80) return <Badge className="bg-lime-100 text-lime-800 hover:bg-lime-100">Good</Badge>
    if (sohPercentage >= 70) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Fair</Badge>
    if (sohPercentage >= 60) return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Poor</Badge>
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>
  }

  const filteredBatteries = batteries.filter((battery) => {
    const soh = calculateSOH(battery.usageCount, battery.capacity)
    const matchesSearch =
      battery.batteryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      battery.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      battery.stationID.toString().includes(searchQuery)

    const matchesStatus = statusFilter === "all" || battery.status.toLowerCase() === statusFilter.toLowerCase()

    const matchesSOH =
      sohFilter === "all" ||
      (sohFilter === "excellent" && soh >= 90) ||
      (sohFilter === "good" && soh >= 80 && soh < 90) ||
      (sohFilter === "fair" && soh >= 70 && soh < 80) ||
      (sohFilter === "poor" && soh >= 60 && soh < 70) ||
      (sohFilter === "critical" && soh < 60)

    return matchesSearch && matchesStatus && matchesSOH
  })

  const avgSOH = batteries.length > 0 
    ? Math.round(batteries.reduce((sum, b) => sum + calculateSOH(b.usageCount, b.capacity), 0) / batteries.length)
    : 0
  const criticalCount = batteries.filter((b) => calculateSOH(b.usageCount, b.capacity) < 60).length
  const avgCycles = batteries.length > 0
    ? Math.round(batteries.reduce((sum, b) => sum + b.usageCount, 0) / batteries.length)
    : 0
  const totalBatteries = batteries.reduce((sum, b) => sum + b.quantity, 0)

  return (
    <>
      <AdminHeader title="Battery Management" />

      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-500">Monitor battery health across your network</p>
            <Button className="bg-[#7241ce] text-white hover:bg-[#5d35a8] gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Batteries</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalBatteries}</h3>
                </div>
                <Battery className="w-8 h-8 text-[#7241ce]" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Average SOH</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{avgSOH}%</h3>
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    -2% this month
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-yellow-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Critical Batteries</p>
                  <h3 className="text-3xl font-bold text-red-600 mt-2">{criticalCount}</h3>
                  <p className="text-xs text-gray-500 mt-1">Below 60% SOH</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Avg. Usage Count</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{avgCycles}</h3>
                  <p className="text-xs text-gray-500 mt-1">usage per battery</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, model or station..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="empty">Empty</SelectItem>
                  <SelectItem value="charging">Charging</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sohFilter} onValueChange={setSOHFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by SOH" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SOH Ranges</SelectItem>
                  <SelectItem value="excellent">90-100%</SelectItem>
                  <SelectItem value="good">80-89%</SelectItem>
                  <SelectItem value="fair">70-79%</SelectItem>
                  <SelectItem value="poor">60-69%</SelectItem>
                  <SelectItem value="critical">&lt;60%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Battery Table */}
          <Card>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading batteries...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Battery Name</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Station ID</TableHead>
                      <TableHead>SOH</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage Count</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Borrow Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatteries.map((battery) => {
                      const soh = calculateSOH(battery.usageCount, battery.capacity)
                      return (
                        <TableRow key={battery.batteryID} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-sm">{battery.batteryName}</TableCell>
                          <TableCell className="text-sm">{battery.model}</TableCell>
                          <TableCell className="text-sm">{battery.batteryType}</TableCell>
                          <TableCell className="text-sm">Station {battery.stationID}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    soh >= 80 ? "bg-[#A2F200]" : soh >= 60 ? "bg-yellow-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${soh}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold">{soh}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                battery.status === "Full" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : battery.status === "Empty"
                                  ? "bg-red-100 text-red-800 hover:bg-red-100"
                                  : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              }
                            >
                              {battery.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{battery.usageCount}</TableCell>
                          <TableCell className="text-sm">{battery.capacity} kWh</TableCell>
                          <TableCell className="text-sm">{battery.quantity}</TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                battery.borrowStatus === "Available"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              }
                            >
                              {battery.borrowStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}