"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Battery, Check, Loader2 } from "lucide-react"

// Utility function for className merging
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

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

interface VehicleSelectorProps {
  selectedVehicleId: number | null
  onSelectVehicle: (id: number) => void
  refreshTrigger?: number
  onVehiclesLoaded?: (vehicles: Vehicle[]) => void // Để share data với parent nếu cần
}

export function VehicleSelector({ 
  selectedVehicleId, 
  onSelectVehicle,
  refreshTrigger,
  onVehiclesLoaded
}: VehicleSelectorProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchVehicles = async () => {
    setIsLoading(true)
    try {
      // Lấy userId từ localStorage
      const userId = localStorage.getItem("userId")
      
      if (!userId) {
        console.log("No userId found in localStorage")
        setVehicles([])
        setIsLoading(false)
        return
      }

      console.log("📤 Fetching vehicles for userId:", userId)

      const response = await fetch(`http://localhost:8080/api/vehicles/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch vehicles, status:", response.status)
        throw new Error("Failed to fetch vehicles")
      }

      const data = await response.json()
      console.log("✅ Vehicles fetched:", data)
      
      // Ensure data is an array
      const vehiclesArray = Array.isArray(data) ? data : []
      setVehicles(vehiclesArray)
      
      // Share data với parent component nếu cần
      if (onVehiclesLoaded) {
        onVehiclesLoaded(vehiclesArray)
      }

    } catch (error) {
      console.error("❌ Error fetching vehicles:", error)
      setVehicles([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [refreshTrigger])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <Battery className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h4 className="font-semibold text-gray-900 mb-2">No vehicles available</h4>
        <p className="text-sm text-gray-600">Please add a vehicle first in the Vehicles page</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {Array.isArray(vehicles) && vehicles.map((vehicle) => (
        <Card
          key={vehicle.vehicleID}
          className={cn(
            "p-4 cursor-pointer transition-all hover:shadow-md",
            selectedVehicleId === vehicle.vehicleID 
              ? "border-[#A2F200] border-2 bg-[#A2F200]/5" 
              : "border-gray-200",
          )}
          onClick={() => onSelectVehicle(vehicle.vehicleID)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Battery
                className={cn(
                  "w-5 h-5 mt-0.5", 
                  selectedVehicleId === vehicle.vehicleID 
                    ? "text-[#A2F200]" 
                    : "text-gray-400"
                )}
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {vehicle.vehicleModel}
                </h4>
                <p className="text-sm text-gray-600 mb-2">VIN: {vehicle.vin}</p>
                <p className="text-xs text-gray-500">Battery: {vehicle.batteryType}</p>
                {vehicle.registerInformation && (
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {vehicle.registerInformation}
                  </p>
                )}
              </div>
            </div>

            {selectedVehicleId === vehicle.vehicleID && (
              <div className="w-6 h-6 rounded-full bg-[#A2F200] flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-black" />
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
