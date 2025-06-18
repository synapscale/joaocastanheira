"use client"

import type React from "react"

import { useState } from "react"
import { ChevronRight, ChevronDown, Code, GripVertical } from "lucide-react"
import type { ComponentNode } from "./component-tree"
import { useApp } from "@/context/app-context"

interface TreeNodeProps {
  node: ComponentNode
  level: number
  onSelect: (node: ComponentNode) => void
  selectedNodeId: string | null
  onDragStart?: (node: ComponentNode) => void
}

export default function TreeNode({ node, level, onSelect, selectedNodeId, onDragStart }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 2) // Auto-expandir os primeiros dois níveis
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedNodeId === node.id
  const { setLastAction, setDragState } = useApp()

  // Determina a cor do ícone com base no tipo de componente
  const getIconColor = () => {
    if (node.path.includes("/ui/")) return "text-blue-500 dark:text-blue-400" // Componentes UI
    if (node.path.includes("/chat/")) return "text-purple-500 dark:text-purple-400" // Componentes de chat
    return "text-gray-500 dark:text-gray-400" // Outros componentes
  }

  // Manipulador para iniciar o arrasto
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()

    // Certifique-se de que todos os dados relevantes sejam incluídos
    const componentData = {
      id: node.id,
      name: node.name,
      path: node.path,
      isHtmlElement: node.isHtmlElement,
      tagName: node.tagName,
      detectionMethod: node.detectionMethod,
      // Adicione quaisquer outros dados relevantes
    }

    // Define os dados que serão transferidos
    e.dataTransfer.setData("application/json", JSON.stringify(componentData))

    // Define o efeito de arrasto
    e.dataTransfer.effectAllowed = "copyMove"

    // Notifica o componente pai e atualiza o estado global
    if (onDragStart) {
      onDragStart(node)
    }

    // Atualiza o estado global com informações completas
    setLastAction(`Arrastando componente: ${node.name}`)
  }

  // Manipulador para o fim do arrasto
  const handleDragEnd = () => {
    // Limpa o estado de arrasto
    setDragState({
      isDragging: false,
      componentData: null,
      position: { x: 0, y: 0 },
    })
  }

  return (
    <div
      className={`flex flex-col group ${level === 0 ? "mt-1" : ""}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`flex items-center py-1 px-1 rounded-md ${
          isSelected
            ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
      >
        <div className="mr-1 opacity-0 group-hover:opacity-100 cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mr-1 h-5 w-5 flex items-center justify-center rounded-sm hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        ) : (
          <div className="mr-1 w-5"></div>
        )}

        <div
          className="flex items-center flex-1 cursor-pointer py-0.5 group"
          onClick={() => onSelect(node)}
          title={node.path}
        >
          <Code className={`h-3.5 w-3.5 mr-1.5 ${getIconColor()}`} />
          <span className="text-sm truncate">{node.name}</span>
          {node.isHtmlElement && (
            <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">{`<${node.tagName?.toLowerCase()}>`}</span>
          )}
          <GripVertical className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 cursor-grab" />
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="ml-2">
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedNodeId={selectedNodeId}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      )}
    </div>
  )
}
