"use client"

import type React from "react"

/**
 * ENHANCED COLLAPSIBLE SIDEBAR
 *
 * Sidebar aprimorado que corresponde exatamente ao design fornecido,
 * com funcionalidade de minimizar/maximizar, animações suaves,
 * persistência de estado e suporte completo à acessibilidade.
 */

import { forwardRef, useCallback, useEffect } from "react"
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { NavigationSectionBase } from "@/components/ui/base/navigation-section"
import { NavigationItemBase } from "@/components/ui/base/navigation-item"
import { NavigationUtils } from "@/config/navigation-config"
import { useSidebarState } from "@/hooks/use-sidebar-state"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Props for EnhancedCollapsibleSidebar
 */
interface EnhancedCollapsibleSidebarProps {
  /** Variante visual dos itens */
  itemVariant?: "default" | "compact" | "minimal"
  /** Se deve mostrar ferramentas de desenvolvimento */
  showDevelopmentTools?: boolean
  /** Se deve mostrar badges nos itens */
  showBadges?: boolean
  /** Se deve mostrar tooltips nos itens */
  showTooltips?: boolean
  /** Classe CSS adicional */
  className?: string
  /** Callback quando o estado muda */
  onStateChange?: (state: { isMinimized: boolean; isHidden: boolean }) => void
}

/**
 * EnhancedCollapsibleSidebar - Sidebar que corresponde ao design fornecido
 */
export const EnhancedCollapsibleSidebar = forwardRef<HTMLElement, EnhancedCollapsibleSidebarProps>(
  (
    { itemVariant = "default", showDevelopmentTools, showBadges = true, showTooltips = true, className, onStateChange },
    ref,
  ) => {
    const { sidebarState, isMinimized, isHidden, isMobile, toggleMinimized, toggleVisibility, shouldShowTooltips } =
      useSidebarState()

    // Notify parent of state changes
    useEffect(() => {
      onStateChange?.({ isMinimized, isHidden })
    }, [isMinimized, isHidden, onStateChange])

    // Determine if development tools should be shown
    const shouldShowDevTools = showDevelopmentTools ?? NavigationUtils.shouldShowDevelopmentTools()

    /**
     * Handle keyboard navigation for toggle button
     */
    const handleToggleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          if (isMobile) {
            toggleVisibility()
          } else {
            toggleMinimized()
          }
        }
      },
      [isMobile, toggleMinimized, toggleVisibility],
    )

    /**
     * Render toggle button
     */
    const renderToggleButton = () => {
      const isMobileToggle = isMobile
      const icon = isMobileToggle ? isHidden ? <Menu /> : <X /> : isMinimized ? <ChevronRight /> : <ChevronLeft />

      const label = isMobileToggle
        ? isHidden
          ? "Abrir menu de navegação"
          : "Fechar menu de navegação"
        : isMinimized
          ? "Expandir sidebar"
          : "Minimizar sidebar"

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={isMobileToggle ? toggleVisibility : toggleMinimized}
          onKeyDown={handleToggleKeyDown}
          aria-label={label}
          title={label}
          className={cn(
            "shrink-0 transition-all duration-200 hover:bg-accent",
            isMinimized ? "w-8 h-8 p-0" : "w-auto h-8 px-2",
          )}
        >
          {icon}
        </Button>
      )
    }

    /**
     * Render console item (special item at bottom)
     */
    const renderConsoleItem = () => {
      const consoleItem = NavigationUtils.getConsoleItem()

      return (
        <div className={cn("border-t border-border transition-all duration-200", isMinimized ? "pt-2" : "pt-4")}>
          <NavigationItemBase
            item={consoleItem}
            isActive={false}
            variant={itemVariant}
            isMinimized={isMinimized}
            showBadge={showBadges && !isMinimized}
            showTooltip={showTooltips || shouldShowTooltips()}
          />
        </div>
      )
    }

    /**
     * Render development section
     */
    const renderDevelopmentSection = () => {
      if (!shouldShowDevTools) return null

      const developmentConfig = NavigationUtils.getDevelopmentConfig()

      return (
        <div className={cn("border-t border-border transition-all duration-200", isMinimized ? "pt-2" : "pt-4")}>
          <NavigationSectionBase
            section={developmentConfig}
            sectionKey="development"
            itemVariant={itemVariant}
            isMinimized={isMinimized}
            showBadges={showBadges && !isMinimized}
            showTooltips={showTooltips || shouldShowTooltips()}
          />
        </div>
      )
    }

    /**
     * Render sidebar header
     */
    const renderSidebarHeader = () => (
      <div className={cn("flex items-center justify-end transition-all duration-200", isMinimized ? "pb-4" : "pb-4")}>
        {renderToggleButton()}
      </div>
    )

    // Don't render if hidden on mobile
    if (isHidden && isMobile) {
      return <div className="fixed top-4 left-4 z-50">{renderToggleButton()}</div>
    }

    return (
      <>
        {/* Mobile overlay */}
        {isMobile && !isHidden && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleVisibility} aria-hidden="true" />
        )}

        {/* Sidebar */}
        <aside
          ref={ref}
          className={cn(
            // Base styles
            "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",

            // Width transitions
            isMinimized ? "w-16" : "w-64",

            // Mobile positioning
            isMobile && ["fixed top-0 left-0 h-full z-50", isHidden && "-translate-x-full"],

            // Desktop positioning
            !isMobile && "relative h-full",

            // Custom className
            className,
          )}
          role="complementary"
          aria-label="Navegação principal"
          aria-expanded={!isMinimized}
        >
          <div className={cn("flex flex-col h-full transition-all duration-200", isMinimized ? "p-2" : "p-4")}>
            {/* Header with toggle button */}
            {renderSidebarHeader()}

            {/* Navigation sections */}
            <div className="flex-1 overflow-y-auto space-y-6">
              {NavigationUtils.getAllSections().map(([sectionKey, sectionConfig]) => (
                <NavigationSectionBase
                  key={sectionKey}
                  section={sectionConfig}
                  sectionKey={sectionKey}
                  itemVariant={itemVariant}
                  isMinimized={isMinimized}
                  showBadges={showBadges && !isMinimized}
                  showTooltips={showTooltips || shouldShowTooltips()}
                />
              ))}
            </div>

            {/* Bottom items */}
            <div className="mt-auto space-y-2">
              {/* Console item */}
              {renderConsoleItem()}

              {/* Development tools */}
              {renderDevelopmentSection()}
            </div>
          </div>
        </aside>
      </>
    )
  },
)

EnhancedCollapsibleSidebar.displayName = "EnhancedCollapsibleSidebar"

/**
 * Sidebar variants for common use cases
 */
export const EnhancedSidebarVariants = {
  /**
   * Default collapsible sidebar
   */
  Default: () => <EnhancedCollapsibleSidebar />,

  /**
   * Compact variant for dense layouts
   */
  Compact: () => <EnhancedCollapsibleSidebar itemVariant="compact" />,

  /**
   * Minimal variant for simple interfaces
   */
  Minimal: () => <EnhancedCollapsibleSidebar itemVariant="minimal" showBadges={false} />,

  /**
   * Development variant with dev tools visible
   */
  Development: () => <EnhancedCollapsibleSidebar showDevelopmentTools={true} />,
} as const
