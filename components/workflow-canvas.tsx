"use client"

import React from "react"
import { useWorkflow } from "@/context/workflow-context"
import { EmptyCanvasPlaceholder } from "@/components/canvas/empty-canvas-placeholder"
import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { WorkflowNode } from "@/components/workflow-node"
import { WorkflowConnection } from "@/components/workflow-connection"
import { CanvasGrid } from "@/components/canvas/canvas-grid"
import { CanvasControls } from "@/components/canvas-controls"
import { NodeContextMenu } from "@/components/node-context-menu"
import { ConnectionContextMenu } from "@/components/connection-context-menu"
import { CanvasContextMenu } from "@/components/canvas-context-menu"
import { MiniMap } from "@/components/mini-map"
import { CommandPalette } from "@/components/command-palette"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { NodePanel } from "@/components/node-panel"
import { useNodeEditorDialog } from "@/hooks/use-node-editor-dialog"
import { NodeEditorDialog } from "@/components/node-editor-dialog"
import { CanvasQuickActions } from "@/components/canvas-quick-actions"
import { PlusIndicator } from "@/components/canvas/plus-indicator"
import type { Position, Node as WorkflowNodeType, Connection } from "@/types/workflow"
import {
  hasOutputConnections,
  getNodeOutputPosition,
  getNodeInputPosition,
  findNodeAtPoint,
  wouldCreateCycle,
} from "@/utils/connection-utils"
import { useCanvasTransform } from "@/hooks/use-canvas-transform"
import { SelectionBox } from "@/components/selection-box"
import { useNodeManagement } from "@/hooks/use-node-management"
import { useNodeDrag } from "@/hooks/use-node-drag"
import { ConnectionPreview } from "@/components/canvas/connection-preview"
import { nanoid } from "nanoid"
import { ConnectionLabelEditor } from "@/components/canvas/connection-label-editor"
import { useCanvasState } from "@/hooks/canvas/use-canvas-state"
import { useConnectionPreview } from "@/hooks/canvas/use-connection-preview"

/**
 * WorkflowCanvas component.
 *
 * Renders the main canvas with nodes, connections and interactive elements.
 * Manages interactions like dragging, selection and context menus.
 */
