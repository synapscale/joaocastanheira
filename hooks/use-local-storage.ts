"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Hook para persistir estado no localStorage
 * @param key Chave para armazenar no localStorage
 * @param initialValue Valor inicial caso não exista no localStorage
 * @returns [storedValue, setValue] - Valor armazenado e função para atualizar
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Função para obter o valor do localStorage
  const getStoredValue = useCallback(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Erro ao recuperar ${key} do localStorage:`, error)
      return initialValue
    }
  }, [initialValue, key])

  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getStoredValue()
  })

  // Função para atualizar o valor no localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Permitir que o valor seja uma função
        const valueToStore = value instanceof Function ? value(storedValue) : value

        // Salvar no estado
        setStoredValue(valueToStore)

        // Salvar no localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Erro ao salvar ${key} no localStorage:`, error)
      }
    },
    [key, storedValue],
  )

  // Sincronizar com mudanças em outras abas/janelas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Erro ao processar mudança no localStorage para ${key}:`, error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
