"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface SimplifiedLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  toolbar?: React.ReactNode
  className?: string
  sidebarOpen?: boolean
}

export function SimplifiedLayout({ children, sidebar, toolbar, className, sidebarOpen = true }: SimplifiedLayoutProps) {
  return (
    <div className={cn("h-full flex overflow-hidden", className)}>
      {/* Main content */}
      <div className="flex-1 relative">
        {toolbar}
        {children}
      </div>

      {/* Sidebar */}
      {sidebar && (
        <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", sidebarOpen ? "w-80" : "w-0")}>
          {sidebarOpen && sidebar}
        </div>
      )}
    </div>
  )
}
