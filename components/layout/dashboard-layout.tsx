"use client"

/**
 * DASHBOARD LAYOUT
 *
 * Layout completo que corresponde exatamente ao design fornecido,
 * incluindo sidebar colapsível e área de conteúdo principal.
 */

import type React from "react"
import { cn } from "@/lib/utils"
import { useState, useCallback } from "react"
import { EnhancedCollapsibleSidebar } from "./enhanced-collapsible-sidebar"

/**
 * Props para DashboardLayout
 */
interface DashboardLayoutProps {
  /** Conteúdo principal */
  children: React.ReactNode
  /** Variante do sidebar */
  sidebarVariant?: "default" | "compact" | "minimal"
  /** Se deve mostrar sidebar */
  showSidebar?: boolean
  /** Se deve mostrar ferramentas de desenvolvimento */
  showDevelopmentTools?: boolean
  /** Classe CSS adicional */
  className?: string
  /** Props adicionais para o sidebar */
  sidebarProps?: React.ComponentProps<typeof EnhancedCollapsibleSidebar>
}

/**
 * DashboardLayout - Layout que corresponde ao design fornecido
 */
export function DashboardLayout({
  children,
  sidebarVariant = "default",
  showSidebar = true,
  showDevelopmentTools,
  className,
  sidebarProps,
}: DashboardLayoutProps) {
  const [sidebarState, setSidebarState] = useState({ isMinimized: false, isHidden: false })

  const handleSidebarStateChange = useCallback((state: { isMinimized: boolean; isHidden: boolean }) => {
    setSidebarState(state)
  }, [])

  return (
    <div className={cn("flex h-screen bg-gray-50", className)}>
      {/* Sidebar */}
      {showSidebar && (
        <EnhancedCollapsibleSidebar
          itemVariant={sidebarVariant}
          showDevelopmentTools={showDevelopmentTools}
          onStateChange={handleSidebarStateChange}
          {...sidebarProps}
        />
      )}

      {/* Main content area */}
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300 ease-in-out bg-gray-50",
          // Adjust margin for desktop when sidebar is visible
          showSidebar && !sidebarState.isHidden && "lg:ml-0",
        )}
      >
        <div className="h-full p-6">{children}</div>
      </main>
    </div>
  )
}

/**
 * Layout variants para casos comuns
 */
export const DashboardLayoutVariants = {
  /**
   * Layout padrão com sidebar completo
   */
  Default: ({ children }: { children: React.ReactNode }) => <DashboardLayout>{children}</DashboardLayout>,

  /**
   * Layout compacto para dashboards
   */
  Compact: ({ children }: { children: React.ReactNode }) => (
    <DashboardLayout sidebarVariant="compact">{children}</DashboardLayout>
  ),

  /**
   * Layout sem sidebar para páginas fullscreen
   */
  Fullscreen: ({ children }: { children: React.ReactNode }) => (
    <DashboardLayout showSidebar={false}>{children}</DashboardLayout>
  ),

  /**
   * Layout para desenvolvimento com ferramentas visíveis
   */
  Development: ({ children }: { children: React.ReactNode }) => (
    <DashboardLayout showDevelopmentTools={true}>{children}</DashboardLayout>
  ),
} as const
