"use client"

import type React from "react"
import { useState, useCallback } from "react"

/**
 * Configuration options for drag and drop functionality
 */
interface DragDropOptions {
  /** Callback fired when drag starts */
  onDragStart?: (data: any, event: React.DragEvent) => void
  /** Callback fired when drag ends */
  onDragEnd?: () => void
  /** Callback fired when drop occurs */
  onDrop?: (data: any, event: React.DragEvent) => void
  /** Accepted data types for drops */
  acceptTypes?: string[]
  /** MIME type for drag data */
  dataType?: string
}

/**
 * Return type for the useDragDrop hook
 */
interface DragDropReturn {
  /** Whether currently dragging */
  isDragging: boolean
  /** Whether drag is over drop zone */
  isOver: boolean
  /** Function to handle drag start */
  handleDragStart: (data: any) => (event: React.DragEvent) => void
  /** Function to handle drag end */
  handleDragEnd: (event: React.DragEvent) => void
  /** Function to handle drag over */
  handleDragOver: (event: React.DragEvent) => void
  /** Function to handle drag leave */
  handleDragLeave: () => void
  /** Function to handle drop */
  handleDrop: (event: React.DragEvent) => void
  /** Props for draggable elements */
  dragProps: {
    draggable: boolean
    onDragStart: (data: any) => (event: React.DragEvent) => void
    onDragEnd: (event: React.DragEvent) => void
  }
  /** Props for drop zone elements */
  dropProps: {
    onDragOver: (event: React.DragEvent) => void
    onDragLeave: () => void
    onDrop: (event: React.DragEvent) => void
  }
}

/**
 * useDragDrop Hook
 *
 * Provides comprehensive drag and drop functionality with type safety
 * and proper event handling. Supports custom drag previews, data validation,
 * and visual feedback for drag states.
 *
 * @example
 * ```tsx
 * const dragDrop = useDragDrop({
 *   onDrop: (data) => console.log('Dropped:', data),
 *   acceptTypes: ['skill', 'node']
 * });
 *
 * return (
 *   <div>
 *     <div {...dragDrop.dragProps(skillData)}>Draggable Skill</div>
 *     <div {...dragDrop.dropProps}>Drop Zone</div>
 *   </div>
 * );
 * ```
 *
 * @param options - Configuration options for drag and drop
 * @returns Object with drag/drop handlers and state
 */
export function useDragDrop({
  onDragStart,
  onDragEnd,
  onDrop,
  acceptTypes = [],
  dataType = "application/json",
}: DragDropOptions = {}): DragDropReturn {
  // Component state
  const [isDragging, setIsDragging] = useState(false)
  const [isOver, setIsOver] = useState(false)

  /**
   * Handles drag start with data serialization and preview creation
   * @param data - Data to be transferred during drag
   */
  const handleDragStart = useCallback(
    (data: any) => (event: React.DragEvent) => {
      setIsDragging(true)
      event.dataTransfer.setData(dataType, JSON.stringify(data))

      // Create custom drag preview
      const dragPreview = document.createElement("div")
      dragPreview.className = "bg-white p-2 rounded border shadow-md text-sm"
      dragPreview.textContent = typeof data === "object" && data.name ? data.name : "Dragging item"
      dragPreview.style.position = "absolute"
      dragPreview.style.top = "-1000px"
      document.body.appendChild(dragPreview)

      // Set drag image with error handling
      try {
        event.dataTransfer.setDragImage(dragPreview, 0, 0)
      } catch (err) {
        console.error("Error setting drag image:", err)
      }

      // Clean up preview element
      setTimeout(() => {
        if (document.body.contains(dragPreview)) {
          document.body.removeChild(dragPreview)
        }
      }, 0)

      onDragStart?.(data, event)
    },
    [dataType, onDragStart],
  )

  /**
   * Handles drag end and cleanup
   */
  const handleDragEnd = useCallback(
    (event: React.DragEvent) => {
      setIsDragging(false)
      onDragEnd?.()
    },
    [onDragEnd],
  )

  /**
   * Handles drag over with visual feedback
   */
  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      if (!isOver) {
        setIsOver(true)
      }
    },
    [isOver],
  )

  /**
   * Handles drag leave
   */
  const handleDragLeave = useCallback(() => {
    setIsOver(false)
  }, [])

  /**
   * Handles drop with data validation and type checking
   */
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsOver(false)

      try {
        const data = JSON.parse(event.dataTransfer.getData(dataType))

        // Validate accepted types if specified
        if (acceptTypes.length > 0) {
          const type = data.type || ""
          if (!acceptTypes.includes(type)) {
            return
          }
        }

        onDrop?.(data, event)
      } catch (error) {
        console.error("Error processing drop:", error)
      }
    },
    [dataType, acceptTypes, onDrop],
  )

  return {
    isDragging,
    isOver,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    dragProps: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
    dropProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  }
}
