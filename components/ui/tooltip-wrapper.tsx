/**
 * @module TooltipWrapper
 * @description A reusable wrapper component for tooltips that simplifies tooltip implementation.
 */

import type React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Props for the TooltipWrapper component
 */
interface TooltipWrapperProps {
  /** The content to display in the tooltip */
  content: React.ReactNode
  /** The element that triggers the tooltip */
  children: React.ReactNode
  /** The side of the trigger where the tooltip should appear */
  side?: "top" | "right" | "bottom" | "left"
  /** Whether the tooltip should be disabled */
  disabled?: boolean
}

/**
 * TooltipWrapper component.
 *
 * A reusable wrapper for tooltips that simplifies the tooltip implementation.
 * Provides a consistent tooltip experience throughout the application.
 *
 * @example
 * ```tsx
 * <TooltipWrapper content="Add a new node">
 *   <Button>+</Button>
 * </TooltipWrapper>
 * ```
 */
export function TooltipWrapper({ content, children, side = "top", disabled = false }: TooltipWrapperProps) {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
