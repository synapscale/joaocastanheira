"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useWorkflow } from "@/context/workflow-context"
import type { Connection, Position } from "@/types/workflow"

interface ConnectionActionsProps {
  connection: Connection
  position: Position
  onAddNode: (connectionId: string) => void
}

export function ConnectionActions({ connection, position, onAddNode }: ConnectionActionsProps) {
  const { removeConnection } = useWorkflow()
  const [isHovered, setIsHovered] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeConnection(connection.id)
  }

  const handleAddNode = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddNode(connection.id)
  }

  return (
    <div
      className="absolute flex items-center gap-1 transition-opacity duration-200"
      style={{
        left: position.x - 40,
        top: position.y - 15,
        opacity: isHovered ? 1 : 0,
        pointerEvents: isHovered ? "auto" : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
        onClick={handleAddNode}
        title="Add node"
      >
        <Plus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </button>
      <button
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white shadow-sm hover:bg-red-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-red-900"
        onClick={handleDelete}
        title="Delete connection"
      >
        <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400" />
      </button>
    </div>
  )
}
