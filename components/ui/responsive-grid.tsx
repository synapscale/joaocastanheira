"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ResponsiveGridProps {
  children: ReactNode
  className?: string

  // Grid configuration
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }

  // Gap configuration
  gap?: "sm" | "md" | "lg"

  // Auto-fit mode
  autoFit?: boolean
  minItemWidth?: string
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "md",
  autoFit = false,
  minItemWidth = "280px",
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  }

  const gridClasses = cn(
    "grid",
    gapClasses[gap],
    !autoFit && [`grid-cols-${cols.mobile}`, `sm:grid-cols-${cols.tablet}`, `lg:grid-cols-${cols.desktop}`],
    autoFit && `grid-cols-[repeat(auto-fit,minmax(${minItemWidth},1fr))]`,
    className,
  )

  return <div className={gridClasses}>{children}</div>
}
