"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import type { Position } from "@/types/workflow"

interface PlusIndicatorProps {
  x: number
  y: number
  sourceNodeId: string
  onClick: (e: React.MouseEvent, sourceNodeId: string) => void
  onDragStart: (sourceNodeId: string, position: Position) => void
  onDrag: (position: Position) => void
  onDragEnd: (position: Position) => void
}

export function PlusIndicator({ x, y, sourceNodeId, onClick, onDragStart, onDrag, onDragEnd }: PlusIndicatorProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Track if we're in a potential click operation
  const potentialClickRef = useRef(true)

  // Track mouse position to determine drag vs click
  const startPosRef = useRef<Position | null>(null)

  // Drag threshold in pixels - movement beyond this is considered a drag
  const DRAG_THRESHOLD = 5

  // Handle mouse down to start potential drag or click
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only handle left mouse button
      if (e.button !== 0) return

      // Prevent default to avoid text selection
      e.preventDefault()
      e.stopPropagation()

      // Initialize tracking variables
      potentialClickRef.current = true
      startPosRef.current = { x: e.clientX, y: e.clientY }

      // Add event listeners for drag and drop
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!startPosRef.current) return

        // Calculate distance moved
        const dx = moveEvent.clientX - startPosRef.current.x
        const dy = moveEvent.clientY - startPosRef.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // If moved beyond threshold, it's a drag operation
        if (distance > DRAG_THRESHOLD) {
          // It's no longer a potential click
          potentialClickRef.current = false

          // If we haven't started dragging yet, initiate drag
          if (!isDragging) {
            setIsDragging(true)
            // Pass the actual node output position, not the mouse position
            onDragStart(sourceNodeId, { x, y })
          }

          // Continue drag operation
          onDrag({ x: moveEvent.clientX, y: moveEvent.clientY })
        }
      }

      const handleMouseUp = (upEvent: MouseEvent) => {
        // If we were dragging, end the drag
        if (!potentialClickRef.current) {
          setIsDragging(false)
          onDragEnd({ x: upEvent.clientX, y: upEvent.clientY })
        }
        // If we didn't move beyond threshold, it's a click
        else if (potentialClickRef.current) {
          // Create a synthetic React event from the native event
          const syntheticEvent = {
            ...e,
            clientX: upEvent.clientX,
            clientY: upEvent.clientY,
            preventDefault: () => {},
            stopPropagation: () => {},
          } as React.MouseEvent

          onClick(syntheticEvent, sourceNodeId)
        }

        // Reset tracking variables
        potentialClickRef.current = true
        startPosRef.current = null
        setIsDragging(false)

        // Remove event listeners
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }

      // Add event listeners
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    },
    [isDragging, onDragStart, onDrag, onDragEnd, onClick, sourceNodeId, x, y],
  )

  // Handle keyboard accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onClick(e as unknown as React.MouseEvent, sourceNodeId)
      }
    },
    [onClick, sourceNodeId],
  )

  return (
    <g
      transform={`translate(${x - 8}, ${y - 8})`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      style={{ cursor: isDragging ? "grabbing" : "pointer" }}
      aria-label="Add node or connection"
      role="button"
      tabIndex={0}
    >
      {/* Fixed position plus indicator that doesn't shift */}
      <circle
        cx="8"
        cy="8"
        r="8"
        fill={isHovered ? "#4f46e5" : "#6366f1"}
        stroke="#ffffff"
        strokeWidth="1.5"
        className="transition-colors duration-150"
        style={{
          filter: isHovered ? "drop-shadow(0 0 2px rgba(99, 102, 241, 0.5))" : "none",
        }}
      />
      <path d="M8 4V12M4 8H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}
