"use client"

import { useEffect, useRef } from "react"

interface KeyCombo {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
}

interface ShortcutConfig {
  combo: KeyCombo | KeyCombo[]
  callback: (e: KeyboardEvent) => void
  preventDefault?: boolean
  stopPropagation?: boolean
  enableInInputs?: boolean
}

/**
 * Hook para gerenciar atalhos de teclado
 * @param shortcuts Lista de configurações de atalhos
 * @param deps Dependências para atualizar os atalhos
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], deps: any[] = []) {
  const shortcutsRef = useRef(shortcuts)

  // Atualiza a referência quando as dependências mudam
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts, ...deps])

  useEffect(() => {
    const matchesKeyCombo = (e: KeyboardEvent, combo: KeyCombo): boolean => {
      if (combo.ctrl !== undefined && combo.ctrl !== e.ctrlKey) return false
      if (combo.alt !== undefined && combo.alt !== e.altKey) return false
      if (combo.shift !== undefined && combo.shift !== e.shiftKey) return false
      if (combo.meta !== undefined && combo.meta !== e.metaKey) return false

      return e.key.toLowerCase() === combo.key.toLowerCase()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora eventos em inputs, a menos que especificado
      if (
        !e.target ||
        (e.target instanceof HTMLElement && ["input", "textarea", "select"].includes(e.target.tagName.toLowerCase()))
      ) {
        const shortcutForInput = shortcutsRef.current.find(
          (s) =>
            s.enableInInputs &&
            (Array.isArray(s.combo) ? s.combo.some((combo) => matchesKeyCombo(e, combo)) : matchesKeyCombo(e, s.combo)),
        )

        if (!shortcutForInput) return
      }

      for (const shortcut of shortcutsRef.current) {
        const combos = Array.isArray(shortcut.combo) ? shortcut.combo : [shortcut.combo]

        for (const combo of combos) {
          if (matchesKeyCombo(e, combo)) {
            if (shortcut.preventDefault) {
              e.preventDefault()
            }

            if (shortcut.stopPropagation) {
              e.stopPropagation()
            }

            shortcut.callback(e)
            return
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, deps)
}
