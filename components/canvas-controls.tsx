"use client"

/**
 * @module CanvasControls
 * @description Provides UI controls for manipulating the workflow canvas.
 * Includes zoom controls, view reset, undo/redo, and connection style options.
 */

import { useState, useCallback } from "react"
import { ZoomIn, ZoomOut, Maximize, RotateCcw, RotateCw, GitBranch, GitFork, GitMerge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkflow } from "@/context/workflow-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ControlButton } from "@/components/canvas/control-button"

/**
 * CanvasControls component.
 *
 * Provides UI controls for manipulating the workflow canvas.
 * Includes zoom controls, view reset, undo/redo, and grid visibility toggle.
 *
 * @remarks
 * Controls are positioned at the bottom left of the canvas.
 * Includes tooltips for better usability.
 * Provides visual feedback for the current zoom level.
 *
 * @example
 * ```tsx
 * <CanvasControls />
 * ```
 */
export function CanvasControls() {
  const { zoom, setZoom, resetView, undo, redo, canUndo, canRedo, toggleGridVisibility, showGrid, nodes } =
    useWorkflow()

  const [connectionLineStyle, setConnectionLineStyle] = useState("bezier")

  /**
   * Updates the connection line style for all connections
   *
   * @param style - The new connection line style ("bezier", "straight", or "step")
   */
  const handleConnectionStyleChange = (style: string) => {
    setConnectionLineStyle(style)
    // Update the connection style in the workflow context
    useWorkflow.getState().updateConnectionType("all", style as "bezier" | "straight" | "step")
  }

  /**
   * Increases zoom level by 10%
   */
  const zoomIn = () => {
    setZoom((prev) => Math.min(2, prev + 0.1))
  }

  /**
   * Decreases zoom level by 10%
   */
  const zoomOut = () => {
    setZoom((prev) => Math.max(0.1, prev - 0.1))
  }

  /**
   * Zoom to fit all nodes in the viewport
   */
  const zoomToFit = useCallback(() => {
    if (nodes.length === 0) return

    // Calculate bounds of all nodes
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    nodes.forEach((node) => {
      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + (node.width || 180))
      maxY = Math.max(maxY, node.position.y + (node.height || 80))
    })

    // Add padding
    const padding = 50
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    // Calculate zoom level to fit all nodes
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const zoomX = viewportWidth / contentWidth
    const zoomY = viewportHeight / contentHeight

    // Use the smaller zoom level to ensure everything fits
    const newZoom = Math.min(zoomX, zoomY, 1) // Cap at 1 to avoid zooming in too much

    // Calculate center point of all nodes
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    // Set new zoom and pan to center on all nodes
    setZoom(newZoom)

    // Calculate pan offset to center the content
    const newPanX = viewportWidth / 2 / newZoom - centerX
    const newPanY = viewportHeight / 2 / newZoom - centerY

    // Update pan offset in the workflow context
    useWorkflow.getState().setPanOffset({ x: newPanX, y: newPanY })
  }, [nodes, setZoom])

  /**
   * Returns the appropriate icon for the current connection line style
   *
   * @returns React element with the appropriate icon
   */
  const getConnectionIcon = () => {
    switch (connectionLineStyle) {
      case "bezier":
        return <GitMerge className="h-4 w-4" />
      case "straight":
        return <GitBranch className="h-4 w-4" />
      case "step":
        return <GitFork className="h-4 w-4" />
      default:
        return <GitMerge className="h-4 w-4" />
    }
  }

  return (
    <div className="absolute bottom-6 left-6 flex flex-col gap-2">
      <div className="grid grid-cols-6 gap-1">
        <TooltipProvider>
          <ControlButton
            icon={<Maximize className="h-4 w-4" />}
            onClick={resetView}
            tooltip="Reset view"
            shortcut="R"
          />
          <ControlButton icon={<ZoomIn className="h-4 w-4" />} onClick={zoomIn} tooltip="Zoom in" shortcut="+" />
          <ControlButton icon={<ZoomOut className="h-4 w-4" />} onClick={zoomOut} tooltip="Zoom out" shortcut="-" />
          {/* Undo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={undo}
                disabled={!canUndo}
                className="h-10 w-10 bg-background/80 backdrop-blur-sm"
                aria-label="Undo"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          {/* Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={redo}
                disabled={!canRedo}
                className="h-10 w-10 bg-background/80 backdrop-blur-sm"
                aria-label="Redo"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>

          {/* Connection Style */}
          <Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 bg-background/80 backdrop-blur-sm"
                      aria-label="Connection style"
                    >
                      {getConnectionIcon()}
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Connection style</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent className="w-auto p-2" side="top">
              <div className="flex flex-col gap-1">
                <Button
                  variant={connectionLineStyle === "bezier" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleConnectionStyleChange("bezier")}
                  className="flex items-center justify-start gap-2"
                >
                  <GitMerge className="h-4 w-4" />
                  <span>Curved</span>
                </Button>
                <Button
                  variant={connectionLineStyle === "straight" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleConnectionStyleChange("straight")}
                  className="flex items-center justify-start gap-2"
                >
                  <GitBranch className="h-4 w-4" />
                  <span>Straight</span>
                </Button>
                <Button
                  variant={connectionLineStyle === "step" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleConnectionStyleChange("step")}
                  className="flex items-center justify-start gap-2"
                >
                  <GitFork className="h-4 w-4" />
                  <span>Step</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </TooltipProvider>
      </div>

      {/* Zoom indicator */}
      <div className="text-xs font-mono bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-center">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  )
}
