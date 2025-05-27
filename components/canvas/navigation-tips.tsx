"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/**
 * =============================================================================
 * TIPOS E INTERFACES
 * =============================================================================
 */

/**
 * Atalho de navegação
 */
export interface NavigationShortcut {
  /**
   * Teclas ou combinação de teclas
   */
  keys: string

  /**
   * Descrição da ação
   */
  description: string

  /**
   * Categoria do atalho
   */
  category?: string

  /**
   * Ícone opcional
   */
  icon?: React.ReactNode
}

/**
 * Props do componente NavigationTips
 */
export interface NavigationTipsProps {
  /**
   * Título do card
   */
  title?: string

  /**
   * Descrição do card
   */
  description?: string

  /**
   * Atalhos personalizados
   */
  shortcuts?: NavigationShortcut[]

  /**
   * Chave para persistência da preferência
   */
  storageKey?: string

  /**
   * Se deve mostrar automaticamente
   */
  autoShow?: boolean

  /**
   * Delay para mostrar automaticamente (ms)
   */
  autoShowDelay?: number

  /**
   * Posição do card
   */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"

  /**
   * Callback quando fechado
   */
  onClose?: () => void

  /**
   * Classes CSS adicionais
   */
  className?: string
}

/**
 * =============================================================================
 * ATALHOS PADRÃO
 * =============================================================================
 */

/**
 * Atalhos de navegação padrão
 */
export const DEFAULT_NAVIGATION_SHORTCUTS: NavigationShortcut[] = [
  {
    keys: "Espaço + Arrastar",
    description: "Navegar pelo canvas",
    category: "navegação",
  },
  {
    keys: "Ctrl + Scroll",
    description: "Zoom in/out",
    category: "zoom",
  },
  {
    keys: "Duplo clique",
    description: "Ajustar à tela",
    category: "zoom",
  },
  {
    keys: "Arrastar",
    description: "Selecionar área",
    category: "seleção",
  },
  {
    keys: "Shift + Clique",
    description: "Seleção múltipla",
    category: "seleção",
  },
  {
    keys: "Delete",
    description: "Remover selecionados",
    category: "edição",
  },
]

/**
 * =============================================================================
 * COMPONENTE PRINCIPAL
 * =============================================================================
 */

/**
 * Componente NavigationTips
 *
 * Exibe dicas de navegação e atalhos de teclado para o canvas.
 * Suporta persistência de preferência e posicionamento flexível.
 */
export function NavigationTips({
  title = "Dicas de Navegação",
  description = "Atalhos para navegar no canvas",
  shortcuts = DEFAULT_NAVIGATION_SHORTCUTS,
  storageKey = "canvas-navigation-tips-shown",
  autoShow = true,
  autoShowDelay = 1000,
  position = "bottom-left",
  onClose,
  className,
}: NavigationTipsProps) {
  // =============================================================================
  // ESTADOS
  // =============================================================================

  const [isVisible, setIsVisible] = useState(false)

  // =============================================================================
  // EFEITOS
  // =============================================================================

  /**
   * Verificar se dicas já foram mostradas
   */
  useEffect(() => {
    if (!autoShow) return

    const tipsShown = localStorage.getItem(storageKey) === "true"

    if (!tipsShown) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, autoShowDelay)

      return () => clearTimeout(timer)
    }
  }, [autoShow, autoShowDelay, storageKey])

  // =============================================================================
  // HANDLERS
  // =============================================================================

  /**
   * Fechar dicas e salvar preferência
   */
  const handleClose = useCallback(() => {
    setIsVisible(false)
    localStorage.setItem(storageKey, "true")
    onClose?.()
  }, [storageKey, onClose])

  // =============================================================================
  // POSICIONAMENTO
  // =============================================================================

  /**
   * Determinar classes de posição
   */
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-16 left-4",
    "bottom-right": "bottom-16 right-4",
  }[position]

  // =============================================================================
  // RENDERIZAÇÃO
  // =============================================================================

  if (!isVisible) return null

  return (
    <Card className={`absolute ${positionClasses} z-10 w-72 shadow-lg canvas-ui-element ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{title}</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ul className="space-y-2 text-sm">
          {shortcuts.map((shortcut, index) => (
            <li key={index} className="flex items-center">
              <kbd className="px-2 py-1 bg-muted rounded text-xs mr-2">{shortcut.keys}</kbd>
              <span>{shortcut.description}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
