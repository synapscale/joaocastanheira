interface CanvasGridProps {
  width?: number
  height?: number
  spacing?: number
  color?: string
}

export function CanvasGrid({ width = 20000, height = 20000, spacing = 20, color = "#e2e8f0" }: CanvasGridProps) {
  // Create a pattern for the grid
  const patternId = "grid-pattern"

  return (
    <svg
      className="absolute top-0 left-0"
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: -height / 2,
        left: -width / 2,
        pointerEvents: "none",
      }}
    >
      <defs>
        <pattern id={patternId} width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <circle cx={spacing / 2} cy={spacing / 2} r={1} fill={color} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${patternId})`} />
    </svg>
  )
}
