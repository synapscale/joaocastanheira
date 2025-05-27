interface ConnectionArrowProps {
  connectionData: {
    toX?: number
    toY?: number
  }
  color: string
}

export function ConnectionArrow({ connectionData, color }: ConnectionArrowProps) {
  if (connectionData.toX === undefined || connectionData.toY === undefined) {
    return null
  }

  return (
    <polygon
      points={`
        ${connectionData.toX - 8},${connectionData.toY - 4}
        ${connectionData.toX - 8},${connectionData.toY + 4}
        ${connectionData.toX},${connectionData.toY}
      `}
      fill={color}
      style={{
        transition: "fill 0.15s ease",
      }}
      aria-hidden="true"
      pointerEvents="none"
    />
  )
}
