"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Edit, Trash2, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminHeader } from "@/components/admin-header"

interface SubscriptionPlan {
  id: string
  name: string
  type: "pay_per_use" | "monthly" | "unlimited"
  price: number
  swapsIncluded?: number
  features: string[]
  isActive: boolean
  subscribers: number
  description: string
  durationDays?: number | null
}

export default function SubscriptionPlans() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    durationDays: 30,
  })

  // Fetch packages from API
  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("http://localhost:8080/api/packages", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Transform API data to match component structure
      const transformedPlans: SubscriptionPlan[] = data.map((pkg: any) => ({
        id: pkg.packageId.toString(),
        name: pkg.packageName,
        type: pkg.durationDays === null ? "pay_per_use" : pkg.durationDays >= 90 ? "unlimited" : "monthly",
        price: pkg.price,
        swapsIncluded: pkg.durationDays === null ? undefined : pkg.durationDays,
        features: [
          pkg.description,
          "Access to all stations",
          "Standard support",
          "Mobile app access"
        ],
        isActive: true,
        subscribers: Math.floor(Math.random() * 1000), // Mock data since API doesn't provide this
        description: pkg.description,
        durationDays: pkg.durationDays,
      }))

      setPlans(transformedPlans)
    } catch (error) {
      console.error("Error fetching packages:", error)
      // Load mock data as fallback
      setPlans(getMockPlans())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockPlans = (): SubscriptionPlan[] => [
    {
      id: "PLAN001",
      name: "Pay Per Use",
      type: "pay_per_use",
      price: 5,
      features: ["Pay only when you swap", "No commitment", "Access to all stations", "Standard support"],
      isActive: true,
      subscribers: 1250,
      description: "Perfect for occasional users who prefer flexibility",
      durationDays: null,
    },
    {
      id: "PLAN002",
      name: "Basic Monthly",
      type: "monthly",
      price: 99,
      swapsIncluded: 30,
      features: [
        "30 swaps per month",
        "Extra swaps at $4 each",
        "Access to all stations",
        "Priority support",
        "Mobile app access",
      ],
      isActive: true,
      subscribers: 842,
      description: "Ideal for regular commuters with predictable usage",
      durationDays: 30,
    },
  ]

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      durationDays: plan.durationDays || 30,
    })
    setIsEditDialogOpen(true)
  }

  const handleCreatePlan = async () => {
    try {
      const payload = {
        packageName: formData.name,
        description: formData.description,
        price: formData.price,
        durationDays: formData.durationDays,
      }

      console.log("Creating package with payload:", payload)

      const response = await fetch("http://localhost:8080/api/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify(payload),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        alert(`Failed to create plan: ${response.status} - ${errorText}`)
        return
      }

      const result = await response.json()
      console.log("Plan created successfully:", result)
      await fetchPackages() // Refresh the list
      setIsCreateDialogOpen(false)
      resetForm()
      alert("Plan created successfully!")
    } catch (error) {
      console.error("Error creating plan:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create plan'}`)
    }
  }

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return

    try {
      const response = await fetch(`http://localhost:8080/api/packages/${selectedPlan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: Number(selectedPlan.id),
          packageName: formData.name,
          description: formData.description,
          price: formData.price,
          durationDays: formData.durationDays,
        }),
      })

      if (response.ok) {
        console.log("Plan updated successfully")
        await fetchPackages() // Refresh the list
        setIsEditDialogOpen(false)
      } else {
        console.error("Failed to update plan")
        alert("Failed to update plan")
      }
    } catch (error) {
      console.error("Error updating plan:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to update plan'}`)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return

    try {
      const response = await fetch(`http://localhost:8080/api/packages/${planId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        console.log("Plan deleted successfully")
        await fetchPackages() // Refresh the list
      } else {
        console.error("Failed to delete plan")
        alert("Failed to delete plan")
      }
    } catch (error) {
      console.error("Error deleting plan:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete plan'}`)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      durationDays: 30,
    })
  }

  const totalSubscribers = 56
  const monthlyRevenue = 2000
  const activePlans = plans.filter((p) => p.isActive).length

  return (
    <>
      <AdminHeader title="Subscription Plans" />

      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-500">Manage pricing and subscription offerings</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#7241ce] text-white hover:bg-[#5d35a8] gap-2" onClick={resetForm}>
                  <Plus className="w-4 h-4" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Subscription Plan</DialogTitle>
                  <DialogDescription>Design a new pricing plan for your users</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Package Name</Label>
                    <Input
                      placeholder="e.g., Premium Monthly"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Brief description of this plan..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Price (USD)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration Days</Label>
                      <Input
                        type="number"
                        placeholder="30"
                        value={formData.durationDays}
                        onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#7241ce] text-white hover:bg-[#5d35a8]"
                      onClick={handleCreatePlan}
                    >
                      Create Plan
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Subscribers</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalSubscribers.toLocaleString()}</h3>
                </div>
                <Package className="w-8 h-8 text-[#7241ce]" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Plans</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{activePlans}</h3>
                  <p className="text-xs text-gray-500 mt-1">out of {plans.length} total</p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Monthly Revenue</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">${monthlyRevenue.toLocaleString()}</h3>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  $
                </div>
              </div>
            </Card>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7241ce]"></div>
                <p className="text-gray-500 mt-4">Loading plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No subscription plans available</p>
              </div>
            ) : (
              plans.map((plan) => (
                <Card key={plan.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                    </div>
                    {plan.isActive ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-[#7241ce]">${plan.price}</span>
                      {plan.type === "pay_per_use" && <span className="text-gray-500">/swap</span>}
                      {plan.type === "monthly" && <span className="text-gray-500">/month</span>}
                      {plan.type === "unlimited" && <span className="text-gray-500">/month</span>}
                    </div>
                    {plan.swapsIncluded && (
                      <p className="text-sm text-gray-600 mt-1">{plan.swapsIncluded} days duration</p>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-[#A2F200] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Subscribers</span>
                      <span className="font-semibold text-gray-900">{plan.subscribers.toLocaleString()}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Subscription Plan</DialogTitle>
                <DialogDescription>Update plan details and pricing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Package Name</Label>
                  <Input
                    placeholder="e.g., Premium Monthly"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of this plan..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (USD)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration Days</Label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#7241ce] text-white hover:bg-[#5d35a8]"
                    onClick={handleUpdatePlan}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}