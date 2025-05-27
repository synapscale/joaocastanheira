"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"

/**
 * Opções para o hook useDisclosure
 */
export interface UseDisclosureOptions {
  /**
   * Estado inicial
   * @default false
   * @example initialState: true
   */
  initialState?: boolean

  /**
   * Função chamada quando o estado muda
   * @example onStateChange: (isOpen) => console.log("Estado:", isOpen)
   */
  onStateChange?: (isOpen: boolean) => void

  /**
   * Função chamada quando o estado é aberto
   * @example onOpen: () => console.log("Aberto")
   */
  onOpen?: () => void

  /**
   * Função chamada quando o estado é fechado
   * @example onClose: () => console.log("Fechado")
   */
  onClose?: () => void

  /**
   * Se verdadeiro, fecha automaticamente após um período
   * @default false
   * @example autoClose: true
   */
  autoClose?: boolean

  /**
   * Tempo em milissegundos para fechar automaticamente
   * @default 5000
   * @example autoCloseTime: 3000
   */
  autoCloseTime?: number

  /**
   * Se verdadeiro, impede a abertura
   * @default false
   * @example preventOpen: true
   */
  preventOpen?: boolean

  /**
   * Se verdadeiro, impede o fechamento
   * @default false
   * @example preventClose: true
   */
  preventClose?: boolean
}

/**
 * Tipo para o retorno do hook useDisclosure
 */
export interface UseDisclosureReturn {
  /**
   * Estado atual
   */
  isOpen: boolean

  /**
   * Função para abrir
   */
  open: () => void

  /**
   * Função para fechar
   */
  close: () => void

  /**
   * Função para alternar o estado
   */
  toggle: () => void

  /**
   * Função para definir o estado
   * @param isOpen Novo estado
   */
  set: (isOpen: boolean) => void

  /**
   * Referência para o elemento que controla a abertura/fechamento
   */
  triggerRef: React.RefObject<HTMLElement>

  /**
   * Referência para o elemento que é aberto/fechado
   */
  contentRef: React.RefObject<HTMLElement>

  /**
   * Props para o elemento que controla a abertura/fechamento
   */
  getTriggerProps: () => {
    "aria-expanded": boolean
    "aria-controls"?: string
    onClick: () => void
    ref: React.RefObject<HTMLElement>
  }

  /**
   * Props para o elemento que é aberto/fechado
   */
  getContentProps: (id?: string) => {
    id: string
    hidden: boolean
    ref: React.RefObject<HTMLElement>
  }
}

/**
 * Hook para gerenciar estados de abertura/fechamento
 *
 * Este hook é útil para modais, dropdowns, tooltips, etc.
 *
 * @param options Opções de configuração
 * @returns Objeto com estado e funções para controlar o estado
 *
 * @example
 * // Uso básico
 * const { isOpen, open, close, toggle } = useDisclosure();
 *
 * // Com estado inicial
 * const modal = useDisclosure({ initialState: true });
 *
 * // Com callbacks
 * const dropdown = useDisclosure({
 *   onOpen: () => console.log("Dropdown aberto"),
 *   onClose: () => console.log("Dropdown fechado")
 * });
 *
 * // Com fechamento automático
 * const toast = useDisclosure({
 *   autoClose: true,
 *   autoCloseTime: 3000
 * });
 *
 * // Com props para acessibilidade
 * const { isOpen, getTriggerProps, getContentProps } = useDisclosure();
 *
 * <button {...getTriggerProps()}>Abrir menu</button>
 * <div {...getContentProps("menu-content")}>Conteúdo do menu</div>
 */
export function useDisclosure(options: UseDisclosureOptions = {}): UseDisclosureReturn {
  // Extrair opções com valores padrão
  const {
    initialState = false,
    onStateChange,
    onOpen,
    onClose,
    autoClose = false,
    autoCloseTime = 5000,
    preventOpen = false,
    preventClose = false,
  } = options

  // Estado para controlar a abertura/fechamento
  const [isOpen, setIsOpen] = useState(initialState)

  // Referências para os elementos
  const triggerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLElement>(null)

  // Referência para o temporizador de fechamento automático
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ID único para o conteúdo
  const uniqueId = useRef(`disclosure-${Math.random().toString(36).substring(2, 9)}`)

  // Função para abrir
  const open = useCallback(() => {
    if (preventOpen) return

    setIsOpen(true)

    // Chamar callbacks
    onStateChange?.(true)
    onOpen?.()

    // Configurar fechamento automático
    if (autoClose) {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }

      autoCloseTimerRef.current = setTimeout(() => {
        setIsOpen(false)
        onStateChange?.(false)
        onClose?.()
      }, autoCloseTime)
    }
  }, [preventOpen, onStateChange, onOpen, autoClose, autoCloseTime, onClose])

  // Função para fechar
  const close = useCallback(() => {
    if (preventClose) return

    setIsOpen(false)

    // Chamar callbacks
    onStateChange?.(false)
    onClose?.()

    // Limpar temporizador de fechamento automático
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current)
      autoCloseTimerRef.current = null
    }
  }, [preventClose, onStateChange, onClose])

  // Função para alternar o estado
  const toggle = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }, [isOpen, close, open])

  // Função para definir o estado diretamente
  const set = useCallback(
    (state: boolean) => {
      if (state) {
        open()
      } else {
        close()
      }
    },
    [open, close],
  )

  // Props para o elemento que controla a abertura/fechamento
  const getTriggerProps = useCallback(() => {
    return {
      "aria-expanded": isOpen,
      "aria-controls": uniqueId.current,
      onClick: toggle,
      ref: triggerRef,
    }
  }, [isOpen, toggle])

  // Props para o elemento que é aberto/fechado
  const getContentProps = useCallback(
    (id?: string) => {
      const contentId = id || uniqueId.current

      return {
        id: contentId,
        hidden: !isOpen,
        ref: contentRef,
      }
    },
    [isOpen],
  )

  // Limpar temporizador ao desmontar
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
    }
  }, [])

  return {
    isOpen,
    open,
    close,
    toggle,
    set,
    triggerRef,
    contentRef,
    getTriggerProps,
    getContentProps,
  }
}
