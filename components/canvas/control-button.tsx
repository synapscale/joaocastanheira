"use client"

import type React from "react"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ControlButtonProps {
  icon: React.ReactNode
  onClick: () => void
  tooltip: string
  shortcut?: string
  disabled?: boolean
}

/**
 * Componente de botão reutilizável para controles do canvas
 */
function ControlButtonComponent({ icon, onClick, tooltip, shortcut, disabled = false }: ControlButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className="h-10 w-10 bg-background/80 backdrop-blur-sm"
            aria-label={tooltip}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>
            {tooltip}
            {shortcut && <span className="ml-1 text-xs opacity-70">({shortcut})</span>}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export const ControlButton = memo(ControlButtonComponent)
