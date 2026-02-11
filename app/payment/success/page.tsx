"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Sparkles, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
  const [transactionId, setTransactionId] = useState<string>("")
  const [packageName, setPackageName] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get payment details from URL params (PayPal returns these)
        const paymentId = searchParams.get("paymentId") || searchParams.get("token")
        const payerId = searchParams.get("PayerID")
        
        console.log("📥 Payment callback received:", { paymentId, payerId })
        console.log("📥 All URL params:", Object.fromEntries(searchParams.entries()))

        if (!paymentId) {
          setStatus("error")
          setErrorMessage("Payment ID not found in URL")
          return
        }

        // PayerID might not be in URL if backend already executed payment
        // In that case, we just need to save the package
        const token = localStorage.getItem("token")

        // Check if payment was already executed by backend
        let transactionId = `TXN-${Date.now().toString().slice(-8)}` // Default transaction ID
        
        if (!payerId) {
          console.log("⚠️ PayerID not found - payment may have been executed by backend")
          // Skip execute step, go straight to saving package
        } else {
          console.log("📤 Executing payment...")

          // Step 1: Execute payment (this will update Transaction and Payment tables)
          const executeResponse = await fetch(
            `http://localhost:8080/api/payment/execute?paymentId=${paymentId}&PayerID=${payerId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            }
          )

          const executeData = await executeResponse.json()
          console.log("📥 Execute payment response:", executeData)
          console.log("📥 Response status:", executeResponse.status)
          console.log("📥 Response ok:", executeResponse.ok)
          console.log("📥 Execute data status:", executeData.status)

          if (!executeResponse.ok) {
            setStatus("error")
            setErrorMessage(executeData.message || "Payment execution failed")
            return
          }

          // Check both "success" and "SUCCESS" since backend might return uppercase
          if (executeData.status && executeData.status.toLowerCase() !== "success") {
            setStatus("error")
            setErrorMessage(executeData.message || "Payment status is not success")
            return
          }
          
          // Get transaction ID from execute response if available
          if (executeData.transactionId) {
            transactionId = executeData.transactionId
          }
        }

        // Step 2: Get pending package purchase info
        const pendingPurchaseStr = localStorage.getItem("pendingPackagePurchase")
        if (!pendingPurchaseStr) {
          setStatus("error")
          setErrorMessage("Purchase information not found")
          return
        }

        const pendingPurchase = JSON.parse(pendingPurchaseStr)
        const userId = localStorage.getItem("userId")

        if (!userId) {
          setStatus("error")
          setErrorMessage("User not logged in")
          return
        }

        console.log("📤 Saving package to UserPackagePlans...")

        // Step 3: Save to UserPackagePlans table
        const savePackageResponse = await fetch("http://localhost:8080/api/user-packages/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            userId: parseInt(userId),
            packageId: pendingPurchase.packageId,
            transactionDate: new Date().toISOString(),
          }),
        })

        const savePackageData = await savePackageResponse.json()
        console.log("📥 Save package response:", savePackageData)
        console.log("📥 Save package status:", savePackageResponse.status)
        console.log("📥 Save package ok:", savePackageResponse.ok)

        if (savePackageResponse.ok && savePackageData.status === "success") {
          setStatus("success")
          setTransactionId(transactionId) // Use the transactionId variable we set earlier
          setPackageName(savePackageData.packageName || "Your Package")
          
          // Clear pending purchase
          localStorage.removeItem("pendingPackagePurchase")
          localStorage.removeItem("paymentId")
          
          console.log("✅ Payment processed and package activated successfully")
        } else {
          // Payment succeeded but package save failed
          setStatus("error")
          setErrorMessage("Payment successful but failed to activate package. Please contact support.")
        }
      } catch (error) {
        console.error("❌ Error processing payment:", error)
        setStatus("error")
        setErrorMessage("An error occurred while processing your payment")
      }
    }

    processPayment()
  }, [searchParams])

  // Processing state
  if (status === "processing") {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#B79FE7]/40 z-10"></div>
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-40"
            style={{
              backgroundImage: "url('https://media.licdn.com/dms/image/D4D12AQG7IgvLrJih2g/article-cover_image-shrink_720_1280/0/1713106996218?e=2147483647&v=beta&t=9XHJWZbHtBqyZ6b4ByVsAQiITLRmnI3nNcb-49HYR4E')",
            }}
          ></div>
        </div>
        
        <Card className="max-w-md w-full shadow-2xl border-2 border-[#A2F200]/30 bg-white relative z-20">
          <CardContent className="py-16">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-[#A2F200] animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black mb-2">Processing Payment</h2>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#B79FE7]/40 z-10"></div>
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-40"
            style={{
              backgroundImage: "url('https://media.licdn.com/dms/image/D4D12AQG7IgvLrJih2g/article-cover_image-shrink_720_1280/0/1713106996218?e=2147483647&v=beta&t=9XHJWZbHtBqyZ6b4ByVsAQiITLRmnI3nNcb-49HYR4E')",
            }}
          ></div>
        </div>
        
        <Card className="max-w-md w-full shadow-2xl border-2 border-red-500/50 bg-white relative z-20">
          <CardHeader className="text-center space-y-4">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-red-500">Payment Failed</CardTitle>
            <CardDescription className="text-base text-gray-600">{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-[#A2F200] hover:bg-[#8DD700] text-black font-bold" size="lg">
              <Link href="/booking/packages">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-black text-black hover:bg-gray-100" size="lg">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#B79FE7]/40 z-10"></div>
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: "url('https://media.licdn.com/dms/image/D4D12AQG7IgvLrJih2g/article-cover_image-shrink_720_1280/0/1713106996218?e=2147483647&v=beta&t=9XHJWZbHtBqyZ6b4ByVsAQiITLRmnI3nNcb-49HYR4E')",
          }}
        ></div>
      </div>
      
      <Card className="max-w-md w-full shadow-2xl border-2 border-[#A2F200] bg-white relative z-20">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="relative mx-auto">
            <div className="absolute inset-0 w-20 h-20 bg-[#A2F200] rounded-full blur-2xl opacity-30"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-[#A2F200] to-[#8DD700] rounded-full flex items-center justify-center shadow-lg shadow-[#A2F200]/50">
              <CheckCircle className="w-12 h-12 text-black" />
            </div>
          </div>

          <CardTitle className="text-3xl font-bold text-[#A2F200]">Payment Successful!</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Your package has been activated successfully
          </CardDescription>

          <div className="flex items-center justify-center gap-2 text-[#A2F200]">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <Sparkles className="w-3 h-3 animate-pulse delay-75" />
            <Sparkles className="w-4 h-4 animate-pulse delay-150" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {packageName && (
            <div className="bg-gradient-to-r from-[#A2F200]/20 to-[#A2F200]/10 border-2 border-[#A2F200] rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Package Activated:</p>
              <p className="font-bold text-lg text-[#A2F200]">{packageName}</p>
            </div>
          )}

          <div className="bg-[#794BD1]/10 border-2 border-[#794BD1] rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Transaction ID:</span>
              <span className="font-mono font-semibold text-[#794BD1]">{transactionId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Status:</span>
              <span className="font-semibold text-[#A2F200] flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Date:</span>
              <span className="font-medium text-gray-900">{new Date().toLocaleDateString("vi-VN")}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button asChild className="w-full bg-[#A2F200] hover:bg-[#8DD700] text-black font-bold" size="lg">
              <Link href="/booking/swap">Use Your Package</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-2 border-black text-black hover:bg-[#794BD1] hover:text-white hover:border-[#794BD1] bg-transparent font-semibold transition-colors"
              size="lg"
            >
              <Link href="/booking/history">View History</Link>
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 pt-2">
            A confirmation email has been sent to your registered email address
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
