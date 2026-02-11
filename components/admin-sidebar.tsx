"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, LayoutDashboard, Plug, Battery, Users, Package, BarChart3, Menu, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Station Management",
      href: "/admin/stations",
      icon: Plug,
    },
    {
      label: "Battery Management",
      href: "/admin/batteries",
      icon: Battery,
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Plan Management",
      href: "/admin/plans",
      icon: Package,
    },
    {
      label: "Reports & Analytics",
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      label: "User Reports",
      href: "/admin/user-reports",
      icon: MessageSquare,
    },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <aside
      className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {sidebarOpen && (
          <Link href="/admin" className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-[#7241CE]">EVSwap Admin</h1>
          </Link>
        )}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? "bg-[#7241CE]/20 text-[#7241CE] border border-[#7241CE]"
                  : "text-gray-700 hover:bg-gray-100 border border-transparent"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 border-red-200 bg-transparent"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
