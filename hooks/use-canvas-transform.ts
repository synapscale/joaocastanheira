"use client"

/**
 * @module useCanvasTransform
 * @description A hook for managing canvas transformations (pan and zoom).
 */

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import type { Position } from "@/types/workflow"

/**
 * Props for the useCanvasTransform hook
 */
interface UseCanvasTransformProps {
  /** Initial zoom level */
  initialZoom?: number
  /** Initial pan offset */
  initialPanOffset?: Position
  /** Minimum allowed zoom level */
  minZoom?: number
  /** Maximum allowed zoom level */
  maxZoom?: number
  /** Callback for when zoom changes */
  onZoomChange?: (zoom: number) => void
  /** Callback for when pan changes */
  onPanChange?: (position: Position) => void
}

/**
 * Transform state interface
 */
interface Transform {
  /** X position */
  x: number
  /** Y position */
  y: number
  /** Zoom level */
  zoom: number
  /** Whether the transform should be animated */
  animated: boolean
}

/**
 * Hook for managing canvas transformations (zoom and pan)
 *
 * @param props - Configuration options for the hook
 * @returns Object containing transform state and methods to manipulate it
 *
 * @example
 * ```tsx
 * const {
 *   transform,
 *   setTransform,
 *   zoomIn,
 *   zoomOut,
 *   resetView,
 *   panStart,
 *   panMove,
 *   panEnd,
 *   handleWheel
 * } = useCanvasTransform({
 *   initialZoom: 1,
 *   initialPanOffset: { x: 0, y: 0 },
 *   onZoomChange: (zoom) => console.log(`Zoom changed to ${zoom}`),
 *   onPanChange: (position) => console.log(`Pan changed to ${position.x}, ${position.y}`)
 * });
 * ```
 */
export function useCanvasTransform({
  initialZoom = 1,
  initialPanOffset = { x: 0, y: 0 },
  minZoom = 0.1,
  maxZoom = 2,
  onZoomChange,
  onPanChange,
}: UseCanvasTransformProps) {
  const [transform, setTransform] = useState<Transform>({
    x: initialPanOffset.x || 0,
    y: initialPanOffset.y || 0,
    zoom: initialZoom,
    animated: false,
  })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState<Position | null>(null)

  // Update transform when initial props change
  useEffect(() => {
    setTransform((prev) => ({
      ...prev,
      zoom: initialZoom,
      x: initialPanOffset?.x || 0,
      y: initialPanOffset?.y || 0,
    }))
  }, [initialZoom, initialPanOffset])

  /**
   * Increases zoom by 20%
   */
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(transform.zoom * 1.2, maxZoom)
    setTransform((prev) => ({ ...prev, zoom: newZoom, animated: true }))
    if (onZoomChange) onZoomChange(newZoom)
  }, [transform.zoom, maxZoom, onZoomChange])

  /**
   * Decreases zoom by 20%
   */
  const zoomOut = useCallback(() => {
    const newZoom = Math.max(transform.zoom / 1.2, minZoom)
    setTransform((prev) => ({ ...prev, zoom: newZoom, animated: true }))
    if (onZoomChange) onZoomChange(newZoom)
  }, [transform.zoom, minZoom, onZoomChange])

  /**
   * Resets zoom and position to initial values
   */
  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, zoom: 1, animated: true })
    if (onZoomChange) onZoomChange(1)
    if (onPanChange) onPanChange({ x: 0, y: 0 })
  }, [onZoomChange, onPanChange])

  /**
   * Starts panning the canvas
   *
   * @param e - The mouse event that triggered the pan
   */
  const panStart = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault()
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      document.body.style.cursor = "grabbing"
    }
  }, [])

  /**
   * Updates the pan position during a pan operation
   *
   * @param e - The mouse event during panning
   */
  const panMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning && lastPanPoint) {
        const dx = e.clientX - lastPanPoint.x
        const dy = e.clientY - lastPanPoint.y

        const newX = transform.x + dx
        const newY = transform.y + dy

        setTransform((prev) => ({
          ...prev,
          x: newX,
          y: newY,
          animated: false,
        }))

        if (onPanChange) {
          onPanChange({
            x: newX,
            y: newY,
          })
        }

        setLastPanPoint({ x: e.clientX, y: e.clientY })
      }
    },
    [isPanning, lastPanPoint, transform.x, transform.y, onPanChange],
  )

  /**
   * Ends a pan operation
   */
  const panEnd = useCallback(() => {
    setIsPanning(false)
    setLastPanPoint(null)
    document.body.style.cursor = "default"
  }, [])

  /**
   * Handles mouse wheel events for zooming and panning
   *
   * @param e - The wheel event
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()

      // Zoom with Ctrl/Cmd + mouse wheel
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY < 0 ? 0.1 : -0.1
        const newZoom = Math.max(minZoom, Math.min(maxZoom, transform.zoom + delta))

        // Calculate cursor position relative to canvas
        const rect = e.currentTarget.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        // Calculate point under cursor in canvas coordinates
        const pointXBeforeZoom = mouseX / transform.zoom - transform.x / transform.zoom
        const pointYBeforeZoom = mouseY / transform.zoom - transform.y / transform.zoom

        // Calculate new transform to keep point under cursor
        const newX = mouseX / newZoom - pointXBeforeZoom
        const newY = mouseY / newZoom - pointYBeforeZoom

        setTransform({
          x: newX,
          y: newY,
          zoom: newZoom,
          animated: false,
        })

        if (onZoomChange) onZoomChange(newZoom)
        if (onPanChange) onPanChange({ x: newX, y: newY })
      } else if (e.shiftKey) {
        // Pan horizontally with Shift + mouse wheel
        const dx = e.deltaY
        const newX = transform.x - dx

        setTransform((prev) => ({
          ...prev,
          x: newX,
          animated: false,
        }))

        if (onPanChange) {
          onPanChange({
            x: newX,
            y: transform.y,
          })
        }
      } else {
        // Pan vertically or horizontally with mouse wheel
        const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY)

        if (isHorizontalScroll) {
          const dx = e.deltaX
          const newX = transform.x - dx

          setTransform((prev) => ({
            ...prev,
            x: newX,
            animated: false,
          }))

          if (onPanChange) {
            onPanChange({
              x: newX,
              y: transform.y,
            })
          }
        } else {
          const dy = e.deltaY
          const newY = transform.y - dy

          setTransform((prev) => ({
            ...prev,
            y: newY,
            animated: false,
          }))

          if (onPanChange) {
            onPanChange({
              x: transform.x,
              y: newY,
            })
          }
        }
      }
    },
    [transform, minZoom, maxZoom, onZoomChange, onPanChange],
  )

  return {
    transform,
    setTransform,
    zoomIn,
    zoomOut,
    resetView,
    panStart,
    panMove,
    panEnd,
    handleWheel,
    isPanning,
  }
}
