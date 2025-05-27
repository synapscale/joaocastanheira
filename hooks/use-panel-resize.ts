"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"

/**
 * Hook para gerenciar o estado de redimensionamento de painéis com persistência no localStorage
 * @param defaultSizes - Tamanhos iniciais dos painéis
 * @param storageKey - Chave para salvar os tamanhos no localStorage
 * @returns Tupla contendo os tamanhos atuais e uma função para atualizá-los
 */
export function usePanelResizeState(defaultSizes: number[], storageKey: string) {
  const [sizes, setSizes] = useState<number[]>(defaultSizes)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Carregar os tamanhos salvos apenas uma vez na montagem do componente
  useEffect(() => {
    try {
      const savedSizes = localStorage.getItem(storageKey)
      if (savedSizes) {
        const parsed = JSON.parse(savedSizes)
        if (Array.isArray(parsed) && parsed.length === defaultSizes.length) {
          setSizes(parsed)
        }
      }
    } catch (e) {
      console.error("Failed to load saved panel sizes", e)
    }
  }, [storageKey, defaultSizes.length])

  // Função para atualizar os tamanhos com debounce
  const updateSizes = useCallback(
    (newSizes: number[]) => {
      setSizes(newSizes)

      // Cancelar o timer anterior se existir
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Definir um novo timer para salvar no localStorage
      debounceTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newSizes))
        } catch (e) {
          console.error("Failed to save panel sizes", e)
        }
      }, 200) // 200ms de debounce
    },
    [storageKey],
  )

  // Limpar o timer quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return [sizes, updateSizes] as const
}

/**
 * Opções para o hook usePanelResize
 */
interface UsePanelResizeOptions {
  /** Largura inicial do painel em pixels */
  initialWidth?: number
  /** Largura mínima do painel em pixels */
  minWidth?: number
  /** Largura máxima do painel em pixels */
  maxWidth?: number
  /** Direção do redimensionamento */
  direction?: "left" | "right"
  /** Chave para salvar a largura no localStorage */
  storageKey?: string
}

/**
 * Tipo de retorno para o hook usePanelResize
 */
interface UsePanelResizeReturn {
  /** Largura atual do painel */
  width: number
  /** Se o redimensionamento está ativo */
  isResizing: boolean
  /** Manipulador para iniciar o redimensionamento */
  startResize: (e: React.MouseEvent) => void
  /** Referência para o elemento do painel */
  panelRef: React.RefObject<HTMLDivElement>
}

/**
 * Hook personalizado para gerenciar o redimensionamento de painéis.
 *
 * Permite que o usuário redimensione painéis arrastando uma borda.
 * Suporta persistência da largura no localStorage.
 *
 * @param options - Opções de configuração para o redimensionamento
 * @returns Objeto contendo estado e funções para controlar o redimensionamento
 */
export function usePanelResize({
  initialWidth = 300,
  minWidth = 200,
  maxWidth = 600,
  direction = "right",
  storageKey,
}: UsePanelResizeOptions = {}): UsePanelResizeReturn {
  // Carrega a largura salva do localStorage, se disponível
  const getSavedWidth = useCallback(() => {
    if (!storageKey || typeof window === "undefined") return initialWidth

    const saved = localStorage.getItem(storageKey)
    return saved ? Number.parseInt(saved, 10) : initialWidth
  }, [initialWidth, storageKey])

  const [width, setWidth] = useState(getSavedWidth)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  /**
   * Inicia o processo de redimensionamento
   */
  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
      startXRef.current = e.clientX
      startWidthRef.current = width
    },
    [width],
  )

  /**
   * Atualiza a largura durante o redimensionamento
   */
  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const delta = direction === "right" ? e.clientX - startXRef.current : startXRef.current - e.clientX

      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + delta))
      setWidth(newWidth)

      // Salva a largura no localStorage, se uma chave for fornecida
      if (storageKey && typeof window !== "undefined") {
        localStorage.setItem(storageKey, newWidth.toString())
      }
    },
    [isResizing, direction, minWidth, maxWidth, storageKey],
  )

  /**
   * Finaliza o processo de redimensionamento
   */
  const stopResize = useCallback(() => {
    setIsResizing(false)
  }, [])

  /**
   * Configura e limpa os event listeners globais para mouse move e mouse up
   */
  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResize)
      window.addEventListener("mouseup", stopResize)
    }

    return () => {
      window.removeEventListener("mousemove", handleResize)
      window.removeEventListener("mouseup", stopResize)
    }
  }, [isResizing, handleResize, stopResize])

  /**
   * Carrega a largura salva quando o componente é montado
   */
  useEffect(() => {
    setWidth(getSavedWidth())
  }, [getSavedWidth])

  return {
    width,
    isResizing,
    startResize,
    panelRef,
  }
}
