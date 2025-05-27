"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"

/**
 * Opções para o hook useNodeDrag
 */
interface UseNodeDragOptions {
  /** Limiar em pixels antes de considerar um movimento do mouse como um arrasto */
  dragThreshold?: number
}

/**
 * Tipo de retorno para o hook useNodeDrag
 */
interface UseNodeDragReturn {
  /** Se o nó está sendo arrastado atualmente */
  isDragging: boolean
  /** A posição inicial do arrasto */
  dragStartPosition: { x: number; y: number } | null
  /** Manipulador para eventos de mouse down */
  handleMouseDown: (e: React.MouseEvent) => void
  /** Manipulador para eventos de mouse move */
  handleMouseMove: (e: React.MouseEvent) => void
  /** Manipulador para eventos de mouse up */
  handleMouseUp: () => void
  /** Manipulador para eventos de clique que respeita o estado de arrasto */
  handleClick: (e: React.MouseEvent, callback: (e: React.MouseEvent) => void) => void
}

/**
 * Hook personalizado para gerenciar a lógica de arrasto de nós.
 *
 * Fornece manipuladores e estado para diferenciar entre cliques e arrastos.
 * Ajuda a prevenir cliques acidentais ao arrastar nós.
 *
 * @param options - Opções de configuração para o comportamento de arrasto
 * @returns Objeto contendo estado de arrasto e manipuladores de eventos
 */
export function useNodeDrag({ dragThreshold = 5 }: UseNodeDragOptions = {}): UseNodeDragReturn {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null)
  const dragStartTimeRef = useRef<number | null>(null)

  /**
   * Inicia o processo de arrasto quando o mouse é pressionado
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragStartPosition({ x: e.clientX, y: e.clientY })
    dragStartTimeRef.current = Date.now()
  }, [])

  /**
   * Atualiza o estado de arrasto baseado no movimento do mouse
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragStartPosition) {
        const dx = Math.abs(e.clientX - dragStartPosition.x)
        const dy = Math.abs(e.clientY - dragStartPosition.y)

        // Se o movimento exceder o limiar, considere como um arrasto
        if (dx > dragThreshold || dy > dragThreshold) {
          setIsDragging(true)
        }
      }
    },
    [dragStartPosition, dragThreshold],
  )

  /**
   * Finaliza o processo de arrasto
   */
  const handleMouseUp = useCallback(() => {
    // Mantém o estado isDragging por um curto período para prevenir eventos de clique
    // Isso será resetado pelo manipulador de clique se for chamado
    setTimeout(() => {
      if (isDragging) {
        setIsDragging(false)
      }
    }, 50)

    setDragStartPosition(null)
    dragStartTimeRef.current = null
  }, [isDragging])

  /**
   * Gerencia eventos de clique considerando o estado de arrasto
   */
  const handleClick = useCallback(
    (e: React.MouseEvent, callback: (e: React.MouseEvent) => void) => {
      // Apenas aciona o callback de clique se não estiver arrastando
      if (!isDragging) {
        callback(e)
      }

      // Reseta o estado de arrasto
      setIsDragging(false)
    },
    [isDragging],
  )

  return {
    isDragging,
    dragStartPosition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleClick,
  }
}
