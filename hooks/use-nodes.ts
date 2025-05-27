"use client"

import { useState, useCallback, useMemo } from "react"

/**
 * Interface para um Node
 */
export interface Node {
  id: string
  name: string
  description: string
  category: string
  position?: { x: number; y: number }
  config?: any
  createdAt?: string
  updatedAt?: string
}

/**
 * Interface para uma Conexão entre Nodes
 */
export interface Connection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}

/**
 * Hook useNodes
 *
 * Gerencia o estado e operações relacionadas a nodes e suas conexões
 */
export function useNodes() {
  // Estados principais
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([])

  /**
   * Gera um ID único
   */
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
  }, [])

  /**
   * Adiciona um novo node
   */
  const addNode = useCallback(
    (nodeData: Omit<Node, "id" | "createdAt" | "updatedAt">) => {
      const timestamp = new Date().toISOString()
      const newNode: Node = {
        ...nodeData,
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      setNodes((prev) => [...prev, newNode])
      return newNode.id
    },
    [generateId],
  )

  /**
   * Atualiza um node existente
   */
  const updateNode = useCallback((id: string, updates: Partial<Omit<Node, "id" | "createdAt" | "updatedAt">>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, ...updates, updatedAt: new Date().toISOString() } : node)),
    )
  }, [])

  /**
   * Remove um node
   */
  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id))

    // Também remove conexões relacionadas a este node
    setConnections((prev) => prev.filter((conn) => conn.sourceNodeId !== id && conn.targetNodeId !== id))

    // Remove o node da seleção, se estiver selecionado
    setSelectedNodeIds((prev) => prev.filter((nodeId) => nodeId !== id))
  }, [])

  /**
   * Adiciona uma conexão entre nodes
   */
  const addConnection = useCallback(
    (connectionData: Omit<Connection, "id">) => {
      // Verifica se a conexão já existe
      const connectionExists = connections.some(
        (conn) =>
          conn.sourceNodeId === connectionData.sourceNodeId &&
          conn.sourcePortId === connectionData.sourcePortId &&
          conn.targetNodeId === connectionData.targetNodeId &&
          conn.targetPortId === connectionData.targetPortId,
      )

      if (connectionExists) return null

      const newConnection: Connection = {
        ...connectionData,
        id: generateId(),
      }

      setConnections((prev) => [...prev, newConnection])
      return newConnection.id
    },
    [connections, generateId],
  )

  /**
   * Remove uma conexão
   */
  const removeConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id))
  }, [])

  /**
   * Seleciona nodes
   */
  const selectNodes = useCallback((ids: string[]) => {
    setSelectedNodeIds(ids)
  }, [])

  /**
   * Adiciona um node à seleção
   */
  const addToSelection = useCallback((id: string) => {
    setSelectedNodeIds((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }, [])

  /**
   * Remove um node da seleção
   */
  const removeFromSelection = useCallback((id: string) => {
    setSelectedNodeIds((prev) => prev.filter((nodeId) => nodeId !== id))
  }, [])

  /**
   * Limpa a seleção
   */
  const clearSelection = useCallback(() => {
    setSelectedNodeIds([])
  }, [])

  /**
   * Verifica se um node está selecionado
   */
  const isSelected = useCallback(
    (id: string) => {
      return selectedNodeIds.includes(id)
    },
    [selectedNodeIds],
  )

  /**
   * Obtém um node pelo ID
   */
  const getNodeById = useCallback(
    (id: string) => {
      return nodes.find((node) => node.id === id) || null
    },
    [nodes],
  )

  /**
   * Obtém conexões de um node
   */
  const getNodeConnections = useCallback(
    (nodeId: string) => {
      return connections.filter((conn) => conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId)
    },
    [connections],
  )

  /**
   * Obtém nodes conectados a um node
   */
  const getConnectedNodes = useMemo(() => {
    const connectedNodesMap = new Map<string, string[]>()

    nodes.forEach((node) => {
      const connectedIds = connections
        .filter((conn) => conn.sourceNodeId === node.id || conn.targetNodeId === node.id)
        .map((conn) => (conn.sourceNodeId === node.id ? conn.targetNodeId : conn.sourceNodeId))

      connectedNodesMap.set(node.id, connectedIds)
    })

    return (nodeId: string) => connectedNodesMap.get(nodeId) || []
  }, [nodes, connections])

  return {
    // Estado
    nodes,
    connections,
    selectedNodeIds,

    // Operações de nodes
    addNode,
    updateNode,
    deleteNode,
    getNodeById,

    // Operações de conexões
    addConnection,
    removeConnection,
    getNodeConnections,
    getConnectedNodes,

    // Operações de seleção
    selectNodes,
    addToSelection,
    removeFromSelection,
    clearSelection,
    isSelected,
  }
}
