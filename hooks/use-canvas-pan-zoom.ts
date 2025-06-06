"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"

/**
 * Interface para as opções do hook useCanvasPanZoom
 */
interface UseCanvasPanZoomOptions {
  /** Nível de zoom mínimo permitido */
  minZoom?: number
  /** Nível de zoom máximo permitido */
  maxZoom?: number
  /** Nível de zoom inicial */
  initialZoom?: number
  /** Posição X inicial */
  initialX?: number
  /** Posição Y inicial */
  initialY?: number
  /** Sensibilidade do zoom ao usar a roda do mouse */
  zoomSensitivity?: number
}

/**
 * Interface para o retorno do hook useCanvasPanZoom
 */
interface UseCanvasPanZoomReturn {
  /** Nível de zoom atual */
  zoom: number
  /** Posição X atual */
  x: number
  /** Posição Y atual */
  y: number
  /** Função para aumentar o zoom */
  zoomIn: () => void
  /** Função para diminuir o zoom */
  zoomOut: () => void
  /** Função para resetar o zoom e a posição */
  resetView: () => void
  /** Função para lidar com o evento de roda do mouse */
  handleWheel: (e: React.WheelEvent) => void
  /** Função para lidar com o evento de mouse down */
  handleMouseDown: (e: React.MouseEvent) => void
  /** Função para lidar com o evento de mouse move */
  handleMouseMove: (e: React.MouseEvent) => void
  /** Função para lidar com o evento de mouse up */
  handleMouseUp: () => void
  /** Referência para o elemento do canvas */
  canvasRef: React.RefObject<HTMLDivElement>
  /** Estilo de transformação CSS para o canvas */
  transformStyle: string
}

/**
 * Hook personalizado para gerenciar o pan e zoom de um canvas.
 *
 * Fornece funcionalidades para:
 * - Zoom in/out com roda do mouse ou botões
 * - Pan (arrastar) o canvas
 * - Resetar a visualização
 *
 * @param options - Opções de configuração para o pan e zoom
 * @returns Objeto com estado e funções para controlar o pan e zoom
 */
export function useCanvasPanZoom({
  minZoom = 0.1,
  maxZoom = 2,
  initialZoom = 1,
  initialX = 0,
  initialY = 0,
  zoomSensitivity = 0.001,
}: UseCanvasPanZoomOptions = {}): UseCanvasPanZoomReturn {
  // Estado para controlar o zoom e posição
  const [zoom, setZoom] = useState(initialZoom)
  const [position, setPosition] = useState({ x: initialX, y: initialY })

  // Referências para o elemento do canvas e estado de arrastar
  const canvasRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const lastPositionRef = useRef({ x: 0, y: 0 })

  /**
   * Aumenta o zoom em 10% até o máximo definido
   */
  const zoomIn = useCallback(() => {
    setZoom((prevZoom) => Math.min(prevZoom * 1.1, maxZoom))
  }, [maxZoom])

  /**
   * Diminui o zoom em 10% até o mínimo definido
   */
  const zoomOut = useCallback(() => {
    setZoom((prevZoom) => Math.max(prevZoom * 0.9, minZoom))
  }, [minZoom])

  /**
   * Reseta o zoom e a posição para os valores iniciais
   */
  const resetView = useCallback(() => {
    setZoom(initialZoom)
    setPosition({ x: initialX, y: initialY })
  }, [initialZoom, initialX, initialY])

  /**
   * Manipula o evento de roda do mouse para zoom
   * Faz zoom centralizado na posição do cursor
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()

      // Calcula o novo zoom baseado na direção da roda
      const delta = -e.deltaY * zoomSensitivity
      const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom * (1 + delta)))

      if (newZoom === zoom) return

      // Calcula a posição do cursor relativa ao canvas
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calcula a nova posição para manter o cursor no mesmo ponto após o zoom
      const newX = mouseX - (mouseX - position.x) * (newZoom / zoom)
      const newY = mouseY - (mouseY - position.y) * (newZoom / zoom)

      setZoom(newZoom)
      setPosition({ x: newX, y: newY })
    },
    [zoom, position, minZoom, maxZoom, zoomSensitivity],
  )

  /**
   * Inicia o arrastar do canvas
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Apenas inicia o arrastar com o botão do meio ou se a tecla espaço estiver pressionada
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      e.preventDefault()
      isDraggingRef.current = true
      lastPositionRef.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  /**
   * Atualiza a posição do canvas durante o arrastar
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return

    const dx = e.clientX - lastPositionRef.current.x
    const dy = e.clientY - lastPositionRef.current.y

    setPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }))

    lastPositionRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  /**
   * Finaliza o arrastar do canvas
   */
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  /**
   * Adiciona e remove event listeners globais para mouse up
   * Isso garante que o arrastar termine mesmo se o mouse sair do canvas
   */
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [])

  // Calcula o estilo de transformação CSS para o canvas
  const transformStyle = `translate(${position.x}px, ${position.y}px) scale(${zoom})`

  return {
    zoom,
    x: position.x,
    y: position.y,
    zoomIn,
    zoomOut,
    resetView,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    canvasRef,
    transformStyle,
  }
}
