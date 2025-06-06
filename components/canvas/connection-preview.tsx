"use client"

import { useMemo } from "react"
import { calculateBezierPath } from "@/utils/connection-utils"

interface ConnectionPreviewProps {
  startX: number
  startY: number
  endX: number
  endY: number
  type?: "bezier" | "straight" | "step"
  color?: string
  isDashed?: boolean
  isValidTarget?: boolean
}

export function ConnectionPreview({
  startX,
  startY,
  endX,
  endY,
  type = "bezier",
  color = "#4f46e5",
  isDashed = false,
  isValidTarget = false,
}: ConnectionPreviewProps) {
  // Calculate the path based on the connection type
  const path = useMemo(() => {
    if (type === "straight") {
      return `M ${startX} ${startY} L ${endX} ${endY}`
    } else if (type === "step") {
      const midX = (startX + endX) / 2
      return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`
    } else {
      // Default to bezier
      return calculateBezierPath(startX, startY, endX, endY)
    }
  }, [startX, startY, endX, endY, type])

  // Determine colors based on validity
  const lineColor = isValidTarget ? "#22c55e" : color
  const endPointColor = isValidTarget ? "#22c55e" : "#f97316"

  return (
    <g className="connection-preview">
      {/* Connection path */}
      <path
        d={path}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        strokeDasharray={isDashed ? "5,5" : "none"}
        className="transition-all duration-150"
        markerEnd={isValidTarget ? "url(#arrowhead-valid)" : "url(#arrowhead)"}
      />

      {/* Start point */}
      <circle cx={startX} cy={startY} r="4" fill={color} className="transition-all duration-150" />

      {/* End point - larger and animated when over valid target */}
      <circle
        cx={endX}
        cy={endY}
        r={isValidTarget ? "6" : "4"}
        fill={endPointColor}
        className="transition-all duration-150"
        style={{
          filter: isValidTarget ? "drop-shadow(0 0 3px rgba(34, 197, 94, 0.5))" : "none",
        }}
      />

      {/* Arrow markers for the path */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
        <marker id="arrowhead-valid" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
        </marker>
      </defs>
    </g>
  )
}
