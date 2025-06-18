"use client"

import { useState, useEffect } from "react"
import { X, Info } from "lucide-react"

export function DevBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShownOnce, setHasShownOnce] = useState(false)

  useEffect(() => {
    // Só mostrar em desenvolvimento
    if (process.env.NODE_ENV === 'development' && !hasShownOnce) {
      // Verificar se há warnings no console (mock data)
      const originalWarn = console.warn
      console.warn = (...args) => {
        if (args[0]?.includes('mock data for development')) {
          setIsVisible(true)
          setHasShownOnce(true)
        }
        originalWarn(...args)
      }

      return () => {
        console.warn = originalWarn
      }
    }
  }, [hasShownOnce])

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200 p-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>Modo Desenvolvimento:</strong> Alguns dados estão sendo simulados devido à falta de autenticação no backend.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-md hover:bg-yellow-100 transition-colors"
        >
          <X className="h-4 w-4 text-yellow-600" />
        </button>
      </div>
    </div>
  )
} 