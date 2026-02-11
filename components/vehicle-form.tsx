"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"

interface VehicleFormProps {
  onVehicleAdded?: () => void
}

export function VehicleForm({ onVehicleAdded }: VehicleFormProps) {
  const [vin, setVin] = useState("")
  const [model, setModel] = useState("")
  const [battery, setBattery] = useState("")
  const [registerInfo, setRegisterInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!vin.trim() || !model || !battery) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      // Lấy userId từ localStorage
      const userId = localStorage.getItem("userId")
      
      if (!userId) {
        alert("Please login first")
        return
      }

      console.log("📤 Sending vehicle data...")
      
      // Gọi API trực tiếp
      const response = await fetch("http://localhost:8080/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Nếu backend yêu cầu token
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          vin: vin.trim(),
          vehicleModel: model,
          batteryType: battery,
          registerInformation: registerInfo.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to add vehicle: ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Vehicle added successfully:", data)

      alert("🎉 Vehicle added successfully!")

      // Reset form
      setVin("")
      setModel("")
      setBattery("")
      setRegisterInfo("")

      // Callback để refresh list
      if (onVehicleAdded) {
        onVehicleAdded()
      }

    } catch (error) {
      console.error("❌ Error adding vehicle:", error)
      alert("Failed to add vehicle: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Add New Vehicle</CardTitle>
        <CardDescription>Enter your vehicle details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vin">
              VIN <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vin"
              placeholder="Vehicle Identification Number"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              className="border-muted-foreground/20"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">
              Vehicle Model <span className="text-red-500">*</span>
            </Label>
            <Select value={model} onValueChange={setModel} disabled={isLoading}>
              <SelectTrigger id="model" className="border-muted-foreground/20">
                <SelectValue placeholder="Select vehicle model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tesla Model 3">Tesla Model 3</SelectItem>
                <SelectItem value="Tesla Model Y">Tesla Model Y</SelectItem>
                <SelectItem value="VinFast VF8">VinFast VF8</SelectItem>
                <SelectItem value="VinFast VF9">VinFast VF9</SelectItem>
                <SelectItem value="BMW iX3">BMW iX3</SelectItem>
                <SelectItem value="Nissan Leaf">Nissan Leaf</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="battery">
              Battery Type <span className="text-red-500">*</span>
            </Label>
            <Select value={battery} onValueChange={setBattery} disabled={isLoading}>
              <SelectTrigger id="battery" className="border-muted-foreground/20">
                <SelectValue placeholder="Select battery type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard (60kWh)">Standard (60 kWh)</SelectItem>
                <SelectItem value="Extended (90kWh)">Extended (90 kWh)</SelectItem>
                <SelectItem value="Premium (120kWh)">Premium (120 kWh)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerInfo">Register Information (Optional)</Label>
            <Input
              id="registerInfo"
              placeholder="e.g., Registered in Ho Chi Minh City"
              value={registerInfo}
              onChange={(e) => setRegisterInfo(e.target.value)}
              className="border-muted-foreground/20"
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#A2F200] text-black hover:bg-[#8fd600] gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Vehicle
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
