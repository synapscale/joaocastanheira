"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import type { Position } from "@/types/workflow"
import { PlusIndicatorCircle } from "./plus-indicator-circle"
import { PlusIndicatorIcon } from "./plus-indicator-icon"

interface PlusIndicatorProps {
  x: number
  y: number
  sourceNodeId: string
  onClick: (e: React.MouseEvent, sourceNodeId: string) => void
  onDragStart: (sourceNodeId: string, position: Position) => void
  onDrag: (position: Position) => void
  onDragEnd: (position: Position) => void
}

/**
 * Componente que renderiza um indicador de adição (+) ao lado de um nó.
 * Permite adicionar novos nós ou criar conexões através de arrasto.
 */
export function PlusIndicator({ x, y, sourceNodeId, onClick, onDragStart, onDrag, onDragEnd }: PlusIndicatorProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Rastreia se estamos em uma operação potencial de clique
  const potentialClickRef = useRef(true)

  // Rastreia posição do mouse para determinar arrasto vs clique
  const startPosRef = useRef<Position | null>(null)

  // Limiar de arrasto em pixels - movimento além disso é considerado um arrasto
  const DRAG_THRESHOLD = 5

  // Manipula mouse down para iniciar potencial arrasto ou clique
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Apenas manipula botão esquerdo do mouse
      if (e.button !== 0) return

      // Previne padrão para evitar seleção de texto
      e.preventDefault()
      e.stopPropagation()

      // Inicializa variáveis de rastreamento
      potentialClickRef.current = true
      startPosRef.current = { x: e.clientX, y: e.clientY }

      // Adiciona event listeners para arrasto e soltar
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!startPosRef.current) return

        // Calcula distância movida
        const dx = moveEvent.clientX - startPosRef.current.x
        const dy = moveEvent.clientY - startPosRef.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Se movido além do limiar, é uma operação de arrasto
        if (distance > DRAG_THRESHOLD) {
          // Não é mais um clique potencial
          potentialClickRef.current = false

          // Se ainda não começamos a arrastar, inicia arrasto
          if (!isDragging) {
            setIsDragging(true)
            // Passa a posição de saída real do nó, não a posição do mouse
            onDragStart(sourceNodeId, { x, y })
          }

          // Continua operação de arrasto
          onDrag({ x: moveEvent.clientX, y: moveEvent.clientY })
        }
      }

      const handleMouseUp = (upEvent: MouseEvent) => {
        // Se estávamos arrastando, termina o arrasto
        if (!potentialClickRef.current) {
          setIsDragging(false)
          onDragEnd({ x: upEvent.clientX, y: upEvent.clientY })
        }
        // Se não movemos além do limiar, é um clique
        else if (potentialClickRef.current) {
          // Cria um evento React sintético a partir do evento nativo
          const syntheticEvent = {
            ...e,
            clientX: upEvent.clientX,
            clientY: upEvent.clientY,
            preventDefault: () => {},
            stopPropagation: () => {},
          } as React.MouseEvent

          onClick(syntheticEvent, sourceNodeId)
        }

        // Reseta variáveis de rastreamento
        potentialClickRef.current = true
        startPosRef.current = null
        setIsDragging(false)

        // Remove event listeners
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }

      // Adiciona event listeners
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    },
    [isDragging, onDragStart, onDrag, onDragEnd, onClick, sourceNodeId, x, y],
  )

  // Limpa event listeners quando o componente é desmontado
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", () => {})
      window.removeEventListener("mouseup", () => {})
    }
  }, [])

  // Manipula acessibilidade de teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onClick(e as unknown as React.MouseEvent, sourceNodeId)
      }
    },
    [onClick, sourceNodeId],
  )

  return (
    <g
      transform={`translate(${x - 8}, ${y - 8})`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      style={{ cursor: isDragging ? "grabbing" : "pointer" }}
      aria-label="Add node or connection"
      role="button"
      tabIndex={0}
      data-node-id={sourceNodeId}
      data-testid="plus-indicator"
    >
      <PlusIndicatorCircle isHovered={isHovered} />
      <PlusIndicatorIcon />
    </g>
  )
}
