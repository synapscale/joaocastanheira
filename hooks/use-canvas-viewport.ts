"use client"

import { useCallback, useRef } from "react"
import type { Position, Viewport } from "@/types/core/canvas-types"

interface UseCanvasViewportProps {
  viewport: Viewport
  setViewport: (viewport: Partial<Viewport>) => void
  minZoom?: number
  maxZoom?: number
}

/**
 * Hook para gerenciar o viewport do canvas
 */
export function useCanvasViewport({ viewport, setViewport, minZoom = 0.1, maxZoom = 3 }: UseCanvasViewportProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null)

  // Converte coordenadas da tela para coordenadas do canvas
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Position => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }

      return {
        x: (screenX - rect.left - viewport.x) / viewport.zoom,
        y: (screenY - rect.top - viewport.y) / viewport.zoom,
      }
    },
    [viewport.x, viewport.y, viewport.zoom],
  )

  // Converte coordenadas do canvas para coordenadas da tela
  const canvasToScreen = useCallback(
    (canvasX: number, canvasY: number): Position => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }

      return {
        x: canvasX * viewport.zoom + viewport.x + rect.left,
        y: canvasY * viewport.zoom + viewport.y + rect.top,
      }
    },
    [viewport.x, viewport.y, viewport.zoom],
  )

  // Zoom para um ponto específico
  const zoomToPoint = useCallback(
    (point: Position, zoomFactor: number) => {
      const newZoom = Math.max(minZoom, Math.min(maxZoom, viewport.zoom * zoomFactor))

      // Calcula o novo viewport para manter o ponto sob o cursor
      const zoomRatio = newZoom / viewport.zoom
      const newX = point.x - (point.x - viewport.x) * zoomRatio
      const newY = point.y - (point.y - viewport.y) * zoomRatio

      setViewport({
        x: newX,
        y: newY,
        zoom: newZoom,
      })
    },
    [viewport, setViewport, minZoom, maxZoom],
  )

  // Pan o canvas
  const panCanvas = useCallback(
    (deltaX: number, deltaY: number) => {
      setViewport({
        x: viewport.x + deltaX,
        y: viewport.y + deltaY,
      })
    },
    [viewport, setViewport],
  )

  // Centraliza o canvas em um ponto
  const centerOn = useCallback(
    (position: Position, padding = 0) => {
      if (!canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      setViewport({
        x: centerX - position.x * viewport.zoom - padding,
        y: centerY - position.y * viewport.zoom - padding,
      })
    },
    [viewport.zoom, setViewport],
  )

  return {
    canvasRef,
    screenToCanvas,
    canvasToScreen,
    zoomToPoint,
    panCanvas,
    centerOn,
  }
}
