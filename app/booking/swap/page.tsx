"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookingHeader } from "@/components/booking-header"
import { VehicleSelector } from "@/components/vehicle-selector"
import { MapPin, Clock, AlertCircle, Check, Calendar, Zap, ShoppingCart, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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

interface Station {
  id: string
  name: string
  address: string
  time: string
  distance: string
}

interface PurchasedPackage {
  id: number
  packageId: number
  packageName: string
  description: string
  price: number
  durationDays: number | null
  purchaseDate: string
  expiryDate: string | null
  usageCount: number
  maxUsage: number | null
  status: string
  remainingDays?: number | null
}

export default function SwapPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [selectedPurchasedPackageId, setSelectedPurchasedPackageId] = useState<number | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  // States for purchased packages
  const [purchasedPackages, setPurchasedPackages] = useState<PurchasedPackage[]>([])
  const [packagesLoading, setPackagesLoading] = useState(false)

  // States for vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, authLoading, router])

  // Load userId from localStorage
  useEffect(() => {
    let storedUserId: string | null = null

    const directUserId = localStorage.getItem("userId")
    console.log("📍 Direct userId from localStorage:", directUserId)

    if (directUserId) {
      storedUserId = directUserId
    } else {
      const userStr = localStorage.getItem("user")
      console.log("📍 User object from localStorage:", userStr)

      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          const id = userData.userId || userData.id || userData.user_id
          if (id) {
            storedUserId = id.toString()
            console.log("✅ UserId extracted from user object:", storedUserId)
          }
        } catch (error) {
          console.error("❌ Error parsing user data:", error)
        }
      }
    }

    if (storedUserId) {
      setUserId(Number.parseInt(storedUserId))
      console.log("✅ UserId loaded successfully:", storedUserId)
    } else {
      console.warn("⚠️ No userId found in localStorage")
    }
  }, [])

  // Fetch purchased packages from API
  useEffect(() => {
    const fetchPurchasedPackages = async () => {
      if (!userId) {
        console.log("⚠️ No userId yet, skipping package fetch")
        return
      }

      setPackagesLoading(true)
      try {
        console.log("📤 Fetching purchased packages for userId:", userId)

        const response = await fetch(`http://localhost:8080/api/user-packages/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setPurchasedPackages(data)
          console.log("✅ Purchased packages loaded:", data)
        } else {
          console.error("❌ Failed to fetch purchased packages")
          setErrorMessage("Failed to load your packages. Please refresh the page.")
        }
      } catch (error) {
        console.error("❌ Error fetching purchased packages:", error)
        setErrorMessage("Network error while loading packages. Please check your connection.")
      } finally {
        setPackagesLoading(false)
      }
    }

    fetchPurchasedPackages()
  }, [userId])

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!userId) {
        console.log("⚠️ No userId yet, skipping vehicle fetch")
        return
      }

      setVehiclesLoading(true)
      try {
        console.log("📤 Fetching vehicles for userId:", userId)

        const response = await fetch(`http://localhost:8080/api/vehicles/user/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setVehicles(data)
          console.log("✅ Vehicles loaded:", data)
        } else {
          console.error("❌ Failed to fetch vehicles")
          setErrorMessage("Failed to load vehicles. Please refresh the page.")
        }
      } catch (error) {
        console.error("❌ Error fetching vehicles:", error)
        setErrorMessage("Network error while loading vehicles. Please check your connection.")
      } finally {
        setVehiclesLoading(false)
      }
    }

    fetchVehicles()
  }, [userId])

  // Load selected station from localStorage
  useEffect(() => {
    const stationData = localStorage.getItem("selectedStation")
    if (stationData) {
      try {
        setSelectedStation(JSON.parse(stationData))
      } catch (error) {
        console.error("Error parsing station data:", error)
      }
    }
  }, [])

  // Clear error message when user changes selection (but keep success message)
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage("")
    }
  }, [selectedVehicleId, selectedPurchasedPackageId, errorMessage])

  const validateBooking = (): boolean => {
    if (!selectedVehicleId) {
      setErrorMessage("Please select a vehicle")
      return false
    }

    if (!selectedPurchasedPackageId) {
      setErrorMessage("Please select a package")
      return false
    }

    if (!selectedStation) {
      setErrorMessage("No station selected. Please select a station first.")
      return false
    }

    return true
  }

  const handleBookSwap = async () => {
    // Clear messages at the start
    setErrorMessage("")
    setSuccessMessage("")

    if (!validateBooking()) {
      return
    }

    if (!userId) {
      setErrorMessage("User ID not found. Please login again.")
      console.error("❌ UserId is null, redirecting to login")
      router.push("/login")
      return
    }

    console.log("📤 Creating swap booking with userId:", userId)
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")

      const requestBody = {
        userId: userId,
        stationId: selectedStation!.id,
        userPackageId: selectedPurchasedPackageId,
        vehicleId: selectedVehicleId,
      }

      console.log("📤 Swap booking request:", requestBody)

      const response = await fetch("http://localhost:8080/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      console.log("📥 API Response:", data)
      console.log("📥 Response status:", response.status)
      console.log("📥 Response OK:", response.ok)
      console.log("📥 Data status:", data.status)
      console.log("📥 Data bookingId:", data.bookingId)

      // Check multiple possible success conditions
      const isSuccess = response.ok || 
                       response.status === 200 || 
                       response.status === 201 ||
                       data.status === "success" ||
                       data.bookingId

      if (isSuccess) {
        // Success - show success message
        const finalBookingId = data.bookingId || data.data?.bookingId || data.id
        
        console.log("✅ Setting success state - Booking ID:", finalBookingId)
        
        // Set states
        setBookingId(finalBookingId)
        setSuccessMessage("Booking created successfully!")
        
        // Reset selections after a small delay to ensure success message is shown
        setTimeout(() => {
          setSelectedVehicleId(null)
          setSelectedPurchasedPackageId(null)
        }, 100)
        
        // Scroll to top to show success message
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 150)
        
        console.log("✅ Success message set:", "Booking created successfully!")
      } else {
        setErrorMessage(data.message || "Failed to create booking. Please try again.")
        console.log("❌ Booking failed:", data.message)
      }
    } catch (error) {
      console.error("❌ Error creating booking:", error)
      setErrorMessage("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
      console.log("✅ Loading finished")
    }
  }

  const handleSelectStation = () => {
    router.push("/stations")
  }

  const handleBuyPackages = () => {
    router.push("/booking/packages")
  }

  const handleViewBooking = () => {
    if (bookingId) {
      router.push(`/bookings/${bookingId}`)
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const activePackages = purchasedPackages.filter(p => 
    p.status && p.status.toLowerCase() === "active"
  )

  return (
    <>
      <BookingHeader title="Battery Swap Booking" />

      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Booking created successfully!</p>
                  <p className="text-sm text-green-700 mt-1">Your battery swap has been scheduled successfully.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Station Info Banner */}
          {selectedStation ? (
            <div className="mb-6 p-4 bg-[#A2F200]/10 border border-[#A2F200]/30 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Selected Station</h3>
                <div className="flex flex-wrap items-start gap-6 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedStation.name}</p>
                      <p className="text-gray-600">{selectedStation.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-700">{selectedStation.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">No station selected</p>
                    <p className="text-sm text-yellow-700 mt-1">Please select a station to continue booking</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSelectStation} className="ml-4 bg-white">
                  Select Station
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Vehicle Selection */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Vehicle</h3>
              <p className="text-sm text-gray-600 mb-6">Choose which vehicle to swap battery for</p>

              <VehicleSelector selectedVehicleId={selectedVehicleId} onSelectVehicle={setSelectedVehicleId} />
            </div>

            {/* Right: Package Selection */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Select Your Package</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBuyPackages}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy Packages
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-6">Choose from your purchased packages</p>

              {packagesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#7241CE] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading packages...</p>
                  </div>
                </div>
              ) : activePackages.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No active packages found</p>
                  <Button onClick={handleBuyPackages} className="bg-[#7241CE] hover:bg-[#5a2fa0] text-white">
                    Purchase a Package
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {activePackages.map((pkg) => {
                    const isMonthlyPlan = pkg.durationDays !== null && pkg.durationDays > 0
                    const isSelected = selectedPurchasedPackageId === pkg.id

                    return (
                      <Card
                        key={pkg.id}
                        className={cn(
                          "p-4 cursor-pointer transition-all hover:shadow-md",
                          isSelected
                            ? "border-[#A2F200] border-2 bg-[#A2F200]/5"
                            : "border-gray-200 hover:border-[#7241CE]",
                        )}
                        onClick={() => setSelectedPurchasedPackageId(pkg.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {isMonthlyPlan ? (
                                <Calendar className="w-4 h-4 text-[#7241CE]" />
                              ) : (
                                <Zap className="w-4 h-4 text-[#A2F200]" />
                              )}
                              <h4 className="font-semibold text-gray-900">{pkg.packageName}</h4>
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-2">{pkg.description}</p>
                            
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              {pkg.expiryDate && (
                                <span>Expires: {new Date(pkg.expiryDate).toLocaleDateString()}</span>
                              )}
                              {pkg.maxUsage && (
                                <span>Used: {pkg.usageCount}/{pkg.maxUsage}</span>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#A2F200] flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-black font-bold" />
                            </div>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Booking Summary */}
              {selectedVehicleId && selectedPurchasedPackageId && activePackages.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium text-gray-900">
                        {vehicles.find((v) => v.vehicleID === selectedVehicleId)?.vehicleModel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-medium text-gray-900">
                        {activePackages.find((p) => p.id === selectedPurchasedPackageId)?.packageName}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="text-gray-900 font-semibold">Status:</span>
                      <span className="text-green-600 font-semibold">Already Paid</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Button */}
              <Button
                className="w-full mt-6 bg-black text-white hover:bg-gray-800 h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handleBookSwap}
                disabled={
                  !selectedVehicleId ||
                  !selectedPurchasedPackageId ||
                  !selectedStation ||
                  isLoading ||
                  packagesLoading ||
                  vehiclesLoading
                }
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Booking...
                  </span>
                ) : (
                  "Confirm Swap Booking"
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-3">
                No payment required - using your purchased package
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}