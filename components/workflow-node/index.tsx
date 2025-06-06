"use client"

import type React from "react"
import { useState, useCallback, memo, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { NodeQuickActions } from "../node-quick-actions"
import type { Node } from "@/types/workflow"
import { NodeIcon } from "../canvas/node-icon"
import { NodePort } from "./node-port"

interface WorkflowNodeProps {
  /** O objeto de dados do nó */
  node: Node
  /** Se o nó está atualmente selecionado */
  isSelected: boolean
  /** Manipulador para seleção de nó */
  onSelect: (nodeId: string, multiple: boolean) => void
  /** Manipulador para iniciar operações de arrasto de nó */
  onDragStart: (e: React.MouseEvent, nodeId: string) => void
  /** Manipulador para eventos de duplo clique */
  onDoubleClick: () => void
  /** Manipulador para eventos de menu de contexto */
  onContextMenu: (e: React.MouseEvent) => void
  /** Manipulador para início de arrasto de porta */
  onPortDragStart: (e: React.MouseEvent) => void
}

/**
 * Renderiza um nó de fluxo de trabalho com suas portas, ícone e elementos interativos.
 * Manipula seleção, arrasto e outras interações do usuário.
 */
function WorkflowNodeComponent({
  node,
  isSelected,
  onSelect,
  onDragStart,
  onDoubleClick,
  onContextMenu,
  onPortDragStart,
}: WorkflowNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  // Manipula mouse enter event
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)

    // Limpa qualquer timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Mostra ações rápidas após um pequeno atraso
    timeoutRef.current = setTimeout(() => {
      setShowQuickActions(true)
    }, 200)
  }, [])

  // Manipula mouse leave event
  const handleMouseLeave = useCallback(() => {
    // Verifica se o mouse está sobre as ações rápidas
    const isOverQuickActions = document.querySelector(".node-quick-actions:hover")
    if (isOverQuickActions) {
      return // Não esconde se estiver sobre as ações rápidas
    }

    setIsHovered(false)

    // Limpa qualquer timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Pequeno atraso antes de esconder para permitir mover para os botões
    setTimeout(() => {
      // Verifica novamente se o mouse está sobre as ações rápidas antes de esconder
      const isStillOverQuickActions = document.querySelector(".node-quick-actions:hover")
      if (!isStillOverQuickActions) {
        setShowQuickActions(false)
      }
    }, 100)
  }, [])

  // Limpa timeouts na desmontagem
  useEffect(() => {
    // Função para manipular quando o mouse sai das ações rápidas
    const handleQuickActionsMouseLeave = () => {
      // Pequeno atraso para verificar se o mouse voltou para o nó
      setTimeout(() => {
        const isOverNode = document.querySelector(`[data-node-id="${node.id}"]:hover`)
        if (!isOverNode) {
          setIsHovered(false)
          setShowQuickActions(false)
        }
      }, 100)
    }

    // Adiciona event listener quando as ações rápidas são mostradas
    if (showQuickActions) {
      const quickActionsEl = document.querySelector(".node-quick-actions")
      if (quickActionsEl) {
        quickActionsEl.addEventListener("mouseleave", handleQuickActionsMouseLeave)
      }
    }

    // Limpeza
    return () => {
      const quickActionsEl = document.querySelector(".node-quick-actions")
      if (quickActionsEl) {
        quickActionsEl.removeEventListener("mouseleave", handleQuickActionsMouseLeave)
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [node.id, showQuickActions])

  // Manipula clique no nó
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect(node.id, e.ctrlKey || e.metaKey || e.shiftKey)
    },
    [node.id, onSelect],
  )

  // Manipula início de arrasto do nó
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDragStart(e, node.id)
    },
    [node.id, onDragStart],
  )

  // Manipula duplo clique no nó
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDoubleClick()
    },
    [onDoubleClick],
  )

  // Manipula menu de contexto do nó
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onContextMenu(e)
    },
    [onContextMenu],
  )

  // Determina largura e altura do nó - tamanho consistente 70x70
  const nodeWidth = node.width || 70
  const nodeHeight = node.height || 70

  // Renderiza as portas de entrada
  const renderInputPorts = () => {
    if (!node.inputs || node.inputs.length === 0) return null

    return (
      <div className="input-ports">
        {node.inputs.map((input: string, index: number) => {
          const top = `${nodeHeight * 0.5 + (index - (node.inputs.length - 1) / 2) * 20}px`

          return (
            <NodePort
              key={`input-${input}`}
              portId={input}
              portType="input"
              nodeId={node.id}
              position={{ top, left: "-4px" }}
              onMouseDown={onPortDragStart}
            />
          )
        })}
      </div>
    )
  }

  // Renderiza as portas de saída
  const renderOutputPorts = () => {
    if (!node.outputs || node.outputs.length === 0) return null

    return (
      <div className="output-ports">
        {node.outputs.map((output: string, index: number) => {
          const top = `${nodeHeight * 0.5 + (index - (node.outputs.length - 1) / 2) * 20}px`

          return (
            <NodePort
              key={`output-${output}`}
              portId={output}
              portType="output"
              nodeId={node.id}
              position={{ top, right: "-4px" }}
              onMouseDown={onPortDragStart}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div
      ref={nodeRef}
      className="absolute workflow-node"
      style={{
        top: node.position.y,
        left: node.position.x,
        width: nodeWidth,
        zIndex: isSelected || isHovered ? 20 : 10,
      }}
      data-node-id={node.id}
      data-node-type={node.type}
    >
      {/* Ações rápidas - visíveis quando hover */}
      {showQuickActions && (
        <div className="node-quick-actions">
          <NodeQuickActions onEditClick={onDoubleClick} nodeWidth={nodeWidth} nodeId={node.id} />
        </div>
      )}

      {/* Contêiner do nó - fundo completamente branco */}
      <div
        className={cn(
          "relative rounded-md border shadow-sm bg-white cursor-move pointer-events-auto flex items-center justify-center transition-all duration-150",
          isSelected ? "ring-2 ring-primary shadow-md" : isHovered ? "ring-1 ring-primary/40 shadow-sm" : "",
        )}
        style={{
          width: nodeWidth,
          height: nodeHeight,
        }}
        onMouseDown={handleDragStart}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={`${node.name} node`}
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
      >
        {/* Ícone centralizado */}
        <NodeIcon type={node.type} />

        {/* Portas de entrada - design retangular */}
        {renderInputPorts()}

        {/* Portas de saída - design semi-círculo (mais delicado) */}
        {renderOutputPorts()}
      </div>

      {/* Rótulo do nó - sempre mostrado abaixo do nó */}
      <div className="mt-2 text-sm font-medium text-center text-foreground/80 truncate max-w-full" title={node.name}>
        {node.name}
      </div>
    </div>
  )
}

export const WorkflowNode = memo(WorkflowNodeComponent)
