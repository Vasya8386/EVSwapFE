"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Battery, Trash2, Loader2 } from "lucide-react"

interface Vehicle {
  vehicleID: number
  userId: number
  userName: string
  userEmail: string
  vin: string
  vehicleModel: string
  batteryType: string
  registerInformation?: string
}

interface VehicleListProps {
  refreshTrigger?: number
}

export function VehicleList({ refreshTrigger }: VehicleListProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicles = async () => {
    setIsLoading(true)
    try {
      // Lấy userId từ localStorage
      const userId = localStorage.getItem("userId")
      
      if (!userId) {
        console.log("No userId found in localStorage")
        setVehicles([])
        return
      }

      console.log("📤 Fetching vehicles for userId:", userId)

      const response = await fetch(`http://localhost:8080/api/vehicles/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Nếu backend yêu cầu token
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch vehicles")
      }

      const data = await response.json()
      console.log("✅ Vehicles fetched:", data)
      setVehicles(data)

    } catch (error) {
      console.error("❌ Error fetching vehicles:", error)
      alert("Failed to load vehicles")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [refreshTrigger])

  const handleDelete = async (vehicleId: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) {
      return
    }

    setDeletingId(vehicleId)
    try {
      console.log("📤 Deleting vehicle:", vehicleId)

      const response = await fetch(`http://localhost:8080/api/vehicles/${vehicleId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Nếu backend yêu cầu token
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete vehicle")
      }

      console.log("✅ Vehicle deleted successfully")
      alert("Vehicle deleted successfully")
      
      // Refresh list
      fetchVehicles()

    } catch (error) {
      console.error("❌ Error deleting vehicle:", error)
      alert("Failed to delete vehicle")
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#A2F200]" />
        </CardContent>
      </Card>
    )
  }

  if (vehicles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Car className="w-12 h-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No vehicles registered yet</p>
          <p className="text-sm text-muted-foreground">Add your first vehicle to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <CardTitle>My Vehicles ({vehicles.length})</CardTitle>
      </CardHeader>
      
      {vehicles.map((vehicle) => (
        <Card key={vehicle.vehicleID} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-[#A2F200]" />
                  <div>
                    <h3 className="font-semibold text-lg">{vehicle.vehicleModel}</h3>
                    <p className="text-sm text-muted-foreground">VIN: {vehicle.vin}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline" className="font-normal">
                    {vehicle.batteryType}
                  </Badge>
                </div>

                {vehicle.registerInformation && (
                  <p className="text-sm text-muted-foreground">
                    📍 {vehicle.registerInformation}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(vehicle.vehicleID)}
                disabled={deletingId === vehicle.vehicleID}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {deletingId === vehicle.vehicleID ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
