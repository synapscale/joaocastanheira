"use client"

import { useState, useCallback, useMemo } from "react"
import type { Node, Connection, Viewport, CanvasState, Position } from "@/types/core/canvas-types"

const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 0.8 }

interface UseCanvasStateOptions {
  initialState?: Partial<CanvasState>
  gridSize?: number
}

/**
 * Hook para gerenciar o estado do canvas
 */
export function useCanvasState(options: UseCanvasStateOptions = {}) {
  const { initialState = {}, gridSize = 20 } = options

  const [nodes, setNodes] = useState<Node[]>(initialState.nodes || [])
  const [connections, setConnections] = useState<Connection[]>(initialState.connections || [])
  const [viewport, setViewportState] = useState<Viewport>(initialState.viewport || DEFAULT_VIEWPORT)
  const [selectedNodes, setSelectedNodes] = useState<string[]>(initialState.selectedNodes || [])

  // Node operations
  const addNode = useCallback((node: Node) => {
    setNodes((prev) => [...prev, node])
  }, [])

  const updateNode = useCallback((id: string, updates: Partial<Node>) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? {
              ...node,
              ...updates,
              data: { ...node.data, ...(updates.data || {}) },
            }
          : node,
      ),
    )
  }, [])

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id))
    setConnections((prev) => prev.filter((conn) => conn.source !== id && conn.target !== id))
    setSelectedNodes((prev) => prev.filter((nodeId) => nodeId !== id))
  }, [])

  const duplicateNode = useCallback((id: string) => {
    setNodes((prev) => {
      const nodeToDuplicate = prev.find((node) => node.id === id)
      if (!nodeToDuplicate) return prev

      const newNode = {
        ...nodeToDuplicate,
        id: `${nodeToDuplicate.type}-${Date.now()}`,
        position: {
          x: nodeToDuplicate.position.x + 30,
          y: nodeToDuplicate.position.y + 30,
        },
      }

      return [...prev, newNode]
    })
  }, [])

  const moveNode = useCallback(
    (id: string, position: Position) => {
      // Aplica snapping à grade se gridSize for fornecido
      const snappedPosition = gridSize
        ? {
            x: Math.round(position.x / gridSize) * gridSize,
            y: Math.round(position.y / gridSize) * gridSize,
          }
        : position

      updateNode(id, { position: snappedPosition })
    },
    [updateNode, gridSize],
  )

  // Node property toggles
  const toggleNodeExpanded = useCallback((id: string, isExpanded?: boolean) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, isExpanded: isExpanded !== undefined ? isExpanded : !node.isExpanded } : node,
      ),
    )
  }, [])

  const toggleNodeLocked = useCallback((id: string, isLocked?: boolean) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, isLocked: isLocked !== undefined ? isLocked : !node.isLocked } : node,
      ),
    )
  }, [])

  const toggleNodeVisibility = useCallback((id: string, isHidden?: boolean) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, isHidden: isHidden !== undefined ? isHidden : !node.isHidden } : node,
      ),
    )
  }, [])

  // Selection operations
  const selectNode = useCallback((id: string, isMultiSelect = false) => {
    setSelectedNodes((prev) => {
      if (isMultiSelect) {
        return prev.includes(id) ? prev.filter((nodeId) => nodeId !== id) : [...prev, id]
      }
      return [id]
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedNodes([])
  }, [])

  // Viewport operations
  const setViewport = useCallback((newViewport: Partial<Viewport>) => {
    setViewportState((prev) => ({ ...prev, ...newViewport }))
  }, [])

  const zoomIn = useCallback(() => {
    setViewportState((prev) => ({
      ...prev,
      zoom: Math.min(3, prev.zoom * 1.2),
    }))
  }, [])

  const zoomOut = useCallback(() => {
    setViewportState((prev) => ({
      ...prev,
      zoom: Math.max(0.1, prev.zoom * 0.8),
    }))
  }, [])

  const resetViewport = useCallback(() => {
    setViewportState(DEFAULT_VIEWPORT)
  }, [])

  // Connection operations
  const addConnection = useCallback((connection: Connection) => {
    setConnections((prev) => [...prev, connection])
  }, [])

  const removeConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id))
  }, [])

  // Canvas operations
  const exportCanvas = useCallback(() => {
    return { nodes, connections, viewport, selectedNodes }
  }, [nodes, connections, viewport, selectedNodes])

  const importCanvas = useCallback((data: Partial<CanvasState>) => {
    if (data.nodes) setNodes(data.nodes)
    if (data.connections) setConnections(data.connections)
    if (data.viewport) setViewportState(data.viewport)
    if (data.selectedNodes) setSelectedNodes(data.selectedNodes)
  }, [])

  const clearCanvas = useCallback(() => {
    setNodes([])
    setConnections([])
    setSelectedNodes([])
  }, [])

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // State
      nodes,
      connections,
      viewport,
      selectedNodes,

      // Node operations
      addNode,
      updateNode,
      removeNode,
      duplicateNode,
      moveNode,
      toggleNodeExpanded,
      toggleNodeLocked,
      toggleNodeVisibility,

      // Selection operations
      selectNode,
      clearSelection,

      // Viewport operations
      setViewport,
      zoomIn,
      zoomOut,
      resetViewport,

      // Connection operations
      addConnection,
      removeConnection,

      // Canvas operations
      exportCanvas,
      importCanvas,
      clearCanvas,
    }),
    [
      nodes,
      connections,
      viewport,
      selectedNodes,
      addNode,
      updateNode,
      removeNode,
      duplicateNode,
      moveNode,
      toggleNodeExpanded,
      toggleNodeLocked,
      toggleNodeVisibility,
      selectNode,
      clearSelection,
      setViewport,
      zoomIn,
      zoomOut,
      resetViewport,
      addConnection,
      removeConnection,
      exportCanvas,
      importCanvas,
      clearCanvas,
    ],
  )
}
