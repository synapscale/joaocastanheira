"use client"

import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface CollapsibleSectionProps {
  title: string
  description?: string
  children: ReactNode
  isExpanded: boolean
  onToggle: () => void
  className?: string
}

export function CollapsibleSection({
  title,
  description,
  children,
  isExpanded,
  onToggle,
  className,
}: CollapsibleSectionProps) {
  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      <button
        className={cn(
          "w-full flex items-center justify-between p-3",
          "text-left bg-white dark:bg-slate-800",
          "hover:bg-slate-50 dark:hover:bg-slate-700",
          "border-b border-slate-200 dark:border-slate-700",
          !isExpanded && "border-b-0",
        )}
        onClick={onToggle}
      >
        <div>
          <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">{title}</h3>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isExpanded && <div className="p-2">{children}</div>}
    </div>
  )
}
