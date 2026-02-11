"use client"

import { useState } from "react"
import { VehicleForm } from "@/components/vehicle-form"
import { VehicleList } from "@/components/vehicle-list"
import { BookingHeader } from "@/components/booking-header"

export default function VehiclePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleVehicleAdded = () => {
    // Trigger refresh của VehicleList
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <>
      <BookingHeader title="Vehicles" />

      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Vehicle Management</h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form thêm xe */}
            <div>
              <VehicleForm onVehicleAdded={handleVehicleAdded} />
            </div>

            {/* Danh sách xe */}
            <div>
              <VehicleList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
