"use client"

import { useMemo } from "react"
import { calculateBezierPath } from "@/utils/connection-utils"
import { ConnectionArrow } from "./connection-arrow"
import { ConnectionLine } from "./connection-line"
import { ConnectionEndpoints } from "./connection-endpoints"
import type { ConnectionType } from "@/types/workflow"

interface ConnectionPreviewProps {
  startX: number
  startY: number
  endX: number
  endY: number
  type?: ConnectionType
  color?: string
  isDashed?: boolean
  isValidTarget?: boolean
  animated?: boolean
}

/**
 * Componente que renderiza uma prévia de conexão durante operações de arrasto.
 * Mostra um caminho entre dois pontos com indicadores visuais de validade.
 */
export function ConnectionPreview({
  startX,
  startY,
  endX,
  endY,
  type = "bezier",
  color = "#4f46e5",
  isDashed = false,
  isValidTarget = false,
  animated = false,
}: ConnectionPreviewProps) {
  // Calcula o caminho com base no tipo de conexão
  const path = useMemo(() => {
    if (type === "straight") {
      return `M ${startX} ${startY} L ${endX} ${endY}`
    } else if (type === "step") {
      const midX = (startX + endX) / 2
      return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`
    } else {
      // Padrão para bezier
      return calculateBezierPath(startX, startY, endX, endY)
    }
  }, [startX, startY, endX, endY, type])

  // Determina cores com base na validade
  const lineColor = isValidTarget ? "#22c55e" : color
  const endPointColor = isValidTarget ? "#22c55e" : "#f97316"

  return (
    <g className="connection-preview" data-valid={isValidTarget ? "true" : "false"}>
      <ConnectionLine
        path={path}
        color={lineColor}
        isDashed={isDashed}
        isValidTarget={isValidTarget}
        animated={animated}
      />

      <ConnectionEndpoints
        startX={startX}
        startY={startY}
        endX={endX}
        endY={endY}
        color={color}
        endPointColor={endPointColor}
        isValidTarget={isValidTarget}
      />

      <ConnectionArrow endX={endX} endY={endY} isValidTarget={isValidTarget} color={lineColor} />
    </g>
  )
}
