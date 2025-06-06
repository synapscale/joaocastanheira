"use client"

import type React from "react"
import { MoreHorizontal } from "lucide-react"
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * Props for the NodeHeader component
 */
interface NodeHeaderProps {
  /** The icon to display in the header */
  icon: React.ReactNode
  /** The title of the node */
  title: string
  /** Optional description for the node */
  description?: string
  /** Callback when the options button is clicked */
  onOptionsClick: (e: React.MouseEvent) => void
  /** Additional CSS classes for the gradient background */
  gradientClass: string
}

/**
 * NodeHeader component.
 *
 * Renders the header section of a workflow node with icon, title, and options.
 */
export function NodeHeader({ icon, title, description, onOptionsClick, gradientClass }: NodeHeaderProps) {
  return (
    <TooltipProvider>
      {/* Gradient header */}
      <div className={cn("h-2 rounded-t-lg bg-gradient-to-r", gradientClass)} />

      <div className="flex items-center p-3 pb-2">
        <div className="p-1.5 rounded-md bg-white/80 dark:bg-gray-800/80 shadow-sm">{icon}</div>

        <div className="ml-2 flex-1 truncate">
          <div className="text-sm font-medium truncate">{title}</div>
          {description && <div className="text-[10px] text-muted-foreground truncate">{description}</div>}
        </div>

        <div className="ml-auto">
          <TooltipWrapper content="Node options">
            <button
              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-background/80"
              onClick={onOptionsClick}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </TooltipWrapper>
        </div>
      </div>
    </TooltipProvider>
  )
}
