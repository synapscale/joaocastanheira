"use client"

import { useTheme } from "next-themes"

interface CanvasGridProps {
  width: number
  height: number
}

export function CanvasGrid({ width, height }: CanvasGridProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Define grid properties
  const dotSize = 1
  const dotSpacing = 20
  const dotColor = isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.8)"

  // Garantir que a grade cubra uma área muito maior que a visível
  // Multiplicamos por 10 para garantir cobertura mesmo com zoom out extremo
  const expandedWidth = Math.max(width * 10, 50000)
  const expandedHeight = Math.max(height * 10, 50000)

  return (
    <div
      className="absolute"
      style={{
        backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
        width: `${expandedWidth}px`,
        height: `${expandedHeight}px`,
        // Centralizando a grade para que ela se estenda em todas as direções
        left: `${-expandedWidth / 2 + width / 2}px`,
        top: `${-expandedHeight / 2 + height / 2}px`,
        transform: "translate(-50%, -50%)",
        position: "absolute",
        top: "50%",
        left: "50%",
        pointerEvents: "none", // Garantir que a grade não interfira com interações
        zIndex: -1, // Garantir que a grade fique atrás de todos os outros elementos
      }}
    />
  )
}
