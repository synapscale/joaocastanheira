"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"
import { useMediaQuery } from "./use-media-query"

/**
 * Tipos para preferências do sidebar
 */
export type SidebarPreference = "expanded" | "collapsed" | "auto"

/**
 * Interface do estado do sidebar
 */
export interface SidebarState {
  isCollapsed: boolean
  isOverlay: boolean
  isMobile: boolean
  preference: SidebarPreference
  width: number
  isOpen: boolean
}

/**
 * Constantes para larguras
 */
const SIDEBAR_WIDTH = {
  EXPANDED: 280,
  COLLAPSED: 64,
  MOBILE: 320,
} as const

/**
 * Hook otimizado para gerenciar estado do sidebar
 */
export function useSidebarState() {
  // Media queries
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  // Preferência persistente
  const [preference, setPreference] = useLocalStorage<SidebarPreference>("sidebar-preference", "expanded")

  // Estado local para mobile
  const [mobileOpen, setMobileOpen] = useState(false)

  // Calcular estado baseado na preferência e tamanho da tela
  const calculatedState = useMemo((): SidebarState => {
    if (isMobile) {
      return {
        isCollapsed: false,
        isOverlay: true,
        isMobile: true,
        preference,
        width: SIDEBAR_WIDTH.MOBILE,
        isOpen: mobileOpen,
      }
    }

    let isCollapsed = false
    let width = SIDEBAR_WIDTH.EXPANDED

    switch (preference) {
      case "collapsed":
        isCollapsed = true
        width = SIDEBAR_WIDTH.COLLAPSED
        break
      case "expanded":
        isCollapsed = false
        width = SIDEBAR_WIDTH.EXPANDED
        break
      case "auto":
        isCollapsed = isTablet
        width = isTablet ? SIDEBAR_WIDTH.COLLAPSED : SIDEBAR_WIDTH.EXPANDED
        break
    }

    return {
      isCollapsed,
      isOverlay: false,
      isMobile: false,
      preference,
      width,
      isOpen: true,
    }
  }, [preference, isMobile, isTablet, mobileOpen])

  // Fechar mobile ao mudar para desktop
  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false)
    }
  }, [isMobile, mobileOpen])

  // Ações
  const toggle = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev)
    } else {
      setPreference(calculatedState.isCollapsed ? "expanded" : "collapsed")
    }
  }, [isMobile, calculatedState.isCollapsed, setPreference])

  const close = useCallback(() => {
    if (isMobile) {
      setMobileOpen(false)
    }
  }, [isMobile])

  const open = useCallback(() => {
    if (isMobile) {
      setMobileOpen(true)
    } else {
      setPreference("expanded")
    }
  }, [isMobile, setPreference])

  return {
    ...calculatedState,
    toggle,
    close,
    open,
    setPreference,
    shouldShowTooltips: () => calculatedState.isCollapsed,
  }
}
