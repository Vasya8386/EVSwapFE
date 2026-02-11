"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LucideBattery, BatteryCharging, Wrench, Search, Loader2, AlertCircle } from "lucide-react"
import { StaffHeader } from "@/components/staff-header"

type BatteryStatus = "full" | "charging" | "maintenance"

interface BatteryType {
  id: string
  name: string
  model: string
  capacity: string
  status: BatteryStatus
  cycleCount: number
}

const API_BASE_URL = "http://localhost:8080/api/batteries"

export default function InventoryPage() {
  // State cho data từ API
  const [batteries, setBatteries] = useState<BatteryType[]>([])
  const [fullCount, setFullCount] = useState<number>(0)
  const [chargingCount, setChargingCount] = useState<number>(0)
  const [maintenanceCount, setMaintenanceCount] = useState<number>(0)
  const [uniqueModels, setUniqueModels] = useState<string[]>([])
  const [uniqueCapacities, setUniqueCapacities] = useState<string[]>([])
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([])
  
  // State cho UI
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterModel, setFilterModel] = useState<string>("all")
  const [filterCapacity, setFilterCapacity] = useState<string>("all")

  // Fetch tất cả data khi component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Lấy JWT token từ localStorage
      let token = null
      
      // Thử lấy từ object user trước (vì đây là cách app này lưu)
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          token = userData.token
        } catch (e) {
          console.error('Failed to parse user data:', e)
        }
      }
      
      // Fallback: thử lấy trực tiếp token
      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      }
      
      if (!token) {
        setError("Authentication required. Please login first.")
        setLoading(false)
        return
      }
      
      // Debug: log token để kiểm tra
      console.log('Token found:', token ? 'Yes' : 'No')
      console.log('Token preview:', token?.substring(0, 50) + '...')
      
      // Gọi tất cả API cùng lúc với JWT token
      const fetchOptions = {
        method: 'GET',
        credentials: 'include' as RequestCredentials,
        mode: 'cors' as RequestMode,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
      
      const [
        batteriesRes,
        fullRes,
        chargingRes,
        maintenanceRes,
        statusRes,
        modelsRes,
        capacitiesRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}`, fetchOptions),
        fetch(`${API_BASE_URL}/count/full`, fetchOptions),
        fetch(`${API_BASE_URL}/count/charging`, fetchOptions),
        fetch(`${API_BASE_URL}/count/maintenance`, fetchOptions),
        fetch(`${API_BASE_URL}/classify/status`, fetchOptions),
        fetch(`${API_BASE_URL}/classify/model`, fetchOptions),
        fetch(`${API_BASE_URL}/classify/capacity`, fetchOptions)
      ])

      // Debug: Log status của từng response
      console.log('=== API Response Status ===')
      console.log('batteries:', batteriesRes.status, batteriesRes.ok)
      console.log('full:', fullRes.status, fullRes.ok)
      console.log('charging:', chargingRes.status, chargingRes.ok)
      console.log('maintenance:', maintenanceRes.status, maintenanceRes.ok)
      console.log('status:', statusRes.status, statusRes.ok)
      console.log('models:', modelsRes.status, modelsRes.ok)
      console.log('capacities:', capacitiesRes.status, capacitiesRes.ok)

      // Helper function để parse response an toàn
      const safeParseJson = async (res: Response, defaultValue: any, name: string) => {
        if (!res.ok) {
          console.warn(`${name} request failed with status ${res.status}`)
          try {
            const errorText = await res.text()
            console.warn(`${name} error response:`, errorText)
          } catch (e) {
            console.warn(`Could not read ${name} error response`)
          }
          return defaultValue
        }
        try {
          const data = await res.json()
          console.log(`${name} data:`, data)
          return data
        } catch (e) {
          console.error(`Failed to parse ${name} JSON:`, e)
          return defaultValue
        }
      }

      // Parse từng response với error handling
      const [
        batteriesData,
        fullData,
        chargingData,
        maintenanceData,
        statusData,
        modelsData,
        capacitiesData
      ] = await Promise.all([
        safeParseJson(batteriesRes, [], 'batteries'),
        safeParseJson(fullRes, 0, 'full count'),
        safeParseJson(chargingRes, 0, 'charging count'),
        safeParseJson(maintenanceRes, 0, 'maintenance count'),
        safeParseJson(statusRes, [], 'status'),
        safeParseJson(modelsRes, [], 'models'),
        safeParseJson(capacitiesRes, [], 'capacities')
      ])

      // Chỉ throw error nếu batteries (endpoint chính) fail
      if (!batteriesRes.ok) {
        throw new Error(`Failed to fetch batteries: ${batteriesRes.status} ${batteriesRes.statusText}`)
      }

      // Transform data to match frontend interface
      const transformedBatteries = batteriesData.map((battery: any) => ({
        id: String(battery.batteryID), // Convert to string để tránh lỗi toLowerCase
        name: battery.batteryName,
        model: battery.model,
        capacity: String(battery.capacity), // Convert to string
        status: battery.status.toLowerCase(),
        cycleCount: battery.usageCount
      }))

      // Set state với fallback values
      setBatteries(transformedBatteries)
      setFullCount(fullData)
      setChargingCount(chargingData)
      setMaintenanceCount(maintenanceData)
      
      // Fallback cho status nếu API fail
      setUniqueStatuses(statusData.length > 0 ? statusData : ['Full', 'Charging', 'Maintenance'])
      
      // Fallback cho models nếu API fail
      setUniqueModels(modelsData.length > 0 ? modelsData : ['Model A', 'Model B', 'Model C', 'Model D', 'Model E', 'Model Z'])
      
      // Fallback cho capacities nếu API fail
      setUniqueCapacities(capacitiesData.length > 0 ? capacitiesData : ['30', '40', '50', '70', '90', '100'])

    } catch (err) {
      console.error("Error fetching battery data:", err)
      setError("Failed to load battery data. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: BatteryStatus) => {
    switch (status) {
      case "full":
        return <LucideBattery className="w-4 h-4" />
      case "charging":
        return <BatteryCharging className="w-4 h-4" />
      case "maintenance":
        return <Wrench className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: BatteryStatus) => {
    const variants = {
      full: "bg-green-100 text-green-700 border-green-200",
      charging: "bg-blue-100 text-blue-700 border-blue-200",
      maintenance: "bg-orange-100 text-orange-700 border-orange-200",
    }
    const labels = {
      full: "Full",
      charging: "Charging",
      maintenance: "Maintenance",
    }
    return (
      <Badge className={`${variants[status]} border`}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status]}</span>
      </Badge>
    )
  }

  // Filter batteries
  const filteredBatteries = batteries.filter((battery) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      String(battery.id).toLowerCase().includes(searchLower) ||
      battery.model.toLowerCase().includes(searchLower) ||
      battery.name.toLowerCase().includes(searchLower)
    const matchesStatus = filterStatus === "all" || battery.status === filterStatus
    const matchesModel = filterModel === "all" || battery.model === filterModel
    const matchesCapacity = filterCapacity === "all" || battery.capacity === filterCapacity
    return matchesSearch && matchesStatus && matchesModel && matchesCapacity
  })

  // Loading state
  if (loading) {
    return (
      <>
        <StaffHeader title="Battery Inventory" />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">Loading battery data...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait</p>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <StaffHeader title="Battery Inventory" />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="p-8 max-w-md">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchAllData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <StaffHeader title="Battery Inventory" />

      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Battery Inventory Management</h1>
              <p className="text-gray-600 mt-1">Track and manage battery status in real-time</p>
            </div>
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 border-green-200 bg-green-50 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Full Batteries</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{fullCount}</p>
                  <p className="text-xs text-green-600 mt-1">Ready to use</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <LucideBattery className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Charging</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{chargingCount}</p>
                  <p className="text-xs text-blue-600 mt-1">In progress</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <BatteryCharging className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-orange-200 bg-orange-50 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Maintenance</p>
                  <p className="text-3xl font-bold text-orange-900 mt-2">{maintenanceCount}</p>
                  <p className="text-xs text-orange-600 mt-1">Under service</p>
                </div>
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by ID, Name, or Model..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Select value={filterCapacity} onValueChange={setFilterCapacity}>
                  <SelectTrigger id="capacity">
                    <SelectValue placeholder="All Capacities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Capacities</SelectItem>
                    {uniqueCapacities.map((capacity) => (
                      <SelectItem key={capacity} value={capacity}>
                        {capacity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select value={filterModel} onValueChange={setFilterModel}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="All Models" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    {uniqueModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status.toLowerCase()}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filterStatus !== "all" || filterModel !== "all" || filterCapacity !== "all") && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setFilterStatus("all")
                    setFilterModel("all")
                    setFilterCapacity("all")
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </Card>

          {/* Battery Table */}
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Battery ID</TableHead>
                    <TableHead className="font-semibold">Battery Name</TableHead>
                    <TableHead className="font-semibold">Model</TableHead>
                    <TableHead className="font-semibold">Capacity</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Cycle Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatteries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <LucideBattery className="w-12 h-12 mb-3 opacity-30" />
                          <p className="text-lg font-medium">No batteries found</p>
                          <p className="text-sm mt-1">Try adjusting your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBatteries.map((battery) => (
                      <TableRow key={battery.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{battery.id}</TableCell>
                        <TableCell>{battery.name}</TableCell>
                        <TableCell>{battery.model}</TableCell>
                        <TableCell>{battery.capacity}</TableCell>
                        <TableCell>{getStatusBadge(battery.status)}</TableCell>
                        <TableCell>
                          <span className="text-gray-700">{battery.cycleCount}</span>
                          <span className="text-gray-400 text-sm ml-1">cycles</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Table Footer */}
            {filteredBatteries.length > 0 && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">{filteredBatteries.length}</span> of{" "}
                  <span className="font-medium">{batteries.length}</span> batteries
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
