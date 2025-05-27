"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import type { Node, Connection, Viewport, CanvasState, Position } from "@/types/core/canvas-types"

/**
 * Default viewport configuration for consistent initialization
 */
const DEFAULT_VIEWPORT_CONFIG: Viewport = {
  x: 0,
  y: 0,
  zoom: 0.8,
}

/**
 * Storage configuration for canvas state persistence
 */
const CANVAS_STORAGE_CONFIG = {
  key: "canvas-state-v1",
  autoSaveDelay: 1000, // milliseconds
} as const

/**
 * Canvas context interface defining all available operations
 * Organized by functional categories for better AI comprehension
 */
interface CanvasContextValue {
  // Current state
  nodes: Node[]
  connections: Connection[]
  viewport: Viewport
  selectedNodes: string[]

  // Node lifecycle operations
  addNode: (node: Node) => void
  updateNode: (nodeId: string, updates: Partial<Node>) => void
  removeNode: (nodeId: string) => void
  duplicateNode: (nodeId: string) => void
  moveNode: (nodeId: string, position: Position) => void

  // Node property operations
  toggleNodeExpanded: (nodeId: string, isExpanded?: boolean) => void
  toggleNodeLocked: (nodeId: string, isLocked?: boolean) => void
  toggleNodeVisibility: (nodeId: string, isHidden?: boolean) => void

  // Selection management operations
  selectNode: (nodeId: string, isMultiSelect?: boolean) => void
  clearSelection: () => void

  // Viewport control operations
  setViewport: (viewport: Partial<Viewport>) => void
  zoomIn: () => void
  zoomOut: () => void
  resetViewport: () => void

  // Connection management operations
  addConnection: (connection: Connection) => void
  removeConnection: (connectionId: string) => void

  // Canvas state operations
  exportCanvas: () => CanvasState
  importCanvas: (canvasData: Partial<CanvasState>) => void
  clearCanvas: () => void

  // Persistence operations
  saveToStorage: () => void
  loadFromStorage: () => boolean
  hasStoredData: () => boolean
}

/**
 * Canvas context for state management
 * Provides undefined as default to enforce provider usage
 */
const CanvasContext = createContext<CanvasContextValue | undefined>(undefined)

/**
 * Canvas provider configuration interface
 */
interface CanvasProviderProps {
  children: React.ReactNode
  initialState?: Partial<CanvasState>
  gridSize?: number
  autoSave?: boolean
}

/**
 * CanvasProvider Component
 *
 * Provides comprehensive canvas state management with persistence.
 * Implements AI-friendly patterns with clear operation categorization.
 *
 * Features:
 * - Automatic state persistence with configurable delay
 * - Grid-based node positioning with snapping
 * - Comprehensive node lifecycle management
 * - Viewport control with zoom constraints
 * - Connection management with validation
 * - Import/export functionality for canvas states
 *
 * @param children - React children to wrap with canvas context
 * @param initialState - Optional initial canvas state
 * @param gridSize - Grid size for node snapping (default: 20)
 * @param autoSave - Enable automatic state persistence (default: true)
 */
