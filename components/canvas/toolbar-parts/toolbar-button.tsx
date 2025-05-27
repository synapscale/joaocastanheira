"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/utils/component-utils"

interface ToolbarButtonProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  tooltipContent: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
  active?: boolean
}

/**
 * Reusable button component for the canvas toolbar with tooltip
 */
export function ToolbarButton({
  icon,
  label,
  onClick,
  disabled = false,
  tooltipContent,
  variant = "ghost",
  className,
  active = false,
}: ToolbarButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "h-8 w-8",
              active && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
              className,
            )}
            aria-label={label}
          >
            {icon}
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
