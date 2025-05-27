"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CanvasNode } from "./canvas-node"
import { ConnectionLine } from "./connection-line"
import { CanvasGrid } from "./canvas-grid"
import { FloatingLibraryButton } from "./floating-library-button"
import { Sparkles, MousePointer2 } from "lucide-react"
import { useCanvas } from "@/contexts/canvas-context"
import { useCanvasViewport } from "@/hooks/use-canvas-viewport"
import { useNodeConnections } from "@/hooks/use-node-connections"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import type { Position } from "@/types/core/canvas-types"

interface UnifiedCanvasProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

/**
 * Componente principal do canvas unificado - sem overflow horizontal
 */
export function UnifiedCanvas({ sidebarOpen, onToggleSidebar }: UnifiedCanvasProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)

  const {
    nodes,
    connections,
    viewport,
    selectedNodes,
    setViewport,
    addNode,
    updateNode,
    selectNode,
    clearSelection,
    addConnection,
    removeConnection,
    moveNode,
    zoomIn,
    zoomOut,
    resetViewport,
  } = useCanvas()

  // Hook para gerenciar o viewport
  const { canvasRef, screenToCanvas, zoomToPoint } = useCanvasViewport({
    viewport,
    setViewport,
  })

  // Hook para gerenciar conexões
  const { activeConnection, startConnection, completeConnection, cancelConnection, getConnectionPositions } =
    useNodeConnections({
      nodes,
      connections,
      onAddConnection: addConnection,
      onRemoveConnection: removeConnection,
    })

  // Registrar atalhos de teclado globais
  useKeyboardShortcuts(
    [
      {
        combo: [
          { key: "=", ctrl: true },
          { key: "+", ctrl: true },
        ],
        callback: () => zoomIn(),
        preventDefault: true,
      },
      {
        combo: [
          { key: "-", ctrl: true },
          { key: "_", ctrl: true },
        ],
        callback: () => zoomOut(),
        preventDefault: true,
      },
      {
        combo: { key: "0", ctrl: true },
        callback: () => resetViewport(),
        preventDefault: true,
      },
      {
        combo: { key: "Escape" },
        callback: () => {
          cancelConnection()
          clearSelection()
        },
      },
    ],
    [],
  )

  // Prevenir comportamento padrão do navegador para eventos de roda
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }

    const canvasElement = canvasRef.current
    if (canvasElement) {
      canvasElement.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener("wheel", handleWheel)
      }
    }
  }, [canvasRef])

  // Manipular pan do canvas
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return // Apenas clique esquerdo

      const target = e.target as HTMLElement
      if (target.closest(".canvas-node") || target.closest(".floating-library-button")) {
        return
      }

      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      clearSelection()
    },
    [clearSelection],
  )

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return

      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y

      setViewport({
        x: viewport.x + deltaX,
        y: viewport.y + deltaY,
      })

      setPanStart({ x: e.clientX, y: e.clientY })
    },
    [isPanning, panStart, viewport, setViewport],
  )

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false)
    setDraggedNodeId(null)
  }, [])

  // Manipular seleção de node
  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      selectNode(nodeId)
    },
    [selectNode],
  )

  // Manipular mouse down no node para arrastar
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation()
      setDraggedNodeId(nodeId)
      selectNode(nodeId)
    },
    [selectNode],
  )

  // Manipular movimento do node
  const handleNodeMove = useCallback(
    (nodeId: string, position: Position) => {
      moveNode(nodeId, position)
    },
    [moveNode],
  )

  // Manipular drag and drop da sidebar
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsHovering(false)

      try {
        const data = JSON.parse(e.dataTransfer.getData("application/json"))
        console.log("Drop data received:", data) // Debug log

        if (data.type === "node" || data.type === "skill") {
          const canvasPos = screenToCanvas(e.clientX, e.clientY)

          // Grid snapping
          const gridSize = 20
          const snappedX = Math.round(canvasPos.x / gridSize) * gridSize
          const snappedY = Math.round(canvasPos.y / gridSize) * gridSize

          // Handle both node and skill types
          const nodeData = data.type === "skill" ? data.skill : data.node

          const newNode = {
            id: `${nodeData.id || data.id}-${Date.now()}`,
            type: nodeData.id || data.id,
            position: { x: snappedX, y: snappedY },
            data: {
              name: nodeData.name,
              description: nodeData.description,
              inputs: nodeData.inputs,
              outputs: nodeData.outputs,
            },
          }

          console.log("Creating new node:", newNode) // Debug log
          addNode(newNode)
        }
      } catch (error) {
        console.error("Error handling drop:", error)
      }
    },
    [screenToCanvas, addNode],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsHovering(true)
  }, [])

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
        setIsHovering(false)
      }
    },
    [canvasRef],
  )

  // Manipular zoom com roda do mouse
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()

        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1

        zoomToPoint({ x: mouseX, y: mouseY }, zoomFactor)
      }
    },
    [zoomToPoint],
  )

  return (
    <div
      className={cn(
        // Container que previne overflow horizontal
        "w-full h-full max-w-full overflow-hidden relative",
        // Ajuste responsivo para sidebar
        sidebarOpen && "lg:pr-80", // Padding right quando sidebar está aberta no desktop
      )}
    >
      {/* Canvas container */}
      <div
        ref={canvasRef}
        className={cn(
          // Canvas que ocupa todo o espaço disponível sem overflow
          "w-full h-full max-w-full overflow-hidden relative",
          "bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
          isPanning ? "cursor-grabbing" : "cursor-grab",
          isHovering && "bg-blue-50/50 dark:bg-blue-950/20",
        )}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onWheel={handleWheel}
      >
        {/* Grid background */}
        <CanvasGrid viewport={viewport} />

        {/* Canvas content with transform */}
        <div
          className="absolute inset-0 origin-top-left pointer-events-none w-full h-full max-w-full overflow-hidden"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          }}
        >
          {/* Connection lines */}
          {connections.map((connection) => {
            const positions = getConnectionPositions(connection)
            if (!positions) return null

            const { sourcePos, targetPos } = positions

            return (
              <ConnectionLine
                key={connection.id}
                connection={connection}
                sourcePosition={sourcePos}
                targetPosition={targetPos}
                isSelected={false}
                onClick={() => console.log("Connection clicked:", connection.id)}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              selected={selectedNodes.includes(node.id)}
              onSelect={() => handleNodeSelect(node.id)}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              isDragging={draggedNodeId === node.id}
            />
          ))}
        </div>

        {/* Empty state */}
        {nodes.length === 0 && !isHovering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <div className="text-center max-w-md mx-auto w-full">
              <div className="relative mb-6">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Sparkles className="h-8 sm:h-10 w-8 sm:w-10 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 sm:w-6 h-5 sm:h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <MousePointer2 className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-white" />
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 break-words">
                Crie ou selecione um node
              </h3>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6 break-words">
                {sidebarOpen
                  ? "Arraste nodes da biblioteca para começar a construir seu fluxo de trabalho."
                  : "Clique no ícone da biblioteca no canto superior direito para abrir a biblioteca de nodes."}{" "}
                Use{" "}
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  Ctrl + Scroll
                </kbd>{" "}
                para zoom.
              </p>
            </div>
          </div>
        )}

        {/* Canvas watermark */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-xs text-slate-400 dark:text-slate-600 font-mono pointer-events-none">
          Canvas v2.0
        </div>
      </div>

      {/* Floating library button - only show when sidebar is closed */}
      {!sidebarOpen && (
        <div className="absolute top-4 right-4 z-10">
          <FloatingLibraryButton onClick={onToggleSidebar} />
        </div>
      )}
    </div>
  )
}
