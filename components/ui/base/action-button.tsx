"use client"

import type React from "react"
import { forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

/**
 * Props para ActionButton - componente base para botões com ícone
 * Mantém compatibilidade total com Button existente
 */
interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  /** Ícone a ser exibido (componente Lucide) */
  icon?: LucideIcon | React.ReactNode
  /** Posição do ícone */
  iconPosition?: "left" | "right"
  /** Estado de carregamento */
  isLoading?: boolean
  /** Texto durante carregamento */
  loadingText?: string
  /** Spinner customizado */
  loadingSpinner?: React.ReactNode
}

/**
 * ActionButton - Componente base para botões com ícone
 *
 * Unifica padrões de botões com ícone mantendo aparência visual idêntica.
 * Reduz duplicação de código sem alterar comportamento visual.
 */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      icon,
      iconPosition = "left",
      isLoading = false,
      loadingText,
      loadingSpinner,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const IconComponent = icon as LucideIcon
    const isDisabled = disabled || isLoading

    // Spinner padrão para loading
    const defaultSpinner = (
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )

    const renderIcon = () => {
      if (isLoading) {
        return loadingSpinner || defaultSpinner
      }

      if (IconComponent && typeof IconComponent === "function") {
        return <IconComponent className="h-4 w-4" />
      }

      return icon
    }

    const renderContent = () => {
      const iconElement = renderIcon()
      const textContent = isLoading && loadingText ? loadingText : children

      if (!iconElement) {
        return textContent
      }

      if (iconPosition === "right") {
        return (
          <>
            {textContent}
            {iconElement}
          </>
        )
      }

      return (
        <>
          {iconElement}
          {textContent}
        </>
      )
    }

    return (
      <Button ref={ref} className={cn("gap-2", className)} disabled={isDisabled} {...props}>
        {renderContent()}
      </Button>
    )
  },
)

ActionButton.displayName = "ActionButton"
