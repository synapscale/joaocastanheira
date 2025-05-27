"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface CanvasMiniMapProps {
  nodes: Array<{ id: string; position: { x: number; y: number } }>
  viewport: { x: number; y: number; zoom: number }
  onViewportChange: (viewport: { x: number; y: number; zoom: number }) => void
}

export function CanvasMiniMap({ nodes, viewport, onViewportChange }: CanvasMiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [mapBounds, setMapBounds] = useState({ minX: 0, minY: 0, maxX: 0, maxY: 0 })
  const [viewportRect, setViewportRect] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [mapSize, setMapSize] = useState({ width: 150, height: 100 })
  const [scale, setScale] = useState(1)
  const [isExpanded, setIsExpanded] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Calculate map bounds based on nodes
  useEffect(() => {
    if (nodes.length === 0) return

    const padding = 100 // Add padding around nodes
    const bounds = nodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxX: Math.max(acc.maxX, node.position.x),
        maxY: Math.max(acc.maxY, node.position.y),
      }),
      {
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      },
    )

    // Add padding
    bounds.minX -= padding
    bounds.minY -= padding
    bounds.maxX += padding
    bounds.maxY += padding

    setMapBounds(bounds)

    // Calculate scale
    const contentWidth = bounds.maxX - bounds.minX
    const contentHeight = bounds.maxY - bounds.minY
    const scaleX = mapSize.width / contentWidth
    const scaleY = mapSize.height / contentHeight
    const newScale = Math.min(scaleX, scaleY)

    setScale(newScale)
  }, [nodes, mapSize])

  // Calculate viewport rectangle
  useEffect(() => {
    if (!mapRef.current) return

    // Get the visible area in world coordinates
    const visibleWidth = window.innerWidth / viewport.zoom
    const visibleHeight = window.innerHeight / viewport.zoom
    const visibleLeft = -viewport.x / viewport.zoom
    const visibleTop = -viewport.y / viewport.zoom

    // Convert to minimap coordinates
    const x = (visibleLeft - mapBounds.minX) * scale
    const y = (visibleTop - mapBounds.minY) * scale
    const width = visibleWidth * scale
    const height = visibleHeight * scale

    setViewportRect({ x, y, width, height })
  }, [viewport, mapBounds, scale])

  // Handle dragging the viewport rectangle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !mapRef.current) return

      const rect = mapRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Convert minimap coordinates to world coordinates
      const worldX = mapBounds.minX + x / scale
      const worldY = mapBounds.minY + y / scale

      // Calculate new viewport position
      const newX = -worldX * viewport.zoom + window.innerWidth / 2
      const newY = -worldY * viewport.zoom + window.innerHeight / 2

      onViewportChange({
        ...viewport,
        x: newX,
        y: newY,
      })
    },
    [isDragging, mapBounds, scale, viewport, onViewportChange],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle clicking on the minimap
  const handleMapClick = useCallback(
    (e: React.MouseEvent) => {
      if (!mapRef.current) return

      const rect = mapRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Convert minimap coordinates to world coordinates
      const worldX = mapBounds.minX + x / scale
      const worldY = mapBounds.minY + y / scale

      // Calculate new viewport position
      const newX = -worldX * viewport.zoom + window.innerWidth / 2
      const newY = -worldY * viewport.zoom + window.innerHeight / 2

      onViewportChange({
        ...viewport,
        x: newX,
        y: newY,
      })
    },
    [mapBounds, scale, viewport, onViewportChange],
  )

  return (
    <div
      className={cn(
        "canvas-mini-map relative bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300",
        isExpanded ? "w-64 h-48" : "w-32 h-24",
        isMobile && "bottom-20",
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        ref={mapRef}
        className="w-full h-full relative cursor-pointer"
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background grid */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)",
              backgroundSize: `${scale * 20}px ${scale * 20}px`,
            }}
          ></div>
        </div>

        {/* Nodes */}
        {nodes.map((node) => {
          const x = (node.position.x - mapBounds.minX) * scale
          const y = (node.position.y - mapBounds.minY) * scale
          return (
            <div
              key={node.id}
              className="absolute w-2 h-2 bg-blue-500 rounded-sm"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )
        })}

        {/* Viewport rectangle */}
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/10 rounded cursor-move"
          style={{
            left: `${viewportRect.x}px`,
            top: `${viewportRect.y}px`,
            width: `${viewportRect.width}px`,
            height: `${viewportRect.height}px`,
          }}
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  )
}
