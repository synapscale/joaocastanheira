"use client"

/**
 * @module NodeContextMenu
 * @description A context menu component that appears when right-clicking on a node.
 * Provides options for editing, duplicating, deleting, and other node operations.
 */

import { useEffect, useRef } from "react"
import {
  Copy,
  Trash2,
  Edit,
  Play,
  Lock,
  Unlock,
  AlignLeft,
  AlignRight,
  AlignCenter,
  AlignCenterVerticalIcon as AlignVerticalCenter,
} from "lucide-react"
import { useWorkflow } from "@/context/workflow-context"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

/**
 * NodeContextMenu component.
 *
 * Displays a context menu for node operations when a node is right-clicked.
 * Supports operations on single or multiple selected nodes.
 *
 * @example
 * ```tsx
 * // The component is typically rendered conditionally based on context menu state
 * {nodeContextMenu && (
 *   <NodeContextMenu />
 * )}
 * ```
 */
export function NodeContextMenu() {
  // Get workflow state and functions from context
  const {
    contextMenuInfo,
    setContextMenuInfo,
    removeNode,
    duplicateNode,
    lockNode,
    unlockNode,
    alignNodes,
    nodes,
    setSelectedNode,
  } = useWorkflow()

  const menuRef = useRef<HTMLDivElement>(null)

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenuInfo(null)
      }
    }

    if (contextMenuInfo) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [contextMenuInfo, setContextMenuInfo])

  // Don't render if there's no context menu info
  if (!contextMenuInfo) return null

  /**
   * Remove all selected nodes
   */
  const handleRemove = () => {
    contextMenuInfo.nodeIds.forEach((id) => removeNode(id))
    setContextMenuInfo(null)
  }

  /**
   * Duplicate all selected nodes
   */
  const handleDuplicate = () => {
    contextMenuInfo.nodeIds.forEach((id) => duplicateNode(id))
    setContextMenuInfo(null)
  }

  /**
   * Open the node details panel for editing
   * (only works for single node selection)
   */
  const handleEdit = () => {
    if (contextMenuInfo.nodeIds.length === 1) {
      const node = nodes.find((n) => n.id === contextMenuInfo.nodeIds[0])
      if (node) {
        setSelectedNode(node)
      }
    }
    setContextMenuInfo(null)
  }

  /**
   * Lock all selected nodes to prevent movement
   */
  const handleLock = () => {
    contextMenuInfo.nodeIds.forEach((id) => lockNode(id))
    setContextMenuInfo(null)
  }

  /**
   * Unlock all selected nodes
   */
  const handleUnlock = () => {
    contextMenuInfo.nodeIds.forEach((id) => unlockNode(id))
    setContextMenuInfo(null)
  }

  /**
   * Align selected nodes in the specified direction
   *
   * @param direction - The direction to align nodes: "left", "right", "center", or "middle"
   */
  const handleAlign = (direction: "left" | "right" | "center" | "middle") => {
    alignNodes(contextMenuInfo.nodeIds, direction)
    setContextMenuInfo(null)
  }

  const isMultipleNodes = contextMenuInfo.nodeIds.length > 1

  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: contextMenuInfo.position.y,
        left: contextMenuInfo.position.x,
        zIndex: 1000,
      }}
    >
      <ContextMenu open={true} onOpenChange={() => setContextMenuInfo(null)}>
        <ContextMenuTrigger />
        <ContextMenuContent className="w-64">
          <ContextMenuItem onClick={handleEdit} disabled={isMultipleNodes}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Node
            <ContextMenuShortcut>E</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
            <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={() => {}}>
            <Play className="mr-2 h-4 w-4" />
            Execute Node
          </ContextMenuItem>

          <ContextMenuSeparator />

          {isMultipleNodes && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <AlignCenter className="mr-2 h-4 w-4" />
                Align Nodes
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem onClick={() => handleAlign("left")}>
                  <AlignLeft className="mr-2 h-4 w-4" />
                  Align Left
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleAlign("center")}>
                  <AlignCenter className="mr-2 h-4 w-4" />
                  Align Center
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleAlign("right")}>
                  <AlignRight className="mr-2 h-4 w-4" />
                  Align Right
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => handleAlign("middle")}>
                  <AlignVerticalCenter className="mr-2 h-4 w-4" />
                  Align Middle
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}

          <ContextMenuItem onClick={handleLock}>
            <Lock className="mr-2 h-4 w-4" />
            Lock Node
          </ContextMenuItem>

          <ContextMenuItem onClick={handleUnlock}>
            <Unlock className="mr-2 h-4 w-4" />
            Unlock Node
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleRemove} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
            <ContextMenuShortcut>Del</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
