"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Eye, Loader2, AlertCircle, RefreshCw, Check, X } from "lucide-react"
import { StaffHeader } from "@/components/staff-header"

type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED"

interface Transaction {
  transactionId: number
  timeDate: string
  customerName: string
  customerEmail: string
  vin: string
  amount: number
  paymentId: number | null
  status: TransactionStatus
  userId: number | null
  stationId: number | null
  packageId: number | null
  record: string | null
  payPalTransactionId: string | null
  isFake?: boolean // Flag để đánh dấu transaction fake
}

const API_BASE_URL = "http://localhost:8080/api/transactions"

export default function TransactionsPage() {
  // State cho data từ API
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // State cho UI
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  
  // State cho inline editing
  const [editingStatus, setEditingStatus] = useState<number | null>(null)
  const [tempStatus, setTempStatus] = useState<TransactionStatus>("PENDING")

  const [newTransaction, setNewTransaction] = useState({
    customerName: "",
    customerEmail: "",
    vin: "",
    amount: "",
    transactionDate: "",
    transactionTime: "",
  })

  // Fetch transactions khi component mount
  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Lấy JWT token từ localStorage
      let token = null
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          token = userData.token
        } catch (e) {
          console.error('Failed to parse user data:', e)
        }
      }

      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      }

      if (!token) {
        setError("Authentication required. Please login first.")
        setLoading(false)
        return
      }

      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Transactions API Status:', response.status, response.ok)

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`)
      }

      const data = await response.json()
      console.log('Transactions data:', data)

      setTransactions(data)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError("Failed to load transactions. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateTransactionStatus = async (transactionId: number, newStatus: TransactionStatus) => {
    try {
      // Nếu là fake transaction, chỉ update local state
      const transaction = transactions.find(t => t.transactionId === transactionId)
      if (transaction?.isFake) {
        setTransactions(transactions.map(t => 
          t.transactionId === transactionId ? { ...t, status: newStatus } : t
        ))
        setEditingStatus(null)
        return
      }

      // Nếu là real transaction, gọi API
      let token = null
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const userData = JSON.parse(userStr)
        token = userData.token
      }

      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      }

      const response = await fetch(`${API_BASE_URL}/${transactionId}`, {
        method: 'PUT',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Update local state
      setTransactions(transactions.map(t => 
        t.transactionId === transactionId ? { ...t, status: newStatus } : t
      ))
      
      setEditingStatus(null)
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Failed to update status. Please try again.")
    }
  }

  const handleCreateTransaction = async () => {
    try {
      // Generate fake transaction ID (negative số để tránh conflict với real ID)
      const fakeId = -Math.floor(Math.random() * 10000)
      
      // Combine date and time
      const dateTimeString = `${newTransaction.transactionDate}T${newTransaction.transactionTime}:00`

      // Create fake transaction object
      const fakeTransaction: Transaction = {
        transactionId: fakeId,
        timeDate: dateTimeString,
        customerName: newTransaction.customerName,
        customerEmail: newTransaction.customerEmail,
        vin: newTransaction.vin,
        amount: parseFloat(newTransaction.amount),
        status: "PENDING",
        paymentId: null,
        userId: null,
        stationId: null,
        packageId: null,
        record: null,
        payPalTransactionId: null,
        isFake: true // Đánh dấu là fake
      }

      // Add to top of list
      setTransactions([fakeTransaction, ...transactions])
      
      // Reset form and close dialog
      setNewTransaction({
        customerName: "",
        customerEmail: "",
        vin: "",
        amount: "",
        transactionDate: "",
        transactionTime: "",
      })
      setIsCreateDialogOpen(false)
    } catch (err) {
      console.error("Error creating transaction:", err)
      alert("Failed to create transaction. Please try again.")
    }
  }

  const startEditingStatus = (transactionId: number, currentStatus: TransactionStatus) => {
    setEditingStatus(transactionId)
    setTempStatus(currentStatus)
  }

  const cancelEditingStatus = () => {
    setEditingStatus(null)
    setTempStatus("PENDING")
  }

  const saveStatus = (transactionId: number) => {
    updateTransactionStatus(transactionId, tempStatus)
  }

  const getStatusBadge = (status: TransactionStatus, transactionId: number, isFake?: boolean) => {
    if (editingStatus === transactionId) {
      return (
        <div className="flex items-center gap-2">
          <Select value={tempStatus} onValueChange={(value: TransactionStatus) => setTempStatus(value)}>
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="COMPLETED">COMPLETED</SelectItem>
              <SelectItem value="FAILED">FAILED</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => saveStatus(transactionId)}>
            <Check className="w-4 h-4 text-green-600" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={cancelEditingStatus}>
            <X className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      )
    }

    const variants = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200 cursor-pointer hover:bg-yellow-200",
      COMPLETED: "bg-green-100 text-green-700 border-green-200 cursor-pointer hover:bg-green-200",
      FAILED: "bg-red-100 text-red-700 border-red-200 cursor-pointer hover:bg-red-200",
    }
    
    return (
      <Badge 
        className={`${variants[status]} border`}
        onClick={() => startEditingStatus(transactionId, status)}
      >
        {status}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return {
      date: date.toLocaleDateString('en-US'),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      String(transaction.transactionId).includes(searchLower) ||
      transaction.customerName.toLowerCase().includes(searchLower) ||
      transaction.vin.toLowerCase().includes(searchLower) ||
      transaction.customerEmail.toLowerCase().includes(searchLower)
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const todayTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.timeDate).toDateString()
    const today = new Date().toDateString()
    return transactionDate === today
  })

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  const averageTransaction = filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0

  // Loading state
  if (loading) {
    return (
      <>
        <StaffHeader title="Swap Transactions" />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#7241CE] mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">Loading transactions...</p>
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
        <StaffHeader title="Swap Transactions" />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="p-8 max-w-md">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchTransactions} className="bg-[#7241CE] hover:bg-[#5a33a6]">
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <StaffHeader title="Swap Transactions" />

      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Battery Swap Transaction Management</h1>
              <p className="text-gray-600 mt-1">Confirm and track battery swap transactions</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchTransactions}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#7241CE] hover:bg-[#5a33a6]">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Transaction</DialogTitle>
                    <DialogDescription>
                      Fill in the transaction details
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Transaction Date *</Label>
                        <Input
                          type="date"
                          value={newTransaction.transactionDate}
                          onChange={(e) => setNewTransaction({ ...newTransaction, transactionDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Transaction Time *</Label>
                        <Input
                          type="time"
                          value={newTransaction.transactionTime}
                          onChange={(e) => setNewTransaction({ ...newTransaction, transactionTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Customer Name *</Label>
                      <Input
                        placeholder="Enter customer name"
                        value={newTransaction.customerName}
                        onChange={(e) => setNewTransaction({ ...newTransaction, customerName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Customer Email *</Label>
                      <Input
                        type="email"
                        placeholder="Enter customer email"
                        value={newTransaction.customerEmail}
                        onChange={(e) => setNewTransaction({ ...newTransaction, customerEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Vehicle VIN *</Label>
                      <Input
                        placeholder="Enter vehicle VIN"
                        value={newTransaction.vin}
                        onChange={(e) => setNewTransaction({ ...newTransaction, vin: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Amount (USD) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter amount in USD"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-[#7241CE] hover:bg-[#5a33a6]"
                        onClick={handleCreateTransaction}
                        disabled={!newTransaction.customerName || !newTransaction.customerEmail || !newTransaction.vin || !newTransaction.amount || !newTransaction.transactionDate || !newTransaction.transactionTime}
                      >
                        Create Transaction
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 border-[#7241CE]/20 bg-[#7241CE]/5">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{filteredTransactions.length}</p>
                <p className="text-xs text-gray-500 mt-1">Today: {todayTransactions.length}</p>
              </div>
            </Card>

            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <div>
                <p className="text-sm font-medium text-green-700">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </Card>

            <Card className="p-6 border-2 border-blue-200 bg-blue-50">
              <div>
                <p className="text-sm font-medium text-blue-700">Average/Transaction</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {formatCurrency(averageTransaction)}
                </p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search by ID, Customer, VIN, or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchTerm || filterStatus !== "all") && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setFilterStatus("all")
                  }}
                  className="text-sm text-[#7241CE] hover:text-[#5a33a6] font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </Card>

          {/* Transactions Table */}
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status (Click to Edit)</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <AlertCircle className="w-12 h-12 mb-3 opacity-30" />
                          <p className="text-lg font-medium">No transactions found</p>
                          <p className="text-sm mt-1">Try adjusting your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction, index) => {
                      const { date, time } = formatDateTime(transaction.timeDate)
                      return (
                        <TableRow 
                          key={`transaction-${transaction.transactionId}-${index}`}
                        >
                          <TableCell className="font-medium">
                            #{Math.abs(transaction.transactionId)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{date}</div>
                              <div className="text-gray-500">{time}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{transaction.customerName}</div>
                              <div className="text-gray-500">{transaction.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{transaction.vin}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.status, transaction.transactionId, transaction.isFake)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedTransaction(transaction)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Transaction Details #{Math.abs(transaction.transactionId)}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Detailed information about the battery swap transaction
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedTransaction && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-gray-600">Transaction ID</Label>
                                        <p className="font-medium">#{Math.abs(selectedTransaction.transactionId)}</p>
                                      </div>
                                      <div>
                                        <Label className="text-gray-600">Date & Time</Label>
                                        <p className="font-medium">
                                          {formatDateTime(selectedTransaction.timeDate).date}{" "}
                                          {formatDateTime(selectedTransaction.timeDate).time}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="border-t pt-4">
                                      <h4 className="font-semibold mb-3">Customer Information</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-gray-600">Customer Name</Label>
                                          <p className="font-medium">{selectedTransaction.customerName}</p>
                                        </div>
                                        <div>
                                          <Label className="text-gray-600">Email</Label>
                                          <p className="font-medium">{selectedTransaction.customerEmail}</p>
                                        </div>
                                        <div>
                                          <Label className="text-gray-600">Vehicle VIN</Label>
                                          <p className="font-medium font-mono">{selectedTransaction.vin}</p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="border-t pt-4">
                                      <h4 className="font-semibold mb-3">Payment Details</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-gray-600">Amount</Label>
                                          <p className="font-bold text-lg text-[#7241CE]">
                                            {formatCurrency(selectedTransaction.amount)}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-gray-600">Status</Label>
                                          <div className="mt-1">
                                            {getStatusBadge(selectedTransaction.status, selectedTransaction.transactionId, selectedTransaction.isFake)}
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-gray-600">Payment ID</Label>
                                          <p className="font-medium">
                                            {selectedTransaction.paymentId || "N/A"}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-gray-600">PayPal Transaction ID</Label>
                                          <p className="font-medium text-sm break-all">
                                            {selectedTransaction.payPalTransactionId || "N/A"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="border-t pt-4">
                                      <h4 className="font-semibold mb-3">Additional Information</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-gray-600">User ID</Label>
                                          <p className="font-medium">{selectedTransaction.userId || "N/A"}</p>
                                        </div>
                                        <div>
                                          <Label className="text-gray-600">Station ID</Label>
                                          <p className="font-medium">{selectedTransaction.stationId || "N/A"}</p>
                                        </div>
                                        <div>
                                          <Label className="text-gray-600">Package ID</Label>
                                          <p className="font-medium">{selectedTransaction.packageId || "N/A"}</p>
                                        </div>
                                      </div>
                                    </div>
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
            </div>

            {/* Table Footer */}
            {filteredTransactions.length > 0 && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">{filteredTransactions.length}</span> of{" "}
                  <span className="font-medium">{transactions.length}</span> transactions
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}