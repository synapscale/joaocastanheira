"use client"

/**
 * @module MiniMap
 * @description A miniature overview of the workflow canvas with all nodes.
 */

import type React from "react"

import { useWorkflow } from "@/context/workflow-context"
import { useRef, useEffect, useState, useCallback } from "react"
import { Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * MiniMap component.
 *
 * Provides a miniature overview of the workflow canvas with all nodes.
 * Allows quick navigation by clicking on different areas of the map.
 * Shows the current viewport as a rectangle that updates in real-time.
 *
 * @remarks
 * The minimap calculates its scale based on the bounds of all nodes in the workflow.
 * It renders a simplified representation of each node with appropriate colors.
 * The viewport indicator shows the current visible area of the canvas.
 *
 * @example
 * ```tsx
 * <MiniMap />
 * ```
 */
export function MiniMap() {
  const { nodes, panOffset, zoom, setPanOffset } = useWorkflow()
  const canvasRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [lastMousePosition, setLastMousePosition] = useState<{ x: number; y: number } | null>(null)

  /**
   * Calculates the bounds of all nodes to determine the minimap scale.
   * Adds padding around the nodes to provide context.
   *
   * @returns An object containing the minimum and maximum x and y coordinates
   */
  const calculateBounds = useCallback(() => {
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }

    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    nodes.forEach((node) => {
      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + (node.width || 150)) // Use node width or default
      maxY = Math.max(maxY, node.position.y + (node.height || 60)) // Use node height or default
    })

    // Add padding around the bounds for better visibility
    minX -= 100
    minY -= 100
    maxX += 100
    maxY += 100

    return { minX, minY, maxX, maxY }
  }, [nodes])

  const bounds = calculateBounds()
  const mapWidth = 150
  const mapHeight = 100

  // Calculate scale to fit all nodes in the minimap
  const scaleX = mapWidth / (bounds.maxX - bounds.minX)
  const scaleY = mapHeight / (bounds.maxY - bounds.minY)
  const scale = Math.min(scaleX, scaleY)

  /**
   * Handles click events on the minimap to navigate the main canvas.
   * Converts the click position to canvas coordinates and centers the view.
   *
   * @param e - The mouse event from clicking on the minimap
   */
  const handleMinimapClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling to the main canvas

    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert click position to canvas coordinates
    const canvasX = x / scale + bounds.minX
    const canvasY = y / scale + bounds.minY

    // Center the view on the clicked point
    setPanOffset({
      x: -canvasX + window.innerWidth / (2 * zoom),
      y: -canvasY + window.innerHeight / (2 * zoom),
    })
  }

  /**
   * Handle mouse down on the viewport indicator to start dragging
   */
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(true)
    setLastMousePosition({ x: e.clientX, y: e.clientY })
  }

  /**
   * Handle mouse move to drag the viewport indicator
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !lastMousePosition || !canvasRef.current) return

    const dx = e.clientX - lastMousePosition.x
    const dy = e.clientY - lastMousePosition.y

    // Convert movement to canvas coordinates
    const canvasDx = dx / scale
    const canvasDy = dy / scale

    // Update pan offset
    setPanOffset({
      x: panOffset.x - canvasDx,
      y: panOffset.y - canvasDy,
    })

    setLastMousePosition({ x: e.clientX, y: e.clientY })
  }

  /**
   * Handle mouse up to stop dragging
   */
  const handleMouseUp = () => {
    setIsDragging(false)
    setLastMousePosition(null)
  }

  /**
   * Toggle minimap visibility
   */
  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  /**
   * Updates the viewport indicator position and size based on current pan and zoom.
   * This effect runs whenever the view parameters change.
   */
  useEffect(() => {
    if (!viewportRef.current) return

    const viewportWidth = window.innerWidth / zoom
    const viewportHeight = window.innerHeight / zoom

    // Calculate viewport position in minimap
    let viewX = (-panOffset.x - bounds.minX) * scale
    let viewY = (-panOffset.y - bounds.minY) * scale
    const viewW = viewportWidth * scale
    const viewH = viewportHeight * scale

    // Ensure the viewport is always visible and showing nodes if possible
    if (nodes.length > 0) {
      // Find the center of all nodes
      const nodeXs = nodes.map((n) => n.position.x + (n.width || 150) / 2)
      const nodeYs = nodes.map((n) => n.position.y + (n.height || 60) / 2)

      const centerX = (Math.min(...nodeXs) + Math.max(...nodeXs)) / 2
      const centerY = (Math.min(...nodeYs) + Math.max(...nodeYs)) / 2

      // Adjust viewport to center on nodes if it's not already showing them
      const nodeMinX = (Math.min(...nodeXs) - bounds.minX) * scale
      const nodeMaxX = (Math.max(...nodeXs) - bounds.minX) * scale
      const nodeMinY = (Math.min(...nodeYs) - bounds.minY) * scale
      const nodeMaxY = (Math.max(...nodeYs) - bounds.minY) * scale

      // Check if nodes are outside the current viewport
      const nodesVisible =
        nodeMinX >= viewX && nodeMaxX <= viewX + viewW && nodeMinY >= viewY && nodeMaxY <= viewY + viewH

      if (!nodesVisible) {
        // Center the viewport on the nodes
        viewX = (centerX - bounds.minX) * scale - viewW / 2
        viewY = (centerY - bounds.minY) * scale - viewH / 2
      }
    }

    viewportRef.current.style.left = `${viewX}px`
    viewportRef.current.style.top = `${viewY}px`
    viewportRef.current.style.width = `${viewW}px`
    viewportRef.current.style.height = `${viewH}px`
  }, [panOffset, zoom, bounds, scale, nodes])

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!lastMousePosition || !canvasRef.current) return

        const dx = e.clientX - lastMousePosition.x
        const dy = e.clientY - lastMousePosition.y

        // Convert movement to canvas coordinates
        const canvasDx = dx / scale
        const canvasDy = dy / scale

        // Update pan offset
        setPanOffset({
          x: panOffset.x - canvasDx,
          y: panOffset.y - canvasDy,
        })

        setLastMousePosition({ x: e.clientX, y: e.clientY })
      }

      const handleGlobalMouseUp = () => {
        setIsDragging(false)
        setLastMousePosition(null)
      }

      window.addEventListener("mousemove", handleGlobalMouseMove)
      window.addEventListener("mouseup", handleGlobalMouseUp)

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove)
        window.removeEventListener("mouseup", handleGlobalMouseUp)
      }
    }
  }, [isDragging, lastMousePosition, panOffset, scale, setPanOffset])

  return (
    <div
      className="absolute bottom-6 right-6 z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-background/80 backdrop-blur-sm border rounded-md shadow-md p-1 overflow-hidden"
          >
            <div
              ref={canvasRef}
              className="relative w-[150px] h-[100px] bg-gray-50 cursor-search rounded-sm overflow-hidden"
              onClick={handleMinimapClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              aria-label="Workflow minimap"
              style={{ cursor: isHovered ? "zoom-in" : "default" }}
            >
              {/* Nodes */}
              {nodes.map((node) => (
                <div
                  key={`minimap-${node.id}`}
                  className="absolute rounded-sm"
                  style={{
                    left: (node.position.x - bounds.minX) * scale,
                    top: (node.position.y - bounds.minY) * scale,
                    width: (node.width || 150) * scale,
                    height: (node.height || 60) * scale,
                    backgroundColor:
                      node.type === "trigger"
                        ? "#f97316"
                        : node.type === "ai"
                          ? "#9333ea"
                          : node.type === "integration"
                            ? "#3b82f6"
                            : "#6b7280",
                    opacity: 0.8,
                  }}
                  aria-hidden="true"
                />
              ))}

              {/* Viewport indicator - agora com estilo mais sutil */}
              <div
                ref={viewportRef}
                className={`absolute border border-primary/40 rounded-sm transition-all duration-150 ${
                  isDragging || isHovered ? "bg-primary/10" : "bg-transparent"
                }`}
                style={{
                  boxShadow: isDragging || isHovered ? "0 0 0 1px rgba(59, 130, 246, 0.3)" : "none",
                  cursor: isDragging ? "grabbing" : "grab",
                }}
                onMouseDown={handleViewportMouseDown}
                aria-hidden="true"
              />

              {/* Overlay de ícone quando hover */}
              {isHovered && !isDragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                  <Search className="h-6 w-6 text-white/70" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={toggleVisibility}
        className="absolute bottom-0 right-0 w-5 h-5 bg-background/80 backdrop-blur-sm border rounded-full flex items-center justify-center text-xs transform translate-x-1/2 translate-y-1/2 shadow-md"
        aria-label={isVisible ? "Hide minimap" : "Show minimap"}
      >
        {isVisible ? "−" : "+"}
      </button>
    </div>
  )
}
