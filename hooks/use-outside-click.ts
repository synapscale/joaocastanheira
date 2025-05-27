"use client"

import { useEffect, type RefObject } from "react"

/**
 * Hook that alerts when you click outside of the passed refs
 */
export function useOutsideClick(refs: RefObject<HTMLElement>[], handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    function handleClickOutside(event: MouseEvent) {
      // If the click was outside all of the refs
      if (refs.every((ref) => ref.current && !ref.current.contains(event.target as Node))) {
        handler()
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [refs, handler, enabled])
}
