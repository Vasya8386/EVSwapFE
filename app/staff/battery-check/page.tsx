"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, AlertCircle, Plus, Loader2 } from "lucide-react"
import { StaffHeader } from "@/components/staff-header"

type BatteryCheckStatus = "PENDING" | "FULL" | "DAMAGED" | "MAINTENANCE"

interface ReturnedBattery {
  batteryID: number
  transactionID: number
  returnDateTime: string
  customer: string
  phone: string
  status: BatteryCheckStatus
  batteryCode?: string
  batteryCapacity?: number
}

// API Configuration
const API_BASE_URL = "http://localhost:8080/api/battery-returns"

export default function BatteryCheckPage() {
  const [batteries, setBatteries] = useState<ReturnedBattery[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedBattery, setSelectedBattery] = useState<ReturnedBattery | null>(null)
  
  const [newCheck, setNewCheck] = useState({
    batteryID: "",
    transactionID: "",
    customer: "",
    phone: "",
  })

  // Fetch all battery returns on component mount
  useEffect(() => {
    fetchBatteryReturns()
  }, [])

  // GET: Fetch all battery returns
  const fetchBatteryReturns = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(API_BASE_URL)
      if (!response.ok) throw new Error("Failed to fetch battery returns")
      
      const data = await response.json()
      setBatteries(data)
    } catch (error) {
      console.error("Error fetching battery returns:", error)
      alert("Không thể tải danh sách battery returns")
    } finally {
      setIsLoading(false)
    }
  }

  // POST: Create new battery return
  const handleCreateCheck = async () => {
    if (!newCheck.batteryID || !newCheck.transactionID || 
        !newCheck.customer || !newCheck.phone) {
      alert("Vui lòng điền đầy đủ thông tin")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batteryID: parseInt(newCheck.batteryID),
          transactionID: parseInt(newCheck.transactionID),
          customer: newCheck.customer,
          phone: newCheck.phone,
        }),
      })

      if (!response.ok) {
        // Kiểm tra xem có response body không
        const contentType = response.headers.get("content-type")
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json()
            
            // Nếu là validation error (400), hiển thị chi tiết
            if (response.status === 400 && typeof errorData === 'object') {
              const validationErrors = Object.entries(errorData)
                .map(([field, message]) => `${field}: ${message}`)
                .join('\n')
              errorMessage = validationErrors || errorData.message || errorMessage
            } else {
              errorMessage = errorData.message || errorMessage
            }
          } catch (e) {
            // Không parse được JSON
          }
        }
        
        throw new Error(errorMessage)
      }

      const createdBattery = await response.json()
      
      // Refresh the list
      await fetchBatteryReturns()
      
      // Reset form and close dialog
      setNewCheck({
        batteryID: "",
        transactionID: "",
        customer: "",
        phone: "",
      })
      setIsCreateDialogOpen(false)
      alert("Tạo battery return thành công!")
    } catch (error) {
      console.error("Error creating battery return:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      alert(`Không thể tạo battery return: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // PATCH: Update battery status
  const handleStatusUpdate = async (batteryID: number, transactionID: number, newStatus: BatteryCheckStatus) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/${batteryID}/${transactionID}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      // Refresh the list
      await fetchBatteryReturns()
      
      setSelectedBattery(null)
      alert("Cập nhật trạng thái thành công!")
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Không thể cập nhật trạng thái")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: BatteryCheckStatus) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      FULL: "bg-green-100 text-green-700 border-green-200",
      DAMAGED: "bg-red-100 text-red-700 border-red-200",
      MAINTENANCE: "bg-orange-100 text-orange-700 border-orange-200",
    }
    const labels = {
      PENDING: "Pending Check",
      FULL: "Full - OK",
      DAMAGED: "Damaged",
      MAINTENANCE: "Needs Maintenance",
    }
    const icons = {
      PENDING: <AlertCircle className="w-4 h-4" />,
      FULL: <CheckCircle2 className="w-4 h-4" />,
      DAMAGED: <XCircle className="w-4 h-4" />,
      MAINTENANCE: <AlertCircle className="w-4 h-4" />,
    }
    return (
      <Badge className={`${variants[status]} border`}>
        {icons[status]}
        <span className="ml-1">{labels[status]}</span>
      </Badge>
    )
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const pendingCount = batteries.filter((b) => b.status === "PENDING").length
  const fullCount = batteries.filter((b) => b.status === "FULL").length
  const damagedCount = batteries.filter((b) => b.status === "DAMAGED").length

  return (
    <>
      <StaffHeader title="Battery Check" />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Returned Battery Status Check</h1>
              <p className="text-gray-600 mt-1">Inspect and record battery condition after swap</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#7241CE] hover:bg-[#5a33a6]" disabled={isLoading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Check
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Battery Check</DialogTitle>
                  <DialogDescription>Fill in the battery check details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Battery ID</Label>
                      <Input
                        type="number"
                        placeholder="Enter battery ID"
                        value={newCheck.batteryID}
                        onChange={(e) => setNewCheck({ ...newCheck, batteryID: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Transaction ID</Label>
                      <Input
                        type="number"
                        placeholder="Enter transaction ID"
                        value={newCheck.transactionID}
                        onChange={(e) => setNewCheck({ ...newCheck, transactionID: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Customer Name</Label>
                      <Input
                        placeholder="Enter customer name"
                        value={newCheck.customer}
                        onChange={(e) => setNewCheck({ ...newCheck, customer: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Customer Phone</Label>
                      <Input
                        type="tel"
                        placeholder="0901234567 (10-11 digits)"
                        value={newCheck.phone}
                        onChange={(e) => setNewCheck({ ...newCheck, phone: e.target.value })}
                        disabled={isLoading}
                        pattern="[0-9]{6,15}"
                        title="Phone number must be 6-15 digits"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-[#7241CE] hover:bg-[#5a33a6]"
                      onClick={handleCreateCheck}
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Check
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 border-yellow-200 bg-yellow-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending Check</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-2">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Checked - OK</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{fullCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-red-200 bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Damaged</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">{damagedCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-700" />
                </div>
              </div>
            </Card>
          </div>

          <Card>
            {isLoading && batteries.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600">Loading battery returns...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Battery ID</TableHead>
                    <TableHead>Return Date & Time</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batteries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No battery returns found
                      </TableCell>
                    </TableRow>
                  ) : (
                    batteries.map((battery) => {
                      const { date, time } = formatDateTime(battery.returnDateTime)
                      return (
                        <TableRow key={`${battery.batteryID}-${battery.transactionID}`}>
                          <TableCell className="font-medium">{battery.batteryID}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{date}</div>
                              <div className="text-gray-500">{time}</div>
                            </div>
                          </TableCell>
                          <TableCell>{battery.transactionID}</TableCell>
                          <TableCell>{battery.customer}</TableCell>
                          <TableCell>{battery.phone}</TableCell>
                          <TableCell>{getStatusBadge(battery.status)}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedBattery(battery)}
                                  disabled={battery.status !== "PENDING" || isLoading}
                                >
                                  {battery.status === "PENDING" ? "Check" : "View"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Check Battery {battery.batteryID}</DialogTitle>
                                  <DialogDescription>Record battery condition after return</DialogDescription>
                                </DialogHeader>
                                {selectedBattery && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-gray-600">Transaction ID</Label>
                                        <p className="font-medium">{selectedBattery.transactionID}</p>
                                      </div>
                                      <div>
                                        <Label className="text-gray-600">Customer</Label>
                                        <p className="font-medium">{selectedBattery.customer}</p>
                                      </div>
                                    </div>

                                    {selectedBattery.status === "PENDING" ? (
                                      <>
                                        <div className="grid grid-cols-3 gap-3 pt-4">
                                          <Button
                                            onClick={() => handleStatusUpdate(selectedBattery.batteryID, selectedBattery.transactionID, "FULL")}
                                            className="bg-green-600 hover:bg-green-700"
                                            disabled={isLoading}
                                          >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Battery OK
                                          </Button>
                                          <Button
                                            onClick={() => handleStatusUpdate(selectedBattery.batteryID, selectedBattery.transactionID, "MAINTENANCE")}
                                            className="bg-orange-600 hover:bg-orange-700"
                                            disabled={isLoading}
                                          >
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Maintenance
                                          </Button>
                                          <Button
                                            onClick={() => handleStatusUpdate(selectedBattery.batteryID, selectedBattery.transactionID, "DAMAGED")}
                                            className="bg-red-600 hover:bg-red-700"
                                            disabled={isLoading}
                                          >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Damaged
                                          </Button>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="space-y-4">
                                        <div>
                                          <Label className="text-gray-600">Status</Label>
                                          <div className="mt-2">{getStatusBadge(selectedBattery.status)}</div>
                                        </div>
                                        {selectedBattery.batteryCode && (
                                          <div>
                                            <Label className="text-gray-600">Battery Code</Label>
                                            <p className="mt-1 text-sm">{selectedBattery.batteryCode}</p>
                                          </div>
                                        )}
                                        {selectedBattery.batteryCapacity && (
                                          <div>
                                            <Label className="text-gray-600">Capacity</Label>
                                            <p className="font-medium">{selectedBattery.batteryCapacity} Ah</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}