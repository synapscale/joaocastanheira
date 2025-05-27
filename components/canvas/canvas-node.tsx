"use client"

import type React from "react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { NodeHeader } from "./node-parts/node-header"
import { ConnectionPoint } from "./ui/connection-point"
import { DeleteConfirmation } from "./ui/delete-confirmation"
import { ActionButton } from "./ui/action-button"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { Copy, Edit, Trash2 } from "lucide-react"
import type { Node } from "@/types/core/canvas-types"
import { useCanvas } from "@/contexts/canvas-context"

interface CanvasNodeProps {
  node: Node
  selected: boolean
  onSelect: () => void
  onMouseDown: (e: React.MouseEvent) => void
  isDragging?: boolean
}

/**
 * Componente de node para o canvas
 */
export function CanvasNode({ node, selected, onSelect, onMouseDown, isDragging = false }: CanvasNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)

  const { removeNode, duplicateNode, updateNode } = useCanvas()

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
    onMouseDown(e)
  }

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeNode(node.id)
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateNode(node.id)
  }

  const handleRename = (newName: string) => {
    if (newName.trim() && newName !== node.data.name) {
      updateNode(node.id, {
        data: {
          ...node.data,
          name: newName,
        },
      })
    }
  }

  // Register keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        combo: { key: "Delete" },
        callback: () => {
          if (selected) {
            setShowDeleteConfirm(true)
          }
        },
      },
      {
        combo: { key: "Backspace" },
        callback: () => {
          if (selected) {
            setShowDeleteConfirm(true)
          }
        },
      },
      {
        combo: { key: "d", ctrl: true },
        callback: (e) => {
          if (selected) {
            e.preventDefault()
            duplicateNode(node.id)
          }
        },
      },
      {
        combo: { key: "Escape" },
        callback: () => {
          if (showDeleteConfirm) {
            setShowDeleteConfirm(false)
          }
        },
      },
    ],
    [selected, showDeleteConfirm, node.id],
  )

  return (
    <div
      ref={nodeRef}
      data-node-id={node.id}
      className={cn(
        "canvas-node absolute select-none transition-all duration-200 pointer-events-auto",
        "bg-white dark:bg-slate-800 rounded-lg border-2 shadow-lg",
        "min-w-[220px] max-w-[300px] cursor-grab focus:outline-none",
        selected
          ? "border-blue-500 dark:border-blue-400 shadow-blue-200 dark:shadow-blue-900/50"
          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
        isDragging && "shadow-xl scale-105 rotate-1 cursor-grabbing z-50",
        isHovered && !isDragging && "shadow-lg scale-102",
        showDeleteConfirm && "border-red-500 dark:border-red-400 shadow-red-200 dark:shadow-red-900/50",
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
    >
      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <DeleteConfirmation
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
          message={`Tem certeza que deseja excluir o node "${node.data.name}"?`}
        />
      )}

      {/* Node header */}
      <NodeHeader
        node={node}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
        onRemove={() => setShowDeleteConfirm(true)}
        onDuplicate={handleDuplicate}
        onSettings={() => console.log("Settings for node:", node.id)}
        isHovered={isHovered}
        isSelected={selected}
        onMouseDown={handleMouseDown}
      />

      {/* Node content - only show if expanded */}
      {isExpanded && (
        <div className="p-3">
          {node.data.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">{node.data.description}</p>
          )}

          {/* Input/Output indicators */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-slate-500 dark:text-slate-400">{node.data.inputs || 0} entradas</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 dark:text-slate-400">{node.data.outputs || 0} saídas</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Node type badge */}
      <div className="absolute -top-2 -right-2">
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          {node.type}
        </Badge>
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute -inset-1 border-2 border-blue-500 dark:border-blue-400 rounded-lg pointer-events-none" />
      )}

      {/* Connection points */}
      <ConnectionPoint
        type="input"
        isVisible={isHovered || selected}
        onMouseDown={() => console.log("Start input connection")}
        onMouseUp={() => console.log("End input connection")}
      />

      <ConnectionPoint
        type="output"
        isVisible={isHovered || selected}
        onMouseDown={() => console.log("Start output connection")}
        onMouseUp={() => console.log("End output connection")}
      />

      {/* Quick action buttons - visible on hover or when selected */}
      {(isHovered || selected) && !showDeleteConfirm && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-full bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center p-1 gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
          <ActionButton
            icon={<Copy className="h-3 w-3 text-slate-500" />}
            label="Duplicar"
            onClick={handleDuplicate}
            className="h-6 w-6 rounded-full"
          />

          <ActionButton
            icon={<Edit className="h-3 w-3 text-slate-500" />}
            label="Renomear"
            onClick={() => {
              const newName = prompt("Renomear node:", node.data.name)
              if (newName) handleRename(newName)
            }}
            className="h-6 w-6 rounded-full"
          />

          <ActionButton
            icon={<Trash2 className="h-3 w-3" />}
            label="Excluir"
            onClick={() => setShowDeleteConfirm(true)}
            className="h-6 w-6 rounded-full text-red-500"
          />
        </div>
      )}
    </div>
  )
}
