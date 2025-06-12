interface ConnectionLineProps {
  path: string
  color: string
  isDashed: boolean
  isValidTarget: boolean
  animated?: boolean
}

/**
 * Componente que renderiza a linha principal da prévia de conexão.
 */
export function ConnectionLine({ path, color, isDashed, isValidTarget, animated = false }: ConnectionLineProps) {
  // Determina o estilo da linha com base na validade e nas propriedades
  const strokeDasharray = isDashed ? "5,3" : ""
  const strokeWidth = isValidTarget ? 2 : 1.5
  const animationClass = animated ? "animate-dash" : ""

  return (
    <path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      className={`transition-all duration-150 ${animationClass}`}
      pointerEvents="none"
    />
  )
}
