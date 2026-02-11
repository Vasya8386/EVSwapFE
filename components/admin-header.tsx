"use client"

import { Zap } from "lucide-react"

interface AdminHeaderProps {
  title: string
}

export function AdminHeader({ title }: AdminHeaderProps) {
  return (
    <div className="relative border-b border-[#8B5FE8] bg-[#7241CE]/95">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#A2F200 1px, transparent 1px), linear-gradient(90deg, #A2F200 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, #A2F200 35px, #A2F200 36px)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #A2F200 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-[#A2F200]/5 blur-3xl" />
      <div className="absolute -left-20 top-0 w-32 h-32 rounded-full bg-[#A2F200]/5 blur-2xl" />

      <div className="px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#A2F200] flex items-center justify-center">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
      </div>
    </div>
  )
}
