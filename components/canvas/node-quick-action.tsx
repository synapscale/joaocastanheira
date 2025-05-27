"use client"

import type React from "react"
import { ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper"

/**
 * Props for the NodeQuickAction component
 */
interface NodeQuickActionProps {
  /** Callback when the action button is clicked */
  onClick: (e: React.MouseEvent) => void
}

/**
 * NodeQuickAction component.
 *
 * Renders a quick action button that appears when hovering over a node.
 * Typically used for creating connections quickly.
 */
export function NodeQuickAction({ onClick }: NodeQuickActionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute -right-3 top-1/2 transform -translate-y-1/2"
    >
      <TooltipWrapper content="Connect to another node">
        <button
          className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
          onClick={onClick}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </TooltipWrapper>
    </motion.div>
  )
}
