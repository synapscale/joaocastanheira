"use client"

import { useCallback } from "react"
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
import type { CustomCategory } from "@/types/custom-category"

interface DeleteCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CustomCategory | null
  onDelete: () => void
}

/**
 * Diálogo de confirmação para excluir uma categoria.
 */
export function DeleteCategoryDialog({ open, onOpenChange, category, onDelete }: DeleteCategoryDialogProps) {
  const handleDelete = useCallback(() => {
    onDelete()
  }, [onDelete])

  // Se não houver categoria selecionada, não renderiza nada
  if (!category) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir categoria &quot;{category.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso removerá permanentemente a categoria personalizada e a associação com
            todos os nós.
            {category.nodeCount > 0 && (
              <span className="block mt-2 font-medium">
                Esta categoria contém {category.nodeCount} {category.nodeCount === 1 ? "nó" : "nós"}.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