export function WorkflowCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const {
    nodes,
    connections,
    selectedNodes,
    setSelectedNodes,
    selectedNode,
    setSelectedNode,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    updateNodePosition,
    updateNode,
    removeNode,
    duplicateNode,
    addConnection,
    addNode,
    removeConnection,
    updateConnection,
  } = useWorkflow()

  const { isOpen, editingNode, openNodeEditor, closeNodeEditor, saveNode, deleteNode } = useNodeEditorDialog()

  // Use the canvas state hook
  const {
    nodeContextMenu,
    connectionContextMenu,
    canvasContextMenu,
    showCommandPalette,
    showKeyboardShortcuts,
    showNodePanel,
    nodePanelPosition,
    setNodeContextMenu,
    setConnectionContextMenu,
    setCanvasContextMenu,
    setShowCommandPalette,
    setShowKeyboardShortcuts,
    setShowNodePanel,
    setNodePanelPosition,
    clearContextMenus,
    clearSelections,
    openNodePanelAtPosition,
    toggleNodePanel,
  } = useCanvasState({
    initialSelectedNodes: selectedNodes,
    initialSelectedNode: selectedNode,
  })

  // State for node panel position when clicking the plus indicator
  const [plusIndicatorNodeId, setPlusIndicatorNodeId] = useState<string | null>(null)

  // Add this after the plusIndicatorNodeId state
  const [connectionForNodePanel, setConnectionForNodePanel] = useState<string | null>(null)

  // Clipboard state for copy/paste
  const [clipboard, setClipboard] = useState<{ nodes: WorkflowNodeType[]; connections: Connection[] } | null>(null)
  const pasteCountRef = useRef(0)

  // History stack for undo/redo
  const [history, setHistory] = useState<{ nodes: WorkflowNodeType[]; connections: Connection[] }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const isApplyingHistory = useRef(false)

  // Function to open node panel for connection
  const openNodePanelForConnection = useCallback((connectionId: string, position: Position) => {
    setConnectionForNodePanel(connectionId)
    setNodePanelPosition(position)
    setShowNodePanel(true)
  }, [setNodePanelPosition, setShowNodePanel])

  // Expose function to window for ConnectionActionButtons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.workflowCanvas = {
        openNodePanelForConnection
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.workflowCanvas
      }
    }
  }, [openNodePanelForConnection])

  // State for selection box
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<Position | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<Position | null>(null)

  // Tracks if initial centering has been performed
  const [hasCentered, setHasCentered] = useState(false)

  // State for connection label editor
  const [labelEditorInfo, setLabelEditorInfo] = useState<{
    connectionId: string
    position: Position
  } | null>(null)

  // State for canvas dimensions
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 10000,
    height: 10000,
    minX: -5000,
    minY: -5000,
  })

  // State for canvas transformation
  const { transform, setTransform, zoomIn, zoomOut, resetView, panStart, panMove, panEnd, handleWheel } =
    useCanvasTransform({
      initialZoom: zoom,
      initialPanOffset: panOffset,
      onZoomChange: setZoom,
      onPanChange: setPanOffset,
    })

  // Functions for node dragging
  const { isDragging, dragNodeId, dragOffset, handleNodeDragStart, handleNodeDrag, handleNodeDragEnd } =
    useNodeManagement({
      nodes,
      transform,
      updateNodePosition,
    })

  // Convert client coordinates to canvas coordinates
  const clientToCanvasPosition = useCallback(
    (clientX: number, clientY: number): Position => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }

      return {
        x: (clientX - rect.left - transform.x) / transform.zoom,
        y: (clientY - rect.top - transform.y) / transform.zoom,
      }
    },
    [transform],
  )

  // Use the connection preview hook
  const {
    connectionPreview,
    portConnectionDrag,
    setPortConnectionDrag,
    handlePlusIndicatorDragStart,
    handlePlusIndicatorDrag,
    handlePlusIndicatorDragEnd,
  } = useConnectionPreview({
    nodes,
    connections,
    clientToCanvasPosition,
    addConnection,
  })

  // Memoize the hasOutputConnections function to avoid recreating it on each render
  const checkHasOutputConnections = useMemo(
    () => (nodeId: string) => hasOutputConnections(nodeId, connections),
    [connections],
  )

  const copySelectedNodes = useCallback(() => {
    const nodesToCopy = nodes.filter((n) => selectedNodes.includes(n.id))
    if (nodesToCopy.length === 0) return
    const ids = nodesToCopy.map((n) => n.id)
    const connsToCopy = connections.filter(
      (c) => ids.includes(c.from) && ids.includes(c.to),
    )
    setClipboard({
      nodes: nodesToCopy.map((n) => ({ ...n })),
      connections: connsToCopy.map((c) => ({ ...c })),
    })
    pasteCountRef.current = 0
  }, [nodes, connections, selectedNodes])

  const pasteNodes = useCallback(() => {
    if (!clipboard) return
    pasteCountRef.current += 1
    const offset = 40 * pasteCountRef.current
    const idMap = new Map<string, string>()
    const newIds: string[] = []
    clipboard.nodes.forEach((node) => {
      const newId = `node-${nanoid(6)}`
      idMap.set(node.id, newId)
      addNode({
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset,
          y: node.position.y + offset,
        },
      })
      newIds.push(newId)
    })
    clipboard.connections.forEach((conn) => {
      const from = idMap.get(conn.from)
      const to = idMap.get(conn.to)
      if (from && to) {
        addConnection(from, to, conn.type, `conn-${nanoid(6)}`, conn.label)
      }
    })
    setSelectedNodes(newIds)
  }, [clipboard, addNode, addConnection, setSelectedNodes])

  const applySnapshot = useCallback(
    (snapshot: { nodes: WorkflowNodeType[]; connections: Connection[] }) => {
      isApplyingHistory.current = true

      nodes.forEach((node) => {
        if (!snapshot.nodes.find((n) => n.id === node.id)) {
          removeNode(node.id)
        }
      })

      snapshot.nodes.forEach((sn) => {
        const existing = nodes.find((n) => n.id === sn.id)
        if (!existing) {
          addNode({ ...sn })
        } else {
          updateNode(sn.id, { ...sn })
        }
      })

      connections.forEach((conn) => {
        if (!snapshot.connections.find((c) => c.id === conn.id)) {
          removeConnection(conn.id)
        }
      })

      snapshot.connections.forEach((sc) => {
        const existing = connections.find((c) => c.id === sc.id)
        if (!existing) {
          addConnection(sc.from, sc.to, sc.type, sc.id, sc.label)
        } else {
          updateConnection(sc.id, sc)
        }
      })
    },
    [nodes, connections, removeNode, addNode, updateNode, removeConnection, addConnection, updateConnection],
  )

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    applySnapshot(history[newIndex])
  }, [history, historyIndex, applySnapshot])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    applySnapshot(history[newIndex])
  }, [history, historyIndex, applySnapshot])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // Record history on state changes
  useEffect(() => {
    if (isApplyingHistory.current) {
      isApplyingHistory.current = false
      return
    }
    const snapshot = {
      nodes: nodes.map((n) => ({ ...n })),
      connections: connections.map((c) => ({ ...c })),
    }
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), snapshot])
    setHistoryIndex((prev) => prev + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, connections])

  // Calculate canvas dimensions based on nodes
  useEffect(() => {
    if (nodes.length === 0) return

    // Calculate bounding box of all nodes
    let minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY

    nodes.forEach((node) => {
      const nodeWidth = node.width || 70
      const nodeHeight = node.height || 70

      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + nodeWidth)
      maxY = Math.max(maxY, node.position.y + nodeHeight)
    })

    // Add margin to ensure there's enough space
    const margin = 1000
    minX -= margin
    minY -= margin
    maxX += margin
    maxY += margin

    // Calculate canvas dimensions
    const width = maxX - minX
    const height = maxY - minY

    // Update canvas dimensions
    setCanvasDimensions({
      width,
      height,
      minX,
      minY,
    })
  }, [nodes])

  // Handle adding the first node when canvas is empty
  const handleAddFirstNode = useCallback(() => {
    // Open the node panel at the center of the canvas
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    // Calculate center position
    const position = {
      x: rect.width / 2,
      y: rect.height / 2,
    }

    // Open the node panel
    openNodePanelAtPosition(position)
  }, [openNodePanelAtPosition])

  // Handle plus indicator click
  const handlePlusIndicatorClick = useCallback(
    (e: React.MouseEvent, sourceNodeId: string) => {
      // Set the source node ID for the node panel
      setPlusIndicatorNodeId(sourceNodeId)

      // Calculate position for the node panel
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      // Open the node panel at the click position
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }

      openNodePanelAtPosition(position)
    },
    [openNodePanelAtPosition],
  )

  // Handle port drag start
  const handlePortDragStart = useCallback(
    (e: React.MouseEvent) => {
      // Only handle left mouse button
      if (e.button !== 0) return

      // Get the port element
      const portElement = e.target as HTMLElement
      const portType = portElement.getAttribute("data-port-type") as "input" | "output"
      const portId = portElement.getAttribute("data-port-id")
      const nodeId = portElement.getAttribute("data-node-id")

      // Only proceed if we have all the necessary data
      if (!portType || !portId || !nodeId) return

      // Prevent default to avoid text selection
      e.preventDefault()
      e.stopPropagation()

      // Find the source node
      const sourceNode = nodes.find((node) => node.id === nodeId)
      if (!sourceNode) return

      // Get the port position based on port type
      let startPosition: Position
      if (portType === "output") {
        startPosition = getNodeOutputPosition(sourceNode)
      } else {
        startPosition = getNodeInputPosition(sourceNode)
      }

      // Calculate canvas position for cursor
      const canvasPosition = clientToCanvasPosition(e.clientX, e.clientY)

      // Set port connection drag
      setPortConnectionDrag({
        sourceNodeId: nodeId,
        sourcePortId: portId,
        sourcePortType: portType,
        startX: startPosition.x,
        startY: startPosition.y,
        endX: startPosition.x, // Start at source node
        endY: startPosition.y, // Start at source node
        isValidTarget: false,
      })

      // Add event listeners for drag and drop
      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Calculate canvas position
        const movePosition = clientToCanvasPosition(moveEvent.clientX, moveEvent.clientY)

        // Find potential target node with a small margin to make targeting easier
        const targetNode = findNodeAtPoint(movePosition, nodes, nodeId, 10)

        // Check if this would create a cycle
        const isValidTarget = targetNode
          ? !wouldCreateCycle(
              connections.map((conn) => ({ from: conn.from, to: conn.to })),
              portType === "output" ? nodeId : targetNode.id,
              portType === "output" ? targetNode.id : nodeId,
            )
          : false

        // Update port connection drag
        setPortConnectionDrag((prev) => {
          if (!prev) return null
          return {
            ...prev,
            endX: movePosition.x,
            endY: movePosition.y,
            isValidTarget,
            targetNodeId: targetNode?.id,
          }
        })
      }

      const handleMouseUp = (upEvent: MouseEvent) => {
        // Get the current port connection drag
        const currentDrag = portConnectionDrag
        if (!currentDrag) {
          // Clean up event listeners
          window.removeEventListener("mousemove", handleMouseMove)
          window.removeEventListener("mouseup", handleMouseUp)
          return
        }

        // Calculate canvas position
        const upPosition = clientToCanvasPosition(upEvent.clientX, upEvent.clientY)

        // Find the target node with a small margin to make targeting easier
        const targetNode = findNodeAtPoint(upPosition, nodes, nodeId, 10)

        // If we found a valid target node, create a connection
        if (targetNode && currentDrag.isValidTarget) {
          // Determine source and target based on port types
          const sourceId = currentDrag.sourcePortType === "output" ? nodeId : targetNode.id
          const targetId = currentDrag.sourcePortType === "output" ? targetNode.id : nodeId

          // Create the connection
          const connectionId = `conn-${nanoid(6)}`
          addConnection(sourceId, targetId, "bezier", connectionId)
        }

        // Clear port connection drag
        setPortConnectionDrag(null)

        // Remove event listeners
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }

      // Add event listeners
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    },
    [nodes, connections, addConnection, clientToCanvasPosition, portConnectionDrag],
  )

  // Handle node selection from node panel
  const handleNodeSelection = useCallback(
    (type: string, data: any) => {
      // If we're adding a node between connections
      if (connectionForNodePanel) {
        // Find the connection
        const connection = connections.find((conn) => conn.id === connectionForNodePanel)
        if (!connection) return

        // Create a new node ID
        const newNodeId = `node-${nanoid(6)}`

        // Find the source and target nodes
        const fromNode = nodes.find((node) => node.id === connection.from)
        const toNode = nodes.find((node) => node.id === connection.to)
        if (!fromNode || !toNode) return

        // Calculate position for the new node (midpoint between connected nodes)
        const newNodePosition = {
          x: (fromNode.position.x + toNode.position.x) / 2,
          y: (fromNode.position.y + toNode.position.y) / 2,
        }

        // Create the new node
        const newNode: WorkflowNodeType = {
          id: newNodeId,
          type,
          name: data.name,
          description: data.description,
          position: newNodePosition,
          inputs: data.inputs || ["default"],
          outputs: data.outputs || ["default"],
          width: 70,
          height: 70,
        }

        // Add the new node to the workflow
        addNode(newNode)

        // Remove the old connection
        removeConnection(connectionForNodePanel)

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
        addConnection(connection.from, newNodeId, connection.type || "bezier", newConnection1.id, newConnection1.label)
        addConnection(newNodeId, connection.to, connection.type || "bezier", newConnection2.id, newConnection2.label)

        // Reset the connection for node panel
        setConnectionForNodePanel(null)
      }
      // If we're adding a node from plus indicator
      else if (plusIndicatorNodeId) {
        // Find the source node
        const sourceNode = nodes.find((node) => node.id === plusIndicatorNodeId)
        if (!sourceNode) return

        // Create a new node ID
        const newNodeId = `node-${nanoid(6)}`

        // Calculate position for the new node
        const newNodePosition = {
          x: sourceNode.position.x + (sourceNode.width || 70) + 100,
          y: sourceNode.position.y,
        }

        // Create the new node
        const newNode: WorkflowNodeType = {
          id: newNodeId,
          type,
          name: data.name,
          description: data.description,
          position: newNodePosition,
          inputs: data.inputs || ["default"],
          outputs: data.outputs || ["default"],
          width: 70,
          height: 70,
        }

        // Add the new node to the workflow
        addNode(newNode)

        // Create a connection between the source node and the new node
        const connectionId = `conn-${nanoid(6)}`
        addConnection(plusIndicatorNodeId, newNodeId, "bezier", connectionId)

        // Reset the plus indicator node ID
        setPlusIndicatorNodeId(null)
      }
      // If we're adding the first node to an empty canvas
      else if (nodes.length === 0) {
        // Create a new node ID
        const newNodeId = `node-${nanoid(6)}`

        // Calculate position for the new node (center of canvas)
        const rect = canvasRef.current?.getBoundingClientRect()
        const centerX = rect ? rect.width / 2 / transform.zoom - transform.x / transform.zoom : 500
        const centerY = rect ? rect.height / 2 / transform.zoom - transform.y / transform.zoom : 300

        // Create the new node
        const newNode: WorkflowNodeType = {
          id: newNodeId,
          type,
          name: data.name,
          description: data.description,
          position: { x: centerX, y: centerY },
          inputs: data.inputs || ["default"],
          outputs: data.outputs || ["default"],
          width: 70,
          height: 70,
        }

        // Add the new node to the workflow
        addNode(newNode)
      }

      // Close the node panel
      setShowNodePanel(false)
    },
    [
      plusIndicatorNodeId,
      connectionForNodePanel,
      nodes,
      connections,
      addNode,
      addConnection,
      removeConnection,
      setShowNodePanel,
      transform,
    ],
  )

  // Center the canvas on initial load
  useEffect(() => {
    // Function to center the canvas
    const centerCanvas = () => {
      if (!canvasRef.current || nodes.length === 0) return

      // Calculate bounding box of all nodes
      let minX = Number.POSITIVE_INFINITY,
        minY = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY

      nodes.forEach((node) => {
        const nodeWidth = node.width || 70
        const nodeHeight = node.height || 70

        minX = Math.min(minX, node.position.x)
        minY = Math.min(minY, node.position.y)
        maxX = Math.max(maxX, node.position.x + nodeWidth)
        maxY = Math.max(maxY, node.position.y + nodeHeight)
      })

      // If we have valid bounds
      if (minX !== Number.POSITIVE_INFINITY && minY !== Number.POSITIVE_INFINITY) {
        // Calculate center of nodes
        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2

        // Calculate canvas center
        const canvasWidth = canvasRef.current.clientWidth
        const canvasHeight = canvasRef.current.clientHeight
        const canvasCenterX = canvasWidth / 2
        const canvasCenterY = canvasHeight / 2

        // Calculate new pan offset to center nodes
        const newPanX = canvasCenterX - centerX * zoom
        const newPanY = canvasCenterY - centerY * zoom

        // Update pan offset
        setPanOffset({ x: newPanX, y: newPanY })
        setTransform({ x: newPanX, y: newPanY, zoom })
      }
    }

    // Center canvas if we haven't done so yet
    if (!hasCentered && nodes.length > 0) {
      centerCanvas()
      setHasCentered(true)
    }
  }, [nodes, zoom, setPanOffset, hasCentered, setTransform])

  // Handle canvas mouse down for selection box
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only handle left mouse button
      if (e.button !== 0) return

      // Ignore if we're clicking on a node or other interactive element
      if ((e.target as HTMLElement).closest(".node, .plus-indicator, .port")) return

      // Prevent default to avoid text selection
      e.preventDefault()

      // Clear any existing selections
      clearSelections()

      // Calculate canvas position
      const position = clientToCanvasPosition(e.clientX, e.clientY)

      // Start selection
      setIsSelecting(true)
      setSelectionStart(position)
      setSelectionEnd(position)

      // Add event listeners for drag and drop
      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Calculate canvas position
        const movePosition = clientToCanvasPosition(moveEvent.clientX, moveEvent.clientY)

        // Update selection end
        setSelectionEnd(movePosition)
      }

      const handleMouseUp = (upEvent: MouseEvent) => {
        // Calculate canvas position
        const upPosition = clientToCanvasPosition(upEvent.clientX, upEvent.clientY)

        // Update selection end
        setSelectionEnd(upPosition)

        // If we have a valid selection
        if (selectionStart && selectionEnd) {
          // Calculate selection bounds
          const minX = Math.min(selectionStart.x, upPosition.x)
          const minY = Math.min(selectionStart.y, upPosition.y)
          const maxX = Math.max(selectionStart.x, upPosition.x)
          const maxY = Math.max(selectionStart.y, upPosition.y)

          // Find nodes within selection
          const selectedNodeIds = nodes
            .filter((node) => {
              const nodeWidth = node.width || 70
              const nodeHeight = node.height || 70

              return (
                node.position.x < maxX &&
                node.position.x + nodeWidth > minX &&
                node.position.y < maxY &&
                node.position.y + nodeHeight > minY
              )
            })
            .map((node) => node.id)

          // Update selected nodes
          setSelectedNodes(selectedNodeIds)
        }

        // End selection
        setIsSelecting(false)
        setSelectionStart(null)
        setSelectionEnd(null)

        // Remove event listeners
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }

      // Add event listeners
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    },
    [clientToCanvasPosition, clearSelections, nodes, selectionStart, selectionEnd, setSelectedNodes],
  )

  // Handle canvas context menu
  const handleCanvasContextMenu = useCallback(
    (e: React.MouseEvent) => {
      // Prevent default context menu
      e.preventDefault()

      // Ignore if we're right-clicking on a node or other interactive element
      if ((e.target as HTMLElement).closest(".node, .plus-indicator, .port")) return

      // Calculate canvas position
      const position = clientToCanvasPosition(e.clientX, e.clientY)

      // Show canvas context menu
      setCanvasContextMenu({
        position: { x: e.clientX, y: e.clientY },
        canvasPosition: position,
      })
    },
    [clientToCanvasPosition, setCanvasContextMenu],
  )

  // Handle node context menu
  const handleNodeContextMenu = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      // Prevent default context menu
      e.preventDefault()

      // Calculate canvas position
      const position = clientToCanvasPosition(e.clientX, e.clientY)

      // Show node context menu
      setNodeContextMenu({
        nodeIds: [nodeId],
        position: { x: e.clientX, y: e.clientY },
      })
    },
    [clientToCanvasPosition, setNodeContextMenu],
  )

  // Handle connection context menu
  const handleConnectionContextMenu = useCallback(
    (e: React.MouseEvent, connectionId: string) => {
      // Prevent default context menu
      e.preventDefault()

      // Show connection context menu
      setConnectionContextMenu({
        connectionId,
        position: { x: e.clientX, y: e.clientY },
      })
    },
    [setConnectionContextMenu],
  )

  // Handle connection label click
  const handleConnectionLabelClick = useCallback(
    (e: React.MouseEvent, connectionId: string) => {
      // Prevent default
      e.preventDefault()
      e.stopPropagation()

      // Show label editor
      setLabelEditorInfo({
        connectionId,
        position: { x: e.clientX, y: e.clientY },
      })
    },
    [setLabelEditorInfo],
  )

  // Handle connection click for adding a node
  const handleConnectionClick = useCallback(
    (e: React.MouseEvent, connectionId: string) => {
      // Prevent default
      e.preventDefault()
      e.stopPropagation()

      // Set the connection for node panel
      setConnectionForNodePanel(connectionId)

      // Calculate position for the node panel
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      // Open the node panel at the click position
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }

      openNodePanelAtPosition(position)
    },
    [openNodePanelAtPosition],
  )

  // Handle canvas pan
  const handleCanvasPan = useCallback(
    (e: React.MouseEvent) => {
      // Only handle middle mouse button or space + left mouse button
      if (e.button !== 1) return

      // Prevent default
      e.preventDefault()

      // Start panning
      panStart(e.clientX, e.clientY)

      // Add event listeners for drag and drop
      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Update pan
        panMove(moveEvent.clientX, moveEvent.clientY)
      }

      const handleMouseUp = () => {
        // End panning
        panEnd()

        // Remove event listeners
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }

      // Add event listeners
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    },
    [panStart, panMove, panEnd],
  )

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if we're in an input field
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")
      ) {
        return
      }

      // Handle keyboard shortcuts
      switch (e.key) {
        case "Delete":
        case "Backspace":
          // Delete selected nodes
          if (selectedNodes.length > 0) {
            selectedNodes.forEach((nodeId) => removeNode(nodeId))
            setSelectedNodes([])
          }
          break
        case "Escape":
          // Clear selections and context menus
          clearSelections()
          clearContextMenus()
          break
        case "a":
          // Select all nodes if Ctrl/Cmd is pressed
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setSelectedNodes(nodes.map((node) => node.id))
          }
          break
        case "c":
          // Copy selected nodes if Ctrl/Cmd is pressed
          if ((e.ctrlKey || e.metaKey) && selectedNodes.length > 0) {
            e.preventDefault()
            copySelectedNodes()
          }
          break
        case "v":
          // Paste copied nodes if Ctrl/Cmd is pressed
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            pasteNodes()
          }
          break
        case "z":
          // Undo if Ctrl/Cmd is pressed
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            undo()
          }
          break
        case "y":
          // Redo if Ctrl/Cmd is pressed
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            redo()
          }
          break
        case "=":
        case "+":
          // Zoom in if Ctrl/Cmd is pressed
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            zoomIn()
          }
          break
        case "-":
          // Zoom out if Ctrl/Cmd is pressed
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            zoomOut()
          }
          break
        case "0":
          // Reset zoom if Ctrl/Cmd is pressed
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            resetView()
          }
          break
        case "d":
          // Duplicate selected nodes if Ctrl/Cmd is pressed
          if ((e.ctrlKey || e.metaKey) && selectedNodes.length > 0) {
            e.preventDefault()
            selectedNodes.forEach((nodeId) => duplicateNode(nodeId))
          }
          break
        case "p":
          // Show command palette
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setShowCommandPalette(true)
          }
          break
        case "?":
          // Show keyboard shortcuts
          if (e.shiftKey) {
            e.preventDefault()
            setShowKeyboardShortcuts(true)
          }
          break
      }
    }

    // Add event listener
    window.addEventListener("keydown", handleKeyDown)

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    selectedNodes,
    removeNode,
    setSelectedNodes,
    clearSelections,
    clearContextMenus,
    nodes,
    zoomIn,
    zoomOut,
    resetView,
    duplicateNode,
    copySelectedNodes,
    pasteNodes,
    undo,
    redo,
    setShowCommandPalette,
    setShowKeyboardShortcuts,
  ])

  // Add global event listeners for node dragging
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        handleNodeDrag(e as any)
      }

      const handleMouseUp = () => {
        handleNodeDragEnd()
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)

      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleNodeDrag, handleNodeDragEnd])

  // Render the canvas
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F9FAFB]">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onContextMenu={handleCanvasContextMenu}
        onMouseDownCapture={handleCanvasPan}
        onWheel={handleWheel}
      >
        {/* Canvas grid */}
        <CanvasGrid zoom={transform.zoom} panOffset={transform.x} />

        {/* SVG layer for connections */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Connections */}
          {connections.map((connection) => (
            <WorkflowConnection
              key={connection.id}
              connection={connection}
              nodes={nodes}
              onContextMenu={(e) => handleConnectionContextMenu(e, connection.id)}
              onLabelClick={(e) => handleConnectionLabelClick(e, connection.id)}
              onClick={(e) => handleConnectionClick(e, connection.id)}
            />
          ))}

          {/* Connection preview */}
          {connectionPreview && (
            <ConnectionPreview
              startX={connectionPreview.startX}
              startY={connectionPreview.startY}
              endX={connectionPreview.endX}
              endY={connectionPreview.endY}
              isValid={connectionPreview.isValidTarget}
            />
          )}

          {/* Plus indicators for adding connected nodes */}
          {nodes.map((node) => (
            !checkHasOutputConnections(node.id) && (
              <PlusIndicator
                key={`plus-${node.id}`}
                x={node.position.x + (node.width || 70) + 20}
                y={node.position.y + (node.height || 70) / 2}
                sourceNodeId={node.id}
                onClick={(e) => handlePlusIndicatorClick(e, node.id)}
                onDragStart={(sourceNodeId, position) => handlePlusIndicatorDragStart(sourceNodeId, position)}
                onDrag={handlePlusIndicatorDrag}
                onDragEnd={handlePlusIndicatorDragEnd}
              />
            )
          ))}
        </svg>

        {/* Nodes */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {nodes.map((node) => (
            <WorkflowNode
              key={node.id}
              node={node}
              isSelected={selectedNodes.includes(node.id)}
              onSelect={(nodeId, multiple) => {
                if (multiple) {
                  if (selectedNodes.includes(nodeId)) {
                    setSelectedNodes(selectedNodes.filter(id => id !== nodeId))
                  } else {
                    setSelectedNodes([...selectedNodes, nodeId])
                  }
                } else {
                  setSelectedNode(node)
                  setSelectedNodes([nodeId])
                }
              }}
              onDragStart={(e, nodeId) => handleNodeDragStart(e, nodeId)}
              onDoubleClick={() => openNodeEditor(node.id)}
              onContextMenu={(e) => handleNodeContextMenu(e, node.id)}
              onPortDragStart={handlePortDragStart}
            />
          ))}
        </div>

        {/* Empty canvas placeholder */}
        {nodes.length === 0 && (
          <EmptyCanvasPlaceholder onAddFirstNode={handleAddFirstNode} />
        )}

        {/* Selection box */}
        {isSelecting && selectionStart && selectionEnd && (
          <SelectionBox
            start={{
              x: selectionStart.x * transform.zoom + transform.x,
              y: selectionStart.y * transform.zoom + transform.y,
            }}
            end={{
              x: selectionEnd.x * transform.zoom + transform.x,
              y: selectionEnd.y * transform.zoom + transform.y,
            }}
          />
        )}
      </div>

      {/* Canvas controls */}
      <CanvasControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        zoom={zoom}
        onToggleNodePanel={toggleNodePanel}
      />

      {/* Mini map */}
      <MiniMap
        nodes={nodes}
        connections={connections}
        viewportWidth={canvasRef.current?.clientWidth || 0}
        viewportHeight={canvasRef.current?.clientHeight || 0}
        transform={transform}
        onViewportChange={setTransform}
      />

      {/* Quick actions */}
      <div className="absolute top-4 right-4 z-10">
        <CanvasQuickActions onOpenNodePanel={toggleNodePanel} />
      </div>

      {/* Context menus */}
      {nodeContextMenu && (
        <NodeContextMenu
          nodeIds={nodeContextMenu.nodeIds}
          position={nodeContextMenu.position}
          onClose={() => setNodeContextMenu(null)}
        />
      )}

      {connectionContextMenu && (
        <ConnectionContextMenu
          connectionId={connectionContextMenu.connectionId}
          position={connectionContextMenu.position}
          onClose={() => setConnectionContextMenu(null)}
        />
      )}

      {canvasContextMenu && (
        <CanvasContextMenu
          position={canvasContextMenu.position}
          canvasPosition={canvasContextMenu.canvasPosition}
          onClose={() => setCanvasContextMenu(null)}
        />
      )}

      {/* Node panel */}
      {showNodePanel && (
        <NodePanel
          position={nodePanelPosition}
          onClose={() => setShowNodePanel(false)}
          onAddNode={handleNodeSelection}
        />
      )}

      {/* Command palette */}
      {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} />}

      {/* Keyboard shortcuts */}
      {showKeyboardShortcuts && <KeyboardShortcuts onClose={() => setShowKeyboardShortcuts(false)} />}

      {/* Node editor dialog */}
      <NodeEditorDialog
        node={editingNode}
        open={isOpen}
        onClose={closeNodeEditor}
        onSave={saveNode}
        onDelete={deleteNode}
      />

      {/* Connection label editor */}
      {labelEditorInfo && (
        <ConnectionLabelEditor
          connectionId={labelEditorInfo.connectionId}
          position={labelEditorInfo.position}
          onClose={() => setLabelEditorInfo(null)}
        />
      )}
    </div>
  )
}
