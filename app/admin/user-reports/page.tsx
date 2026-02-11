"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/admin-header"
import { Search, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface UserReport {
  id: string
  userName: string
  userId: string
  reportContent: string
  description: string
  reportDate: string
  status: "pending" | "resolved" | "rejected"
  transactionId: string
}

export default function UserReports() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [reports, setReports] = useState<UserReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/reports/with-username`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`)
      }

      const data = await response.json()
      
      const transformedReports: UserReport[] = data.map((report: any) => ({
        id: report.reportId?.toString() || "",
        userName: report.fullName || report.userName || "Unknown User",
        userId: report.userId?.toString() || "N/A",
        reportContent: report.reportContent || "No content",
        description: report.description || "No description provided",
        reportDate: report.reportDate || new Date().toISOString(),
        status: (report.status?.toLowerCase() || "pending") as "pending" | "resolved" | "rejected",
        transactionId: report.transactionId?.toString() || "N/A",
      }))
      
      setReports(transformedReports)
    } catch (error) {
      console.error("Error fetching reports:", error)
      alert("Failed to load reports. Please check your connection.")
      setReports([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change the status to ${newStatus.toUpperCase()}?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`)
      }

      alert("Status updated successfully!")
      await fetchReports()
      
      if (selectedReport && selectedReport.id === reportId) {
        setIsDetailDialogOpen(false)
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status. Please try again.")
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || report.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    if (status === "pending")
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      )
    if (status === "resolved")
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Resolved
        </Badge>
      )
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        <XCircle className="w-3 h-3 mr-1" />
        Rejected
      </Badge>
    )
  }

  const viewReportDetails = (report: UserReport) => {
    setSelectedReport(report)
    setIsDetailDialogOpen(true)
  }

  const pendingCount = reports.filter((r) => r.status === "pending").length
  const resolvedCount = reports.filter((r) => r.status === "resolved").length
  const rejectedCount = reports.filter((r) => r.status === "rejected").length

  return (
    <>
      <AdminHeader title="User Reports" />

      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-500">Manage and respond to user reports</p>
            <Button onClick={fetchReports} variant="outline">
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Reports</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{reports.length}</h3>
                </div>
                <MessageSquare className="w-8 h-8 text-[#7241ce]" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Pending</p>
                  <h3 className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</h3>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Resolved</p>
                  <h3 className="text-3xl font-bold text-green-600 mt-2">{resolvedCount}</h3>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Rejected</p>
                  <h3 className="text-3xl font-bold text-red-600 mt-2">{rejectedCount}</h3>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by user name, content, or report ID..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Reports Table */}
          <Card>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7241ce]"></div>
                  <p className="text-gray-500 mt-4">Loading reports...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery || statusFilter !== "all" 
                      ? "No reports found matching your filters" 
                      : "No reports available"}
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Report ID</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">User</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Report Content</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Description</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Transaction</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-mono text-sm">#{report.id}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-900">{report.userName}</p>
                            <p className="text-xs text-gray-500">ID: {report.userId}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-900 max-w-xs truncate">
                            {report.reportContent}
                          </p>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="text-sm text-gray-600 truncate">{report.description}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono text-gray-500">
                            {report.transactionId !== "N/A" ? `#${report.transactionId}` : "N/A"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {new Date(report.reportDate).toLocaleDateString("vi-VN")}
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(report.reportDate).toLocaleTimeString("vi-VN")}
                          </span>
                        </td>
                        <td className="p-4">{getStatusBadge(report.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => viewReportDetails(report)}
                            >
                              View
                            </Button>
                            <Select
                              value={report.status}
                              onValueChange={(value) => handleStatusChange(report.id, value)}
                            >
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          {/* Report Detail Dialog */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
                <DialogDescription>View and manage report information</DialogDescription>
              </DialogHeader>
              {selectedReport && (
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Report ID</Label>
                      <p className="text-sm font-mono bg-gray-50 p-2 rounded">#{selectedReport.id}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div>{getStatusBadge(selectedReport.status)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>User Information</Label>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                      <p className="font-semibold text-gray-900">{selectedReport.userName}</p>
                      <p className="text-sm text-gray-600">User ID: {selectedReport.userId}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Transaction ID</Label>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                      {selectedReport.transactionId !== "N/A" ? `#${selectedReport.transactionId}` : "N/A"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Report Content</Label>
                    <p className="text-sm font-semibold text-gray-900 bg-gray-50 p-3 rounded">
                      {selectedReport.reportContent}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={selectedReport.description} 
                      readOnly 
                      rows={5} 
                      className="resize-none bg-gray-50" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Report Date</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedReport.reportDate).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Change Status</Label>
                    <Select
                      value={selectedReport.status}
                      onValueChange={(value) => handleStatusChange(selectedReport.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}