export function CanvasProvider({ children, initialState, gridSize = 20, autoSave = true }: CanvasProviderProps) {
  // Core state management
  const [nodes, setNodes] = useState<Node[]>(initialState?.nodes || [])
  const [connections, setConnections] = useState<Connection[]>(initialState?.connections || [])
  const [viewport, setViewportState] = useState<Viewport>(initialState?.viewport || DEFAULT_VIEWPORT_CONFIG)
  const [selectedNodes, setSelectedNodes] = useState<string[]>(initialState?.selectedNodes || [])

  /**
   * Auto-save functionality with debounced persistence
   * Prevents excessive storage operations during rapid changes
   */
  useEffect(() => {
    if (!autoSave) return

    const autoSaveTimer = setTimeout(() => {
      if (nodes.length > 0 || connections.length > 0) {
        saveToStorage()
      }
    }, CANVAS_STORAGE_CONFIG.autoSaveDelay)

    return () => clearTimeout(autoSaveTimer)
  }, [nodes, connections, viewport, autoSave])

  /**
   * Initial data loading from storage
   * Loads persisted state on component mount if no initial state provided
   */
  useEffect(() => {
    if (!initialState && autoSave) {
      loadFromStorage()
    }
  }, [])

  // Storage operations with error handling
  const saveToStorage = useCallback(() => {
    try {
      const canvasState: CanvasState = {
        nodes,
        connections,
        viewport,
        selectedNodes,
      }
      localStorage.setItem(CANVAS_STORAGE_CONFIG.key, JSON.stringify(canvasState))
      console.log("Canvas state successfully saved to localStorage")
    } catch (storageError) {
      console.error("Failed to save canvas state to localStorage:", storageError)
    }
  }, [nodes, connections, viewport, selectedNodes])

  const loadFromStorage = useCallback(() => {
    try {
      const storedCanvasData = localStorage.getItem(CANVAS_STORAGE_CONFIG.key)
      if (storedCanvasData) {
        const parsedCanvasState: CanvasState = JSON.parse(storedCanvasData)
        setNodes(parsedCanvasState.nodes || [])
        setConnections(parsedCanvasState.connections || [])
        setViewportState(parsedCanvasState.viewport || DEFAULT_VIEWPORT_CONFIG)
        setSelectedNodes(parsedCanvasState.selectedNodes || [])
        console.log("Canvas state successfully loaded from localStorage")
        return true
      }
    } catch (storageError) {
      console.error("Failed to load canvas state from localStorage:", storageError)
    }
    return false
  }, [])

  const hasStoredData = useCallback(() => {
    try {
      const storedData = localStorage.getItem(CANVAS_STORAGE_CONFIG.key)
      return Boolean(storedData)
    } catch {
      return false
    }
  }, [])

  // Node lifecycle operations
  const addNode = useCallback((newNode: Node) => {
    setNodes((previousNodes) => [...previousNodes, newNode])
  }, [])

  const updateNode = useCallback((nodeId: string, nodeUpdates: Partial<Node>) => {
    setNodes((previousNodes) =>
      previousNodes.map((existingNode) =>
        existingNode.id === nodeId
          ? {
              ...existingNode,
              ...nodeUpdates,
              data: { ...existingNode.data, ...(nodeUpdates.data || {}) },
            }
          : existingNode,
      ),
    )
  }, [])

  const removeNode = useCallback((nodeId: string) => {
    setNodes((previousNodes) => previousNodes.filter((node) => node.id !== nodeId))
    setConnections((previousConnections) =>
      previousConnections.filter((connection) => connection.source !== nodeId && connection.target !== nodeId),
    )
    setSelectedNodes((previousSelection) => previousSelection.filter((selectedNodeId) => selectedNodeId !== nodeId))
  }, [])

  const duplicateNode = useCallback((nodeId: string) => {
    setNodes((previousNodes) => {
      const nodeToDuplicate = previousNodes.find((node) => node.id === nodeId)
      if (!nodeToDuplicate) return previousNodes

      const duplicatedNode = {
        ...nodeToDuplicate,
        id: `${nodeToDuplicate.type}-${Date.now()}`,
        position: {
          x: nodeToDuplicate.position.x + 30,
          y: nodeToDuplicate.position.y + 30,
        },
      }

      return [...previousNodes, duplicatedNode]
    })
  }, [])

  const moveNode = useCallback(
    (nodeId: string, newPosition: Position) => {
      // Apply grid snapping if gridSize is configured
      const snappedPosition = gridSize
        ? {
            x: Math.round(newPosition.x / gridSize) * gridSize,
            y: Math.round(newPosition.y / gridSize) * gridSize,
          }
        : newPosition

      updateNode(nodeId, { position: snappedPosition })
    },
    [updateNode, gridSize],
  )

  // Node property operations
  const toggleNodeExpanded = useCallback((nodeId: string, isExpanded?: boolean) => {
    setNodes((previousNodes) =>
      previousNodes.map((node) =>
        node.id === nodeId ? { ...node, isExpanded: isExpanded !== undefined ? isExpanded : !node.isExpanded } : node,
      ),
    )
  }, [])

  const toggleNodeLocked = useCallback((nodeId: string, isLocked?: boolean) => {
    setNodes((previousNodes) =>
      previousNodes.map((node) =>
        node.id === nodeId ? { ...node, isLocked: isLocked !== undefined ? isLocked : !node.isLocked } : node,
      ),
    )
  }, [])

  const toggleNodeVisibility = useCallback((nodeId: string, isHidden?: boolean) => {
    setNodes((previousNodes) =>
      previousNodes.map((node) =>
        node.id === nodeId ? { ...node, isHidden: isHidden !== undefined ? isHidden : !node.isHidden } : node,
      ),
    )
  }, [])

  // Selection management operations
  const selectNode = useCallback((nodeId: string, isMultiSelect = false) => {
    setSelectedNodes((previousSelection) => {
      if (isMultiSelect) {
        return previousSelection.includes(nodeId)
          ? previousSelection.filter((selectedId) => selectedId !== nodeId)
          : [...previousSelection, nodeId]
      }
      return [nodeId]
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedNodes([])
  }, [])

  // Viewport control operations with constraints
  const setViewport = useCallback((viewportUpdates: Partial<Viewport>) => {
    setViewportState((previousViewport) => ({ ...previousViewport, ...viewportUpdates }))
  }, [])

  const zoomIn = useCallback(() => {
    setViewportState((previousViewport) => ({
      ...previousViewport,
      zoom: Math.min(3, previousViewport.zoom * 1.2), // Max zoom: 3x
    }))
  }, [])

  const zoomOut = useCallback(() => {
    setViewportState((previousViewport) => ({
      ...previousViewport,
      zoom: Math.max(0.1, previousViewport.zoom * 0.8), // Min zoom: 0.1x
    }))
  }, [])

  const resetViewport = useCallback(() => {
    setViewportState(DEFAULT_VIEWPORT_CONFIG)
  }, [])

  // Connection management operations
  const addConnection = useCallback((newConnection: Connection) => {
    setConnections((previousConnections) => [...previousConnections, newConnection])
  }, [])

  const removeConnection = useCallback((connectionId: string) => {
    setConnections((previousConnections) => previousConnections.filter((connection) => connection.id !== connectionId))
  }, [])

  // Canvas state operations
  const exportCanvas = useCallback(() => {
    return { nodes, connections, viewport, selectedNodes }
  }, [nodes, connections, viewport, selectedNodes])

  const importCanvas = useCallback((canvasData: Partial<CanvasState>) => {
    if (canvasData.nodes) setNodes(canvasData.nodes)
    if (canvasData.connections) setConnections(canvasData.connections)
    if (canvasData.viewport) setViewportState(canvasData.viewport)
    if (canvasData.selectedNodes) setSelectedNodes(canvasData.selectedNodes)
  }, [])

  const clearCanvas = useCallback(() => {
    setNodes([])
    setConnections([])
    setSelectedNodes([])
  }, [])

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      // Current state
      nodes,
      connections,
      viewport,
      selectedNodes,

      // Node lifecycle operations
      addNode,
      updateNode,
      removeNode,
      duplicateNode,
      moveNode,

      // Node property operations
      toggleNodeExpanded,
      toggleNodeLocked,
      toggleNodeVisibility,

      // Selection management operations
      selectNode,
      clearSelection,

      // Viewport control operations
      setViewport,
      zoomIn,
      zoomOut,
      resetViewport,

      // Connection management operations
      addConnection,
      removeConnection,

      // Canvas state operations
      exportCanvas,
      importCanvas,
      clearCanvas,

      // Persistence operations
      saveToStorage,
      loadFromStorage,
      hasStoredData,
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
      saveToStorage,
      loadFromStorage,
      hasStoredData,
    ],
  )

  return <CanvasContext.Provider value={contextValue}>{children}</CanvasContext.Provider>
}

/**
 * Custom hook for accessing canvas context
 * Provides type-safe access with error handling for missing provider
 *
 * @throws Error if used outside of CanvasProvider
 * @returns CanvasContextValue - The canvas context value
 */
export function useCanvas() {
  const canvasContext = useContext(CanvasContext)
  if (canvasContext === undefined) {
    throw new Error("useCanvas must be used within a CanvasProvider")
  }
  return canvasContext
}
