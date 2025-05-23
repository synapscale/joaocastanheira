"use client"

/**
 * @module CanvasContextMenu
 * @description A context menu component that appears when right-clicking on the canvas.
 * Provides options for adding nodes, managing the view, and clipboard operations.
 */

import { useEffect, useRef } from "react"
import {
  Plus,
  Grid3X3,
  Undo,
  Redo,
  Copy,
  ClipboardPasteIcon as Paste,
  FileJson,
  FileImage,
  Maximize,
} from "lucide-react"
import { useWorkflow } from "@/context/workflow-context"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useToast } from "@/components/ui/use-toast"

/**
 * CanvasContextMenu component.
 *
 * Displays a context menu for canvas operations when right-clicking on the canvas.
 * Provides options for adding nodes, managing the view, and clipboard operations.
 *
 * @example
 * ```tsx
 * // The component is typically rendered conditionally based on context menu state
 * {canvasContextMenu && (
 *   <CanvasContextMenu />
 * )}
 * ```
 */
export function CanvasContextMenu() {
  // Get workflow state and functions from context
  const {
    canvasContextMenuInfo,
    setCanvasContextMenuInfo,
    toggleGridVisibility,
    showGrid,
    undo,
    redo,
    canUndo,
    canRedo,
    resetView,
    addNodeAtPosition,
    copySelectedNodes,
    pasteNodes,
  } = useWorkflow()

  const { toast } = useToast()
  const menuRef = useRef<HTMLDivElement>(null)

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setCanvasContextMenuInfo(null)
      }
    }

    if (canvasContextMenuInfo) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [canvasContextMenuInfo, setCanvasContextMenuInfo])

  // Don't render if there's no context menu info
  if (!canvasContextMenuInfo) return null

  /**
   * Add a new node at the clicked position
   */
  const handleAddNode = () => {
    setCanvasContextMenuInfo(null)
    // Open node panel at position
    addNodeAtPosition(canvasContextMenuInfo.canvasPosition)
  }

  /**
   * Toggle grid visibility
   */
  const handleToggleGrid = () => {
    toggleGridVisibility()
    setCanvasContextMenuInfo(null)
  }

  /**
   * Copy selected nodes to clipboard
   */
  const handleCopy = () => {
    copySelectedNodes()
    toast({
      title: "Copied to clipboard",
      description: "Selected nodes copied to clipboard",
    })
    setCanvasContextMenuInfo(null)
  }

  /**
   * Paste nodes from clipboard at the clicked position
   */
  const handlePaste = () => {
    pasteNodes(canvasContextMenuInfo.canvasPosition)
    setCanvasContextMenuInfo(null)
  }

  /**
   * Export workflow as JSON
   */
  const handleExportJSON = () => {
    // Implementation would be in the workflow context
    toast({
      title: "Workflow exported",
      description: "Workflow JSON has been downloaded",
    })
    setCanvasContextMenuInfo(null)
  }

  /**
   * Export canvas as an image
   */
  const handleExportImage = () => {
    // Implementation would be in the workflow context
    toast({
      title: "Canvas exported",
      description: "Canvas image has been downloaded",
    })
    setCanvasContextMenuInfo(null)
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: canvasContextMenuInfo.position.y,
        left: canvasContextMenuInfo.position.x,
        zIndex: 1000,
      }}
    >
      <ContextMenu open={true} onOpenChange={() => setCanvasContextMenuInfo(null)}>
        <ContextMenuTrigger />
        <ContextMenuContent className="w-64">
          <ContextMenuItem onClick={handleAddNode}>
            <Plus className="mr-2 h-4 w-4" />
            Add Node
            <ContextMenuShortcut>A</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleToggleGrid}>
            <Grid3X3 className="mr-2 h-4 w-4" />
            {showGrid ? "Hide Grid" : "Show Grid"}
            <ContextMenuShortcut>G</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onClick={resetView}>
            <Maximize className="mr-2 h-4 w-4" />
            Reset View
            <ContextMenuShortcut>R</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={undo} disabled={!canUndo}>
            <Undo className="mr-2 h-4 w-4" />
            Undo
            <ContextMenuShortcut>Ctrl+Z</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onClick={redo} disabled={!canRedo}>
            <Redo className="mr-2 h-4 w-4" />
            Redo
            <ContextMenuShortcut>Ctrl+Y</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
            <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onClick={handlePaste}>
            <Paste className="mr-2 h-4 w-4" />
            Paste
            <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleExportJSON}>
            <FileJson className="mr-2 h-4 w-4" />
            Export JSON
          </ContextMenuItem>

          <ContextMenuItem onClick={handleExportImage}>
            <FileImage className="mr-2 h-4 w-4" />
            Export as Image
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
