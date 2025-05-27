"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface NodeBadgeProps {
  text: string
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
}

/**
 * Badge para exibir informações sobre o node
 */
export function NodeBadge({ text, variant = "secondary", className }: NodeBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn("text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300", className)}
    >
      {text}
    </Badge>
  )
}
