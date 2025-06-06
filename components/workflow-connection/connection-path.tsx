"use client"

import type React from "react"

import type { RefObject } from "react"
import type { Connection } from "@/types/workflow"

interface ConnectionPathProps {
  pathRef: RefObject<SVGPathElement>
  path: string
  connectionStyle: {
    color: string
    width: string
    dasharray: string
    animated: boolean
  }
  isSelected: boolean
  connection: Connection
  onContextMenu: (e: React.MouseEvent, connectionId: string) => void
}

export function ConnectionPath({
  pathRef,
  path,
  connectionStyle,
  isSelected,
  connection,
  onContextMenu,
}: ConnectionPathProps) {
  return (
    <path
      ref={pathRef}
      d={path}
      fill="none"
      stroke={connectionStyle.color}
      strokeWidth={connectionStyle.width}
      strokeDasharray={connectionStyle.dasharray}
      className={`connection-path ${isSelected ? "connection-selected" : ""} ${
        connectionStyle.animated ? "connection-animated" : ""
      }`}
      style={{
        transition: "stroke 0.15s ease, stroke-width 0.15s ease",
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => onContextMenu(e, connection.id)}
      pointerEvents="none"
      aria-label={`Connection from ${connection.from} to ${connection.to}`}
      role="graphics-symbol"
      data-from-node={connection.from}
      data-to-node={connection.to}
    />
  )
}
