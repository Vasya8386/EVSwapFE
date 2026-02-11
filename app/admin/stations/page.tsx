"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Battery, Search, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Station {
  stationID: number
  stationName: string
  address: string
  stationStatus: string
  contact: string
  latitude: number
  longitude: number
}

export default function StationManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false)
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Allocation form state
  const [sourceStationId, setSourceStationId] = useState("")
  const [batteryQuantity, setBatteryQuantity] = useState("")
  const [batteryType, setBatteryType] = useState("")

  // Mock data cho số lượng pin (vì API chưa có thông tin này)
  const [stationBatteries, setStationBatteries] = useState<Record<number, { total: number, available: number }>>({})

  // Fetch stations from API
  const fetchStations = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8080/api/stations')

      if (!response.ok) {
        throw new Error('Failed to fetch stations')
      }

      const result = await response.json()

      // Kiểm tra cấu trúc response
      const stationsData = result.data || result

      if (Array.isArray(stationsData)) {
        setStations(stationsData)

        // Tạo mock data cho batteries nếu chưa có
        const mockBatteries: Record<number, { total: number, available: number }> = {}
        stationsData.forEach((station: Station) => {
          mockBatteries[station.stationID] = {
            total: 20 + Math.floor(Math.random() * 20), // 20-40 slots
            available: 10 + Math.floor(Math.random() * 15) // 10-25 available
          }
        })
        setStationBatteries(mockBatteries)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching stations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStations()
  }, [])

  const filteredStations = stations.filter(
    (s) =>
      s.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAllocationClick = (station: Station) => {
    setSelectedStation(station)
    setSourceStationId("")
    setBatteryQuantity("")
    setBatteryType("")
    setIsAllocationDialogOpen(true)
  }

  const handleConfirmTransfer = () => {
    if (!selectedStation || !sourceStationId || !batteryQuantity || !batteryType) {
      alert("Vui lòng điền đầy đủ thông tin!")
      return
    }

    const quantity = parseInt(batteryQuantity)
    const sourceId = parseInt(sourceStationId)
    const targetId = selectedStation.stationID

    const sourceBattery = stationBatteries[sourceId]
    const targetBattery = stationBatteries[targetId]

    if (!sourceBattery || !targetBattery) {
      alert("Lỗi dữ liệu trạm!")
      return
    }

    if (quantity > sourceBattery.available) {
      alert(`Trạm nguồn chỉ có ${sourceBattery.available} pin khả dụng!`)
      return
    }

    if (quantity + targetBattery.available > targetBattery.total) {
      alert(`Trạm đích chỉ còn ${targetBattery.total - targetBattery.available} slot trống!`)
      return
    }

    // Update battery counts
    setStationBatteries(prev => ({
      ...prev,
      [sourceId]: {
        ...prev[sourceId],
        available: prev[sourceId].available - quantity
      },
      [targetId]: {
        ...prev[targetId],
        available: prev[targetId].available + quantity
      }
    }))

    const sourceStation = stations.find(s => s.stationID === sourceId)
    alert(`Đã chuyển ${quantity} pin ${batteryType} từ ${sourceStation?.stationName} đến ${selectedStation.stationName}!`)
    setIsAllocationDialogOpen(false)
    setSelectedStation(null)
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()

    if (statusLower === 'open' || statusLower === 'active') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    }
    if (statusLower === 'closed' || statusLower === 'offline') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Offline</Badge>
    }
    if (statusLower === 'maintenance') {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#7241ce]" />
          <p className="text-gray-600">Loading stations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchStations} className="bg-[#7241ce] text-white hover:bg-[#5d35a8]">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Station Management</h1>
            <p className="text-gray-500 mt-1">Monitor and manage battery swap stations</p>
          </div>
          <Button
            onClick={fetchStations}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-6">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Total Stations</p>
              <p className="text-2xl font-bold text-gray-900">{stations.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Active Stations</p>
              <p className="text-2xl font-bold text-green-600">
                {stations.filter(s => s.stationStatus.toLowerCase() === 'open').length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Total Battery Slots</p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.values(stationBatteries).reduce((sum, b) => sum + b.total, 0)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Available Batteries</p>
              <p className="text-2xl font-bold text-[#A2F200]">
                58
              </p>
            </Card>
          </div>

          {/* Stations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((station) => {
              const batteryInfo = stationBatteries[station.stationID] || { total: 20, available: 15 }

              return (
                <Card key={station.stationID} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{station.stationName}</h3>
                        {getStatusBadge(station.stationStatus)}
                      </div>
                      <p className="text-sm text-gray-500 flex items-start gap-1">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{station.address}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Battery Slots</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {batteryInfo.available}/{batteryInfo.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#A2F200] h-2 rounded-full transition-all"
                        style={{
                          width: `${(batteryInfo.available / batteryInfo.total) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Contact:</span>
                        <span className="text-gray-700 font-medium">{station.contact}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Location:</span>
                        <span className="text-gray-700 font-medium">
                          {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Station ID: {station.stationID}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAllocationClick(station)}
                    >
                      <Battery className="w-4 h-4 mr-1" />
                      Allocate
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          {filteredStations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No stations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Battery Allocation Dialog */}
      <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Battery Allocation - {selectedStation?.stationName}</DialogTitle>
            <DialogDescription>Manage battery distribution for this station</DialogDescription>
          </DialogHeader>
          {selectedStation && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Total Slots</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stationBatteries[selectedStation.stationID]?.total || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stationBatteries[selectedStation.stationID]?.available || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">In Use</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(stationBatteries[selectedStation.stationID]?.total || 0) -
                      (stationBatteries[selectedStation.stationID]?.available || 0)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Transfer Batteries From</Label>
                <Select value={sourceStationId} onValueChange={setSourceStationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations
                      .filter((s) => s.stationID !== selectedStation.stationID &&
                        (stationBatteries[s.stationID]?.available || 0) > 0)
                      .map((s) => (
                        <SelectItem key={s.stationID} value={s.stationID.toString()}>
                          {s.stationName} ({stationBatteries[s.stationID]?.available || 0} available)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Batteries</Label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  min="1"
                  value={batteryQuantity}
                  onChange={(e) => setBatteryQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Battery Type</Label>
                <Select value={batteryType} onValueChange={setBatteryType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select battery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="48V 20Ah">48V 20Ah</SelectItem>
                    <SelectItem value="60V 30Ah">60V 30Ah</SelectItem>
                    <SelectItem value="72V 40Ah">72V 40Ah</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAllocationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-[#7241ce] text-white hover:bg-[#5d35a8]"
                  onClick={handleConfirmTransfer}
                >
                  Confirm Transfer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}