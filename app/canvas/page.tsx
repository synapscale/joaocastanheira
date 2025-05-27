"use client"

import { useState, useEffect } from "react"
import { CanvasProvider } from "@/contexts/canvas-context"
import { CanvasHeader } from "@/components/canvas/canvas-header"
import { UnifiedCanvas } from "@/components/canvas/unified-canvas"
import { NodeSidebar } from "@/components/node-sidebar/node-sidebar"

export default function CanvasPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Auto-open sidebar on desktop
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  if (!mounted) {
    return (
      <div className="h-screen w-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 dark:text-slate-400">Carregando canvas...</span>
        </div>
      </div>
    )
  }

  return (
    <CanvasProvider autoSave={true}>
      <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <CanvasHeader />
        <div className="flex-1 relative overflow-hidden">
          <UnifiedCanvas sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
          <NodeSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        </div>
      </div>
    </CanvasProvider>
  )
}
