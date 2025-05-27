"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { AgentDeleteDialogProps } from "@/types/component-params"

/**
 * Dialog for confirming agent deletion
 *
 * This component displays a confirmation dialog when the user tries to
 * delete an agent.
 *
 * @example
 * ```tsx
 * <AgentDeleteDialog
 *   agent={agentToDelete}
 *   onOpenChange={(open) => !open && setAgentToDelete(null)}
 *   onConfirm={handleDeleteAgent}
 * />
 * ```
 *
 * @param props - Component properties
 * @returns React component
 */
export function AgentDeleteDialog({
  // Required props
  agent,
  onOpenChange,
  onConfirm,

  // Optional props with defaults
  title = "Excluir agente",
  description,
  cancelText = "Cancelar",
  confirmText = "Excluir",

  // Accessibility props
  id,
  testId,
  ariaLabel,
}: AgentDeleteDialogProps) {
  const componentId = id || "agent-delete-dialog"
  const defaultDescription = agent
    ? `Tem certeza que deseja excluir o agente "${agent.name}"? Esta ação não pode ser desfeita.`
    : "Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita."

  return (
    <AlertDialog open={!!agent} onOpenChange={onOpenChange}>
      <AlertDialogContent id={componentId} data-testid={testId} aria-label={ariaLabel || title}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description || defaultDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid={`${componentId}-cancel-button`}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
            data-testid={`${componentId}-confirm-button`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
