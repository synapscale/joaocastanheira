"use client"

import { useCallback, useMemo } from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

/**
 * Available theme names in the application
 */
export type ThemeName = "default" | "colorful" | "minimal" | "dark" | "pastel" | "light" | "system"

/**
 * Node theme colors configuration for each category
 */
export type NodeThemeColors = {
  [key: string]: {
    background: string
    border: string
    text: string
    headerBg: string
  }
}

/**
 * Complete theme definition
 */
export type Theme = {
  name: ThemeName
  label: string
  nodeColors: NodeThemeColors
  canvasBg: string
  nodeStyle: {
    borderRadius: string
    shadowSize: string
  }
}

/**
 * Theme context type definition
 */
type ThemeContextType = {
  currentTheme: Theme
  setTheme: (theme: ThemeName) => void
  availableThemes: Theme[]
}

// Available themes configuration
const themes: Record<ThemeName, Theme> = {
  default: {
    name: "default",
    label: "Padrão",
    canvasBg: "bg-muted/20",
    nodeStyle: {
      borderRadius: "rounded-md",
      shadowSize: "shadow-md",
    },
    nodeColors: {
      ai: {
        background: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-900",
        headerBg: "bg-purple-100",
      },
      "app-action": {
        background: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-900",
        headerBg: "bg-blue-100",
      },
      "data-transformation": {
        background: "bg-green-50",
        border: "border-green-200",
        text: "text-green-900",
        headerBg: "bg-green-100",
      },
      flow: {
        background: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-900",
        headerBg: "bg-yellow-100",
      },
      core: {
        background: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-900",
        headerBg: "bg-gray-100",
      },
      human: {
        background: "bg-pink-50",
        border: "border-pink-200",
        text: "text-pink-900",
        headerBg: "bg-pink-100",
      },
      trigger: {
        background: "bg-red-50",
        border: "border-red-200",
        text: "text-red-900",
        headerBg: "bg-red-100",
      },
    },
  },
  colorful: {
    name: "colorful",
    label: "Colorido",
    canvasBg: "bg-white",
    nodeStyle: {
      borderRadius: "rounded-lg",
      shadowSize: "shadow-lg",
    },
    nodeColors: {
      ai: {
        background: "bg-purple-500",
        border: "border-purple-700",
        text: "text-white",
        headerBg: "bg-purple-600",
      },
      "app-action": {
        background: "bg-blue-500",
        border: "border-blue-700",
        text: "text-white",
        headerBg: "bg-blue-600",
      },
      "data-transformation": {
        background: "bg-green-500",
        border: "border-green-700",
        text: "text-white",
        headerBg: "bg-green-600",
      },
      flow: {
        background: "bg-yellow-500",
        border: "border-yellow-700",
        text: "text-white",
        headerBg: "bg-yellow-600",
      },
      core: {
        background: "bg-gray-500",
        border: "border-gray-700",
        text: "text-white",
        headerBg: "bg-gray-600",
      },
      human: {
        background: "bg-pink-500",
        border: "border-pink-700",
        text: "text-white",
        headerBg: "bg-pink-600",
      },
      trigger: {
        background: "bg-red-500",
        border: "border-red-700",
        text: "text-white",
        headerBg: "bg-red-600",
      },
    },
  },
  minimal: {
    name: "minimal",
    label: "Minimalista",
    canvasBg: "bg-gray-50",
    nodeStyle: {
      borderRadius: "rounded-sm",
      shadowSize: "shadow-sm",
    },
    nodeColors: {
      ai: {
        background: "bg-white",
        border: "border-gray-200",
        text: "text-gray-900",
        headerBg: "bg-white",
      },
      "app-action": {
        background: "bg-white",
        border: "border-gray-200",
        text: "text-gray-900",
        headerBg: "bg-white",
      },
      "data-transformation": {
        background: "bg-white",
        border: "border-gray-200",
        text: "text-gray-900",
        headerBg: "bg-white",
      },
      flow: {
        background: "bg-white",
        border: "border-gray-200",
        text: "text-gray-900",
        headerBg: "bg-white",
      },
      core: {
        background: "bg-white",
        border: "border-gray-200",
        text: "text-gray-900",
        headerBg: "bg-white",
      },
      human: {
        background: "bg-white",
        border: "border-gray-200",
        text: "text-gray-900",
        headerBg: "bg-white",
      },
      trigger: {
        background: "bg-white",
        border: "border-gray-200",
        text: "text-gray-900",
        headerBg: "bg-white",
      },
    },
  },
  dark: {
    name: "dark",
    label: "Escuro",
    canvasBg: "bg-gray-900",
    nodeStyle: {
      borderRadius: "rounded-md",
      shadowSize: "shadow-xl",
    },
    nodeColors: {
      ai: {
        background: "bg-gray-800",
        border: "border-purple-700",
        text: "text-purple-300",
        headerBg: "bg-gray-700",
      },
      "app-action": {
        background: "bg-gray-800",
        border: "border-blue-700",
        text: "text-blue-300",
        headerBg: "bg-gray-700",
      },
      "data-transformation": {
        background: "bg-gray-800",
        border: "border-green-700",
        text: "text-green-300",
        headerBg: "bg-gray-700",
      },
      flow: {
        background: "bg-gray-800",
        border: "border-yellow-700",
        text: "text-yellow-300",
        headerBg: "bg-gray-700",
      },
      core: {
        background: "bg-gray-800",
        border: "border-gray-600",
        text: "text-gray-300",
        headerBg: "bg-gray-700",
      },
      human: {
        background: "bg-gray-800",
        border: "border-pink-700",
        text: "text-pink-300",
        headerBg: "bg-gray-700",
      },
      trigger: {
        background: "bg-gray-800",
        border: "border-red-700",
        text: "text-red-300",
        headerBg: "bg-gray-700",
      },
    },
  },
  pastel: {
    name: "pastel",
    label: "Pastel",
    canvasBg: "bg-blue-50",
    nodeStyle: {
      borderRadius: "rounded-xl",
      shadowSize: "shadow-md",
    },
    nodeColors: {
      ai: {
        background: "bg-purple-100",
        border: "border-purple-200",
        text: "text-purple-800",
        headerBg: "bg-purple-200",
      },
      "app-action": {
        background: "bg-blue-100",
        border: "border-blue-200",
        text: "text-blue-800",
        headerBg: "bg-blue-200",
      },
      "data-transformation": {
        background: "bg-green-100",
        border: "border-green-200",
        text: "text-green-800",
        headerBg: "bg-green-200",
      },
      flow: {
        background: "bg-yellow-100",
        border: "border-yellow-200",
        text: "text-yellow-800",
        headerBg: "bg-yellow-200",
      },
      core: {
        background: "bg-gray-100",
        border: "border-gray-200",
        text: "text-gray-800",
        headerBg: "bg-gray-200",
      },
      human: {
        background: "bg-pink-100",
        border: "border-pink-200",
        text: "text-pink-800",
        headerBg: "bg-pink-200",
      },
      trigger: {
        background: "bg-red-100",
        border: "border-red-200",
        text: "text-red-800",
        headerBg: "bg-red-200",
      },
    },
  },
  light: {
    name: "light",
    label: "Claro",
    canvasBg: "bg-white",
    nodeStyle: {
      borderRadius: "rounded-md",
      shadowSize: "shadow-md",
    },
    nodeColors: {
      ai: {
        background: "bg-purple-100",
        border: "border-purple-200",
        text: "text-purple-900",
        headerBg: "bg-purple-200",
      },
      "app-action": {
        background: "bg-blue-100",
        border: "border-blue-200",
        text: "text-blue-900",
        headerBg: "bg-blue-200",
      },
      "data-transformation": {
        background: "bg-green-100",
        border: "border-green-200",
        text: "text-green-900",
        headerBg: "bg-green-200",
      },
      flow: {
        background: "bg-yellow-100",
        border: "border-yellow-200",
        text: "text-yellow-900",
        headerBg: "bg-yellow-200",
      },
      core: {
        background: "bg-gray-100",
        border: "border-gray-200",
        text: "text-gray-900",
        headerBg: "bg-gray-200",
      },
      human: {
        background: "bg-pink-100",
        border: "border-pink-200",
        text: "text-pink-900",
        headerBg: "bg-pink-200",
      },
      trigger: {
        background: "bg-red-100",
        border: "border-red-200",
        text: "text-red-900",
        headerBg: "bg-red-200",
      },
    },
  },
  system: {
    name: "system",
    label: "Sistema",
    canvasBg: "bg-white",
    nodeStyle: {
      borderRadius: "rounded-md",
      shadowSize: "shadow-md",
    },
    nodeColors: {
      ai: {
        background: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-900",
        headerBg: "bg-purple-100",
      },
      "app-action": {
        background: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-900",
        headerBg: "bg-blue-100",
      },
      "data-transformation": {
        background: "bg-green-50",
        border: "border-green-200",
        text: "text-green-900",
        headerBg: "bg-green-100",
      },
      flow: {
        background: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-900",
        headerBg: "bg-yellow-100",
      },
      core: {
        background: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-900",
        headerBg: "bg-gray-100",
      },
      human: {
        background: "bg-pink-50",
        border: "border-pink-200",
        text: "text-pink-900",
        headerBg: "bg-pink-100",
      },
      trigger: {
        background: "bg-red-50",
        border: "border-red-200",
        text: "text-red-900",
        headerBg: "bg-red-100",
      },
    },
  },
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * ThemeProvider Component
 *
 * Provides theme context to the application, managing theme state and persistence.
 *
 * @param children - React children to be wrapped by the provider
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.system)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("canvas-theme")
    if (savedTheme && themes[savedTheme as ThemeName]) {
      setCurrentTheme(themes[savedTheme as ThemeName])
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setCurrentTheme(themes.dark)
    } else {
      setCurrentTheme(themes.light)
    }
  }, [])

  // Function to change the theme
  const setTheme = useCallback((themeName: ThemeName) => {
    setCurrentTheme(themes[themeName])
    localStorage.setItem("canvas-theme", themeName)
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentTheme,
      setTheme,
      availableThemes: Object.values(themes),
    }),
    [currentTheme, setTheme],
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("default", "colorful", "minimal", "dark", "pastel", "light")

    if (currentTheme.name === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(currentTheme.name)
    }
  }, [currentTheme])

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

/**
 * useTheme Hook
 *
 * Custom hook to access the theme context.
 *
 * @returns The theme context value
 * @throws Error if used outside of a ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
