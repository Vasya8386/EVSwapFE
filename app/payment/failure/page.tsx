import Link from "next/link"
import { XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-700">Payment Failed</CardTitle>
          <CardDescription className="text-base text-gray-600">We couldn't process your transaction</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Common reasons for payment failure:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Insufficient funds in your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Incorrect card details or expired card</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Network connectivity issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Transaction declined by your bank</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
              <Link href="/booking/swap" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
              size="lg"
            >
              <Link href="/booking/swap">Return to Booking</Link>
            </Button>

            <Button asChild variant="ghost" className="w-full text-gray-600 hover:text-gray-900" size="lg">
              <Link href="/booking/support">Contact Support</Link>
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 pt-2">Need help? Contact our support team for assistance</p>
        </CardContent>
      </Card>
    </div>
  )
}
