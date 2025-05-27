"use client"

import { usePathname } from "next/navigation"
import { useCallback, useMemo } from "react"
import type { NavigationItem } from "@/config/navigation-config"

/**
 * Hook para gerenciar lógica de navegação
 *
 * Centraliza a lógica de ativação de rotas e navegação,
 * mantendo consistência em toda a aplicação.
 */
export function useNavigation() {
  const currentPathname = usePathname()

  /**
   * Determina se um item de navegação está ativo
   * Usa lógica precisa para representação correta do estado
   */
  const isItemActive = useCallback(
    (itemHref: string): boolean => {
      if (itemHref === "/") {
        return currentPathname === "/"
      }
      return currentPathname?.startsWith(itemHref) ?? false
    },
    [currentPathname],
  )

  /**
   * Obtém informações sobre a rota atual
   */
  const currentRoute = useMemo(
    () => ({
      pathname: currentPathname,
      isHome: currentPathname === "/",
      segments: currentPathname?.split("/").filter(Boolean) ?? [],
    }),
    [currentPathname],
  )

  /**
   * Verifica se uma seção contém a rota ativa
   */
  const isSectionActive = useCallback(
    (items: NavigationItem[]): boolean => {
      return items.some((item) => isItemActive(item.href))
    },
    [isItemActive],
  )

  /**
   * Obtém o item ativo em uma lista de itens
   */
  const getActiveItem = useCallback(
    (items: NavigationItem[]): NavigationItem | null => {
      return items.find((item) => isItemActive(item.href)) ?? null
    },
    [isItemActive],
  )

  return {
    currentRoute,
    isItemActive,
    isSectionActive,
    getActiveItem,
  }
}
