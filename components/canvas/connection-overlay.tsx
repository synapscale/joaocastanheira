"use client"

import type React from "react"
import { useWorkflow } from "@/context/workflow-context"
import type { Connection, Position } from "@/types/workflow"
import { useTheme } from "next-themes"

interface ConnectionOverlayProps {
  connection: Connection
  midPoint: Position
  onClose: () => void
}

export function ConnectionOverlay({ connection, midPoint, onClose }: ConnectionOverlayProps) {
  const { removeConnection, addNodeBetweenConnections } = useWorkflow()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const handleAddNode = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Instead of directly adding a node, we'll open the node panel
    onClose()
    // Use the global workflowCanvas object to trigger the node panel
    if (window.workflowCanvas) {
      window.workflowCanvas.openNodePanelForConnection(connection.id, midPoint)
    }
  }

  const handleDeleteConnection = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeConnection(connection.id)
    onClose()
  }

  // Cores baseadas no tema
  const bgColor = isDark ? "#1f2937" : "#ffffff"
  const borderColor = isDark ? "#374151" : "#e5e7eb"
  const iconColor = isDark ? "#9ca3af" : "#6b7280"
  const hoverBgColor = isDark ? "#374151" : "#f3f4f6"
  const deleteHoverColor = isDark ? "#7f1d1d" : "#fee2e2"
  const deleteIconHoverColor = isDark ? "#ef4444" : "#dc2626"

  return (
    <g
      transform={`translate(${midPoint.x - 40}, ${midPoint.y - 15})`}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
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
      <g cursor="pointer" onClick={handleAddNode} className="connection-action-button">
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
      <g cursor="pointer" onClick={handleDeleteConnection} className="connection-action-button">
        <rect
          x="40"
          y="0"
          width="40"
          height="30"
          fill="transparent"
          className="hover:fill-[#fee2e2] dark:hover:fill-[#7f1d1d]"
        />
        <circle cx="60" cy="15" r="10" fill="transparent" />
        {/* Trash icon */}
        <path
          d="M56,11 L64,11 M65,13 L55,13 M64,13 L63,21 L57,21 L56,13 M60,11 L60,13"
          stroke={iconColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="hover:stroke-[#dc2626] dark:hover:stroke-[#ef4444]"
        />
      </g>
    </g>
  )
}
