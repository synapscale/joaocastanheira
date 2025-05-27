"use client"

import { useState, useCallback } from "react"
import type { Connection, Node } from "@/types/core/canvas-types"

interface UseNodeConnectionsProps {
  nodes: Node[]
  connections: Connection[]
  onAddConnection: (connection: Connection) => void
  onRemoveConnection: (connectionId: string) => void
}

/**
 * Hook para gerenciar conexões entre nodes
 */
export function useNodeConnections({
  nodes,
  connections,
  onAddConnection,
  onRemoveConnection,
}: UseNodeConnectionsProps) {
  const [activeConnection, setActiveConnection] = useState<{
    sourceNodeId: string
    sourcePortId: string
  } | null>(null)

  // Inicia uma conexão
  const startConnection = useCallback((nodeId: string, portId: string) => {
    setActiveConnection({
      sourceNodeId: nodeId,
      sourcePortId: portId,
    })
  }, [])

  // Completa uma conexão
  const completeConnection = useCallback(
    (targetNodeId: string, targetPortId: string) => {
      if (!activeConnection) return

      const { sourceNodeId, sourcePortId } = activeConnection

      // Evita conectar um node a si mesmo
      if (sourceNodeId === targetNodeId) {
        setActiveConnection(null)
        return
      }

      // Verifica se a conexão já existe
      const connectionExists = connections.some(
        (conn) =>
          conn.source === sourceNodeId &&
          conn.target === targetNodeId &&
          conn.sourcePort === sourcePortId &&
          conn.targetPort === targetPortId,
      )

      if (!connectionExists) {
        onAddConnection({
          id: `conn-${sourceNodeId}-${sourcePortId}-${targetNodeId}-${targetPortId}`,
          source: sourceNodeId,
          target: targetNodeId,
          sourcePort: sourcePortId,
          targetPort: targetPortId,
        })
      }

      setActiveConnection(null)
    },
    [activeConnection, connections, onAddConnection],
  )

  // Cancela uma conexão ativa
  const cancelConnection = useCallback(() => {
    setActiveConnection(null)
  }, [])

  // Verifica se uma conexão é válida
  const isValidConnection = useCallback(
    (sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string) => {
      // Evita conectar um node a si mesmo
      if (sourceNodeId === targetNodeId) return false

      // Verifica se a conexão já existe
      return !connections.some(
        (conn) =>
          conn.source === sourceNodeId &&
          conn.target === targetNodeId &&
          conn.sourcePort === sourcePortId &&
          conn.targetPort === targetPortId,
      )
    },
    [connections],
  )

  // Calcula as posições das conexões
  const getConnectionPositions = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetNode = nodes.find((n) => n.id === connection.target)

      if (!sourceNode || !targetNode) {
        return null
      }

      // Posições padrão (centro-direita para centro-esquerda)
      const sourcePos = {
        x: sourceNode.position.x + (sourceNode.size?.width || 240),
        y: sourceNode.position.y + (sourceNode.size?.height || 100) / 2,
      }

      const targetPos = {
        x: targetNode.position.x,
        y: targetNode.position.y + (targetNode.size?.height || 100) / 2,
      }

      return { sourcePos, targetPos }
    },
    [nodes],
  )

  return {
    activeConnection,
    startConnection,
    completeConnection,
    cancelConnection,
    isValidConnection,
    getConnectionPositions,
  }
}
