"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useNodeDefinitions } from "@/context/node-definition-context"
import { NodeTemplateCreator } from "@/components/node-creator/node-template-creator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { NodeDefinition } from "@/types/node-definition"
import React from "react"

// Usando tipagem 'any' para evitar conflitos com os tipos internos do Next.js
export default function Page({ params }: any) {
  const { id } = params
  const router = useRouter()
  const { getNodeDefinition } = useNodeDefinitions()
  const [nodeDefinition, setNodeDefinition] = useState<NodeDefinition | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const definition = getNodeDefinition(id)
    if (definition) {
      setNodeDefinition(definition)
    } else {
      setNotFound(true)
    }
  }, [id, getNodeDefinition])

  if (notFound) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/node-definitions")} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Template de Nó Não Encontrado</h1>
        </div>
        <div className="bg-muted p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">O template de nó solicitado não foi encontrado</h2>
          <p className="mb-6">O template de nó com ID "{id}" não existe ou foi excluído.</p>
          <Button onClick={() => router.push("/node-definitions")}>Voltar para Templates de Nós</Button>
        </div>
      </div>
    )
  }

  if (!nodeDefinition) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <NodeTemplateCreator initialData={nodeDefinition} onCancel={() => router.push("/node-definitions")} />
    </div>
  )
}
