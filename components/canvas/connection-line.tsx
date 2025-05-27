"use client"

import { cn } from "@/lib/utils"
import type { Connection } from "@/types/core/canvas-types"

interface ConnectionLineProps {
  connection: Connection
  sourcePosition: { x: number; y: number }
  targetPosition: { x: number; y: number }
  isSelected?: boolean
  isPreview?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Componente para renderizar uma linha de conexão entre nodes
 */
export function ConnectionLine({
  connection,
  sourcePosition,
  targetPosition,
  isSelected = false,
  isPreview = false,
  onClick,
  className,
}: ConnectionLineProps) {
  // Calcula pontos de controle para uma curva bezier
  const dx = targetPosition.x - sourcePosition.x
  const dy = targetPosition.y - sourcePosition.y
  const controlPointOffset = Math.abs(dx) * 0.5

  const path = `
    M ${sourcePosition.x},${sourcePosition.y} 
    C ${sourcePosition.x + controlPointOffset},${sourcePosition.y} 
      ${targetPosition.x - controlPointOffset},${targetPosition.y} 
      ${targetPosition.x},${targetPosition.y}
  `

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <path
        d={path}
        className={cn(
          "fill-none stroke-2 transition-colors",
          isSelected ? "stroke-primary" : "stroke-slate-400 dark:stroke-slate-600",
          isPreview && "stroke-dashed",
          className,
        )}
        strokeDasharray={isPreview ? "5,5" : "none"}
        strokeLinecap="round"
        onClick={onClick}
        style={{ pointerEvents: onClick ? "auto" : "none" }}
      />

      {/* Arrow at the end of the line */}
      <circle
        cx={targetPosition.x}
        cy={targetPosition.y}
        r={3}
        className={cn("transition-colors", isSelected ? "fill-primary" : "fill-slate-400 dark:fill-slate-600")}
      />
    </svg>
  )
}
