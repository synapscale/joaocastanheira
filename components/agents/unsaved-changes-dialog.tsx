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
import type { UnsavedChangesDialogProps } from "@/types/component-params"

/**
 * Dialog for confirming navigation away from unsaved changes
 *
 * This component displays a confirmation dialog when the user tries to
 * navigate away from a form with unsaved changes.
 *
 * @example
 * ```tsx
 * <UnsavedChangesDialog
 *   open={showUnsavedDialog}
 *   onOpenChange={setShowUnsavedDialog}
 *   onConfirm={handleConfirmNavigation}
 * />
 * ```
 *
 * @param props - Component properties
 * @returns React component
 */
export function UnsavedChangesDialog({
  // Required props
  open,
  onOpenChange,
  onConfirm,

  // Optional props with defaults
  title = "Alterações não salvas",
  description = "Você tem alterações não salvas. Tem certeza que deseja sair sem salvar?",
  cancelText = "Cancelar",
  confirmText = "Sair sem salvar",
  confirmVariant = "destructive",

  // Accessibility props
  id,
  testId,
  ariaLabel,
}: UnsavedChangesDialogProps) {
  const componentId = id || "unsaved-changes-dialog"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent id={componentId} data-testid={testId} aria-label={ariaLabel || title}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid={`${componentId}-cancel-button`}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              confirmVariant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
            data-testid={`${componentId}-confirm-button`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
