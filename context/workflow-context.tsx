"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useMemo } from "react"
import type { Node, Connection, Position } from "@/types/workflow"
import { nanoid } from "nanoid"

// Inicialização sem nodes pré-existentes
const initialNodes: Node[] = []

// Inicialização sem conexões pré-existentes
const initialConnections: Connection[] = []

/**
 * Interface for the workflow context
 */
interface WorkflowContextType {
  // State
  nodes: Node[]
  connections: Connection[]
  selectedNode: Node | null
  selectedNodes: string[]
  zoom: number
  panOffset: Position
  showGrid: boolean
  contextMenuInfo: { nodeIds: string[]; position: Position } | null
  canvasContextMenuInfo: { position: Position; canvasPosition: Position } | null
  connectionContextMenuInfo: { connectionId: string; position: Position } | null
  connectionPreview: {
    fromNodeId: string
    start: Position
    end: Position
    type?: string
  } | null
  workflowName: string
  isActive: boolean

  // Node operations
  addNode: (node: Node) => void
  updateNode: (nodeId: string, updates: Partial<Node>) => void
  updateNodePosition: (nodeId: string, position: Position) => void
  removeNode: (nodeId: string) => void
  duplicateNode: (nodeId: string) => void
  lockNode: (nodeId: string) => void
  unlockNode: (nodeId: string) => void
  toggleNodeDisabled: (nodeId: string) => void
  executeNode: (nodeId: string) => void
  alignNodes: (nodeIds: string[], alignment: "left" | "right" | "top" | "bottom" | "center") => void

  // Connection operations
  addConnection: (fromNodeId: string, toNodeId: string, type?: string, id?: string, label?: string) => void
  removeConnection: (connectionId: string) => void
  updateConnectionType: (connectionId: string, type: string) => void
  updateConnectionLabel: (connectionId: string, label: string) => void
  addNodeBetweenConnections: (connectionId: string) => void
  updateConnection: (connectionId: string, updatedConnection: Connection) => void

  // Selection operations
  setSelectedNode: (node: Node | null) => void
  setSelectedNodes: (nodeIds: string[]) => void

  // Canvas operations
  setZoom: (zoom: number) => void
  setPanOffset: (offset: Position) => void
  setShowGrid: (show: boolean) => void

  // Context menu operations
  setContextMenuInfo: (info: { nodeIds: string[]; position: Position } | null) => void
  setCanvasContextMenuInfo: (info: { position: Position; canvasPosition: Position } | null) => void
  setConnectionContextMenuInfo: (info: { connectionId: string; position: Position } | null) => void
  setConnectionPreview: (
    preview: {
      fromNodeId: string
      start: Position
      end: Position
      type?: string
    } | null,
  ) => void

  // Workflow operations
  setWorkflowName: (name: string) => void
  setIsActive: (active: boolean) => void
  saveWorkflow: () => void
}

// Create the context
const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

/**
 * Provider component for the workflow context
 */
