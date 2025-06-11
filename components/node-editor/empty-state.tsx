"use client"

import type { ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
}

/**
 * EmptyState component
 *
 * Displays a placeholder with icon, title, description, and optional action
 * Used when there's no data to display
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-base font-medium mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
