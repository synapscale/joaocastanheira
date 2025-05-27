"use client"

import { useRef, useEffect } from "react"
import { useCanvas } from "@/contexts/canvas-context"
import { Trash2, Copy, Scissors, ZoomIn, Plus, Edit, Link } from "lucide-react"

interface CanvasContextMenuProps {
  x: number
  y: number
  nodeId?: string
  canvasPosition?: { x: number; y: number }
  onClose: () => void
}

export function CanvasContextMenu({ x, y, nodeId, canvasPosition, onClose }: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const { removeNode, duplicateNodes, addNode, selectNode } = useCanvas()

  // Adjust position if menu would go off screen
  useEffect(() => {
    if (!menuRef.current) return

    const rect = menuRef.current.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    if (x + rect.width > windowWidth) {
      adjustedX = windowWidth - rect.width - 10
    }

    if (y + rect.height > windowHeight) {
      adjustedY = windowHeight - rect.height - 10
    }

    menuRef.current.style.left = `${adjustedX}px`
    menuRef.current.style.top = `${adjustedY}px`
  }, [x, y])

  // Handle node-specific actions
  const handleDeleteNode = () => {
    if (nodeId) {
      removeNode?.(nodeId)
    }
    onClose()
  }

  const handleDuplicateNode = () => {
    if (nodeId) {
      duplicateNodes?.([nodeId])
    }
    onClose()
  }

  const handleEditNode = () => {
    if (nodeId) {
      selectNode?.(nodeId)
      // Open node editor (implementation depends on your app)
    }
    onClose()
  }

  // Handle canvas-specific actions
  const handleAddNode = (type: string) => {
    if (canvasPosition) {
      addNode?.({
        id: `${type}-${Date.now()}`,
        type,
        position: canvasPosition,
        data: {
          name: type.charAt(0).toUpperCase() + type.slice(1),
          inputs: 1,
          outputs: 1,
        },
      })
    }
    onClose()
  }

  const handleZoomToNode = () => {
    if (nodeId) {
      // Implementation depends on your zoom functionality
    }
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="context-menu absolute z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[180px]"
      style={{ left: x, top: y }}
    >
      {nodeId ? (
        // Node context menu
        <>
          <div className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
            Ações do Node
          </div>
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={handleEditNode}
          >
            <Edit className="h-4 w-4 text-slate-500" />
            <span>Editar</span>
          </button>
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={handleDuplicateNode}
          >
            <Copy className="h-4 w-4 text-slate-500" />
            <span>Duplicar</span>
          </button>
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={handleZoomToNode}
          >
            <ZoomIn className="h-4 w-4 text-slate-500" />
            <span>Zoom para este node</span>
          </button>
          <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleDeleteNode}
          >
            <Trash2 className="h-4 w-4" />
            <span>Excluir</span>
          </button>
        </>
      ) : (
        // Canvas context menu
        <>
          <div className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
            Adicionar Node
          </div>
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => handleAddNode("input")}
          >
            <Plus className="h-4 w-4 text-blue-500" />
            <span>Node de Entrada</span>
          </button>
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => handleAddNode("process")}
          >
            <Scissors className="h-4 w-4 text-purple-500" />
            <span>Node de Processamento</span>
          </button>
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => handleAddNode("output")}
          >
            <Link className="h-4 w-4 text-green-500" />
            <span>Node de Saída</span>
          </button>
        </>
      )}
    </div>
  )
}
