interface ConnectionArrowProps {
  endX: number
  endY: number
  isValidTarget: boolean
  color: string
}

/**
 * Componente que renderiza a seta no final da prévia de conexão.
 */
export function ConnectionArrow({ endX, endY, isValidTarget, color }: ConnectionArrowProps) {
  return (
    <>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
        <marker id="arrowhead-valid" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
        </marker>
      </defs>

      {/* Seta no final da conexão */}
      <polygon
        points={`
          ${endX - 8},${endY - 4}
          ${endX - 8},${endY + 4}
          ${endX},${endY}
        `}
        fill={isValidTarget ? "#22c55e" : color}
        className="transition-all duration-150"
        pointerEvents="none"
      />
    </>
  )
}
