"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: "default" | "ghost" | "destructive"
  size?: "default" | "sm" | "icon"
  className?: string
  disabled?: boolean
}

export function ActionButton({
  icon,
  label,
  onClick,
  variant = "ghost",
  size = "icon",
  className,
  disabled = false,
}: ActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={onClick}
            className={cn("h-6 w-6", className)}
            disabled={disabled}
            aria-label={label}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
