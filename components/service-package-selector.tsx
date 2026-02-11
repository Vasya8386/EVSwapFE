"use client"

import { Card } from "@/components/ui/card"
import { Check, Zap, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface Package {
  packageId: number
  packageName: string
  description: string
  price: number
  durationDays: number | null
}

interface MonthlySubscription {
  isActive: boolean
  usageCount: number
  expiryDate: string
}

interface ServicePackageSelectorProps {
  packages: Package[]
  packagesLoading: boolean
  selectedPackageId: string | null
  onSelectPackage: (id: string) => void
  monthlySubscription?: MonthlySubscription
}

export function ServicePackageSelectorV2({
  packages,
  packagesLoading,
  selectedPackageId,
  onSelectPackage,
  monthlySubscription,
}: ServicePackageSelectorProps) {
  console.log("🆕 V2 Component - Packages:", packages)
  console.log("🆕 V2 Component - Loading:", packagesLoading)
  // Loading state
  if (packagesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading packages...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (packages.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-600">No packages available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {packages.map((pkg) => {
        const isMonthlyPlan = pkg.durationDays !== null && pkg.durationDays > 0

        return (
          <Card
            key={pkg.packageId}
            className={cn(
              "p-6 cursor-pointer transition-all hover:shadow-md",
              selectedPackageId === pkg.packageId.toString()
                ? "border-[#A2F200] border-2 bg-[#A2F200]/5"
                : "border-gray-200",
            )}
            onClick={() => onSelectPackage(pkg.packageId.toString())}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg mb-1">
                  {pkg.packageName}
                </h4>
                <p className="text-2xl font-bold text-gray-900">
                  ${pkg.price.toFixed(2)}
                </p>
              </div>

              {selectedPackageId === pkg.packageId.toString() && (
                <div className="w-6 h-6 rounded-full bg-[#A2F200] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-black" />
                </div>
              )}
            </div>

            {/* Package Description */}
            <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>

            {/* Duration Info */}
            {pkg.durationDays && (
              <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
                Valid for {pkg.durationDays} days
              </div>
            )}

            {/* Show subscription info if user has active monthly plan */}
            {isMonthlyPlan && monthlySubscription?.isActive && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-[#A2F200]" />
                  <span className="text-gray-700">
                    <span className="font-semibold">{monthlySubscription.usageCount}</span> swaps used this month
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">
                    Expires: <span className="font-semibold">{monthlySubscription.expiryDate}</span>
                  </span>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
