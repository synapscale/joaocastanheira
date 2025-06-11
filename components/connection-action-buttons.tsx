"use client"

import type React from "react"
import { useCallback } from "react"
import { useWorkflow } from "@/context/workflow-context"
import type { Connection, Position } from "@/types/workflow"
import { useTheme } from "next-themes"

interface ConnectionActionButtonsProps {
  /** The connection these actions apply to */
  connection: Connection
  /** Position where the buttons should be rendered */
  position: Position
  /** Callback for hover state changes */
  onHoverChange?: (hovered: boolean) => void
}

/**
 * Renders action buttons for a connection.
 * Includes buttons for adding a node between connections and deleting the connection.
 */
export function ConnectionActionButtons({ connection, position, onHoverChange }: ConnectionActionButtonsProps) {
  const { removeConnection } = useWorkflow()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Handle mouse enter event
  const handleMouseEnter = useCallback(() => {
    if (onHoverChange) onHoverChange(true)
  }, [onHoverChange])

  // Handle mouse leave event
  const handleMouseLeave = useCallback(() => {
    if (onHoverChange) onHoverChange(false)
  }, [onHoverChange])

  // Handle add node button click
  const handleAddNode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (window.workflowCanvas) {
        window.workflowCanvas.openNodePanelForConnection(connection.id, position)
      }
    },
    [connection.id, position],
  )

  // Handle remove connection button click
  const handleRemoveConnection = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (removeConnection) {
        removeConnection(connection.id)
      }
    },
    [removeConnection, connection.id],
  )

  // Ensure position has valid values
  const x = position?.x || 0
  const y = position?.y || 0

  // Colors based on theme
  const bgColor = isDark ? "#1f2937" : "#ffffff"
  const borderColor = isDark ? "#374151" : "#e5e7eb"
  const iconColor = isDark ? "#9ca3af" : "#6b7280"

  return (
    <g
      className="connection-action-buttons"
      transform={`translate(${x - 40}, ${y - 15})`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ pointerEvents: "all" }}
    >
      {/* Background rectangle */}
      <rect
        x="0"
        y="0"
        width="80"
        height="30"
        rx="4"
        ry="4"
        fill={bgColor}
        stroke={borderColor}
        strokeWidth="1"
        filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))"
      />

      {/* Divider line */}
      <line x1="40" y1="0" x2="40" y2="30" stroke={borderColor} strokeWidth="1" />

      {/* Add button */}
      <g
        cursor="pointer"
        onClick={handleAddNode}
        className="connection-action-button"
        aria-label="Add node between connections"
      >
        <rect
          x="0"
          y="0"
          width="40"
          height="30"
          fill="transparent"
          className="hover:fill-[#f3f4f6] dark:hover:fill-[#374151]"
        />
        <circle cx="20" cy="15" r="10" fill="transparent" />
        {/* Plus icon */}
        <line x1="14" y1="15" x2="26" y2="15" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="9" x2="20" y2="21" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Delete button */}
      <g
        cursor="pointer"
        onClick={handleRemoveConnection}
        className="connection-action-button"
        aria-label="Delete connection"
      >
        <rect
          x="40"
          y="0"
          width="40"
          height="30"
          fill="transparent"
          className="hover:fill-[#fee2e2] dark:hover:fill-[#7f1d1d]"
        />
        <circle cx="60" cy="15" r="10" fill="transparent" />
        {/* X icon */}
        <line
          x1="55"
          y1="10"
          x2="65"
          y2="20"
          stroke={iconColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          className="hover:stroke-[#dc2626] dark:hover:stroke-[#ef4444]"
        />
        <line
          x1="65"
          y1="10"
          x2="55"
          y2="20"
          stroke={iconColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          className="hover:stroke-[#dc2626] dark:hover:stroke-[#ef4444]"
        />
      </g>
    </g>
  )
}
