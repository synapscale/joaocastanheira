"use client"

import { memo } from "react"
import type { Position } from "@/types/workflow"

interface SelectionBoxProps {
  start: Position
  end: Position
}

/**
 * Componente que renderiza uma caixa de seleção para selecionar múltiplos nós
 */
function SelectionBoxComponent({ start, end }: SelectionBoxProps) {
  // Calcular as coordenadas da caixa de seleção
  const left = Math.min(start.x, end.x)
  const top = Math.min(start.y, end.y)
  const width = Math.abs(end.x - start.x)
  const height = Math.abs(end.y - start.y)

  return (
    <div
      className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
      style={{
        left,
        top,
        width,
        height,
      }}
      aria-hidden="true"
    />
  )
}

export const SelectionBox = memo(SelectionBoxComponent)
