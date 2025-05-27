"use client"

import type React from "react"

import { memo, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { CollapsibleSidebar } from "./collapsible-sidebar"

/**
 * Props for AppLayout
 */
interface AppLayoutProps {
  children: React.ReactNode
  sidebarVariant?: "default" | "compact" | "minimal"
  showSidebar?: boolean
  showDevelopmentTools?: boolean
  className?: string
  sidebarProps?: React.ComponentProps<typeof CollapsibleSidebar>
}

/**
 * Sidebar state interface
 */
interface SidebarState {
  isMinimized: boolean
  isHidden: boolean
}

/**
 * AppLayout - Optimized layout with collapsible sidebar
 */
export const AppLayout = memo(function AppLayout({
  children,
  sidebarVariant = "default",
  showSidebar = true,
  showDevelopmentTools,
  className,
  sidebarProps,
}: AppLayoutProps) {
  const [sidebarState, setSidebarState] = useState<SidebarState>({ isMinimized: false, isHidden: false })

  const handleSidebarStateChange = useCallback((state: SidebarState) => {
    setSidebarState(state)
  }, [])

  return (
    <div className={cn("flex h-screen bg-gray-50", className)}>
      {/* Sidebar */}
      {showSidebar && (
        <CollapsibleSidebar
          itemVariant={sidebarVariant}
          showDevelopmentTools={showDevelopmentTools}
          onStateChange={handleSidebarStateChange}
          {...sidebarProps}
        />
      )}

      {/* Main content */}
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300 ease-in-out bg-gray-50",
          // Ensure proper spacing when sidebar is present
          showSidebar && !sidebarState.isHidden && "lg:ml-0",
        )}
      >
        <div className="h-full p-6">{children}</div>
      </main>
    </div>
  )
})

/**
 * Pre-configured layout variants
 */
export const LayoutVariants = {
  Default: ({ children }: { children: React.ReactNode }) => <AppLayout>{children}</AppLayout>,
  Dashboard: ({ children }: { children: React.ReactNode }) => (
    <AppLayout sidebarVariant="compact">{children}</AppLayout>
  ),
  Fullscreen: ({ children }: { children: React.ReactNode }) => <AppLayout showSidebar={false}>{children}</AppLayout>,
  Development: ({ children }: { children: React.ReactNode }) => (
    <AppLayout showDevelopmentTools={true}>{children}</AppLayout>
  ),
} as const
