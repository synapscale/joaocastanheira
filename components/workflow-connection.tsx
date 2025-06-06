"use client"

import type React from "react"
import { useMemo, memo, useState, useRef, useEffect, useCallback } from "react"
import type { Connection } from "@/types/workflow"
import { useTheme } from "next-themes"
import { useWorkflow } from "@/context/workflow-context"
import { calculateConnectionPath } from "@/utils/connection-utils"
import { ConnectionActionButtons } from "@/components/connection-action-buttons"

interface WorkflowConnectionProps {
  /** The connection data object */
  connection: Connection
  /** Whether the connection is currently selected */
  isSelected?: boolean
  /** Handler for context menu events */
  onContextMenu: (e: React.MouseEvent, connectionId: string) => void
}

/**
 * Renders a connection between two nodes in the workflow.
 * Handles hover states, action buttons, and connection styling.
 */
function WorkflowConnectionComponent({ connection, isSelected = false, onContextMenu }: WorkflowConnectionProps) {
  const { theme } = useTheme()
  const { nodes } = useWorkflow()
  const [showActions, setShowActions] = useState(false)
  const pathRef = useRef<SVGPathElement>(null)
  const [midPoint, setMidPoint] = useState({ x: 0, y: 0 })
  const connectionRef = useRef<SVGGElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isDark = theme === "dark"

  // Calculate connection path data based on connected nodes
  const connectionData = useMemo(() => {
    if (!Array.isArray(nodes) || nodes.length === 0) return null

    const fromNode = nodes.find((n) => n.id === connection.from)
    const toNode = nodes.find((n) => n.id === connection.to)

    if (!fromNode || !toNode) {
      console.warn(`Connection ${connection.id} references non-existent nodes`)
      return null
    }

    return calculateConnectionPath(fromNode, toNode, connection.type || "bezier")
  }, [connection.from, connection.to, connection.type, nodes])

  // Fixed colors based on state and theme
  const normalColor = isDark ? "#9ca3af" : "#6b7280" // gray-400 for dark mode, gray-500 for light mode
  const hoverColor = "#f97316" // orange-500
  const selectedColor = "#3b82f6" // blue-500

  // Get current color based on state
  const currentColor = isSelected ? selectedColor : showActions ? hoverColor : normalColor

  // Calculate the midpoint of the connection path
  const calculateMidPoint = useCallback(() => {
    if (!pathRef.current) return

    try {
      const pathLength = pathRef.current.getTotalLength()
      if (pathLength > 0) {
        const point = pathRef.current.getPointAtLength(pathLength / 2)
        setMidPoint({ x: point.x, y: point.y })
      } else if (connectionData) {
        // Fallback if path length is 0
        const { fromX, fromY, toX, toY } = connectionData
        setMidPoint({
          x: fromX !== undefined && toX !== undefined ? (fromX + toX) / 2 : 0,
          y: fromY !== undefined && toY !== undefined ? (fromY + toY) / 2 : 0,
        })
      }
    } catch (error) {
      // Fallback calculation if getTotalLength fails
      if (connectionData) {
        const { fromX, fromY, toX, toY } = connectionData
        setMidPoint({
          x: fromX !== undefined && toX !== undefined ? (fromX + toX) / 2 : 0,
          y: fromY !== undefined && toY !== undefined ? (fromY + toY) / 2 : 0,
        })
      }
    }
  }, [connectionData])

  // Calculate midpoint when connection data changes
  useEffect(() => {
    if (connectionData && pathRef.current) {
      calculateMidPoint()
    }
  }, [connectionData, calculateMidPoint])

  // Clear any pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Handle mouse enter on the connection
  const handleMouseEnter = useCallback(() => {
    // Clear any pending timeout to hide actions
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    setShowActions(true)
    calculateMidPoint()
  }, [calculateMidPoint])

  // Handle mouse leave on the connection
  const handleMouseLeave = useCallback(() => {
    // Use a small timeout to prevent flickering when moving between connection and action buttons
    hoverTimeoutRef.current = setTimeout(() => {
      setShowActions(false)
    }, 100) // Small delay to allow moving to action buttons
  }, [])

  // Callback for when action buttons signal hover state change
  const handleActionsHoverChange = useCallback((isHovered: boolean) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    if (isHovered) {
      setShowActions(true)
    } else {
      // When leaving action buttons, add a small delay before hiding
      hoverTimeoutRef.current = setTimeout(() => {
        setShowActions(false)
      }, 100)
    }
  }, [])

  if (!connectionData || !connectionData.path) return null

  // Determine stroke width based on state
  const strokeWidth = isSelected || showActions ? 2 : 1.5

  // Determine stroke dasharray based on connection style
  const dasharray = connection.style?.dashed ? "5,3" : ""

  return (
    <g
      ref={connectionRef}
      className="workflow-connection"
      data-connection-id={connection.id}
      data-selected={isSelected ? "true" : "false"}
      data-hovered={showActions ? "true" : "false"}
    >
      {/* Invisible wider path for hover detection */}
      <path
        d={connectionData.path}
        fill="none"
        stroke="transparent"
        strokeWidth="12"
        style={{ cursor: "pointer" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        pointerEvents="stroke"
        aria-hidden="true"
      />

      {/* Main connection path */}
      <path
        ref={pathRef}
        d={connectionData.path}
        fill="none"
        stroke={currentColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dasharray}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => onContextMenu(e, connection.id)}
        pointerEvents="none"
        aria-label={`Connection from ${connection.from} to ${connection.to}`}
        role="graphics-symbol"
        data-from-node={connection.from}
        data-to-node={connection.to}
      />

      {/* Arrow at the end of the connection */}
      {connectionData.toX !== undefined && connectionData.toY !== undefined && (
        <polygon
          points={`
            ${connectionData.toX - 8},${connectionData.toY - 4}
            ${connectionData.toX - 8},${connectionData.toY + 4}
            ${connectionData.toX},${connectionData.toY}
          `}
          fill={currentColor}
          aria-hidden="true"
          pointerEvents="none"
        />
      )}

      {/* Connection action buttons - show only when hovered */}
      {(showActions || isSelected) && midPoint.x !== 0 && midPoint.y !== 0 && (
        <ConnectionActionButtons connection={connection} position={midPoint} onHoverChange={handleActionsHoverChange} />
      )}
    </g>
  )
}

export const WorkflowConnection = memo(WorkflowConnectionComponent)
