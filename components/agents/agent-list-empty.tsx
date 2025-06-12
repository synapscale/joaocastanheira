"use client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AgentListEmptyProps } from "@/types/component-params"

/**
 * Empty state component for the agent listing page
 *
 * This component displays a message and create button when there are no agents.
 *
 * @example
 * ```tsx
 * <AgentListEmpty
 *   onCreateAgent={handleCreateAgent}
 *   message="No agents found matching your filters"
 * />
 * ```
 *
 * @param props - Component properties
 * @returns React component
 */
export function AgentListEmpty({
  // Required props
  onCreateAgent,

  // Optional props with defaults
  message = "Nenhum agente encontrado.",
  createButtonText = "Criar Novo Agente",
  showCreateButton = true,
  icon,

  // Accessibility props
  className,
  id,
  testId,
  ariaLabel,
}: AgentListEmptyProps) {
  const componentId = id || "agent-list-empty"

  return (
    <div
      className={cn("text-center py-12 border rounded-lg bg-muted/20", className)}
      id={componentId}
      data-testid={testId}
      aria-label={ariaLabel || "Nenhum agente encontrado"}
    >
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      <p className="text-muted-foreground mb-4" data-testid={`${componentId}-message`}>
        {message}
      </p>
      {showCreateButton && (
        <Button
          onClick={onCreateAgent}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          aria-label={createButtonText}
          data-testid={`${componentId}-create-button`}
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          {createButtonText}
        </Button>
      )}
    </div>
  )
}
