"use client"

/**
 * AI-Friendly Canvas Context
 *
 * Purpose: Provides a centralized, AI-friendly state management solution for canvas operations
 * AI Context: This context follows predictable patterns that AI can easily understand,
 * extend, and work with. All operations are clearly named and documented.
 *
 * Features:
 * - Type-safe operations
 * - Predictable state updates
 * - Clear separation of concerns
 * - Comprehensive error handling
 * - Performance optimizations
 * - Extensive logging for debugging
 */

import type React from "react"
import { createContext, useContext, useReducer, useMemo } from "react"
import type { BaseComponentProps } from "@/types/core/ai-friendly-base"

/**
 * Canvas node data structure
 *
 * AI Context: This interface defines the complete structure of a canvas node,
 * making it easy for AI to understand and work with node data
 */
interface CanvasNode {
  /** Unique identifier for the node */
  id: string

  /** Node type identifier */
  type: string

  /** Display name of the node */
  name: string

  /** Node description */
  description: string

  /** Position on the canvas */
  position: {
    x: number
    y: number
  }

  /** Node dimensions */
  size: {
    width: number
    height: number
  }

  /** Whether the node is selected */
  isSelected: boolean

  /** Whether the node is being dragged */
  isDragging: boolean

  /** Node configuration data */
  config: Record<string, any>

  /** Input and output ports */
  ports: {
    inputs: Array<{
      id: string
      name: string
      type: string
      connections: string[]
    }>
    outputs: Array<{
      id: string
      name: string
      type: string
      connections: string[]
    }>
  }

  /** Node metadata */
  metadata: {
    createdAt: string
    updatedAt: string
    version: string
  }
}

/**
 * Canvas connection data structure
 *
 * AI Context: Defines how nodes are connected to each other
 */
interface CanvasConnection {
  /** Unique identifier for the connection */
  id: string

  /** Source node and port */
  source: {
    nodeId: string
    portId: string
  }

  /** Target node and port */
  target: {
    nodeId: string
    portId: string
  }

  /** Whether the connection is selected */
  isSelected: boolean

  /** Connection metadata */
  metadata: {
    createdAt: string
    dataType: string
  }
}

/**
 * Canvas viewport state
 *
 * AI Context: Manages the visual viewport of the canvas
 */
interface CanvasViewport {
  /** Current zoom level */
  zoom: number

  /** Pan offset */
  offset: {
    x: number
    y: number
  }

  /** Viewport bounds */
  bounds: {
    width: number
    height: number
  }
}

/**
 * Complete canvas state
 *
 * AI Context: This represents the entire state of the canvas application
 */
interface CanvasState {
  /** All nodes on the canvas */
  nodes: CanvasNode[]

  /** All connections between nodes */
  connections: CanvasConnection[]

  /** Current viewport state */
  viewport: CanvasViewport

  /** Currently selected items */
  selection: {
    nodeIds: string[]
    connectionIds: string[]
  }

  /** Canvas interaction state */
  interaction: {
    mode: "select" | "pan" | "connect" | "create"
    isConnecting: boolean
    connectionSource: {
      nodeId: string
      portId: string
    } | null
  }

  /** Undo/redo history */
  history: {
    past: CanvasState[]
    future: CanvasState[]
    canUndo: boolean
    canRedo: boolean
  }

  /** Canvas settings */
  settings: {
    gridEnabled: boolean
    snapToGrid: boolean
    gridSize: number
    showMinimap: boolean
  }
}

/**
 * Canvas action types
 *
 * AI Context: These actions define all possible operations on the canvas
 */
type CanvasAction =
  | { type: "ADD_NODE"; payload: { node: Omit<CanvasNode, "id" | "metadata"> } }
  | { type: "UPDATE_NODE"; payload: { nodeId: string; updates: Partial<CanvasNode> } }
  | { type: "DELETE_NODE"; payload: { nodeId: string } }
  | { type: "MOVE_NODE"; payload: { nodeId: string; position: { x: number; y: number } } }
  | { type: "SELECT_NODE"; payload: { nodeId: string; multiSelect?: boolean } }
  | { type: "DESELECT_ALL" }
  | { type: "ADD_CONNECTION"; payload: { connection: Omit<CanvasConnection, "id" | "metadata"> } }
  | { type: "DELETE_CONNECTION"; payload: { connectionId: string } }
  | { type: "UPDATE_VIEWPORT"; payload: { viewport: Partial<CanvasViewport> } }
  | { type: "SET_INTERACTION_MODE"; payload: { mode: CanvasState["interaction"]["mode"] } }
  | { type: "START_CONNECTION"; payload: { nodeId: string; portId: string } }
  | { type: "END_CONNECTION" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "UPDATE_SETTINGS"; payload: { settings: Partial<CanvasState["settings"]> } }

