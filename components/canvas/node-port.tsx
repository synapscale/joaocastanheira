"use client"

import type React from "react"
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper"
import { cn } from "@/lib/utils"

/**
 * Props for the NodePort component
 */
interface NodePortProps {
  /** The ID of the port */
  id: string
  /** The type of port (input or output) */
  type: "input" | "output"
  /** The label to display in the tooltip */
  label: string
  /** Callback when the port is clicked */
  onClick?: (e: React.MouseEvent) => void
  /** Additional CSS classes to apply */
  className?: string
}

/**
 * NodePort component.
 *
 * Renders an input or output port for a workflow node.
 * Handles interactions and styling for connection points.
 */
export function NodePort({ id, type, label, onClick, className }: NodePortProps) {
  return (
    <TooltipWrapper
      content={`${type === "input" ? "Input" : "Output"}: ${label}`}
      side={type === "input" ? "left" : "right"}
    >
      <div
        className={cn("h-3 w-1.5 cursor-crosshair", type === "input" ? "rounded-l-full" : "rounded-r-full", className)}
        onClick={onClick}
        data-port-id={id}
        data-port-type={type}
        style={{
          position: "absolute",
          [type === "input" ? "left" : "right"]: "-1.5px",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
    </TooltipWrapper>
  )
}
