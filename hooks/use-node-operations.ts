"use client"

import { useCallback, useState } from "react"

interface Node {
  id: string
  x: number
  y: number
  width: number
  height: number
  zIndex?: number
  [key: string]: any
}

interface UseNodeOperationsResult {
  nodes: Node[]
  addNode: (node: Omit<Node, "id">) => void
  updateNode: (nodeId: string, updates: Partial<Node>) => void
  removeNode: (nodeId: string) => void
  bringNodeToFront: (nodeId: string) => void
  sendNodeToBack: (nodeId: string) => void
}

const useNodeOperations = (): UseNodeOperationsResult => {
  const [nodes, setNodes] = useState<Node[]>([])

  const addNode = useCallback((node: Omit<Node, "id">) => {
    setNodes((prevNodes) => [...prevNodes, { ...node, id: crypto.randomUUID() }])
  }, [])

  const updateNode = useCallback((nodeId: string, updates: Partial<Node>) => {
    setNodes((prevNodes) => prevNodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)))
  }, [])

  const removeNode = useCallback((nodeId: string) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId))
  }, [])

  // Trazer um node para frente (maior z-index)
  const bringNodeToFront = useCallback(
    (nodeId: string) => {
      // Encontrar o maior z-index atual
      const maxZIndex = nodes.reduce((max, node) => Math.max(max, node.zIndex || 0), 0)

      // Atualizar o z-index do node
      setNodes(nodes.map((node) => (node.id === nodeId ? { ...node, zIndex: maxZIndex + 1 } : node)))
    },
    [nodes, setNodes],
  )

  // Enviar um node para trás (menor z-index)
  const sendNodeToBack = useCallback(
    (nodeId: string) => {
      // Encontrar o menor z-index atual
      const minZIndex = nodes.reduce((min, node) => Math.min(min, node.zIndex || 0), 0)

      // Atualizar o z-index do node
      setNodes(nodes.map((node) => (node.id === nodeId ? { ...node, zIndex: minZIndex - 1 } : node)))
    },
    [nodes, setNodes],
  )

  return {
    nodes,
    addNode,
    updateNode,
    removeNode,
    bringNodeToFront,
    sendNodeToBack,
  }
}

export default useNodeOperations
