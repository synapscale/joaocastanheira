"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeleteConfirmationProps {
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: (e: React.MouseEvent) => void
  onCancel: (e: React.MouseEvent) => void
  className?: string
}

/**
 * Componente de confirmação de exclusão
 */
export function DeleteConfirmation({
  title = "Excluir node",
  message = "Tem certeza que deseja excluir este node?",
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  className,
}: DeleteConfirmationProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10 rounded-lg flex flex-col items-center justify-center p-3",
        className,
      )}
    >
      <Trash2 className="h-5 w-5 text-red-500 mb-2" />
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 text-center">{message}</p>
      <div className="flex gap-2">
        <Button variant="destructive" size="sm" className="h-8" onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  )
}
