"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import type { Position } from "@/types/canvas-types"

interface UseDragDropNodeProps {
  onNodeMove: (nodeId: string, position: Position) => void
  gridSize?: number
}

interface DragDropNodeState {
  isDragging: boolean
  startDrag: (nodeId: string, e: React.MouseEvent, currentPosition: Position) => void
  handleDrag: (e: MouseEvent) => void
  endDrag: () => void
}

export function useDragDropNode({ onNodeMove, gridSize = 20 }: UseDragDropNodeProps): DragDropNodeState {
  const [isDragging, setIsDragging] = useState(false)
  const draggedNodeRef = useRef<string | null>(null)
  const dragStartPosRef = useRef<Position>({ x: 0, y: 0 })
  const nodePosRef = useRef<Position>({ x: 0, y: 0 })
  const mouseOffsetRef = useRef<Position>({ x: 0, y: 0 })

  const startDrag = useCallback((nodeId: string, e: React.MouseEvent, currentPosition: Position) => {
    e.stopPropagation()

    draggedNodeRef.current = nodeId
    nodePosRef.current = currentPosition
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    mouseOffsetRef.current = {
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y,
    }

    setIsDragging(true)

    // Add global event listeners
    document.addEventListener("mousemove", handleDrag)
    document.addEventListener("mouseup", endDrag)
  }, [])

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (!draggedNodeRef.current) return

      // Calculate new position
      const newX = e.clientX - mouseOffsetRef.current.x
      const newY = e.clientY - mouseOffsetRef.current.y

      // Apply grid snapping if gridSize is provided
      const snappedX = gridSize ? Math.round(newX / gridSize) * gridSize : newX
      const snappedY = gridSize ? Math.round(newY / gridSize) * gridSize : newY

      // Update node position
      if (draggedNodeRef.current) {
        onNodeMove(draggedNodeRef.current, { x: snappedX, y: snappedY })
      }
    },
    [onNodeMove, gridSize],
  )

  const endDrag = useCallback(() => {
    setIsDragging(false)
    draggedNodeRef.current = null

    // Remove global event listeners
    document.removeEventListener("mousemove", handleDrag)
    document.removeEventListener("mouseup", endDrag)
  }, [handleDrag])

  return {
    isDragging,
    startDrag,
    handleDrag,
    endDrag,
  }
}
