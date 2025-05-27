"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface NodePortProps {
  nodeId: string
  port: {
    id: string
    name: string
    type: string
    connected?: boolean
  }
  isInput: boolean
  onDragStart: () => void
  onDrop: () => void
}

export function NodePort({ nodeId, port, isInput, onDragStart, onDrop }: NodePortProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Determinar a cor baseada no tipo da porta
  const getPortTypeColor = (type: string) => {
    const typeColors: Record<string, { bg: string; border: string }> = {
      string: {
        bg: "bg-green-500",
        border: "border-green-600",
      },
      number: {
        bg: "bg-blue-500",
        border: "border-blue-600",
      },
      boolean: {
        bg: "bg-amber-500",
        border: "border-amber-600",
      },
      object: {
        bg: "bg-purple-500",
        border: "border-purple-600",
      },
      array: {
        bg: "bg-indigo-500",
        border: "border-indigo-600",
      },
      any: {
        bg: "bg-gray-500",
        border: "border-gray-600",
      },
    }

    return typeColors[type] || typeColors.any
  }

  const portColor = getPortTypeColor(port.type)

  // Handlers para drag and drop
  const handleDragStart = (e: React.DragEvent) => {
    if (isInput) return // Não permitir arrastar de inputs

    e.stopPropagation()
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "port", nodeId, portId: port.id }))
    onDragStart()
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!isInput) return // Só permitir soltar em inputs

    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!isInput) return // Só permitir soltar em inputs

    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    onDrop()
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1 px-2 rounded text-xs node-port",
        "transition-colors duration-200",
        isInput ? "flex-row" : "flex-row-reverse",
        isDragOver && "bg-blue-100 dark:bg-blue-900/30",
        isHovered && "bg-slate-100 dark:bg-slate-800/50",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable={!isInput}
      data-port-id={port.id}
      data-node-id={nodeId}
      data-port-type={port.type}
      data-is-input={isInput}
    >
      <div
        className={cn(
          "w-3 h-3 rounded-full border-2",
          portColor.bg,
          portColor.border,
          port.connected && "ring-2 ring-white dark:ring-slate-800",
          isDragOver && "ring-2 ring-blue-400 dark:ring-blue-500",
        )}
      />
      <span className="truncate">{port.name}</span>
      <span className="text-[10px] text-muted-foreground opacity-70">{port.type}</span>
    </div>
  )
}
