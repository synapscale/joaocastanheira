"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface QuickActionButtonProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  className?: string
}

export function QuickActionButton({ icon, label, onClick, className }: QuickActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 text-xs flex items-center gap-1.5 bg-white dark:bg-slate-800",
        "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
        "text-slate-700 dark:text-slate-300",
        className,
      )}
    >
      {icon}
      {label}
    </Button>
  )
}