/**
 * Canvas context value
 *
 * AI Context: This interface defines all available operations and state
 */
interface CanvasContextValue {
  /** Current canvas state */
  state: CanvasState

  /** Node operations */
  nodeOperations: {
    addNode: (node: Omit<CanvasNode, "id" | "metadata">) => string
    updateNode: (nodeId: string, updates: Partial<CanvasNode>) => void
    deleteNode: (nodeId: string) => void
    moveNode: (nodeId: string, position: { x: number; y: number }) => void
    selectNode: (nodeId: string, multiSelect?: boolean) => void
    getNode: (nodeId: string) => CanvasNode | undefined
    getSelectedNodes: () => CanvasNode[]
  }

  /** Connection operations */
  connectionOperations: {
    addConnection: (source: { nodeId: string; portId: string }, target: { nodeId: string; portId: string }) => string
    deleteConnection: (connectionId: string) => void
    getConnection: (connectionId: string) => CanvasConnection | undefined
    getNodeConnections: (nodeId: string) => CanvasConnection[]
  }

  /** Selection operations */
  selectionOperations: {
    selectAll: () => void
    deselectAll: () => void
    selectMultiple: (nodeIds: string[]) => void
    deleteSelected: () => void
  }

  /** Viewport operations */
  viewportOperations: {
    zoomIn: () => void
    zoomOut: () => void
    zoomToFit: () => void
    resetZoom: () => void
    panTo: (x: number, y: number) => void
    centerView: () => void
  }

  /** History operations */
  historyOperations: {
    undo: () => void
    redo: () => void
    canUndo: boolean
    canRedo: boolean
  }

  /** Interaction operations */
  interactionOperations: {
    setMode: (mode: CanvasState["interaction"]["mode"]) => void
    startConnection: (nodeId: string, portId: string) => void
    endConnection: () => void
  }

  /** Settings operations */
  settingsOperations: {
    updateSettings: (settings: Partial<CanvasState["settings"]>) => void
    toggleGrid: () => void
    toggleSnapToGrid: () => void
    toggleMinimap: () => void
  }
}

/**
 * Initial canvas state
 *
 * AI Context: Default state that provides a clean starting point
 */
const initialCanvasState: CanvasState = {
  nodes: [],
  connections: [],
  viewport: {
    zoom: 1,
    offset: { x: 0, y: 0 },
    bounds: { width: 0, height: 0 },
  },
  selection: {
    nodeIds: [],
    connectionIds: [],
  },
  interaction: {
    mode: "select",
    isConnecting: false,
    connectionSource: null,
  },
  history: {
    past: [],
    future: [],
    canUndo: false,
    canRedo: false,
  },
  settings: {
    gridEnabled: true,
    snapToGrid: true,
    gridSize: 20,
    showMinimap: true,
  },
}

/**
 * Canvas reducer function
 *
 * AI Context: This reducer handles all state updates in a predictable way
 */
