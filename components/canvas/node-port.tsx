"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface NodePortProps {
  nodeId: string
  port: {
    id: string
    name: string
    type: string
    connected?: boolean
    connections?: string[]
  }
  isInput: boolean
  onConnectionStart?: (nodeId: string, portId: string) => void
  onConnectionEnd?: (nodeId: string, portId: string) => void
  onDragStart?: () => void
  onDrop?: () => void
}

/**
 * Componente de porta de node para conexões
 * Suporta drag and drop para criar conexões entre nodes
 */
export function NodePort({
  nodeId,
  port,
  isInput,
  onConnectionStart,
  onConnectionEnd,
  onDragStart,
  onDrop,
}: NodePortProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Determinar a cor baseada no tipo da porta
  const getPortTypeColor = (type: string) => {
    const typeColors: Record<string, { bg: string; border: string; hover: string }> = {
      string: {
        bg: "bg-green-500",
        border: "border-green-600",
        hover: "hover:bg-green-600",
      },
      number: {
        bg: "bg-blue-500",
        border: "border-blue-600",
        hover: "hover:bg-blue-600",
      },
      boolean: {
        bg: "bg-amber-500",
        border: "border-amber-600",
        hover: "hover:bg-amber-600",
      },
      object: {
        bg: "bg-purple-500",
        border: "border-purple-600",
        hover: "hover:bg-purple-600",
      },
      array: {
        bg: "bg-indigo-500",
        border: "border-indigo-600",
        hover: "hover:bg-indigo-600",
      },
      any: {
        bg: "bg-gray-500",
        border: "border-gray-600",
        hover: "hover:bg-gray-600",
      },
    }

    return typeColors[type] || typeColors.any
  }

  const portColor = getPortTypeColor(port.type)

  // Handlers para drag and drop
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (isInput) return // Não permitir arrastar de inputs

      e.stopPropagation()
      setIsDragging(true)

      // Set drag data for connection
      const dragData = {
        type: "connection",
        sourceNodeId: nodeId,
        sourcePortId: port.id,
        sourcePortType: port.type,
      }

      e.dataTransfer.setData("application/json", JSON.stringify(dragData))
      e.dataTransfer.effectAllowed = "link"

      onConnectionStart?.(nodeId, port.id)
      onDragStart?.()
    },
    [isInput, nodeId, port.id, port.type, onConnectionStart, onDragStart],
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isInput) return // Só permitir soltar em inputs

      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(true)
    },
    [isInput],
  )

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!isInput) return // Só permitir soltar em inputs

      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      try {
        const dragData = JSON.parse(e.dataTransfer.getData("application/json"))

        if (dragData.type === "connection") {
          // Validate connection
          if (dragData.sourceNodeId === nodeId) {
            console.warn("Cannot connect node to itself")
            return
          }

          // Check type compatibility (simplified)
          if (dragData.sourcePortType !== port.type && port.type !== "any" && dragData.sourcePortType !== "any") {
            console.warn(`Type mismatch: ${dragData.sourcePortType} → ${port.type}`)
            // Could still allow connection with warning
          }

          onConnectionEnd?.(nodeId, port.id)
          onDrop?.()
        }
      } catch (error) {
        console.error("Error handling port drop:", error)
      }
    },
    [isInput, nodeId, port.id, port.type, onConnectionEnd, onDrop],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()

      if (isInput) {
        onConnectionEnd?.(nodeId, port.id)
      } else {
        onConnectionStart?.(nodeId, port.id)
      }
    },
    [isInput, nodeId, port.id, onConnectionStart, onConnectionEnd],
  )

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1 px-2 rounded text-xs node-port group",
        "transition-all duration-200 cursor-pointer",
        isInput ? "flex-row" : "flex-row-reverse",
        isDragOver && "bg-blue-100 dark:bg-blue-900/30 scale-105",
        isHovered && "bg-slate-100 dark:bg-slate-800/50",
        isDragging && "opacity-50",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      draggable={!isInput}
      data-port-id={port.id}
      data-node-id={nodeId}
      data-port-type={port.type}
      data-is-input={isInput}
      title={`${port.name} (${port.type})`}
    >
      <div
        className={cn(
          "w-3 h-3 rounded-full border-2 transition-all duration-200",
          portColor.bg,
          portColor.border,
          portColor.hover,
          port.connected && "ring-2 ring-white dark:ring-slate-800",
          isDragOver && "ring-2 ring-blue-400 dark:ring-blue-500 scale-125",
          isHovered && "scale-110",
          "group-hover:scale-110",
        )}
      />
      <span className="truncate font-medium">{port.name}</span>
      <span className="text-[10px] text-muted-foreground opacity-70 font-mono">{port.type}</span>

      {/* Connection count indicator */}
      {port.connections && port.connections.length > 0 && (
        <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
          {port.connections.length}
        </div>
      )}
    </div>
  )
}
