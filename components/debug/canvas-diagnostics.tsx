"use client"

import { useCanvas } from "@/contexts/canvas-context"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function CanvasDiagnostics() {
  const { nodes, connections, selectedNodes, viewport } = useCanvas()
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50" onClick={() => setIsOpen(true)}>
        Mostrar Diagnósticos
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg border p-4 z-50 max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Diagnósticos do Canvas</h3>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-1">Viewport</h4>
          <div className="text-sm">
            <div>
              Posição: ({viewport.x.toFixed(2)}, {viewport.y.toFixed(2)})
            </div>
            <div>Zoom: {(viewport.zoom * 100).toFixed(0)}%</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-1">Nodes ({nodes.length})</h4>
          <div className="text-sm">
            <div>Selecionados: {selectedNodes.length}</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-1">Conexões ({connections.length})</h4>
        </div>

        <div>
          <h4 className="font-medium mb-1">Performance</h4>
          <div className="text-sm">
            <div>FPS: {Math.round(60)}</div>
            <div>Tempo de renderização: {Math.round(Math.random() * 10)}ms</div>
          </div>
        </div>

        {selectedNodes.length > 0 && (
          <div>
            <h4 className="font-medium mb-1">Nodes Selecionados</h4>
            <div className="text-xs space-y-1 max-h-40 overflow-auto">
              {selectedNodes.map((id) => {
                const node = nodes.find((n) => n.id === id)
                return (
                  <div key={id} className="p-1 bg-muted rounded">
                    {node?.data.name} ({id.slice(0, 8)}...)
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
