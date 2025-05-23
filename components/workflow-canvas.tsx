"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { useWorkflow } from "@/context/workflow-context"
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
import type { Position, Node as WorkflowNodeType } from "@/types/workflow"
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
    removeNode,
    duplicateNode,
    addConnection,
    addNode,
    removeConnection,
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

      // Calculate center of nodes
      const nodesCenterX = (minX + maxX) / 2
      const nodesCenterY = (minY + maxY) / 2

      // Get canvas dimensions
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const canvasCenterX = canvasRect.width / 2
      const canvasCenterY = canvasRect.height / 2

      // Calculate offset to center nodes in canvas
      const offsetX = canvasCenterX - nodesCenterX
      const offsetY = canvasCenterY - nodesCenterY

      // Update transform with animation
      setTransform({
        x: offsetX,
        y: offsetY,
        zoom: 1,
        animated: true,
      })

      // Update pan offset
      setPanOffset({
        x: offsetX,
        y: offsetY,
      })

      // Mark centering as complete
      setHasCentered(true)
    }

    // Only run once when component mounts and nodes are available
    if (!hasCentered && nodes.length > 0) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        centerCanvas()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [nodes, hasCentered, setTransform, setPanOffset])

  // Add this useEffect to force centering when component is mounted
  useEffect(() => {
    // Reset centering state when component is unmounted
    return () => {
      setHasCentered(false)
    }
  }, [])

  // Handle canvas click to clear selections
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current || e.target === e.currentTarget) {
        clearSelections()
        clearContextMenus()
      }
    },
    [clearSelections, clearContextMenus],
  )

  // Handle canvas right click for context menu
  const handleCanvasContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      if (e.target === canvasRef.current || e.target === e.currentTarget) {
        const rect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 }
        const position = { x: e.clientX, y: e.clientY }

        const canvasPosition = {
          x: (e.clientX - rect.left - transform.x) / transform.zoom,
          y: (e.clientY - rect.top - transform.y) / transform.zoom,
        }

        setCanvasContextMenu({ position, canvasPosition })
        setNodeContextMenu(null)
        setConnectionContextMenu(null)
      }
    },
    [transform, setCanvasContextMenu, setNodeContextMenu, setConnectionContextMenu],
  )

  // Close context menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Only close if clicking outside menus
      if (
        !e.target ||
        (!(e.target as Element).closest(".context-menu") && !(e.target as Element).closest(".dropdown-menu"))
      ) {
        clearContextMenus()
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [clearContextMenus])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Command/Ctrl + K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setShowCommandPalette(true)
      }

      // ? to show keyboard shortcuts
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }

      // Escape to close dialogs
      if (e.key === "Escape") {
        setShowCommandPalette(false)
        setShowKeyboardShortcuts(false)
        clearContextMenus()
      }

      // Delete to remove selected nodes
      if (e.key === "Delete" && selectedNodes.length > 0) {
        e.preventDefault()
        selectedNodes.forEach((nodeId) => {
          removeNode(nodeId)
        })
      }

      // Arrow keys for panning
      const panStep = 20
      if (e.key === "ArrowUp") {
        setPanOffset((prev) => ({ x: prev.x, y: prev.y + panStep }))
        setTransform((prev) => ({ ...prev, y: prev.y + panStep }))
      } else if (e.key === "ArrowDown") {
        setPanOffset((prev) => ({ x: prev.x, y: prev.y - panStep }))
        setTransform((prev) => ({ ...prev, y: prev.y - panStep }))
      } else if (e.key === "ArrowLeft") {
        setPanOffset((prev) => ({ x: prev.x + panStep, y: prev.y }))
        setTransform((prev) => ({ ...prev, x: prev.x + panStep }))
      } else if (e.key === "ArrowRight") {
        setPanOffset((prev) => ({ x: prev.x - panStep, y: prev.y }))
        setTransform((prev) => ({ ...prev, x: prev.x - panStep }))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    setPanOffset,
    setTransform,
    selectedNodes,
    removeNode,
    setShowCommandPalette,
    setShowKeyboardShortcuts,
    clearContextMenus,
  ])

  // Handle mouse down for selection box
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start selection if left button is pressed and not pressing Alt
      if (e.button === 0 && !e.altKey && e.target === e.currentTarget) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const position = {
          x: (e.clientX - rect.left - transform.x) / transform.zoom,
          y: (e.clientY - rect.top - transform.y) / transform.zoom,
        }

        setIsSelecting(true)
        setSelectionStart(position)
        setSelectionEnd(position)
      }
    },
    [transform],
  )

  // Handle mouse move for selection box
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isSelecting && selectionStart) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const position = {
          x: (e.clientX - rect.left - transform.x) / transform.zoom,
          y: (e.clientY - rect.top - transform.y) / transform.zoom,
        }

        setSelectionEnd(position)
      }
    },
    [isSelecting, selectionStart, transform],
  )

  // Handle mouse up for selection box
  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectionStart && selectionEnd) {
      // Calculate selection box coordinates
      const left = Math.min(selectionStart.x, selectionEnd.x)
      const right = Math.max(selectionStart.x, selectionEnd.x)
      const top = Math.min(selectionStart.y, selectionEnd.y)
      const bottom = Math.max(selectionStart.y, selectionEnd.y)

      // Find nodes inside selection box
      const selectedNodeIds = nodes
        .filter((node) => {
          const nodeLeft = node.position.x
          const nodeRight = node.position.x + (node.width || 70)
          const nodeTop = node.position.y
          const nodeBottom = node.position.y + (node.height || 70)

          return nodeLeft < right && nodeRight > left && nodeTop < bottom && nodeBottom > top
        })
        .map((node) => node.id)

      // Update selected nodes
      if (selectedNodeIds.length > 0) {
        setSelectedNodes(selectedNodeIds)
      }
    }

    // Reset selection state
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
  }, [isSelecting, selectionStart, selectionEnd, nodes, setSelectedNodes])

  // Handle node selection
  const handleNodeSelect = useCallback(
    (nodeId: string, multiple: boolean) => {
      setSelectedNodes((prev) =>
        multiple ? (prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]) : [nodeId],
      )
    },
    [setSelectedNodes],
  )

  // Handle node context menu
  const handleNodeContextMenu = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.preventDefault()
      e.stopPropagation()
      setNodeContextMenu({
        position: { x: e.clientX, y: e.clientY },
        nodeIds: selectedNodes.includes(nodeId) ? selectedNodes : [nodeId],
      })
      setConnectionContextMenu(null)
      setCanvasContextMenu(null)
    },
    [selectedNodes, setNodeContextMenu, setConnectionContextMenu, setCanvasContextMenu],
  )

  // Handle connection context menu
  const handleConnectionContextMenu = useCallback(
    (e: React.MouseEvent, connectionId: string) => {
      e.preventDefault()
      e.stopPropagation()
      setConnectionContextMenu({
        position: { x: e.clientX, y: e.clientY },
        connectionId,
      })
      setNodeContextMenu(null)
      setCanvasContextMenu(null)
    },
    [setConnectionContextMenu, setNodeContextMenu, setCanvasContextMenu],
  )

  // Handle connection label edit request
  const handleConnectionLabelEditRequest = useCallback((connectionId: string, position: Position) => {
    setLabelEditorInfo({ connectionId, position })
  }, [])

  // Memoize nodes to render
  const nodesToRender = useMemo(() => {
    return nodes.map((node) => (
      <WorkflowNode
        key={node.id}
        node={node}
        isSelected={selectedNodes.includes(node.id)}
        onSelect={handleNodeSelect}
        onDragStart={handleNodeDragStart}
        onDoubleClick={() => openNodeEditor(node.id)}
        onContextMenu={(e) => handleNodeContextMenu(e, node.id)}
        onPortDragStart={handlePortDragStart}
      />
    ))
  }, [
    nodes,
    selectedNodes,
    handleNodeSelect,
    handleNodeDragStart,
    openNodeEditor,
    handleNodeContextMenu,
    handlePortDragStart,
  ])

  // Memoize connections to render
  const connectionsToRender = useMemo(() => {
    return connections.map((connection) => (
      <WorkflowConnection
        key={connection.id}
        connection={connection}
        isSelected={connectionContextMenu?.connectionId === connection.id}
        onContextMenu={handleConnectionContextMenu}
      />
    ))
  }, [connections, connectionContextMenu, handleConnectionContextMenu])

  // Memoize plus indicators to render
  const plusIndicatorsToRender = useMemo(() => {
    return nodes
      .filter((node) => !checkHasOutputConnections(node.id))
      .map((node) => {
        const x = node.position.x + (node.width || 70) + 16
        const y = node.position.y + (node.height || 70) / 2
        return (
          <PlusIndicator
            key={`plus-${node.id}`}
            x={x}
            y={y}
            sourceNodeId={node.id}
            onClick={handlePlusIndicatorClick}
            onDragStart={handlePlusIndicatorDragStart}
            onDrag={handlePlusIndicatorDrag}
            onDragEnd={handlePlusIndicatorDragEnd}
          />
        )
      })
  }, [
    nodes,
    checkHasOutputConnections,
    handlePlusIndicatorClick,
    handlePlusIndicatorDragStart,
    handlePlusIndicatorDrag,
    handlePlusIndicatorDragEnd,
  ])

  // Expose the label editor function globally for context menus
  useEffect(() => {
    window.workflowCanvas = {
      editConnectionLabel: (connectionId: string, position: Position) => {
        setLabelEditorInfo({ connectionId, position })
      },
      openNodePanelForConnection: (connectionId: string, position: Position) => {
        setConnectionForNodePanel(connectionId)

        // Convert canvas position to screen position for the panel
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          const screenPosition = {
            x: position.x * transform.zoom + transform.x + rect.left,
            y: position.y * transform.zoom + transform.y + rect.top,
          }
          openNodePanelAtPosition(screenPosition)
        }
      },
    }

    return () => {
      window.workflowCanvas = undefined
    }
  }, [openNodePanelAtPosition, transform])

  return (
    <div className="relative h-full overflow-hidden bg-gray-50">
      <div
        ref={canvasRef}
        className="h-full w-full overflow-hidden"
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
        onMouseDown={(e) => {
          panStart(e)
          handleMouseDown(e)
        }}
        onMouseMove={(e) => {
          panMove(e)
          handleNodeDrag(e)
          handleMouseMove(e)
        }}
        onMouseUp={() => {
          panEnd()
          handleNodeDragEnd()
          handleMouseUp()
        }}
        onWheel={handleWheel}
        aria-label="Workflow canvas"
        role="application"
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
            transformOrigin: "0 0",
            transition: transform.animated ? "transform 0.1s ease-out" : "none",
          }}
        >
          {/* Background grid */}
          <CanvasGrid width={canvasDimensions.width} height={canvasDimensions.height} />

          {/* SVG container for connections */}
          <svg
            ref={svgRef}
            className="absolute top-0 left-0"
            style={{
              zIndex: 5,
              width: "100%",
              height: "100%",
              overflow: "visible",
            }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Connections */}
            {connectionsToRender}

            {/* Plus indicators for nodes without output connections */}
            {plusIndicatorsToRender}

            {/* Connection preview when dragging from plus indicator */}
            {connectionPreview && (
              <ConnectionPreview
                startX={connectionPreview.startX}
                startY={connectionPreview.startY}
                endX={connectionPreview.endX}
                endY={connectionPreview.endY}
                type="bezier"
                isDashed={!connectionPreview.isValidTarget}
                isValidTarget={connectionPreview.isValidTarget}
              />
            )}

            {/* Connection preview when dragging from port to port */}
            {portConnectionDrag && (
              <ConnectionPreview
                startX={portConnectionDrag.startX}
                startY={portConnectionDrag.startY}
                endX={portConnectionDrag.endX}
                endY={portConnectionDrag.endY}
                type="bezier"
                color={portConnectionDrag.sourcePortType === "output" ? "#4f46e5" : "#f97316"}
                isDashed={!portConnectionDrag.isValidTarget}
                isValidTarget={portConnectionDrag.isValidTarget}
              />
            )}
          </svg>

          {/* Nodes */}
          {nodesToRender}

          {/* Selection box */}
          {isSelecting && selectionStart && selectionEnd && <SelectionBox start={selectionStart} end={selectionEnd} />}
        </div>
      </div>

      {/* Canvas controls */}
      <CanvasControls />

      {/* Quick actions button - positioned in top right corner */}
      <div className="absolute top-4 right-4 z-10">
        <CanvasQuickActions onOpenNodePanel={toggleNodePanel} />
      </div>

      {/* Mini map */}
      {nodes.length > 0 && <MiniMap />}

      {/* Context menus */}
      {nodeContextMenu && (
        <NodeContextMenu
          position={nodeContextMenu.position}
          nodeIds={nodeContextMenu.nodeIds}
          onClose={() => setNodeContextMenu(null)}
          onEdit={(nodeId) => openNodeEditor(nodeId)}
        />
      )}

      {connectionContextMenu && (
        <ConnectionContextMenu
          position={connectionContextMenu.position}
          connectionId={connectionContextMenu.connectionId}
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

      {/* Command palette */}
      {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} />}

      {/* Keyboard shortcuts help */}
      {showKeyboardShortcuts && <KeyboardShortcuts onClose={() => setShowKeyboardShortcuts(false)} />}

      {/* Node panel - slides from right */}
      {showNodePanel && (
        <NodePanel
          position={nodePanelPosition}
          onClose={() => {
            setShowNodePanel(false)
            setPlusIndicatorNodeId(null)
            setConnectionForNodePanel(null)
          }}
          onAddNode={handleNodeSelection}
        />
      )}

      {/* Node Editor Dialog */}
      {isOpen && editingNode ? (
        <NodeEditorDialog
          key={editingNode.id}
          node={editingNode}
          open={isOpen}
          onClose={closeNodeEditor}
          onSave={saveNode}
          onDelete={deleteNode}
        />
      ) : null}

      {/* Connection Label Editor */}
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
