"use client"

import type React from "react"

import { memo, useMemo, useCallback } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { NavigationItem } from "@/config/navigation-config"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Props para NavigationItemBase
 */
interface NavigationItemBaseProps {
  item: NavigationItem
  isActive?: boolean
  variant?: "default" | "compact" | "minimal"
  isMinimized?: boolean
  className?: string
  showBadge?: boolean
  showTooltip?: boolean
}

/**
 * NavigationItemBase - Item de navegação otimizado
 */
export const NavigationItemBase = memo(function NavigationItemBase({
  item,
  isActive = false,
  variant = "default",
  isMinimized = false,
  className,
  showBadge = true,
  showTooltip = true,
}: NavigationItemBaseProps) {
  const IconComponent = item.icon

  // Memoizar valores computados
  const computedStyles = useMemo(() => {
    const baseClasses = cn(
      // Base styles
      "group relative flex items-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      "text-gray-600 hover:text-gray-900 hover:bg-gray-50",

      // Layout baseado no estado
      isMinimized ? ["justify-center w-12 h-12 mx-auto"] : ["gap-3 px-4 py-3 w-full"],

      // Estado ativo
      isActive && ["text-blue-600 bg-blue-50 hover:bg-blue-50 hover:text-blue-600", "shadow-sm border border-blue-100"],
    )

    const iconClasses = cn(
      "transition-all duration-200 flex-shrink-0",
      isMinimized ? "h-5 w-5" : "h-4 w-4",
      isActive && "text-blue-600",
    )

    return { baseClasses, iconClasses }
  }, [isMinimized, isActive])

  // Memoizar conteúdo do tooltip
  const tooltipConfig = useMemo(() => {
    const shouldShow = showTooltip && (isMinimized || item.description)
    const content = isMinimized ? item.label : item.description
    return { shouldShow, content }
  }, [showTooltip, isMinimized, item.label, item.description])

  // Handler para clique
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Adicionar analytics ou outras ações se necessário
      if (item.onClick) {
        item.onClick(e)
      }
    },
    [item],
  )

  const linkElement = (
    <Link
      href={item.href}
      onClick={handleClick}
      className={cn(computedStyles.baseClasses, className)}
      aria-current={isActive ? "page" : undefined}
      aria-label={isMinimized ? item.label : undefined}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
    >
      {/* Indicador de página ativa */}
      {isActive && !isMinimized && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"
          aria-hidden="true"
        />
      )}

      {/* Ícone */}
      <IconComponent className={computedStyles.iconClasses} aria-hidden="true" />

      {/* Conteúdo expandido */}
      {!isMinimized && (
        <>
          <span className="font-medium truncate flex-1">{item.shortLabel || item.label}</span>

          {/* Badge */}
          {showBadge && item.badge && (
            <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs text-white font-medium">
              {item.badge}
            </span>
          )}

          {/* Indicador de link externo */}
          {item.external && (
            <svg
              className="h-3 w-3 shrink-0 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          )}
        </>
      )}
    </Link>
  )

  // Envolver com tooltip se necessário
  if (tooltipConfig.shouldShow && tooltipConfig.content) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
          <TooltipContent side="right" align="center" className="font-medium">
            <p>{tooltipConfig.content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return linkElement
})
