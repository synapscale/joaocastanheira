"use client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AgentFormActionsProps } from "@/types/component-params"

/**
 * Component for the form actions of the agent form
 *
 * This component displays the action buttons for the agent form,
 * including reset and submit buttons.
 *
 * @example
 * ```tsx
 * <AgentFormActions
 *   onReset={handleReset}
 *   onSubmit={handleSubmit}
 *   isSubmitting={isSubmitting}
 *   isValid={isValid}
 *   hasUnsavedChanges={hasUnsavedChanges}
 *   isNewAgent={isNewAgent}
 * />
 * ```
 *
 * @param props - Component properties
 * @returns React component
 */
export function AgentFormActions({
  // Required props
  onReset,
  isSubmitting,
  isValid,
  hasUnsavedChanges,
  isNewAgent,

  // Optional props with defaults
  onSubmit,
  resetButtonText = "Redefinir",
  submitButtonText,
  showResetButton = true,
  confirmReset = false,
  confirmSubmit = false,
  submitButtonVariant = "default",
  resetButtonVariant = "outline",
  additionalActions,

  // Accessibility props
  className,
  id,
  testId,
  ariaLabel,
}: AgentFormActionsProps) {
  const handleReset = () => {
    if (confirmReset && hasUnsavedChanges) {
      if (
        window.confirm("Tem certeza que deseja redefinir o formulário? Todas as alterações não salvas serão perdidas.")
      ) {
        onReset()
      }
    } else {
      onReset()
    }
  }

  const handleSubmit = () => {
    if (confirmSubmit) {
      if (window.confirm("Tem certeza que deseja salvar as alterações?")) {
        onSubmit?.()
      }
    } else {
      onSubmit?.()
    }
  }

  const defaultSubmitText = isSubmitting ? "Salvando..." : isNewAgent ? "Criar Agente" : "Salvar Alterações"

  const finalSubmitText = submitButtonText || defaultSubmitText
  const componentId = id || "agent-form-actions"

  return (
    <div
      className={cn("flex justify-end gap-3 pt-4 border-t", className)}
      id={componentId}
      data-testid={testId}
      aria-label={ariaLabel || "Ações do formulário"}
    >
      {additionalActions && <div className="mr-auto">{additionalActions}</div>}

      {showResetButton && (
        <Button
          type="button"
          variant={resetButtonVariant}
          onClick={handleReset}
          disabled={isSubmitting || !hasUnsavedChanges}
          aria-label={resetButtonText}
          data-testid={`${componentId}-reset-button`}
        >
          {resetButtonText}
        </Button>
      )}

      <Button
        type={onSubmit ? "button" : "submit"}
        onClick={onSubmit ? handleSubmit : undefined}
        disabled={isSubmitting || !isValid}
        variant={submitButtonVariant}
        className={cn("bg-purple-600 hover:bg-purple-700 text-white", !hasUnsavedChanges && "opacity-50")}
        aria-label={finalSubmitText}
        aria-disabled={isSubmitting || !isValid}
        data-testid={`${componentId}-submit-button`}
      >
        {finalSubmitText}
      </Button>
    </div>
  )
}
