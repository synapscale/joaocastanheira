"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  customColors: Record<string, string>
  setCustomColors: (colors: Record<string, string>) => void
  resetCustomColors: () => void
}

const defaultColors = {
  primary: 'hsl(222.2, 47.4%, 11.2%)',
  secondary: 'hsl(217.2, 32.6%, 17.5%)',
  accent: 'hsl(210, 100%, 52%)',
  background: 'hsl(0, 0%, 100%)',
  foreground: 'hsl(222.2, 47.4%, 11.2%)',
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [customColors, setCustomColors] = useState<Record<string, string>>(defaultColors)

  // Inicializar tema do localStorage ou preferência do sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const savedColors = localStorage.getItem('customColors')
    
    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      // Verificar preferência do sistema
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setThemeState(systemPreference)
    }
    
    if (savedColors) {
      try {
        setCustomColors(JSON.parse(savedColors))
      } catch (e) {
        console.error('Erro ao carregar cores personalizadas:', e)
      }
    }
  }, [])

  // Aplicar tema ao documento
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remover classes anteriores
    root.classList.remove('light', 'dark')
    
    // Aplicar tema atual
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
    
    // Salvar no localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  // Aplicar cores personalizadas
  useEffect(() => {
    const root = window.document.documentElement
    
    // Aplicar cada cor personalizada como variável CSS
    Object.entries(customColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    // Salvar no localStorage
    localStorage.setItem('customColors', JSON.stringify(customColors))
  }, [customColors])

  // Função para definir tema
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Função para resetar cores personalizadas
  const resetCustomColors = () => {
    setCustomColors(defaultColors)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        customColors,
        setCustomColors,
        resetCustomColors
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default useTheme
