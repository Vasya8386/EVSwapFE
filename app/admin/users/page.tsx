"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Search, MoreVertical, Edit, Trash2, Shield, Mail, Phone } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"

interface UserData {
  userID: number
  userName: string
  email: string | null
  password: string
  fullName: string | null
  phone: string | null
  role: string | null
  address: string | null
  googleId: string | null
  authProvider: string
  createdAt: string
  updatedAt: string
  status: string
}

const API_BASE_URL = 'http://localhost:8080'

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])

  const [formData, setFormData] = useState({
    role: "DRIVER",
    status: "Active",
  })


  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      console.log('Fetched users:', data)
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Failed to load users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const fullName = user.fullName || user.userName || ''
    const email = user.email || ''
    const phone = user.phone || ''
    const role = user.role || ''
    const status = user.status || ''

    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery)

    const matchesRole = roleFilter === "all" || role.toUpperCase() === roleFilter.toUpperCase()
    const matchesStatus = statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadge = (role: string | null) => {
    const roleUpper = (role || '').toUpperCase()
    if (roleUpper === "ADMIN")
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      )
    if (roleUpper === "STAFF")
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Users className="w-3 h-3 mr-1" />
          Staff
        </Badge>
      )
    if (roleUpper === "DRIVER")
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Driver</Badge>
    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">No Role</Badge>
  }

  const getStatusBadge = (status: string | null) => {
    const s = (status || '');
    if (s === "Active")
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    if (s === "Deactivated")
      return <Badge className="bg-gray-200 text-gray-800">Deactivated</Badge>
    return <Badge className="bg-yellow-100 text-yellow-800">Unknown</Badge>
  }

  const handleEdit = (user: UserData) => {
    setSelectedUser(user)
    setFormData({
      role: user.role || "DRIVER",
      status: user.status || "active",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveChanges = async () => {
    if (!selectedUser) return

    try {
      // Update role - GỬI QUA QUERY PARAMETER
      const roleResponse = await fetch(`${API_BASE_URL}/api/users/${selectedUser.userID}/update-role?role=${formData.role}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!roleResponse.ok) {
        const errorText = await roleResponse.text()
        console.error('Role update error:', errorText)
        throw new Error(`Failed to update role (${roleResponse.status}): ${errorText}`)
      }

      const roleData = await roleResponse.json()
      console.log('Role updated:', roleData)

      // Update status - GỬI STATUS VIẾT HOA
      const statusResponse = await fetch(
        `${API_BASE_URL}/api/users/${selectedUser.userID}/update-status?status=${formData.status}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      )


      if (!statusResponse.ok) {
        const errorText = await statusResponse.text()
        console.error('Status update error:', errorText)
        throw new Error(`Failed to update status (${statusResponse.status}): ${errorText}`)
      }

      const statusData = await statusResponse.json()
      console.log('Status updated:', statusData)

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.userID === selectedUser.userID
            ? { ...user, role: formData.role, status: formData.status }
            : user
        )
      )

      alert(`User ${selectedUser.fullName || selectedUser.userName} updated successfully!\nRole: ${formData.role}\nStatus: ${formData.status}`)
      setIsEditDialogOpen(false)
      setSelectedUser(null)

      // Refresh data từ server
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      alert(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteUser = (user: UserData) => {
    const userName = user.fullName || user.userName
    if (confirm(`Are you sure you want to delete ${userName}?`)) {
      setUsers(prevUsers => prevUsers.filter(u => u.userID !== user.userID))
      alert(`User ${userName} has been deleted`)
    }
  }

  const getActiveCount = () => users.filter(u => (u.status || '').toLowerCase() === 'active').length
  const getSuspendedCount = () => users.filter(u => (u.status || '').toLowerCase() === 'suspended').length
  const getRoleCount = (role: string) => users.filter(u => (u.role || '').toUpperCase() === role.toUpperCase()).length

  return (
    <>
      <AdminHeader title="User & Staff Management" />

      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-500">Manage user accounts and permissions</p>
            <Button
              onClick={fetchUsers}
              variant="outline"
              className="gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <p className="text-sm text-gray-500 font-medium">Total Drivers</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {getRoleCount('DRIVER')}
              </h3>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-500 font-medium">Staff Members</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {getRoleCount('STAFF')}
              </h3>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-500 font-medium">Administrators</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {getRoleCount('ADMIN')}
              </h3>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-500 font-medium">Suspended</p>
              <h3 className="text-3xl font-bold text-red-600 mt-2">
                {getSuspendedCount()}
              </h3>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="DRIVER">Driver</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </Card>

          {/* Users Table */}
          <Card>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading users...</p>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auth Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.userID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-gray-900">{user.fullName || user.userName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">ID: {user.userID}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {user.email || 'N/A'}
                            </p>
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {user.phone || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{user.authProvider}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user role and status</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedUser && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p className="font-semibold text-gray-900">{selectedUser.fullName || selectedUser.userName}</p>
                <p className="text-sm text-gray-600">{selectedUser.email || 'No email'}</p>
                <p className="text-sm text-gray-600">{selectedUser.phone || 'No phone'}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(value: string) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRIVER">Driver</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Select the user's role in the system</p>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>

            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#7241ce] text-white hover:bg-[#5d35a8]"
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}