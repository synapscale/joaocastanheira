import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PanelHeaderProps {
  title: string
  className?: string
  actions?: ReactNode
}

/**
 * PanelHeader component.
 *
 * A reusable header for panels in the node editor.
 */
export function PanelHeader({ title, className, actions }: PanelHeaderProps) {
  return (
    <div className={cn("p-3 border-b bg-muted/30 flex justify-between items-center", className)}>
      <h3 className="text-sm font-medium tracking-wider text-gray-500">{title}</h3>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
