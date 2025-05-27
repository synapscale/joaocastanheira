"use client"

import { useMemo } from "react"

interface CanvasGridProps {
  viewport: { x: number; y: number; zoom: number }
}

export function CanvasGrid({ viewport }: CanvasGridProps) {
  const gridStyle = useMemo(() => {
    const { zoom } = viewport
    const gridSize = 24 * zoom
    const dotSize = Math.max(1, zoom * 1.5)

    // Subtle grid colors that adapt to zoom level
    const opacity = Math.min(0.4, Math.max(0.1, zoom * 0.3))
    const gridColor = `rgba(148, 163, 184, ${opacity})`

    return {
      backgroundSize: `${gridSize}px ${gridSize}px`,
      backgroundImage: `
        radial-gradient(circle, ${gridColor} ${dotSize}px, transparent ${dotSize}px)
      `,
      transform: `translate(${viewport.x % gridSize}px, ${viewport.y % gridSize}px)`,
    }
  }, [viewport])

  return <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
}
