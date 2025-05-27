"use client"

import { useEffect, useRef } from "react"

interface HotkeyConfig {
  keys: string[]
  callback: (e: KeyboardEvent) => void
  preventDefault?: boolean
}

export function useHotkeys(hotkeys: HotkeyConfig[], dependencies: any[] = []) {
  // Ref para manter as hotkeys atualizadas sem causar re-renders
  const hotkeysRef = useRef(hotkeys)

  // Atualiza a ref quando as hotkeys mudam
  useEffect(() => {
    hotkeysRef.current = hotkeys
  }, [hotkeys])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const hotkey of hotkeysRef.current) {
        const isCtrlOrMeta = hotkey.keys.some((k) => k.includes("ctrl") || k.includes("meta"))
        const isShift = hotkey.keys.some((k) => k.includes("shift"))
        const isAlt = hotkey.keys.some((k) => k.includes("alt"))

        // Verifica se as teclas modificadoras correspondem
        if ((isCtrlOrMeta && !(e.ctrlKey || e.metaKey)) || (isShift && !e.shiftKey) || (isAlt && !e.altKey)) {
          continue
        }

        // Verifica a tecla principal
        const mainKeys = hotkey.keys.map((k) => k.replace(/(ctrl|meta|shift|alt)\+/g, ""))

        if (mainKeys.includes(e.key.toLowerCase())) {
          if (hotkey.preventDefault) {
            e.preventDefault()
          }
          hotkey.callback(e)
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, dependencies)
}
