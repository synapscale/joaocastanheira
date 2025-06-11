"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import type { AIModel, UserPreferences } from "@/types/chat"
import type { Component } from "@/types/component-selector"

/**
 * Default model configuration
 * @ai-pattern model-definition
 * Defines the default AI model with its capabilities and metadata
 */
const DEFAULT_MODEL: AIModel = {
  id: "gpt-4o",
  name: "GPT-4o",
  provider: "openai",
  description: "Modelo mais avançado da OpenAI com capacidades multimodais",
  category: "multimodal",
  capabilities: {
    imageAnalysis: true,
    toolCalling: true,
    longContext: true,
    maxContextLength: 128000,
  },
}

const DEFAULT_TOOL = "enabled"
const DEFAULT_PERSONALITY = "natural"
const DEFAULT_PRESET = "default"

/**
 * Default user preferences
 * @ai-pattern user-preferences
 * Defines the initial state for user preferences
 */
const INITIAL_USER_PREFERENCES: UserPreferences = {
  theme: "system",
  recentModels: [],
  recentTools: [],
  recentPersonalities: [],
  favoriteModels: [],
  favoriteConversations: [],
  interface: {
    showConfigByDefault: true,
    fontSize: "medium",
    density: "comfortable",
  },
  notifications: {
    sound: true,
    desktop: false,
  },
}

type Theme = "light" | "dark" | "system"

