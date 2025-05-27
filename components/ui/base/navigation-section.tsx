"use client"

import { memo, useMemo } from "react"
import { usePathname } from "next/navigation"
import { NavigationItemBase } from "./navigation-item"
import type { NavigationSection } from "@/config/navigation-config"
import { cn } from "@/lib/utils"

/**
 * Props for NavigationSectionBase
 */
interface NavigationSectionBaseProps {
  section: NavigationSection
  sectionKey: string
  itemVariant?: "default" | "compact" | "minimal"
  isMinimized?: boolean
  showBadges?: boolean
  showTooltips?: boolean
  className?: string
}

/**
 * NavigationSectionBase - Seção de navegação moderna
 */
export const NavigationSectionBase = memo(function NavigationSectionBase({
  section,
  sectionKey,
  itemVariant = "default",
  isMinimized = false,
  showBadges = true,
  showTooltips = true,
  className,
}: NavigationSectionBaseProps) {
  const pathname = usePathname()

  // Filtrar itens para estado minimizado
  const visibleItems = useMemo(() => {
    if (!isMinimized) return section.items

    // No estado minimizado, mostrar apenas itens de alta prioridade
    return section.items
      .filter((item) => !item.disabled)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 3) // Máximo 3 itens quando minimizado
  }, [section.items, isMinimized])

  // Não renderizar se a seção não deve aparecer minimizada
  if (isMinimized && section.showInMinimized === false) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)} role="group" aria-labelledby={`section-${sectionKey}-title`}>
      {/* Título da seção */}
      {!isMinimized && (
        <div className="px-0 pb-1">
          <h3
            id={`section-${sectionKey}-title`}
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
          >
            {section.title}
          </h3>
        </div>
      )}

      {/* Separador visual para estado minimizado */}
      {isMinimized && visibleItems.length > 0 && (
        <div className="flex justify-center pb-2">
          <div className="w-6 h-px bg-gray-200" />
        </div>
      )}

      {/* Itens de navegação */}
      <nav
        className={cn("space-y-1", isMinimized && "flex flex-col items-center space-y-2")}
        aria-label={section.title}
      >
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <NavigationItemBase
              key={item.href}
              item={item}
              isActive={isActive}
              variant={itemVariant}
              isMinimized={isMinimized}
              showBadge={showBadges}
              showTooltip={showTooltips}
            />
          )
        })}
      </nav>
    </div>
  )
})
