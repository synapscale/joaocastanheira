"use client"

import type React from "react"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { Node } from "@/types/workflow"

interface NodeContainerProps {
  node: Node
  isSelected: boolean
  isHovered: boolean
  nodeWidth: number
  nodeHeight: number
  children: ReactNode
  onMouseDown: (e: React.MouseEvent) => void
  onClick: (e: React.MouseEvent) => void
  onDoubleClick: (e: React.MouseEvent) => void
  onContextMenu: (e: React.MouseEvent) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function NodeContainer({
  node,
  isSelected,
  isHovered,
  nodeWidth,
  nodeHeight,
  children,
  onMouseDown,
  onClick,
  onDoubleClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
}: NodeContainerProps) {
  return (
    <div
      className={cn(
        "relative rounded-md border shadow-sm bg-white cursor-move pointer-events-auto flex items-center justify-center transition-all duration-150",
        isSelected ? "ring-2 ring-primary shadow-md" : isHovered ? "ring-1 ring-primary/40 shadow-sm" : "",
      )}
      style={{
        width: nodeWidth,
        height: nodeHeight,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={`${node.name} node`}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
    >
      {children}
    </div>
  )
}
