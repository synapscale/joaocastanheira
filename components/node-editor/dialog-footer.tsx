"use client"

import { memo } from "react"
import { Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DialogFooterProps {
  isCodeChanged: boolean
  isSettingsChanged: boolean
  onDelete: () => void
  onCancel: () => void
  onSave: () => void
}

/**
 * Componente de rodapé para o diálogo de edição de nó
 */
function DialogFooterComponent({ isCodeChanged, isSettingsChanged, onDelete, onCancel, onSave }: DialogFooterProps) {
  const hasChanges = isCodeChanged || isSettingsChanged

  return (
    <div className="px-6 py-4 border-t">
      <div className="flex items-center justify-between w-full">
        <Button variant="destructive" onClick={onDelete} className="gap-1.5">
          <Trash2 className="h-4 w-4" />
          Delete Node
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className={cn("gap-1.5", hasChanges && "bg-primary-foreground text-primary hover:bg-primary-foreground/90")}
          >
            <Save className={cn("h-4 w-4", hasChanges && "text-primary")} />
            {hasChanges ? "Save Changes*" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const DialogFooter = memo(DialogFooterComponent)
