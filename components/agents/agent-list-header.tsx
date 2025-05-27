"use client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AgentListHeaderProps } from "@/types/component-params"

/**
 * Header component for the agent listing page
 *
 * This component displays the header of the agent listing page,
 * including the title and create button.
 *
 * @example
 * ```tsx
 * <AgentListHeader
 *   onCreateAgent={handleCreateAgent}
 *   title="AI Agents"
 * />
 * ```
 *
 * @param props - Component properties
 * @returns React component
 */
export function AgentListHeader({
  // Required props
  onCreateAgent,

  // Optional props with defaults
  title = "Agentes",
  createButtonText = "Novo Agente",
  showCreateButton = true,
  additionalActions,

  // Accessibility props
  className,
  id,
  testId,
  ariaLabel,
}: AgentListHeaderProps) {
  const componentId = id || "agent-list-header"

  return (
    <div
      className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", className)}
      id={componentId}
      data-testid={testId}
      aria-label={ariaLabel || "Cabeçalho da lista de agentes"}
    >
      <h1 className="text-2xl font-bold" data-testid={`${componentId}-title`}>
        {title}
      </h1>
      <div className="flex items-center gap-2">
        {showCreateButton && (
          <Button
            onClick={onCreateAgent}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            aria-label={`Criar ${createButtonText.toLowerCase()}`}
            data-testid={`${componentId}-create-button`}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {createButtonText}
          </Button>
        )}
        {additionalActions}
      </div>
    </div>
  )
}
