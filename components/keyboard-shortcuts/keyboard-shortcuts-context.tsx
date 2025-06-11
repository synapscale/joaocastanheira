"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface KeyboardShortcutsContextType {
  shortcuts: Record<string, ShortcutConfig>
  registerShortcut: (id: string, config: ShortcutConfig) => void
  unregisterShortcut: (id: string) => void
  isShortcutsDialogOpen: boolean
  setShortcutsDialogOpen: (open: boolean) => void
}

export interface ShortcutConfig {
  keys: string[]
  description: string
  category: string
  action: () => void
  global?: boolean
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined)

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [shortcuts, setShortcuts] = useState<Record<string, ShortcutConfig>>({})
  const [isShortcutsDialogOpen, setShortcutsDialogOpen] = useState(false)

  // Registrar um novo atalho
  const registerShortcut = useCallback((id: string, config: ShortcutConfig) => {
    setShortcuts(prev => ({
      ...prev,
      [id]: config
    }))
  }, [])

  // Remover um atalho
  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts(prev => {
      const newShortcuts = { ...prev }
      delete newShortcuts[id]
      return newShortcuts
    })
  }, [])

  // Manipular eventos de teclado
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar eventos em campos de entrada
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Verificar se algum atalho corresponde às teclas pressionadas
      Object.entries(shortcuts).forEach(([id, config]) => {
        const { keys, action, global } = config

        // Verificar se todas as teclas do atalho estão pressionadas
        const keysPressed = keys.every(key => {
          if (key === 'Ctrl' || key === 'Control') return e.ctrlKey
          if (key === 'Alt') return e.altKey
          if (key === 'Shift') return e.shiftKey
          if (key === 'Meta' || key === 'Command') return e.metaKey
          return e.key.toLowerCase() === key.toLowerCase()
        })

        // Se todas as teclas estiverem pressionadas, executar a ação
        if (keysPressed) {
          e.preventDefault()
          action()
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        shortcuts,
        registerShortcut,
        unregisterShortcut,
        isShortcutsDialogOpen,
        setShortcutsDialogOpen
      }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  )
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext)
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider')
  }
  return context
}

export default useKeyboardShortcuts
