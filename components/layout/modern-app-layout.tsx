"use client"

import type React from "react"
import { memo, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { UnifiedSidebar } from "./unified-sidebar"

/**
 * Props para ModernAppLayout
 */
interface ModernAppLayoutProps {
  children: React.ReactNode
  sidebarVariant?: "default" | "compact" | "minimal"
  showSidebar?: boolean
  showDevelopmentTools?: boolean
  className?: string
  contentClassName?: string
}

/**
 * Estado do layout
 */
interface LayoutState {
  isCollapsed: boolean
  width: number
}

/**
 * ModernAppLayout - Layout com sidebar visível e sem espaços em branco
 */
export const ModernAppLayout = memo(function ModernAppLayout({
  children,
  sidebarVariant = "default",
  showSidebar = true,
  showDevelopmentTools,
  className,
  contentClassName,
}: ModernAppLayoutProps) {
  const [layoutState, setLayoutState] = useState<LayoutState>({
    isCollapsed: false,
    width: 280,
  })

  // Handler otimizado para mudanças de estado
  const handleSidebarStateChange = useCallback((state: LayoutState) => {
    setLayoutState(state)
  }, [])

  return (
    <div className={cn("flex h-screen w-full overflow-hidden bg-background", className)}>
      {/* Sidebar - sempre visível em desktop quando showSidebar for true */}
      {showSidebar && (
        <aside
          className={cn(
            "flex-shrink-0 border-r border-border bg-card/50 backdrop-blur-sm",
            "w-64", // Largura fixa da sidebar
            "hidden lg:flex", // Oculta em mobile, mostra em desktop
            "flex-col", // Layout vertical
          )}
        >
          <UnifiedSidebar
            itemVariant={sidebarVariant}
            showDevelopmentTools={showDevelopmentTools}
            showBadges={true}
            showTooltips={true}
          />
        </aside>
      )}

      {/* Área de conteúdo principal */}
      <main
        className={cn(
          "flex-1 min-w-0 flex flex-col overflow-hidden",
          "bg-gradient-to-br from-background to-muted/20",
          contentClassName,
        )}
        role="main"
        aria-label="Conteúdo principal"
      >
        {/* Content wrapper com scroll adequado */}
        <div className="flex-1 overflow-auto">
          <div className="w-full h-full">{children}</div>
        </div>
      </main>
    </div>
  )
})

/**
 * Variantes com sidebar visível
 */
export const LayoutVariants = {
  Default: memo(({ children }: { children: React.ReactNode }) => (
    <ModernAppLayout showSidebar={true}>{children}</ModernAppLayout>
  )),

  WithSidebar: memo(({ children }: { children: React.ReactNode }) => (
    <ModernAppLayout showSidebar={true}>{children}</ModernAppLayout>
  )),

  NoSidebar: memo(({ children }: { children: React.ReactNode }) => (
    <ModernAppLayout showSidebar={false}>{children}</ModernAppLayout>
  )),

  Dashboard: memo(({ children }: { children: React.ReactNode }) => (
    <ModernAppLayout sidebarVariant="compact" showSidebar={true}>
      {children}
    </ModernAppLayout>
  )),

  Fullscreen: memo(({ children }: { children: React.ReactNode }) => (
    <ModernAppLayout showSidebar={false}>{children}</ModernAppLayout>
  )),
} as const

// Adicionar displayName para debugging
LayoutVariants.Default.displayName = "DefaultLayout"
LayoutVariants.WithSidebar.displayName = "WithSidebarLayout"
LayoutVariants.NoSidebar.displayName = "NoSidebarLayout"
LayoutVariants.Dashboard.displayName = "DashboardLayout"
LayoutVariants.Fullscreen.displayName = "FullscreenLayout"
