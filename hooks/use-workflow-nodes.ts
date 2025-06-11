"use client"

import { useCallback } from "react"
import { useWorkflow } from "@/context"
import type { Node } from "@/types/workflow"

/**
 * Interface para o retorno do hook useWorkflowNodes
 */
interface UseWorkflowNodesReturn {
  /** Lista de todos os nós no workflow */
  nodes: Node[]
  /** Função para adicionar um novo nó */
  addNode: (node: Node) => void
  /** Função para atualizar um nó */
  updateNode: (id: string, updates: Partial<Node>) => void
  /** Função para atualizar a posição de um nó */
  updateNodePosition: (id: string, position: { x: number; y: number }) => void
  /** Função para remover um nó */
  removeNode: (id: string) => void
  /** Função para duplicar um nó */
  duplicateNode: (id: string) => void
  /** Função para bloquear um nó */
  lockNode: (id: string) => void
  /** Função para desbloquear um nó */
  unlockNode: (id: string) => void
  /** Função para alinhar nós */
  alignNodes: (nodeIds: string[], direction: "left" | "right" | "center" | "middle") => void
  /** Nó selecionado atualmente */
  selectedNode: Node | null
  /** IDs dos nós selecionados */
  selectedNodes: string[]
  /** Função para definir o nó selecionado */
  setSelectedNode: (node: Node | null) => void
  /** Função para definir os nós selecionados */
  setSelectedNodes: (nodeIds: string[]) => void
  /** Função para obter um nó pelo ID */
  getNodeById: (id: string) => Node | null
  /** Função para obter nós por tipo */
  getNodesByType: (type: string) => Node[]
  /** Função para selecionar um nó */
  selectNode: (nodeId: string, addToSelection?: boolean) => void
  /** Função para desselecionar todos os nós */
  deselectAllNodes: () => void
  /** Agrupa nós selecionados */
  groupSelectedNodes: (groupName: string) => void
  /** Remove nós de um grupo */
  ungroupNodes: (groupId: string) => void
}

/**
 * Hook personalizado para gerenciar nós do workflow.
 *
 * Fornece funções para adicionar, atualizar, remover e consultar nós.
 * Também gerencia a seleção de nós.
 *
 * @returns Objeto contendo estado e funções para gerenciar nós
 */
export function useWorkflowNodes(): UseWorkflowNodesReturn {
  const {
    nodes,
    addNode,
    updateNode,
    updateNodePosition,
    removeNode,
    duplicateNode,
    lockNode,
    unlockNode,
    alignNodes,
    selectedNode,
    selectedNodes,
    setSelectedNode,
    setSelectedNodes,
  } = useWorkflow()

  /**
   * Obtém um nó pelo ID
   */
  const getNodeById = useCallback(
    (id: string): Node | null => {
      return nodes.find((node) => node.id === id) || null
    },
    [nodes],
  )

  /**
   * Obtém nós por tipo
   */
  const getNodesByType = useCallback(
    (type: string): Node[] => {
      return nodes.filter((node) => node.type === type)
    },
    [nodes],
  )

  /**
   * Seleciona um nó, opcionalmente adicionando à seleção existente
   */
  const selectNode = useCallback(
    (nodeId: string, addToSelection = false): void => {
      const node = getNodeById(nodeId)
      if (!node) return

      if (addToSelection) {
        setSelectedNodes((prev) => (prev.includes(nodeId) ? prev : [...prev, nodeId]))
      } else {
        setSelectedNode(node)
        setSelectedNodes([nodeId])
      }
    },
    [getNodeById, setSelectedNode, setSelectedNodes],
  )

  /**
   * Desseleciona todos os nós
   */
  const deselectAllNodes = useCallback((): void => {
    setSelectedNode(null)
    setSelectedNodes([])
  }, [setSelectedNode, setSelectedNodes])

  /**
   * Agrupa nós selecionados
   */
  const groupSelectedNodes = useCallback(
    (groupName: string): void => {
      if (selectedNodes.length < 2) return

      // Criar um novo grupo
      const groupId = `group-${Date.now()}`

      // Atualizar os nós selecionados para pertencerem ao grupo
      selectedNodes.forEach((nodeId) => {
        updateNode(nodeId, { groupId })
      })

      // Opcionalmente, adicionar o grupo ao estado
      // addGroup({ id: groupId, name: groupName, nodeIds: selectedNodes })
    },
    [selectedNodes, updateNode],
  )

  /**
   * Remove nós de um grupo
   */
  const ungroupNodes = useCallback(
    (groupId: string): void => {
      // Encontrar todos os nós que pertencem ao grupo
      const groupNodes = nodes.filter((node) => node.groupId === groupId)

      // Remover a associação de grupo
      groupNodes.forEach((node) => {
        updateNode(node.id, { groupId: undefined })
      })

      // Opcionalmente, remover o grupo do estado
      // removeGroup(groupId)
    },
    [nodes, updateNode],
  )

  return {
    nodes,
    addNode,
    updateNode,
    updateNodePosition,
    removeNode,
    duplicateNode,
    lockNode,
    unlockNode,
    alignNodes,
    selectedNode,
    selectedNodes,
    setSelectedNode,
    setSelectedNodes,
    getNodeById,
    getNodesByType,
    selectNode,
    deselectAllNodes,
    groupSelectedNodes,
    ungroupNodes,
  }
}
