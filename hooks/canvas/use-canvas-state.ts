"use client"

import { useState, useCallback, useMemo } from "react"
import type { Position, ContextMenuInfo, ConnectionContextMenuInfo, CanvasContextMenuInfo } from "@/types/workflow"

interface UseCanvasStateProps {
  initialSelectedNodes?: string[]
  initialSelectedNode?: string | null
}

/**
 * Hook para gerenciar o estado do canvas, incluindo seleções, menus de contexto e painéis.
 *
 * @param props Propriedades iniciais para o estado do canvas
 * @returns Estado e funções para gerenciar o canvas
 */
export function useCanvasState({ initialSelectedNodes = [], initialSelectedNode = null }: UseCanvasStateProps = {}) {
  // Estado para menus de contexto
  const [nodeContextMenu, setNodeContextMenu] = useState<ContextMenuInfo | null>(null)
  const [connectionContextMenu, setConnectionContextMenu] = useState<ConnectionContextMenuInfo | null>(null)
  const [canvasContextMenu, setCanvasContextMenu] = useState<CanvasContextMenuInfo | null>(null)

  // Estado para paleta de comandos e atalhos de teclado
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  // Estado para painel de nós
  const [showNodePanel, setShowNodePanel] = useState(false)
  const [nodePanelPosition, setNodePanelPosition] = useState<Position | null>(null)

  // Estado para nós selecionados
  const [selectedNodes, setSelectedNodes] = useState<string[]>(initialSelectedNodes)
  const [selectedNode, setSelectedNode] = useState<string | null>(initialSelectedNode)

  // Verifica se algum menu de contexto está aberto
  const isAnyContextMenuOpen = useMemo(() => {
    return Boolean(nodeContextMenu || connectionContextMenu || canvasContextMenu)
  }, [nodeContextMenu, connectionContextMenu, canvasContextMenu])

  // Limpa todos os menus de contexto
  const clearContextMenus = useCallback(() => {
    setNodeContextMenu(null)
    setConnectionContextMenu(null)
    setCanvasContextMenu(null)
  }, [])

  // Limpa todas as seleções
  const clearSelections = useCallback(() => {
    setSelectedNodes([])
    setSelectedNode(null)
  }, [])

  // Abre o painel de nós em uma posição específica
  const openNodePanelAtPosition = useCallback((position: Position) => {
    setShowNodePanel(true)
    setNodePanelPosition(position)
  }, [])

  // Alterna o painel de nós
  const toggleNodePanel = useCallback(() => {
    setShowNodePanel((prev) => !prev)
    setNodePanelPosition(null) // Reseta posição ao alternar
  }, [])

  // Seleciona um nó, opcionalmente adicionando à seleção múltipla
  const selectNode = useCallback((nodeId: string, isMultiSelect = false) => {
    setSelectedNodes((prev) => {
      if (isMultiSelect) {
        // Se já estiver selecionado, remova-o
        if (prev.includes(nodeId)) {
          return prev.filter((id) => id !== nodeId)
        }
        // Caso contrário, adicione-o à seleção
        return [...prev, nodeId]
      }
      // Seleção única
      return [nodeId]
    })

    // Atualiza o nó selecionado atual
    setSelectedNode(nodeId)
  }, [])

  return {
    // Estado
    nodeContextMenu,
    connectionContextMenu,
    canvasContextMenu,
    showCommandPalette,
    showKeyboardShortcuts,
    showNodePanel,
    nodePanelPosition,
    selectedNodes,
    selectedNode,
    isAnyContextMenuOpen,

    // Setters
    setNodeContextMenu,
    setConnectionContextMenu,
    setCanvasContextMenu,
    setShowCommandPalette,
    setShowKeyboardShortcuts,
    setShowNodePanel,
    setNodePanelPosition,
    setSelectedNodes,
    setSelectedNode,

    // Helpers
    clearContextMenus,
    clearSelections,
    openNodePanelAtPosition,
    toggleNodePanel,
    selectNode,
  }
}