export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  // State for nodes and connections
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [connections, setConnections] = useState<Connection[]>(initialConnections)

  // State for selection
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])

  // State for canvas
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState<Position>({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)

  // State for context menus
  const [contextMenuInfo, setContextMenuInfo] = useState<{ nodeIds: string[]; position: Position } | null>(null)
  const [canvasContextMenuInfo, setCanvasContextMenuInfo] = useState<{
    position: Position
    canvasPosition: Position
  } | null>(null)
  const [connectionContextMenuInfo, setConnectionContextMenuInfo] = useState<{
    connectionId: string
    position: Position
  } | null>(null)
  const [connectionPreview, setConnectionPreview] = useState<{
    fromNodeId: string
    start: Position
    end: Position
    type?: string
  } | null>(null)

  // State for workflow
  const [workflowName, setWorkflowName] = useState("Untitled Workflow")
  const [isActive, setIsActive] = useState(false) // Inicializa como inativo por padrão

  // Node operations
  const addNode = useCallback((node: Node) => {
    setNodes((prevNodes) => [...prevNodes, node])
  }, [])

  const updateNode = useCallback((nodeId: string, updates: Partial<Node>) => {
    setNodes((prevNodes) => prevNodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)))
  }, [])

  const updateNodePosition = useCallback((nodeId: string, position: Position) => {
    setNodes((prevNodes) => prevNodes.map((node) => (node.id === nodeId ? { ...node, position } : node)))
  }, [])

  const removeNode = useCallback((nodeId: string) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId))
    setConnections((prevConnections) => prevConnections.filter((conn) => conn.from !== nodeId && conn.to !== nodeId))

    // Also clear selection if the removed node was selected
    setSelectedNodes((prev) => prev.filter((id) => id !== nodeId))
    setSelectedNode((prev) => (prev?.id === nodeId ? null : prev))
  }, [])

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const nodeToDuplicate = nodes.find((node) => node.id === nodeId)
      if (!nodeToDuplicate) return

      const newNode: Node = {
        ...nodeToDuplicate,
        id: `node-${nanoid(6)}`,
        position: {
          x: nodeToDuplicate.position.x + 20,
          y: nodeToDuplicate.position.y + 20,
        },
        name: `${nodeToDuplicate.name} (copy)`,
      }

      setNodes((prevNodes) => [...prevNodes, newNode])
    },
    [nodes],
  )

  const toggleNodeDisabled = useCallback((nodeId: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, disabled: !node.disabled } : node,
      ),
    )
  }, [])

  const executeNode = useCallback((nodeId: string) => {
    // Placeholder for future execution logic
    console.log(`Execute node ${nodeId}`)
  }, [])

  const lockNode = useCallback((nodeId: string) => {
    setNodes((prevNodes) => prevNodes.map((node) => (node.id === nodeId ? { ...node, locked: true } : node)))
  }, [])

  const unlockNode = useCallback((nodeId: string) => {
    setNodes((prevNodes) => prevNodes.map((node) => (node.id === nodeId ? { ...node, locked: false } : node)))
  }, [])

  const alignNodes = useCallback(
    (nodeIds: string[], alignment: "left" | "right" | "top" | "bottom" | "center") => {
      if (nodeIds.length < 2) return

      const nodesToAlign = nodes.filter((node) => nodeIds.includes(node.id))
      if (nodesToAlign.length < 2) return

      let alignValue: number

      switch (alignment) {
        case "left":
          alignValue = Math.min(...nodesToAlign.map((node) => node.position.x))
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              nodeIds.includes(node.id) ? { ...node, position: { ...node.position, x: alignValue } } : node,
            ),
          )
          break
        case "right":
          alignValue = Math.max(...nodesToAlign.map((node) => node.position.x + (node.width || 70)))
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              nodeIds.includes(node.id)
                ? {
                    ...node,
                    position: {
                      ...node.position,
                      x: alignValue - (node.width || 70),
                    },
                  }
                : node,
            ),
          )
          break
        case "top":
          alignValue = Math.min(...nodesToAlign.map((node) => node.position.y))
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              nodeIds.includes(node.id) ? { ...node, position: { ...node.position, y: alignValue } } : node,
            ),
          )
          break
        case "bottom":
          alignValue = Math.max(...nodesToAlign.map((node) => node.position.y + (node.height || 70)))
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              nodeIds.includes(node.id)
                ? {
                    ...node,
                    position: {
                      ...node.position,
                      y: alignValue - (node.height || 70),
                    },
                  }
                : node,
            ),
          )
          break
        case "center":
          const centerX =
            nodesToAlign.reduce((sum, node) => sum + node.position.x + (node.width || 70) / 2, 0) / nodesToAlign.length
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              nodeIds.includes(node.id)
                ? {
                    ...node,
                    position: {
                      ...node.position,
                      x: centerX - (node.width || 70) / 2,
                    },
                  }
                : node,
            ),
          )
          break
      }
    },
    [nodes],
  )

  // Connection operations
  const addConnection = useCallback(
    (fromNodeId: string, toNodeId: string, type = "bezier", id?: string, label?: string) => {
      const newConnection: Connection = {
        id: id || `connection-${nanoid(6)}`,
        from: fromNodeId,
        to: toNodeId,
        type: type as "bezier" | "straight" | "step",
        label,
      }
      setConnections((prevConnections) => [...prevConnections, newConnection])
    },
    [],
  )

  const removeConnection = useCallback((connectionId: string) => {
    setConnections((prevConnections) => prevConnections.filter((conn) => conn.id !== connectionId))
  }, [])

  const updateConnectionType = useCallback((connectionId: string, type: string) => {
    setConnections((prevConnections) =>
      prevConnections.map((conn) =>
        conn.id === connectionId ? { ...conn, type: type as "bezier" | "straight" | "step" } : conn,
      ),
    )
  }, [])

  const updateConnectionLabel = useCallback((connectionId: string, label: string) => {
    setConnections((prevConnections) =>
      prevConnections.map((conn) => (conn.id === connectionId ? { ...conn, label } : conn)),
    )
  }, [])

  const addNodeBetweenConnections = useCallback(
    (connectionId: string) => {
      // Find the connection
      const connection = connections.find((conn) => conn.id === connectionId)
      if (!connection) return

      // Create a new node at the midpoint between the connected nodes
      const fromNode = nodes.find((node) => node.id === connection.from)
      const toNode = nodes.find((node) => node.id === connection.to)

      if (!fromNode || !toNode) return

      // Calculate the position of the new node
      const midX = (fromNode.position.x + toNode.position.x) / 2
      const midY = (fromNode.position.y + toNode.position.y) / 2

      // Create a new node
      const newNodeId = `node-${nanoid(6)}`
      const newNode: Node = {
        id: newNodeId,
        type: "action",
        name: "New Action",
        position: { x: midX, y: midY },
        inputs: ["input-1"],
        outputs: ["output-1"],
        description: "Added node",
        width: 70,
        height: 70,
      }

      // Add the new node
      setNodes((prev) => [...prev, newNode])

      // Remove the old connection
      removeConnection(connectionId)

      // Create two new connections
      const newConnection1 = {
        id: `conn-${nanoid(6)}`,
        from: connection.from,
        to: newNodeId,
        type: connection.type || "bezier",
        label: connection.label ? `${connection.label} (in)` : undefined,
      }

      const newConnection2 = {
        id: `conn-${nanoid(6)}`,
        from: newNodeId,
        to: connection.to,
        type: connection.type || "bezier",
        label: connection.label ? `${connection.label} (out)` : undefined,
      }

      // Add the new connections
      setConnections((prev) => [...prev, newConnection1, newConnection2])
    },
    [connections, nodes, removeConnection],
  )

  const updateConnection = useCallback((connectionId: string, updatedConnection: Connection) => {
    setConnections((prevConnections) =>
      prevConnections.map((conn) => (conn.id === connectionId ? updatedConnection : conn)),
    )
  }, [])

  const saveWorkflow = useCallback(async () => {
    try {
      const apiService = new (await import("@/lib/api/service")).ApiService()
      
      if (!workflowName) {
        throw new Error("Nome do workflow é obrigatório")
      }

      const workflowData = {
        name: workflowName,
        description: `Workflow com ${nodes.length} nós e ${connections.length} conexões`,
        definition: {
          nodes,
          connections
        },
        is_public: false,
        tags: [],
        category: "custom"
      }

      const savedWorkflow = await apiService.createWorkflow(workflowData)
      console.log("Workflow salvo com sucesso:", savedWorkflow)
      
      // Opcional: mostrar notificação de sucesso em vez de alert
      alert(`Workflow "${workflowName}" salvo com sucesso!`)
    } catch (error) {
              console.warn("⚠️ Erro ao salvar workflow:", error)
      alert(`Erro ao salvar workflow: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [nodes, connections, workflowName])

  // Memoize only the most frequently changing values to reduce unnecessary re-renders
  const value = useMemo(
    () => ({
      // State values
      nodes,
      connections,
      selectedNode,
      selectedNodes,
      zoom,
      panOffset,
      showGrid,
      contextMenuInfo,
      canvasContextMenuInfo,
      connectionContextMenuInfo,
      connectionPreview,
      workflowName,
      isActive,
      
      // Functions (these are stable with useCallback)
      addNode,
      updateNode,
      updateNodePosition,
      removeNode,
      duplicateNode,
      lockNode,
      unlockNode,
      toggleNodeDisabled,
      executeNode,
      alignNodes,
      addConnection,
      removeConnection,
      updateConnectionType,
      updateConnectionLabel,
      addNodeBetweenConnections,
      updateConnection,
      setSelectedNode,
      setSelectedNodes,
      setZoom,
      setPanOffset,
      setShowGrid,
      setContextMenuInfo,
      setCanvasContextMenuInfo,
      setConnectionContextMenuInfo,
      setConnectionPreview,
      setWorkflowName,
      setIsActive,
      saveWorkflow,
    }),
    [
      // Only include state values that actually change
      nodes,
      connections,
      selectedNode,
      selectedNodes,
      zoom,
      panOffset,
      showGrid,
      contextMenuInfo,
      canvasContextMenuInfo,
      connectionContextMenuInfo,
      connectionPreview,
      workflowName,
      isActive,
      // Functions are stable with useCallback, no need to include them in deps
    ],
  )

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

/**
 * Custom hook to access the workflow context.
 *
 * @throws Error if used outside of a WorkflowProvider
 * @returns The workflow context
 */
export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}
