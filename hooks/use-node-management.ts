"use client"

/**
 * @module useNodeManagement
 * @description A hook for managing node operations like dragging, positioning, etc.
 */

import type React from "react"

import { useState, useCallback } from "react"
import type { Node, Position } from "@/types/workflow"

/**
 * Props for the useNodeManagement hook
 */
interface UseNodeManagementProps {
  /** Array of nodes in the workflow */
  nodes: Node[]
  /** Current transform state of the canvas */
  transform: { x: number; y: number; zoom: number }
  /** Function to update a node's position */
  updateNodePosition: (nodeId: string, position: Position) => void
}

/**
 * Hook for managing node operations like dragging
 *
 * @param props - Configuration options for the hook
 * @returns Object containing node management state and methods
 *
 * @example
 * ```tsx
 * const {
 *   isDragging,
 *   dragNodeId,
 *   dragOffset,
 *   handleNodeDragStart,
 *   handleNodeDrag,
 *   handleNodeDragEnd
 * } = useNodeManagement({
 *   nodes,
 *   transform,
 *   updateNodePosition: (id, pos) => updateNode(id, { position: pos })
 * });
 * ```
 */
export function useNodeManagement({ nodes, transform, updateNodePosition }: UseNodeManagementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragNodeId, setDragNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<Position | null>(null)

  /**
   * Starts dragging a node
   *
   * @param e - The mouse event that triggered the drag
   * @param nodeId - The ID of the node being dragged
   */
  const handleNodeDragStart = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation()
      setIsDragging(true)
      setDragNodeId(nodeId)

      const node = nodes.find((n) => n.id === nodeId)
      if (node) {
        setDragOffset({
          x: e.clientX - (node.position.x * transform.zoom + transform.x),
          y: e.clientY - (node.position.y * transform.zoom + transform.y),
        })
      }
    },
    [nodes, transform],
  )

  /**
   * Updates the node position during dragging
   *
   * @param e - The mouse event during dragging
   */
  const handleNodeDrag = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && dragNodeId && dragOffset) {
        const newX = (e.clientX - dragOffset.x - transform.x) / transform.zoom
        const newY = (e.clientY - dragOffset.y - transform.y) / transform.zoom

        updateNodePosition(dragNodeId, { x: newX, y: newY })
      }
    },
    [isDragging, dragNodeId, dragOffset, transform, updateNodePosition],
  )

  /**
   * Ends a node drag operation
   */
  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false)
    setDragNodeId(null)
    setDragOffset(null)
  }, [])

  return {
    isDragging,
    dragNodeId,
    dragOffset,
    handleNodeDragStart,
    handleNodeDrag,
    handleNodeDragEnd,
  }
}
