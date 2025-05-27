"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteConfirmationProps {
  onConfirm: (e: React.MouseEvent) => void
  onCancel: (e: React.MouseEvent) => void
}

export function DeleteConfirmation({ onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="absolute inset-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10 rounded-lg flex flex-col items-center justify-center p-3">
      <Trash2 className="h-5 w-5 text-red-500 mb-2" />
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 text-center">Excluir este node?</p>
      <div className="flex gap-2">
        <Button variant="destructive" size="sm" className="h-8" onClick={onConfirm} autoFocus>
          Excluir
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
