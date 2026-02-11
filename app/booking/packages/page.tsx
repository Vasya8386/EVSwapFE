"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { BookingHeader } from "@/components/booking-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Zap, Calendar, Clock, Sparkles, AlertCircle } from "lucide-react"

interface Package {
  packageId: number
  packageName: string
  description: string
  price: number
  durationDays: number | null
}

export default function PackagesPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()
  
  const [packages, setPackages] = useState<Package[]>([])
  const [packagesLoading, setPackagesLoading] = useState(false)
  const [processingPackageId, setProcessingPackageId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [userId, setUserId] = useState<number | null>(null)

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

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      setPackagesLoading(true)
      try {
        const response = await fetch("http://localhost:8080/api/packages", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setPackages(data)
          console.log("✅ Packages loaded:", data)
        } else {
          console.error("❌ Failed to fetch packages")
          setErrorMessage("Failed to load service packages. Please refresh the page.")
        }
      } catch (error) {
        console.error("❌ Error fetching packages:", error)
        setErrorMessage("Network error while loading packages. Please check your connection.")
      } finally {
        setPackagesLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const handlePurchasePackage = async (packageId: number) => {
    setErrorMessage("")

    if (!userId) {
      setErrorMessage("User ID not found. Please login again.")
      console.error("❌ UserId is null, redirecting to login")
      router.push("/login")
      return
    }

    console.log("📤 Creating payment for package with userId:", userId)
    setProcessingPackageId(packageId)

    try {
      const token = localStorage.getItem("token")
      const selectedPackage = packages.find((p) => p.packageId === packageId)
      
      if (!selectedPackage) {
        setErrorMessage("Package not found")
        setProcessingPackageId(null)
        return
      }

      // Match exact API request body format
      const requestBody = {
        userId: userId,
        stationId: 1, // Use default station ID for package purchase
        packageId: packageId,
        amount: selectedPackage.price,
        currency: "USD",
        description: `Package purchase: ${selectedPackage.packageName}`,
      }

      console.log("📤 Payment request:", requestBody)
      console.log("📤 Token:", token ? "Present" : "Missing")

      const response = await fetch("http://localhost:8080/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      console.log("📥 API Response:", data)

      if (response.ok && data.redirect_url) {
        // Save payment info
        if (data.payment_id) {
          localStorage.setItem("paymentId", data.payment_id)
        }
        localStorage.setItem(
          "pendingPackagePurchase",
          JSON.stringify({
            packageId: packageId,
            timestamp: new Date().toISOString(),
          }),
        )

        console.log("✅ Redirecting to PayPal:", data.redirect_url)
        window.location.href = data.redirect_url
      } else {
        setErrorMessage(data.message || "Failed to create payment. Please try again.")
        setProcessingPackageId(null)
      }
    } catch (error) {
      console.error("❌ Error creating payment:", error)
      setErrorMessage("Network error. Please check your connection and try again.")
      setProcessingPackageId(null)
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

  return (
    <>
      <BookingHeader title="Service Packages" />

      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase Your Package</h3>
            <p className="text-gray-600">Buy a package now and use it later for battery swaps</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          {packagesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#7241CE] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading packages...</p>
              </div>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">No packages available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                const isMonthlyPlan = pkg.durationDays !== null && pkg.durationDays > 0
                const isProcessing = processingPackageId === pkg.packageId

                return (
                  <Card
                    key={pkg.packageId}
                    className="p-6 transition-all hover:shadow-lg hover:-translate-y-1 border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isMonthlyPlan ? (
                            <Calendar className="w-5 h-5 text-[#7241CE]" />
                          ) : (
                            <Zap className="w-5 h-5 text-[#A2F200]" />
                          )}
                          <h4 className="font-bold text-gray-900 text-lg">{pkg.packageName}</h4>
                        </div>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-3xl font-bold text-[#7241CE]">${pkg.price.toFixed(0)}</span>
                          <span className="text-gray-600 text-sm">{isMonthlyPlan ? "/month" : "/swap"}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{pkg.description}</p>

                    {pkg.durationDays && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-lg mb-4">
                        <Clock className="w-4 h-4 text-[#7241CE]" />
                        <span>Valid for {pkg.durationDays} days</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-[#A2F200] mt-0.5 flex-shrink-0" />
                          <span>Quick battery swap service</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-[#A2F200] mt-0.5 flex-shrink-0" />
                          <span>All stations available</span>
                        </li>
                        {isMonthlyPlan && (
                          <>
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-[#A2F200] mt-0.5 flex-shrink-0" />
                              <span>Unlimited swaps</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              <Sparkles className="w-4 h-4 text-[#A2F200] mt-0.5 flex-shrink-0" />
                              <span className="font-semibold text-[#7241CE]">Priority service</span>
                            </li>
                          </>
                        )}
                      </ul>

                      <Button
                        className="w-full bg-black text-white hover:bg-gray-800 h-12 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handlePurchasePackage(pkg.packageId)}
                        disabled={isProcessing || packagesLoading}
                      >
                        {isProcessing ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </span>
                        ) : (
                          `Purchase for $${pkg.price.toFixed(2)}`
                        )}
                      </Button>
                      
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Secure payment via PayPal
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}