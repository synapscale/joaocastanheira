"use client"

import type React from "react"

import { memo, useEffect, useCallback } from "react"
import { ChevronLeft, Menu, X } from "lucide-react"
import { NavigationSectionBase } from "@/components/ui/base/navigation-section"
import { NavigationItemBase } from "@/components/ui/base/navigation-item"
import { NavigationUtils, CONSOLE_ITEM } from "@/config/navigation-config"
import { useSidebarState } from "@/hooks/use-sidebar-state"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Props para ModernSidebar
 */
interface ModernSidebarProps {
  itemVariant?: "default" | "compact" | "minimal"
  showDevelopmentTools?: boolean
  className?: string
  onStateChange?: (state: { isCollapsed: boolean; width: number }) => void
}

/**
 * Botão de toggle posicionado corretamente
 */
const SidebarToggle = memo(function SidebarToggle({
  isCollapsed,
  isMobile,
  isOpen,
  onToggle,
  sidebarWidth,
}: {
  isCollapsed: boolean
  isMobile: boolean
  isOpen: boolean
  onToggle: () => void
  sidebarWidth: number
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onToggle()
      }
    },
    [onToggle],
  )

  if (isMobile) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="fixed top-4 left-4 z-50 h-10 w-10 rounded-lg bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200"
        aria-label={isOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        "fixed top-6 z-20 h-8 w-8 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300",
        "flex items-center justify-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "hover:border-gray-300",
        isCollapsed && "rotate-180",
      )}
      style={{
        left: `${sidebarWidth - 16}px`, // Posiciona na borda direita da sidebar
      }}
      aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
      aria-expanded={!isCollapsed}
    >
      <ChevronLeft className="h-4 w-4 transition-transform duration-300" />
    </Button>
  )
})

/**
 * Header da sidebar otimizado
 */
const SidebarHeader = memo(function SidebarHeader({
  isCollapsed,
  isMobile,
}: {
  isCollapsed: boolean
  isMobile: boolean
}) {
  if (isCollapsed && !isMobile) {
    return (
      <header className="flex items-center justify-center h-16 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm" aria-hidden="true">
            N
          </span>
        </div>
      </header>
    )
  }

  return (
    <header className="flex items-center gap-3 h-16 px-6 border-b border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
        <span className="text-white font-bold text-sm" aria-hidden="true">
          N
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-gray-900 truncate">Node Creator</h1>
        <p className="text-xs text-gray-500 truncate">Sistema de Criação</p>
      </div>
    </header>
  )
})

/**
 * Item do console otimizado
 */
const ConsoleItem = memo(function ConsoleItem({
  isCollapsed,
  shouldShowTooltips,
}: {
  isCollapsed: boolean
  shouldShowTooltips: boolean
}) {
  return (
    <div className="border-t border-gray-100 pt-4">
      <NavigationItemBase
        item={CONSOLE_ITEM}
        isActive={false}
        variant="default"
        isMinimized={isCollapsed}
        showBadge={false}
        showTooltip={shouldShowTooltips}
      />
    </div>
  )
})

/**
 * ModernSidebar - Sidebar moderna com toggle posicionado corretamente
 */
export const ModernSidebar = memo(function ModernSidebar({
  itemVariant = "default",
  showDevelopmentTools,
  className,
  onStateChange,
}: ModernSidebarProps) {
  const sidebarState = useSidebarState()
  const { isCollapsed, isOverlay, isMobile, isOpen, width, toggle, close, shouldShowTooltips } = sidebarState

  // Notificar mudanças de estado
  useEffect(() => {
    onStateChange?.({ isCollapsed, width })
  }, [isCollapsed, width, onStateChange])

  // Gerenciar eventos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobile && isOpen) {
        close()
      }
    }

    if (isMobile && isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      // Prevenir scroll do body quando sidebar está aberta
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isMobile, isOpen, close])

  // Renderizar apenas toggle se mobile e fechado
  if (isMobile && !isOpen) {
    return <SidebarToggle isCollapsed={false} isMobile={true} isOpen={false} onToggle={toggle} sidebarWidth={0} />
  }

  return (
    <>
      {/* Backdrop para mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={close}
          onKeyDown={(e) => e.key === "Enter" && close()}
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base styles
          "relative flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-out",

          // Positioning and sizing
          isMobile
            ? ["fixed top-0 left-0 h-full z-50 shadow-2xl", isOpen ? "translate-x-0" : "-translate-x-full"]
            : ["h-full shadow-sm"],

          className,
        )}
        style={{
          width: isMobile ? 320 : width,
          transform: isMobile && !isOpen ? "translateX(-100%)" : undefined,
        }}
        role="complementary"
        aria-label="Navegação principal"
        aria-expanded={isOpen}
        aria-hidden={isMobile && !isOpen}
      >
        {/* Header */}
        <SidebarHeader isCollapsed={isCollapsed} isMobile={isMobile} />

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          aria-label="Menu principal"
        >
          <div className={cn("space-y-6", isCollapsed ? "px-2" : "px-6")}>
            {NavigationUtils.getAllSections().map(([sectionKey, sectionConfig]) => (
              <NavigationSectionBase
                key={sectionKey}
                section={sectionConfig}
                sectionKey={sectionKey}
                itemVariant={itemVariant}
                isMinimized={isCollapsed}
                showBadges={!isCollapsed}
                showTooltips={shouldShowTooltips()}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <footer className={cn("mt-auto", isCollapsed ? "px-2 pb-4" : "px-6 pb-6")}>
          <ConsoleItem isCollapsed={isCollapsed} shouldShowTooltips={shouldShowTooltips()} />

          {/* Development tools */}
          {(showDevelopmentTools ?? NavigationUtils.shouldShowDevelopmentTools()) && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <NavigationSectionBase
                section={NavigationUtils.getDevelopmentConfig()}
                sectionKey="development"
                itemVariant={itemVariant}
                isMinimized={isCollapsed}
                showBadges={!isCollapsed}
                showTooltips={shouldShowTooltips()}
              />
            </div>
          )}
        </footer>
      </aside>

      {/* Toggle button - posicionado após a sidebar para ficar por cima */}
      {!isMobile && (
        <SidebarToggle
          isCollapsed={isCollapsed}
          isMobile={false}
          isOpen={isOpen}
          onToggle={toggle}
          sidebarWidth={width}
        />
      )}
    </>
  )
})