export type AppContextType = {
  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void

  // Sidebar
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void

  // Focus mode
  focusMode: boolean
  setFocusMode: (focusMode: boolean) => void

  // User preferences
  userPreferences: UserPreferences
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void

  // Selected model
  selectedModel: AIModel
  setSelectedModel: (model: AIModel) => void

  // Selected tool
  selectedTool: string
  setSelectedTool: (tool: string) => void
  
  // Tools enabled/disabled
  toolsEnabled: boolean
  setToolsEnabled: (enabled: boolean) => void

  // Selected personality
  selectedPersonality: string
  setPersonality: (personality: string) => void

  // Selected preset
  preset: string
  setPreset: (preset: string) => void

  // Apply preset
  applyPreset: (preset: { model: string; tool: string; personality: string }) => void

  // Last action
  lastAction: string | null
  setLastAction: (action: string | null) => void

  // Component selector
  isComponentSelectorActive: boolean
  setComponentSelectorActive: (isActive: boolean) => void
  selectedComponent: Component | null
  setSelectedComponent: (component: Component | null) => void
  hoveredComponent: Component | null
  setHoveredComponent: (component: Component | null) => void
  dragState: {
    isDragging: boolean
    component?: Component
    x?: number
    y?: number
  } | null
  setDragState: (state: {
    isDragging: boolean
    component?: Component
    x?: number
    y?: number
  } | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Tema
  const [themeState, setThemeState] = useState<Theme>("system")

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Focus mode
  const [focusMode, setFocusMode] = useState(false)

  // User preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(INITIAL_USER_PREFERENCES)

  // Selected model
  const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_MODEL)

  // Selected tool
  const [selectedTool, setSelectedTool] = useState<string>(DEFAULT_TOOL)
  
  // Tools enabled/disabled
  const [toolsEnabled, setToolsEnabled] = useState<boolean>(true)

  // Selected personality
  const [personality, setPersonality] = useState<string>(DEFAULT_PERSONALITY)
  
  // Selected preset
  const [preset, setPreset] = useState<string>(DEFAULT_PRESET)

  // Last action
  const [lastAction, setLastAction] = useState<string | null>(null)

  // Component selector
  const [isComponentSelectorActive, setComponentSelectorActive] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [hoveredComponent, setHoveredComponent] = useState<Component | null>(null)
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    component?: Component
    x?: number
    y?: number
  } | null>({
    isDragging: false,
  })

  /**
   * Update user preferences
   * @param preferences Partial preferences to update
   * @ai-pattern state-update
   * Immutable state update pattern
   */
  const updateUserPreferences = useCallback((preferences: Partial<UserPreferences>) => {
    setUserPreferences((prev) => {
      const newPreferences = {
        ...prev,
        ...preferences,
      }
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('userPreferences', JSON.stringify(newPreferences))
        } catch (error) {
          console.error('Erro ao salvar preferências:', error)
        }
      }
      
      return newPreferences
    })
  }, [])

  /**
   * Set theme and update preferences
   * @param newTheme The new theme to set
   */
  const setTheme = useCallback(
    (newTheme: "light" | "dark" | "system") => {
      setThemeState(newTheme)
      updateUserPreferences({ theme: newTheme })
      
      // Salvar tema no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme)
      }
    },
    [updateUserPreferences],
  )

  /**
   * Apply preset configuration
   * @param preset The preset configuration to apply
   */
  const applyPreset = useCallback(
    (presetConfig: { model: string; tool: string; personality: string }) => {
      // Encontrar o modelo pelo ID
      const modelObj = {
        id: presetConfig.model,
        name: presetConfig.model,
        provider: "OpenAI",
        description: "",
        category: "text",
        capabilities: {}
      }
      
      setSelectedModel(modelObj)
      setSelectedTool(presetConfig.tool)
      setToolsEnabled(presetConfig.tool === "enabled")
      setPersonality(presetConfig.personality)
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('selectedModel', JSON.stringify(modelObj))
          localStorage.setItem('selectedTool', presetConfig.tool)
          localStorage.setItem('toolsEnabled', String(presetConfig.tool === "enabled"))
          localStorage.setItem('personality', presetConfig.personality)
        } catch (error) {
          console.error('Erro ao salvar configurações de preset:', error)
        }
      }
    },
    [],
  )

  // Carregar preferências do localStorage ao iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Carregar tema
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme) {
        setThemeState(savedTheme)
      }
      
      // Carregar todas as preferências do usuário
      try {
        const savedPreferences = localStorage.getItem('userPreferences')
        if (savedPreferences) {
          const parsedPreferences = JSON.parse(savedPreferences)
          setUserPreferences(prev => ({
            ...prev,
            ...parsedPreferences
          }))
        }
        
        // Carregar modelo selecionado
        const savedModel = localStorage.getItem('selectedModel')
        if (savedModel) {
          try {
            const parsedModel = JSON.parse(savedModel)
            setSelectedModel(parsedModel)
          } catch (e) {
            console.error('Erro ao carregar modelo:', e)
          }
        }
        
        // Carregar ferramenta selecionada
        const savedTool = localStorage.getItem('selectedTool')
        if (savedTool) {
          setSelectedTool(savedTool)
        }
        
        // Carregar estado de ferramentas habilitadas
        const savedToolsEnabled = localStorage.getItem('toolsEnabled')
        if (savedToolsEnabled) {
          setToolsEnabled(savedToolsEnabled === 'true')
        }
        
        // Carregar personalidade selecionada
        const savedPersonality = localStorage.getItem('personality')
        if (savedPersonality) {
          setPersonality(savedPersonality)
        }
        
        // Carregar preset selecionado
        const savedPreset = localStorage.getItem('preset')
        if (savedPreset) {
          setPreset(savedPreset)
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error)
      }
    }
  }, [])

  // Salvar modelo selecionado quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedModel) {
      try {
        localStorage.setItem('selectedModel', JSON.stringify(selectedModel))
      } catch (error) {
        console.error('Erro ao salvar modelo selecionado:', error)
      }
    }
  }, [selectedModel])

  // Salvar ferramenta selecionada quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedTool) {
      try {
        localStorage.setItem('selectedTool', selectedTool)
      } catch (error) {
        console.error('Erro ao salvar ferramenta selecionada:', error)
      }
    }
  }, [selectedTool])

  // Salvar estado de ferramentas habilitadas quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('toolsEnabled', String(toolsEnabled))
      } catch (error) {
        console.error('Erro ao salvar estado de ferramentas:', error)
      }
    }
  }, [toolsEnabled])

  // Salvar personalidade selecionada quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined' && personality) {
      try {
        localStorage.setItem('personality', personality)
      } catch (error) {
        console.error('Erro ao salvar personalidade selecionada:', error)
      }
    }
  }, [personality])
  
  // Salvar preset selecionado quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined' && preset) {
      try {
        localStorage.setItem('preset', preset)
      } catch (error) {
        console.error('Erro ao salvar preset selecionado:', error)
      }
    }
  }, [preset])

  // Aplicar tema ao documento
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")

      if (themeState === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        root.classList.add(systemTheme)
      } else {
        root.classList.add(themeState)
      }
    }
  }, [themeState])

  const value = useMemo(
    () => ({
      theme: themeState,
      setTheme,
      isSidebarOpen,
      setIsSidebarOpen,
      focusMode,
      setFocusMode,
      userPreferences,
      updateUserPreferences,
      selectedModel,
      setSelectedModel,
      selectedTool,
      setSelectedTool,
      toolsEnabled,
      setToolsEnabled,
      selectedPersonality: personality,
      personality,
      setPersonality,
      preset,
      setPreset,
      applyPreset,
      lastAction,
      setLastAction,
      isComponentSelectorActive,
      setComponentSelectorActive,
      selectedComponent,
      setSelectedComponent,
      hoveredComponent,
      setHoveredComponent,
      dragState,
      setDragState,
    }),
    [
      themeState,
      setTheme,
      isSidebarOpen,
      setIsSidebarOpen,
      focusMode,
      setFocusMode,
      userPreferences,
      updateUserPreferences,
      selectedModel,
      setSelectedModel,
      selectedTool,
      setSelectedTool,
      toolsEnabled,
      setToolsEnabled,
      personality,
      setPersonality,
      preset,
      setPreset,
      applyPreset,
      lastAction,
      setLastAction,
      isComponentSelectorActive,
      setComponentSelectorActive,
      selectedComponent,
      setSelectedComponent,
      hoveredComponent,
      setHoveredComponent,
      dragState,
      setDragState,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
