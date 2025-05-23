"use client"

import { useState, useCallback, useRef } from "react"
import type {
  Position,
  Node,
  Connection,
  ConnectionDragState,
  PortConnectionDragState,
  ConnectionType,
} from "@/types/workflow"
import { findNodeAtPoint, wouldCreateCycle, getNodeOutputPosition } from "@/utils/connection-utils"
import { nanoid } from "nanoid"

interface UseConnectionPreviewProps {
  nodes: Node[]
  connections: Connection[]
  clientToCanvasPosition: (clientX: number, clientY: number) => Position
  addConnection: (fromNodeId: string, toNodeId: string, type: ConnectionType, id: string) => void
}

/**
 * Hook para gerenciar a visualização de conexão durante operações de arrasto.
 *
 * @param props Propriedades necessárias para gerenciar a visualização de conexão
 * @returns Estado e funções para gerenciar a visualização de conexão
 */
export function useConnectionPreview({
  nodes,
  connections,
  clientToCanvasPosition,
  addConnection,
}: UseConnectionPreviewProps) {
  // Estado para visualização de conexão ao arrastar do indicador plus
  const [connectionPreview, setConnectionPreview] = useState<ConnectionDragState | null>(null)

  // Estado para arrasto de conexão de porta para porta
  const [portConnectionDrag, setPortConnectionDrag] = useState<PortConnectionDragState | null>(null)

  // Referência para rastrear o último nó alvo válido
  const lastValidTargetRef = useRef<{ nodeId: string; timestamp: number } | null>(null)

  // Manipula início de arrasto do indicador plus
  const handlePlusIndicatorDragStart = useCallback(
    (sourceNodeId: string, position: Position) => {
      // Encontra o nó de origem
      const sourceNode = nodes.find((node) => node.id === sourceNodeId)
      if (!sourceNode) return

      // Obtém a posição de saída do nó de origem
      const outputPosition = getNodeOutputPosition(sourceNode)

      // Define visualização de conexão com o ponto inicial correto
      setConnectionPreview({
        sourceNodeId,
        startX: outputPosition.x,
        startY: outputPosition.y,
        endX: outputPosition.x, // Inicia na posição de saída do nó de origem
        endY: outputPosition.y, // Inicia na posição de saída do nó de origem
        isValidTarget: false,
      })

      // Reseta o último nó alvo válido
      lastValidTargetRef.current = null
    },
    [nodes],
  )

  // Manipula arrasto do indicador plus
  const handlePlusIndicatorDrag = useCallback(
    (position: Position) => {
      if (!connectionPreview) return

      // Converte posição do cliente para posição do canvas
      const canvasPosition = clientToCanvasPosition(position.x, position.y)

      // Encontra nó alvo potencial com uma pequena margem para facilitar o alvo
      const targetNode = findNodeAtPoint(canvasPosition, nodes, connectionPreview.sourceNodeId, 10)

      // Verifica se isso criaria um ciclo
      const isValidTarget = targetNode
        ? !wouldCreateCycle(
            connections.map((conn) => ({ from: conn.from, to: conn.to })),
            connectionPreview.sourceNodeId,
            targetNode.id,
          )
        : false

      // Atualiza o último nó alvo válido
      if (targetNode && isValidTarget) {
        lastValidTargetRef.current = {
          nodeId: targetNode.id,
          timestamp: Date.now(),
        }
      }

      // Atualiza posição final da visualização de conexão
      setConnectionPreview((prev) => {
        if (!prev) return null
        return {
          ...prev,
          endX: canvasPosition.x,
          endY: canvasPosition.y,
          isValidTarget,
          targetNodeId: targetNode?.id,
        }
      })
    },
    [connectionPreview, nodes, connections, clientToCanvasPosition],
  )

  // Manipula fim de arrasto do indicador plus
  const handlePlusIndicatorDragEnd = useCallback(
    (position: Position) => {
      if (!connectionPreview) return

      // Converte posição do cliente para posição do canvas
      const canvasPosition = clientToCanvasPosition(position.x, position.y)

      // Encontra nó alvo com uma pequena margem para facilitar o alvo
      const targetNode = findNodeAtPoint(canvasPosition, nodes, connectionPreview.sourceNodeId, 10)

      // Verifica se temos um nó alvo válido
      let validTarget = targetNode && connectionPreview.isValidTarget ? targetNode : null

      // Se não temos um alvo válido, mas tivemos um recentemente (dentro de 300ms),
      // use esse como fallback para melhorar a experiência do usuário
      if (!validTarget && lastValidTargetRef.current) {
        const timeSinceLastValid = Date.now() - lastValidTargetRef.current.timestamp
        if (timeSinceLastValid < 300) {
          // 300ms de tolerância
          validTarget = nodes.find((node) => node.id === lastValidTargetRef.current?.nodeId) || null
        }
      }

      // Se encontramos um nó alvo válido, cria uma conexão
      if (validTarget) {
        const connectionId = `conn-${nanoid(6)}`
        addConnection(connectionPreview.sourceNodeId, validTarget.id, "bezier", connectionId)
      }

      // Limpa visualização de conexão
      setConnectionPreview(null)
      lastValidTargetRef.current = null
    },
    [connectionPreview, nodes, addConnection, clientToCanvasPosition],
  )

  // Inicia o arrasto de conexão de porta
  const startPortConnectionDrag = useCallback(
    (nodeId: string, portId: string, portType: "input" | "output", startPosition: Position) => {
      setPortConnectionDrag({
        sourceNodeId: nodeId,
        sourcePortId: portId,
        sourcePortType: portType,
        startX: startPosition.x,
        startY: startPosition.y,
        endX: startPosition.x,
        endY: startPosition.y,
        isValidTarget: false,
      })

      // Reseta o último nó alvo válido
      lastValidTargetRef.current = null
    },
    [],
  )

  // Atualiza o arrasto de conexão de porta
  const updatePortConnectionDrag = useCallback((position: Position, targetNodeId?: string, isValidTarget = false) => {
    setPortConnectionDrag((prev) => {
      if (!prev) return null

      // Atualiza o último nó alvo válido
      if (targetNodeId && isValidTarget) {
        lastValidTargetRef.current = {
          nodeId: targetNodeId,
          timestamp: Date.now(),
        }
      }

      return {
        ...prev,
        endX: position.x,
        endY: position.y,
        isValidTarget,
        targetNodeId,
      }
    })
  }, [])

  // Finaliza o arrasto de conexão de porta
  const finishPortConnectionDrag = useCallback((createConnection: (sourceId: string, targetId: string) => void) => {
    setPortConnectionDrag(null)
    lastValidTargetRef.current = null
  }, [])

  return {
    connectionPreview,
    setConnectionPreview,
    portConnectionDrag,
    setPortConnectionDrag,
    handlePlusIndicatorDragStart,
    handlePlusIndicatorDrag,
    handlePlusIndicatorDragEnd,
    startPortConnectionDrag,
    updatePortConnectionDrag,
    finishPortConnectionDrag,
  }
}
