"use client"

import { memo, useMemo } from "react"

interface JsonLineProps {
  line: string
  index: number
}

/**
 * Componente para renderizar uma linha de JSON com realce de sintaxe
 */
function JsonLineComponent({ line, index }: JsonLineProps) {
  // Aplicar realce de sintaxe
  const highlightedLine = useMemo(() => {
    return line
      .replace(/^(\s*)(".*?")(\s*:)(\s*)/, '$1<span class="text-blue-600">$2</span>$3$4')
      .replace(/:\s*(".*?")([,\s]|$)/g, ': <span class="text-indigo-600">$1</span>$2')
      .replace(/:\s*(\d+)([,\s]|$)/g, ': <span class="text-green-600">$1</span>$2')
      .replace(/:\s*(true|false)([,\s]|$)/g, ': <span class="text-purple-600">$1</span>$2')
      .replace(/:\s*(null)([,\s]|$)/g, ': <span class="text-gray-600">$1</span>$2')
  }, [line])

  return <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightedLine }} />
}

export const JsonLine = memo(JsonLineComponent)
