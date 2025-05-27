"use client"

import { useState, useEffect } from "react"

/**
 * Hook personalizado para verificar se uma media query corresponde.
 *
 * @param query - A media query a ser verificada
 * @returns Boolean indicando se a media query corresponde
 */
export function useMediaQuery(query: string): boolean {
  // Inicializar com null para evitar problemas de hidratação
  const [matches, setMatches] = useState<boolean | null>(null)

  useEffect(() => {
    // Verificar se window está disponível (lado do cliente)
    if (typeof window !== "undefined") {
      // Definir o estado inicial
      const media = window.matchMedia(query)
      setMatches(media.matches)

      // Função para atualizar o estado quando a media query muda
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches)
      }

      // Adicionar o listener
      media.addEventListener("change", listener)

      // Limpar o listener quando o componente é desmontado
      return () => {
        media.removeEventListener("change", listener)
      }
    }

    // Retornar false para SSR
    return () => {}
  }, [query])

  // Retornar false para SSR ou quando ainda não foi inicializado
  return matches ?? false
}

/**
 * Hook personalizado para verificar se o dispositivo é móvel.
 *
 * @returns Boolean indicando se o dispositivo é móvel
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)")
}

/**
 * Hook personalizado para verificar se o dispositivo é tablet.
 *
 * @returns Boolean indicando se o dispositivo é tablet
 */
export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)")
}

/**
 * Hook personalizado para verificar se o dispositivo é desktop.
 *
 * @returns Boolean indicando se o dispositivo é desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1025px)")
}
