"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useEffect, useState } from "react"

interface NavigationHintsProps {
  onClose: () => void
}

export function NavigationHints({ onClose }: NavigationHintsProps) {
  const [showHints, setShowHints] = useState(true)

  // Check if hints have been shown before
  useEffect(() => {
    const hintsShown = localStorage.getItem("canvas-hints-shown")
    if (hintsShown === "true") {
      setShowHints(false)
    }
  }, [])

  // Mark hints as shown when closed
  const handleClose = () => {
    localStorage.setItem("canvas-hints-shown", "true")
    setShowHints(false)
    onClose()
  }

  if (!showHints) return null

  return (
    <Card className="absolute bottom-16 left-4 z-10 w-72 shadow-lg canvas-ui-element">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Dicas de Navegação</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Atalhos para navegar no canvas</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center">
            <kbd className="px-2 py-1 bg-muted rounded text-xs mr-2">Espaço + Arrastar</kbd>
            <span>Navegar pelo canvas</span>
          </li>
          <li className="flex items-center">
            <kbd className="px-2 py-1 bg-muted rounded text-xs mr-2">Ctrl + Scroll</kbd>
            <span>Zoom in/out</span>
          </li>
          <li className="flex items-center">
            <kbd className="px-2 py-1 bg-muted rounded text-xs mr-2">Duplo clique</kbd>
            <span>Ajustar à tela</span>
          </li>
          <li className="flex items-center">
            <kbd className="px-2 py-1 bg-muted rounded text-xs mr-2">Arrastar</kbd>
            <span>Selecionar área</span>
          </li>
          <li className="flex items-center">
            <kbd className="px-2 py-1 bg-muted rounded text-xs mr-2">Shift + Clique</kbd>
            <span>Seleção múltipla</span>
          </li>
          <li className="flex items-center">
            <kbd className="px-2 py-1 bg-muted rounded text-xs mr-2">Delete</kbd>
            <span>Remover selecionados</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
