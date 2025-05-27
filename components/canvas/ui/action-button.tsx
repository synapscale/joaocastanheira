"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: "default" | "ghost" | "destructive" | "outline" | "secondary" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  disabled?: boolean
  tooltipSide?: "top" | "right" | "bottom" | "left"
}

/**
 * Botão de ação com tooltip
 */
export function ActionButton({
  icon,
  label,
  onClick,
  variant = "ghost",
  size = "icon",
  className,
  disabled = false,
  tooltipSide = "bottom",
}: ActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={onClick}
            className={className}
            disabled={disabled}
            aria-label={label}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
