import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PanelContainerProps {
  children: ReactNode
  className?: string
  width?: string
  minWidth?: string
  maxWidth?: string
  isCollapsible?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

/**
 * PanelContainer component.
 *
 * A responsive container for panels in the node editor.
 */
export function PanelContainer({
  children,
  className,
  width = "w-1/4",
  minWidth = "min-w-[250px]",
  maxWidth = "max-w-[350px]",
  isCollapsible = false,
  isCollapsed = false,
  onToggleCollapse,
}: PanelContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full transition-all duration-200",
        isCollapsed ? "w-[40px]" : width,
        !isCollapsed && minWidth,
        !isCollapsed && maxWidth,
        className,
      )}
    >
      {children}
    </div>
  )
}
