"use client"

import { useState, useEffect } from "react"
import { MarketplaceBrowser } from "@/components/marketplace/marketplace-browser"
import { SkillsMarketplaceSidebar } from "@/components/marketplace/skills-marketplace-sidebar"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MarketplacePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
        <h1 className="text-xl font-semibold">Marketplace</h1>
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "w-full lg:w-80 xl:w-96 bg-card border-r transition-all duration-300 ease-in-out",
          "lg:relative lg:translate-x-0",
          isMobile
            ? sidebarOpen
              ? "fixed inset-y-0 left-0 z-50 translate-x-0 shadow-lg"
              : "fixed inset-y-0 left-0 z-50 -translate-x-full"
            : "relative",
        )}
      >
        <SkillsMarketplaceSidebar onItemSelect={() => isMobile && setSidebarOpen(false)} />
      </aside>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        <MarketplaceBrowser />
      </main>
    </div>
  )
}
