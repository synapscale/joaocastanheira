interface ConnectionEndpointsProps {
  startX: number
  startY: number
  endX: number
  endY: number
  color: string
  endPointColor: string
  isValidTarget: boolean
}

/**
 * Componente que renderiza os pontos de extremidade da prévia de conexão.
 */
export function ConnectionEndpoints({
  startX,
  startY,
  endX,
  endY,
  color,
  endPointColor,
  isValidTarget,
}: ConnectionEndpointsProps) {
  return (
    <>
      {/* Ponto de início */}
      <circle
        cx={startX}
        cy={startY}
        r={4}
        fill={color}
        stroke="#ffffff"
        strokeWidth={1}
        className="connection-endpoint transition-all duration-150"
        pointerEvents="none"
      />

      {/* Ponto de fim */}
      <circle
        cx={endX}
        cy={endY}
        r={4}
        fill={endPointColor}
        stroke="#ffffff"
        strokeWidth={1}
        className={`connection-endpoint transition-all duration-150 ${isValidTarget ? "animate-pulse" : ""}`}
        pointerEvents="none"
      />
    </>
  )
}
