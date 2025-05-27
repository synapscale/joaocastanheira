"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface NodePortProps {
  portId: string
  portType: "input" | "output"
  nodeId: string
  position: {
    top?: string
    left?: string
    right?: string
    bottom?: string
  }
  onMouseDown: (e: React.MouseEvent) => void
}

export function NodePort({ portId, portType, nodeId, position, onMouseDown }: NodePortProps) {
  const isInput = portType === "input"

  return (
    <div
      className={cn(
        "absolute cursor-crosshair",
        isInput ? "hover:bg-blue-500" : "hover:bg-orange-500",
        "transition-colors",
      )}
      style={{
        ...position,
        transform: "translateY(-50%)",
        zIndex: 30,
        width: isInput ? "4px" : "8px",
        height: "12px",
      }}
      title={`${isInput ? "Input" : "Output"}: ${portId}`}
      data-port-id={portId}
      data-port-type={portType}
      data-node-id={nodeId}
      aria-label={`${isInput ? "Input" : "Output"} port: ${portId}`}
      onMouseDown={onMouseDown}
    >
      {isInput ? (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: "#6b7280", // gray-500
            borderRadius: "1px",
          }}
        />
      ) : (
        <div
          className="h-full"
          style={{
            borderRadius: "0 50% 50% 0",
            width: "4px",
            height: "12px",
            backgroundColor: "#6b7280", // gray-500
            marginLeft: "4px",
          }}
        />
      )}
    </div>
  )
}
