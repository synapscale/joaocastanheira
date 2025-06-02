"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { NodeDefinition, NodeTemplate } from "@/types/node-definition"

interface NodeDefinitionContextType {
  // Node definitions
  nodeDefinitions: NodeDefinition[]
  getNodeDefinition: (id: string) => NodeDefinition | undefined
  addNodeDefinition: (definition: NodeDefinition) => void
  updateNodeDefinition: (id: string, updates: Partial<NodeDefinition> | NodeDefinition) => void
  deleteNodeDefinition: (id: string) => void

  // Node templates
  nodeTemplates: NodeTemplate[]
  getNodeTemplate: (id: string) => NodeTemplate | undefined
  addNodeTemplate: (template: NodeTemplate) => void
  updateNodeTemplate: (id: string, updates: Partial<NodeTemplate>) => void
  deleteNodeTemplate: (id: string) => void

  // Loading states
  isLoading: boolean
  error: string | null
}

const NodeDefinitionContext = createContext<NodeDefinitionContextType | undefined>(undefined)

export function NodeDefinitionProvider({ children }: { children: React.ReactNode }) {
  const [nodeDefinitions, setNodeDefinitions] = useState<NodeDefinition[]>([])
  const [nodeTemplates, setNodeTemplates] = useState<NodeTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar definições de nós do armazenamento ao montar
  useEffect(() => {
    const loadNodeDefinitions = async () => {
      try {
        setIsLoading(true)

        // Em um aplicativo real, isso seria uma chamada de API
        // Por enquanto, usaremos localStorage
        const storedDefinitions = localStorage.getItem("nodeDefinitions")
        const storedTemplates = localStorage.getItem("nodeTemplates")

        if (storedDefinitions) {
          const parsedDefinitions = JSON.parse(storedDefinitions)
          // Converter strings de data para objetos Date
          const definitionsWithDates = parsedDefinitions.map((def: any) => ({
            ...def,
            createdAt: new Date(def.createdAt),
            updatedAt: new Date(def.updatedAt),
          }))
          setNodeDefinitions(definitionsWithDates)
        } else {
          // Adicionar algumas definições padrão se não houver nenhuma
          setNodeDefinitions([
            {
              id: "node-def-default-1",
              name: "Transformador de Dados",
              type: "dataTransformer",
              category: "transformations",
              description: "Transforma dados de entrada aplicando operações personalizadas.",
              version: "1.0.0",
              color: "#10b981",
              icon: "code",
              author: "Sistema",
              tags: ["transformação", "dados", "código"],
              inputs: [
                {
                  id: "input",
                  name: "Entrada",
                  description: "Dados a serem transformados",
                  required: true,
                },
              ],
              outputs: [
                {
                  id: "output",
                  name: "Saída",
                  description: "Dados transformados",
                },
              ],
              parameters: [
                {
                  id: "param-1",
                  name: "Modo de Operação",
                  key: "operationMode",
                  type: "select",
                  description: "Como o código deve processar os itens",
                  required: true,
                  options: [
                    { label: "Executar uma vez para todos os itens", value: "all" },
                    { label: "Executar para cada item", value: "each" },
                  ],
                  default: "all",
                },
              ],
              codeTemplate: `// Este código será executado quando o nó for acionado
// $input contém os dados de entrada
// Você deve retornar os dados que serão passados para o próximo nó

// Exemplo: Adicionar um campo a cada item
return $input.map(item => {
  return {
    ...item,
    newField: "Valor adicionado pelo nó personalizado"
  };
});`,
              documentation: `# Transformador de Dados

## Descrição
Este nó permite transformar dados usando código JavaScript personalizado.

## Entradas
- **Entrada**: Dados a serem transformados (array ou objeto)

## Parâmetros
- **Modo de Operação**: Define como o código processa os itens
  - **Executar uma vez para todos os itens**: O código recebe todo o array de entrada
  - **Executar para cada item**: O código é executado separadamente para cada item

## Saídas
- **Saída**: Dados transformados

## Exemplo
\`\`\`javascript
// Adicionar um campo a cada item
return $input.map(item => {
  return {
    ...item,
    newField: "Valor adicionado"
  };
});
\`\`\``,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ])
        }

        if (storedTemplates) {
          setNodeTemplates(JSON.parse(storedTemplates))
        }

        setIsLoading(false)
      } catch (err) {
        setError("Falha ao carregar definições de nós")
        setIsLoading(false)
      }
    }

    loadNodeDefinitions()
  }, [])

  // Salvar definições de nós no armazenamento quando elas mudarem
  useEffect(() => {
    if (nodeDefinitions.length > 0) {
      localStorage.setItem("nodeDefinitions", JSON.stringify(nodeDefinitions))
    }
  }, [nodeDefinitions])

  // Salvar templates de nós no armazenamento quando eles mudarem
  useEffect(() => {
    if (nodeTemplates.length > 0) {
      localStorage.setItem("nodeTemplates", JSON.stringify(nodeTemplates))
    }
  }, [nodeTemplates])

  // Operações de definição de nó
  const getNodeDefinition = useCallback((id: string) => nodeDefinitions.find((def) => def.id === id), [nodeDefinitions])

  const addNodeDefinition = useCallback((definition: NodeDefinition) => {
    setNodeDefinitions((prev) => {
      // Verificar se já existe um node com o mesmo ID
      const exists = prev.some(def => def.id === definition.id)
      if (exists) {
        console.warn(`Node definition with ID "${definition.id}" already exists. Skipping addition.`)
        return prev
      }
      return [...prev, definition]
    })
  }, [])

  const updateNodeDefinition = useCallback((id: string, updates: Partial<NodeDefinition> | NodeDefinition) => {
    setNodeDefinitions((prev) =>
      prev.map((def) => {
        if (def.id === id) {
          // Se updates for uma definição completa, use-a, caso contrário, mescle com a existente
          if ("id" in updates && "name" in updates && "type" in updates) {
            return { ...(updates as NodeDefinition), updatedAt: new Date() }
          } else {
            return { ...def, ...updates, updatedAt: new Date() }
          }
        }
        return def
      }),
    )
  }, [])

  const deleteNodeDefinition = useCallback((id: string) => {
    setNodeDefinitions((prev) => prev.filter((def) => def.id !== id))
  }, [])

  // Operações de template de nó
  const getNodeTemplate = useCallback(
    (id: string) => nodeTemplates.find((template) => template.id === id),
    [nodeTemplates],
  )

  const addNodeTemplate = useCallback((template: NodeTemplate) => {
    setNodeTemplates((prev) => [...prev, template])
  }, [])

  const updateNodeTemplate = useCallback((id: string, updates: Partial<NodeTemplate>) => {
    setNodeTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, ...updates } : template)))
  }, [])

  const deleteNodeTemplate = useCallback((id: string) => {
    setNodeTemplates((prev) => prev.filter((template) => template.id !== id))
  }, [])

  const value = {
    nodeDefinitions,
    getNodeDefinition,
    addNodeDefinition,
    updateNodeDefinition,
    deleteNodeDefinition,

    nodeTemplates,
    getNodeTemplate,
    addNodeTemplate,
    updateNodeTemplate,
    deleteNodeTemplate,

    isLoading,
    error,
  }

  return <NodeDefinitionContext.Provider value={value}>{children}</NodeDefinitionContext.Provider>
}

export function useNodeDefinitions() {
  const context = useContext(NodeDefinitionContext)
  if (context === undefined) {
    throw new Error("useNodeDefinitions deve ser usado dentro de um NodeDefinitionProvider")
  }
  return context
}
