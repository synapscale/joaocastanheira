"use client"

import { useEffect, useState } from "react"
import ComponentReference from "../component-selector/component-reference"

interface ComponentReferenceMessageProps {
  componentData: {
    name: string
    path: string
    props?: Record<string, any>
    detectionMethod?: string
  }
}

export default function ComponentReferenceMessage({ componentData }: ComponentReferenceMessageProps) {
  const [isClient, setIsClient] = useState(false)

  // Garantir que o componente só seja renderizado no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="p-3 border rounded-md">Carregando referência de componente...</div>
  }

  return (
    <ComponentReference
      name={componentData.name}
      path={componentData.path}
      props={componentData.props}
      detectionMethod={componentData.detectionMethod}
      onSelect={() => {
        // Aqui poderia ativar o seletor de componentes e focar neste componente
        // Por enquanto, apenas mostra uma mensagem no console
        console.log("Componente selecionado:", componentData.name)
      }}
    />
  )
}
