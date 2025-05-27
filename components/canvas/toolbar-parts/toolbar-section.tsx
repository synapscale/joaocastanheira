import type React from "react"
import { Separator } from "@/components/ui/separator"

interface ToolbarSectionProps {
  children: React.ReactNode
  isLast?: boolean
}

/**
 * A section of related buttons in the toolbar
 */
export function ToolbarSection({ children, isLast = false }: ToolbarSectionProps) {
  return (
    <div className="flex items-center gap-1">
      {children}
      {!isLast && <Separator orientation="vertical" className="h-6 mx-1" />}
    </div>
  )
}
