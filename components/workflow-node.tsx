"use client"

import type React from "react"
import { useState, useCallback, memo, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { NodeQuickActions } from "./node-quick-actions"
import type { Node } from "@/types/workflow"
import { NodeIcon } from "@/components/canvas/node-icon"

interface WorkflowNodeProps {
  /** The node data object */
  node: Node
  /** Whether the node is currently selected */
  isSelected: boolean
  /** Handler for node selection */
  onSelect: (nodeId: string, multiple: boolean) => void
  /** Handler for starting node drag operations */
  onDragStart: (e: React.MouseEvent, nodeId: string) => void
  /** Handler for double-click events */
  onDoubleClick: () => void
  /** Handler for context menu events */
  onContextMenu: (e: React.MouseEvent) => void
  /** Handler for port drag start */
  onPortDragStart: (e: React.MouseEvent) => void
}

/**
 * Renders a workflow node with its ports, icon, and interactive elements.
 * Handles selection, dragging, and other user interactions.
 */
function WorkflowNodeComponent({
  node,
  isSelected,
  onSelect,
  onDragStart,
  onDoubleClick,
  onContextMenu,
  onPortDragStart,
}: WorkflowNodeProps) {
  const [showQuickActions, setShowQuickActions] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear any pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Handle mouse enter event
  const handleMouseEnter = useCallback(() => {
    // Clear any pending timeout to hide actions
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    setShowQuickActions(true)
  }, [])

  // Handle mouse leave event
  const handleMouseLeave = useCallback(() => {
    // Use a small timeout to prevent flickering when moving between node and action buttons
    hoverTimeoutRef.current = setTimeout(() => {
      setShowQuickActions(false)
    }, 100) // Small delay to allow moving to action buttons
  }, [])

  // Callback for when quick actions signal hover state change
  const handleActionsHoverChange = useCallback((isHovered: boolean) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    if (isHovered) {
      setShowQuickActions(true)
    } else {
      // When leaving action buttons, add a small delay before hiding
      hoverTimeoutRef.current = setTimeout(() => {
        setShowQuickActions(false)
      }, 100)
    }
  }, [])

  // Handle node click
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect(node.id, e.ctrlKey || e.metaKey || e.shiftKey)
    },
    [node.id, onSelect],
  )

  // Handle node drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDragStart(e, node.id)
    },
    [node.id, onDragStart],
  )

  // Handle node double click
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDoubleClick()
    },
    [onDoubleClick],
  )

  // Handle node context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onContextMenu(e)
    },
    [onContextMenu],
  )

  // Determine node width and height - consistent 70x70 size
  const nodeWidth = node.width || 70
  const nodeHeight = node.height || 70

  return (
    <div
      ref={nodeRef}
      className="absolute workflow-node"
      style={{
        top: node.position.y,
        left: node.position.x,
        width: nodeWidth,
        zIndex: isSelected || showQuickActions ? 20 : 10,
      }}
      data-node-id={node.id}
      data-node-type={node.type}
    >
      {/* Quick action buttons - visible when hovered */}
      {(showQuickActions || isSelected) && (
        <div
          className="node-quick-actions absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[calc(50%-1px)]"
          style={{ zIndex: 30 }}
        >
          <NodeQuickActions
            onEditClick={onDoubleClick}
            nodeWidth={nodeWidth}
            nodeId={node.id}
            onHoverChange={handleActionsHoverChange}
          />
        </div>
      )}

      {/* Node container - completely white background */}
      <div
        className={cn(
          "relative rounded-md border shadow-sm bg-white cursor-move pointer-events-auto flex items-center justify-center",
          isSelected ? "ring-2 ring-primary shadow-md" : showQuickActions ? "ring-1 ring-primary/40 shadow-sm" : "",
        )}
        style={{
          width: nodeWidth,
          height: nodeHeight,
        }}
        onMouseDown={handleDragStart}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={`${node.name} node`}
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
      >
        {/* Centered icon */}
        <NodeIcon type={node.type} />

        {/* Input ports - rectangle design */}
        {node.inputs && node.inputs.length > 0 && (
          <div className="input-ports">
            {node.inputs.map((input: string, index: number) => (
              <div
                key={`input-${input}`}
                className="absolute cursor-crosshair hover:bg-primary"
                style={{
                  left: "-4px",
                  top: `${nodeHeight * 0.5 + (index - (node.inputs.length - 1) / 2) * 20}px`,
                  transform: "translateY(-50%)",
                  zIndex: 30,
                  width: "4px",
                  height: "12px",
                  backgroundColor: "#6b7280", // gray-500
                  borderRadius: "1px",
                }}
                title={`Input: ${input}`}
                data-port-id={input}
                data-port-type="input"
                data-node-id={node.id}
                aria-label={`Input port: ${input}`}
                onMouseDown={onPortDragStart}
              />
            ))}
          </div>
        )}

        {/* Output ports - semi-circle design (more delicate) */}
        {node.outputs && node.outputs.length > 0 && (
          <div className="output-ports">
            {node.outputs.map((output: string, index: number) => (
              <div
                key={`output-${output}`}
                className="absolute flex items-center justify-center cursor-crosshair"
                style={{
                  right: "-4px",
                  top: `${nodeHeight * 0.5 + (index - (node.outputs.length - 1) / 2) * 20}px`,
                  transform: "translateY(-50%)",
                  zIndex: 30,
                  width: "8px",
                  height: "12px",
                }}
                title={`Output: ${output}`}
                data-port-id={output}
                data-port-type="output"
                data-node-id={node.id}
                aria-label={`Output port: ${output}`}
                onMouseDown={onPortDragStart}
              >
                <div
                  className="hover:bg-primary"
                  style={{
                    borderRadius: "0 50% 50% 0",
                    width: "4px",
                    height: "12px",
                    backgroundColor: "#6b7280", // gray-500
                    marginLeft: "4px",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Node label - always shown below the node */}
      <div className="mt-2 text-sm font-medium text-center text-foreground/80 truncate max-w-full" title={node.name}>
        {node.name}
      </div>
    </div>
  )
}

export const WorkflowNode = memo(WorkflowNodeComponent)
