"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useNodeTemplates } from "@/context/node-template-context"
import { useWorkflow } from "@/context/workflow-context"
import { Loader2 } from "lucide-react"

interface AddFromTemplateProps {
  templateId?: string
  trigger: React.ReactNode
}

export function AddFromTemplate({ templateId, trigger }: AddFromTemplateProps) {
  const { getTemplateById, applyTemplate } = useNodeTemplates()
  const { clearCanvas } = useWorkflow()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"add" | "replace">("add")

  const template = templateId ? getTemplateById(templateId) : null

  const handleApplyTemplate = async () => {
    if (!templateId) return

    setIsLoading(true)
    try {
      if (mode === "replace") {
        clearCanvas()
      }
      await applyTemplate(templateId)
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to apply template:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Aplicar Template</DialogTitle>
          <DialogDescription>
            {template
              ? `Adicione o template "${template.name}" ao seu workflow.`
              : "Adicione este template ao seu workflow."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={mode === "add" ? "default" : "outline"}
                className="w-full"
                onClick={() => setMode("add")}
              >
                Adicionar
              </Button>
              <Button
                variant={mode === "replace" ? "default" : "outline"}
                className="w-full"
                onClick={() => setMode("replace")}
              >
                Substituir
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {mode === "add"
                ? "O template será adicionado ao workflow atual."
                : "O workflow atual será substituído pelo template."}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApplyTemplate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "add" ? "Adicionar" : "Substituir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