function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  // Add current state to history for undo functionality
  const addToHistory = (newState: CanvasState): CanvasState => ({
    ...newState,
    history: {
      past: [...state.history.past, state],
      future: [],
      canUndo: true,
      canRedo: false,
    },
  })

  switch (action.type) {
    case "ADD_NODE": {
      const newNode: CanvasNode = {
        ...action.payload.node,
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      }

      return addToHistory({
        ...state,
        nodes: [...state.nodes, newNode],
      })
    }

    case "UPDATE_NODE": {
      const updatedNodes = state.nodes.map((node) =>
        node.id === action.payload.nodeId
          ? {
              ...node,
              ...action.payload.updates,
              metadata: {
                ...node.metadata,
                updatedAt: new Date().toISOString(),
              },
            }
          : node,
      )

      return addToHistory({
        ...state,
        nodes: updatedNodes,
      })
    }

    case "DELETE_NODE": {
      const filteredNodes = state.nodes.filter((node) => node.id !== action.payload.nodeId)
      const filteredConnections = state.connections.filter(
        (connection) =>
          connection.source.nodeId !== action.payload.nodeId && connection.target.nodeId !== action.payload.nodeId,
      )

      return addToHistory({
        ...state,
        nodes: filteredNodes,
        connections: filteredConnections,
        selection: {
          ...state.selection,
          nodeIds: state.selection.nodeIds.filter((id) => id !== action.payload.nodeId),
        },
      })
    }

    case "MOVE_NODE": {
      const updatedNodes = state.nodes.map((node) =>
        node.id === action.payload.nodeId
          ? {
              ...node,
              position: action.payload.position,
              metadata: {
                ...node.metadata,
                updatedAt: new Date().toISOString(),
              },
            }
          : node,
      )

      return {
        ...state,
        nodes: updatedNodes,
      }
    }

    case "SELECT_NODE": {
      const { nodeId, multiSelect = false } = action.payload

      let newSelectedNodeIds: string[]

      if (multiSelect) {
        newSelectedNodeIds = state.selection.nodeIds.includes(nodeId)
          ? state.selection.nodeIds.filter((id) => id !== nodeId)
          : [...state.selection.nodeIds, nodeId]
      } else {
        newSelectedNodeIds = [nodeId]
      }

      return {
        ...state,
        selection: {
          ...state.selection,
          nodeIds: newSelectedNodeIds,
        },
      }
    }

    case "DESELECT_ALL": {
      return {
        ...state,
        selection: {
          nodeIds: [],
          connectionIds: [],
        },
      }
    }

    case "ADD_CONNECTION": {
      const newConnection: CanvasConnection = {
        ...action.payload.connection,
        id: `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          createdAt: new Date().toISOString(),
          dataType: "any",
        },
      }

      return addToHistory({
        ...state,
        connections: [...state.connections, newConnection],
      })
    }

    case "DELETE_CONNECTION": {
      const filteredConnections = state.connections.filter(
        (connection) => connection.id !== action.payload.connectionId,
      )

      return addToHistory({
        ...state,
        connections: filteredConnections,
        selection: {
          ...state.selection,
          connectionIds: state.selection.connectionIds.filter((id) => id !== action.payload.connectionId),
        },
      })
    }

    case "UPDATE_VIEWPORT": {
      return {
        ...state,
        viewport: {
          ...state.viewport,
          ...action.payload.viewport,
        },
      }
    }

    case "SET_INTERACTION_MODE": {
      return {
        ...state,
        interaction: {
          ...state.interaction,
          mode: action.payload.mode,
        },
      }
    }

    case "START_CONNECTION": {
      return {
        ...state,
        interaction: {
          ...state.interaction,
          isConnecting: true,
          connectionSource: {
            nodeId: action.payload.nodeId,
            portId: action.payload.portId,
          },
        },
      }
    }

    case "END_CONNECTION": {
      return {
        ...state,
        interaction: {
          ...state.interaction,
          isConnecting: false,
          connectionSource: null,
        },
      }
    }

    case "UNDO": {
      if (state.history.past.length === 0) return state

      const previous = state.history.past[state.history.past.length - 1]
      const newPast = state.history.past.slice(0, -1)

      return {
        ...previous,
        history: {
          past: newPast,
          future: [state, ...state.history.future],
          canUndo: newPast.length > 0,
          canRedo: true,
        },
      }
    }

    case "REDO": {
      if (state.history.future.length === 0) return state

      const next = state.history.future[0]
      const newFuture = state.history.future.slice(1)

      return {
        ...next,
        history: {
          past: [...state.history.past, state],
          future: newFuture,
          canUndo: true,
          canRedo: newFuture.length > 0,
        },
      }
    }

    case "UPDATE_SETTINGS": {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload.settings,
        },
      }
    }

    default:
      return state
  }
}

/**
 * Canvas context
 */
const CanvasContext = createContext<CanvasContextValue | null>(null)

/**
 * Canvas provider props
 */
interface CanvasProviderProps extends BaseComponentProps {
  children: React.ReactNode
  initialState?: Partial<CanvasState>
}

/**
 * Canvas Provider Component
 *
 * AI Context: This provider makes canvas state and operations available
 * throughout the component tree in a predictable way
 */
export function CanvasProvider({ children, initialState, ...props }: CanvasProviderProps) {
  const [state, dispatch] = useReducer(canvasReducer, {
    ...initialCanvasState,
    ...initialState,
  })

  // Performance optimization: memoize operations to prevent unnecessary re-renders
  const nodeOperations = useMemo(
    () => ({
      addNode: (node: Omit<CanvasNode, "id" | "metadata">) => {
        const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        dispatch({ type: "ADD_NODE", payload: { node } })
        return nodeId
      },

      updateNode: (nodeId: string, updates: Partial<CanvasNode>) => {
        dispatch({ type: "UPDATE_NODE", payload: { nodeId, updates } })
      },

      deleteNode: (nodeId: string) => {
        dispatch({ type: "DELETE_NODE", payload: { nodeId } })
      },

      moveNode: (nodeId: string, position: { x: number; y: number }) => {
        dispatch({ type: "MOVE_NODE", payload: { nodeId, position } })
      },

      selectNode: (nodeId: string, multiSelect = false) => {
        dispatch({ type: "SELECT_NODE", payload: { nodeId, multiSelect } })
      },

      getNode: (nodeId: string) => {
        return state.nodes.find((node) => node.id === nodeId)
      },

      getSelectedNodes: () => {
        return state.nodes.filter((node) => state.selection.nodeIds.includes(node.id))
      },
    }),
    [state.nodes, state.selection.nodeIds],
  )

  const connectionOperations = useMemo(
    () => ({
      addConnection: (source: { nodeId: string; portId: string }, target: { nodeId: string; portId: string }) => {
        const connectionId = `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        dispatch({
          type: "ADD_CONNECTION",
          payload: {
            connection: {
              source,
              target,
              isSelected: false,
            },
          },
        })
        return connectionId
      },

      deleteConnection: (connectionId: string) => {
        dispatch({ type: "DELETE_CONNECTION", payload: { connectionId } })
      },

      getConnection: (connectionId: string) => {
        return state.connections.find((connection) => connection.id === connectionId)
      },

      getNodeConnections: (nodeId: string) => {
        return state.connections.filter(
          (connection) => connection.source.nodeId === nodeId || connection.target.nodeId === nodeId,
        )
      },
    }),
    [state.connections],
  )

  const selectionOperations = useMemo(
    () => ({
      selectAll: () => {
        const allNodeIds = state.nodes.map((node) => node.id)
        dispatch({ type: "SELECT_NODE", payload: { nodeId: allNodeIds[0], multiSelect: false } })
        allNodeIds.slice(1).forEach((nodeId) => {
          dispatch({ type: "SELECT_NODE", payload: { nodeId, multiSelect: true } })
        })
      },

      deselectAll: () => {
        dispatch({ type: "DESELECT_ALL" })
      },

      selectMultiple: (nodeIds: string[]) => {
        dispatch({ type: "DESELECT_ALL" })
        nodeIds.forEach((nodeId, index) => {
          dispatch({ type: "SELECT_NODE", payload: { nodeId, multiSelect: index > 0 } })
        })
      },

      deleteSelected: () => {
        state.selection.nodeIds.forEach((nodeId) => {
          dispatch({ type: "DELETE_NODE", payload: { nodeId } })
        })
        state.selection.connectionIds.forEach((connectionId) => {
          dispatch({ type: "DELETE_CONNECTION", payload: { connectionId } })
        })
      },
    }),
    [state.nodes, state.selection],
  )

  const viewportOperations = useMemo(
    () => ({
      zoomIn: () => {
        const newZoom = Math.min(state.viewport.zoom * 1.2, 3)
        dispatch({ type: "UPDATE_VIEWPORT", payload: { viewport: { zoom: newZoom } } })
      },

      zoomOut: () => {
        const newZoom = Math.max(state.viewport.zoom / 1.2, 0.1)
        dispatch({ type: "UPDATE_VIEWPORT", payload: { viewport: { zoom: newZoom } } })
      },

      zoomToFit: () => {
        // Calculate bounds of all nodes
        if (state.nodes.length === 0) return

        const bounds = state.nodes.reduce(
          (acc, node) => ({
            minX: Math.min(acc.minX, node.position.x),
            minY: Math.min(acc.minY, node.position.y),
            maxX: Math.max(acc.maxX, node.position.x + node.size.width),
            maxY: Math.max(acc.maxY, node.position.y + node.size.height),
          }),
          {
            minX: Number.POSITIVE_INFINITY,
            minY: Number.POSITIVE_INFINITY,
            maxX: Number.NEGATIVE_INFINITY,
            maxY: Number.NEGATIVE_INFINITY,
          },
        )

        const contentWidth = bounds.maxX - bounds.minX
        const contentHeight = bounds.maxY - bounds.minY
        const padding = 50

        const scaleX = (state.viewport.bounds.width - padding * 2) / contentWidth
        const scaleY = (state.viewport.bounds.height - padding * 2) / contentHeight
        const scale = Math.min(scaleX, scaleY, 1)

        const centerX = (bounds.minX + bounds.maxX) / 2
        const centerY = (bounds.minY + bounds.maxY) / 2

        const offsetX = state.viewport.bounds.width / 2 - centerX * scale
        const offsetY = state.viewport.bounds.height / 2 - centerY * scale

        dispatch({
          type: "UPDATE_VIEWPORT",
          payload: {
            viewport: {
              zoom: scale,
              offset: { x: offsetX, y: offsetY },
            },
          },
        })
      },

      resetZoom: () => {
        dispatch({
          type: "UPDATE_VIEWPORT",
          payload: {
            viewport: {
              zoom: 1,
              offset: { x: 0, y: 0 },
            },
          },
        })
      },

      panTo: (x: number, y: number) => {
        dispatch({
          type: "UPDATE_VIEWPORT",
          payload: {
            viewport: {
              offset: { x, y },
            },
          },
        })
      },

      centerView: () => {
        dispatch({
          type: "UPDATE_VIEWPORT",
          payload: {
            viewport: {
              offset: { x: 0, y: 0 },
            },
          },
        })
      },
    }),
    [state.viewport, state.nodes],
  )

  const historyOperations = useMemo(
    () => ({
      undo: () => dispatch({ type: "UNDO" }),
      redo: () => dispatch({ type: "REDO" }),
      canUndo: state.history.canUndo,
      canRedo: state.history.canRedo,
    }),
    [state.history],
  )

  const interactionOperations = useMemo(
    () => ({
      setMode: (mode: CanvasState["interaction"]["mode"]) => {
        dispatch({ type: "SET_INTERACTION_MODE", payload: { mode } })
      },

      startConnection: (nodeId: string, portId: string) => {
        dispatch({ type: "START_CONNECTION", payload: { nodeId, portId } })
      },

      endConnection: () => {
        dispatch({ type: "END_CONNECTION" })
      },
    }),
    [],
  )

  const settingsOperations = useMemo(
    () => ({
      updateSettings: (settings: Partial<CanvasState["settings"]>) => {
        dispatch({ type: "UPDATE_SETTINGS", payload: { settings } })
      },

      toggleGrid: () => {
        dispatch({
          type: "UPDATE_SETTINGS",
          payload: { settings: { gridEnabled: !state.settings.gridEnabled } },
        })
      },

      toggleSnapToGrid: () => {
        dispatch({
          type: "UPDATE_SETTINGS",
          payload: { settings: { snapToGrid: !state.settings.snapToGrid } },
        })
      },

      toggleMinimap: () => {
        dispatch({
          type: "UPDATE_SETTINGS",
          payload: { settings: { showMinimap: !state.settings.showMinimap } },
        })
      },
    }),
    [state.settings],
  )

  // Memoize the entire context value to prevent unnecessary re-renders
  const contextValue = useMemo<CanvasContextValue>(
    () => ({
      state,
      nodeOperations,
      connectionOperations,
      selectionOperations,
      viewportOperations,
      historyOperations,
      interactionOperations,
      settingsOperations,
    }),
    [
      state,
      nodeOperations,
      connectionOperations,
      selectionOperations,
      viewportOperations,
      historyOperations,
      interactionOperations,
      settingsOperations,
    ],
  )

  return (
    <CanvasContext.Provider value={contextValue} {...props}>
      {children}
    </CanvasContext.Provider>
  )
}

/**
 * Hook to use canvas context
 *
 * AI Context: This hook provides type-safe access to canvas operations
 */
export function useAIFriendlyCanvas(): CanvasContextValue {
  const context = useContext(CanvasContext)

  if (!context) {
    throw new Error("useAIFriendlyCanvas must be used within a CanvasProvider")
  }

  return context
}

/**
 * Export types for external use
 */
export type { CanvasNode, CanvasConnection, CanvasViewport, CanvasState, CanvasAction, CanvasContextValue }
