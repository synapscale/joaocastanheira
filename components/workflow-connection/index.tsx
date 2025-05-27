"use client"

import type React from "react"
import { useMemo, memo, useState, useRef, useEffect, useCallback } from "react"
import type { Connection } from "@/types/workflow"
import { useTheme } from "next-themes"
import { useWorkflow } from "@/context/workflow-context"
import { calculateConnectionPath } from "@/utils/connection-utils"
import { ConnectionActionButtons } from "../connection-action-buttons"
import { ConnectionLabel } from "../canvas/connection-label"
import { ConnectionEndpoints } from "./connection-endpoints"
import { ConnectionArrow } from "./connection-arrow"

interface WorkflowConnectionProps {
  /** O objeto de dados da conexão */
  connection: Connection
  /** Se a conexão está atualmente selecionada */
  isSelected?: boolean
  /** Manipulador para eventos de menu de contexto */
  onContextMenu: (e: React.MouseEvent, connectionId: string) => void
  /** Manipulador para solicitação de edição de rótulo */
  onLabelEditRequest?: (connectionId: string, position: { x: number; y: number }) => void
}

/**
 * Renderiza uma conexão entre dois nós no fluxo de trabalho.
 * Manipula estados de hover, botões de ação e estilo de conexão.
 */
function WorkflowConnectionComponent({
  connection,
  isSelected = false,
  onContextMenu,
  onLabelEditRequest,
}: WorkflowConnectionProps) {
  const { theme } = useTheme()
  const { nodes, updateConnectionLabel } = useWorkflow()
  const [isHovered, setIsHovered] = useState(false)
  const [isActionHovered, setIsActionHovered] = useState(false)
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const pathRef = useRef<SVGPathElement>(null)
  const hoverAreaRef = useRef<SVGPathElement>(null)
  const [midPoint, setMidPoint] = useState({ x: 0, y: 0 })
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectionRef = useRef<SVGGElement>(null)

  // Calcula dados do caminho de conexão com base nos nós conectados
  const connectionData = useMemo(() => {
    if (!Array.isArray(nodes) || nodes.length === 0) return null

    const fromNode = nodes.find((n) => n.id === connection.from)
    const toNode = nodes.find((n) => n.id === connection.to)

    if (!fromNode || !toNode) {
      console.warn(`Connection ${connection.id} references non-existent nodes`)
      return null
    }

    return calculateConnectionPath(fromNode, toNode, connection.type || "bezier")
  }, [connection.from, connection.to, connection.type, nodes])

  // Calcula estilo de conexão com base no estado, tema e estilo personalizado
  const connectionStyle = useMemo(() => {
    const isDark = theme === "dark"

    // Cores padrão com base no estado e tema
    const defaultColor = isSelected
      ? "#3b82f6" // blue-500
      : isHovered || isActionHovered
        ? "#f97316" // orange-500
        : isDark
          ? "#9ca3af" // gray-400 para modo escuro
          : "#6b7280" // gray-500 para modo claro

    // Usa cor personalizada se fornecida, caso contrário usa padrão
    const color = connection.style?.color || defaultColor

    // Determina largura do traço com base no estado e largura personalizada
    const width = connection.style?.width || (isSelected || isHovered || isActionHovered ? 2 : 1.5)

    // Determina dasharray do traço com base no tipo de conexão e propriedade dashed
    const dasharray = connection.style?.dashed ? "5,3" : connection.type === "step" ? "5,3" : ""

    return {
      color,
      width: width.toString(),
      dasharray,
      animated: connection.style?.animated || false,
    }
  }, [isSelected, isHovered, isActionHovered, theme, connection.type, connection.style])

  // Calcula o ponto médio do caminho de conexão
  const calculateMidPoint = useCallback(() => {
    if (!pathRef.current) return

    try {
      const pathLength = pathRef.current.getTotalLength()
      if (pathLength > 0) {
        const point = pathRef.current.getPointAtLength(pathLength / 2)
        setMidPoint({ x: point.x, y: point.y })
      } else if (connectionData) {
        // Fallback se o comprimento do caminho for 0
        const { fromX, fromY, toX, toY } = connectionData
        setMidPoint({
          x: fromX !== undefined && toX !== undefined ? (fromX + toX) / 2 : 0,
          y: fromY !== undefined && toY !== undefined ? (fromY + toY) / 2 : 0,
        })
      }
    } catch (error) {
      // Cálculo de fallback se getTotalLength falhar
      if (connectionData) {
        const { fromX, fromY, toX, toY } = connectionData
        setMidPoint({
          x: fromX !== undefined && toX !== undefined ? (fromX + toX) / 2 : 0,
          y: fromY !== undefined && toY !== undefined ? (fromY + toY) / 2 : 0,
        })
      }
    }
  }, [connectionData])

  // Calcula ponto médio quando os dados de conexão mudam
  useEffect(() => {
    if (connectionData && pathRef.current) {
      // Calcula imediatamente e depois mais uma vez após um pequeno atraso para garantir precisão
      calculateMidPoint()
      const timer = setTimeout(calculateMidPoint, 50)
      return () => clearTimeout(timer)
    }
  }, [connectionData, calculateMidPoint])

  // Manipula evento mouse enter para a conexão
  const handleMouseEnter = useCallback(() => {
    // Limpa qualquer timeout existente
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    setIsHovered(true)
    calculateMidPoint()
  }, [calculateMidPoint])

  // Manipula evento mouse leave para a conexão
  const handleMouseLeave = useCallback(() => {
    // Só define isHovered como false se os botões de ação não estiverem sendo hover
    if (!isActionHovered) {
      // Usa um pequeno atraso para evitar cintilação
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false)
      }, 100) // Atraso aumentado para melhor UX
    }
  }, [isActionHovered])

  // Manipula duplo clique na conexão para editar o rótulo
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (onLabelEditRequest) {
        // Obtém a posição para o editor de rótulo
        const position = { x: e.clientX, y: e.clientY }
        onLabelEditRequest(connection.id, position)
      } else {
        setIsEditingLabel(true)
      }
    },
    [connection.id, onLabelEditRequest],
  )

  // Manipula solicitação de edição de rótulo
  const handleLabelEditRequest = useCallback(() => {
    if (connectionRef.current && onLabelEditRequest) {
      const bbox = connectionRef.current.getBoundingClientRect()
      const position = {
        x: bbox.left + bbox.width / 2,
        y: bbox.top + bbox.height / 2,
      }
      onLabelEditRequest(connection.id, position)
    } else {
      setIsEditingLabel(true)
    }
  }, [connection.id, onLabelEditRequest])

  // Manipula conclusão da edição de rótulo
  const handleLabelEditComplete = useCallback(
    (newLabel: string) => {
      if (newLabel !== connection.label) {
        updateConnectionLabel(connection.id, newLabel)
      }
      setIsEditingLabel(false)
    },
    [connection.id, connection.label, updateConnectionLabel],
  )

  // Manipula estado de hover dos botões de ação
  const handleActionHover = useCallback(
    (hovered: boolean) => {
      setIsActionHovered(hovered)

      // Limpa qualquer timeout existente
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }

      // Se os botões de ação não estiverem mais hover e a conexão também não estiver hover,
      // então podemos esconder os botões de ação
      if (!hovered && !isHovered) {
        hoverTimeoutRef.current = setTimeout(() => {
          setIsHovered(false)
        }, 100) // Atraso aumentado para melhor UX
      }
    },
    [isHovered],
  )

  // Limpa timeouts na desmontagem
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Determina se devemos mostrar elementos interativos
  const showInteractiveElements = isHovered || isActionHovered || isSelected

  if (!connectionData || !connectionData.path) return null

  return (
    <g
      ref={connectionRef}
      className="workflow-connection"
      data-hovered={showInteractiveElements ? "true" : "false"}
      data-connection-id={connection.id}
      data-selected={isSelected ? "true" : "false"}
    >
      {/* Caminho invisível mais largo para melhor detecção de hover */}
      <path
        ref={hoverAreaRef}
        d={connectionData.path}
        fill="none"
        stroke="transparent"
        strokeWidth="12"
        style={{ cursor: "pointer" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        pointerEvents="stroke"
        aria-hidden="true"
      />

      {/* Caminho principal da conexão */}
      <path
        ref={pathRef}
        d={connectionData.path}
        stroke={connectionStyle.color}
        strokeWidth={connectionStyle.width}
        strokeDasharray={connectionStyle.dasharray}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="stroke"
        className={`connection-path ${connectionStyle.animated ? "animated-path" : ""}`}
        style={{
          transition: "stroke 0.2s ease",
          cursor: "pointer",
        }}
        onContextMenu={(e) => onContextMenu(e, connection.id)}
      />

      {/* Pontos de extremidade da conexão */}
      <ConnectionEndpoints
        fromX={connectionData.fromX}
        fromY={connectionData.fromY}
        toX={connectionData.toX}
        toY={connectionData.toY}
      />

      {/* Seta no final da conexão */}
      <ConnectionArrow toX={connectionData.toX} toY={connectionData.toY} color={connectionStyle.color} />

      {/* Rótulo da conexão */}
      <ConnectionLabel
        connection={connection}
        midPoint={midPoint}
        isEditing={isEditingLabel}
        onEditRequest={handleLabelEditRequest}
        onEditComplete={handleLabelEditComplete}
        isHovered={showInteractiveElements}
      />

      {/* Botões de ação da conexão - mostrar apenas quando hover */}
      {showInteractiveElements && midPoint.x !== 0 && midPoint.y !== 0 && (
        <ConnectionActionButtons connection={connection} position={midPoint} onHoverChange={handleActionHover} />
      )}
    </g>
  )
}

export const WorkflowConnection = memo(WorkflowConnectionComponent)
