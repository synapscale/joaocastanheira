"use client"

import type { ReactNode } from "react"

interface ComponentMarkerProps {
  name: string
  path: string
  children: ReactNode
}

/**
 * Componente de utilidade para marcar componentes React para detecção pelo seletor de componentes.
 * Envolve componentes com atributos de dados que facilitam a identificação precisa.
 */
export default function ComponentMarker({ name, path, children }: ComponentMarkerProps) {
  // Safely handle undefined name by providing a default value
  const safeClassName = name ? `component-${name.toLowerCase()}` : "component-unknown"

  return (
    <div
      data-component={name || "UnknownComponent"}
      data-component-path={path || "unknown-path"}
      className={safeClassName}
    >
      {children}
    </div>
  )
}
