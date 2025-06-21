"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import type { AIModel, UserPreferences } from "@/types/chat"
import type { Component } from "@/types/component-selector"
import { AVAILABLE_MODELS } from "@/constants/models"

/**
 * Default model configuration
 * @ai-pattern model-definition
 * Defines the default AI model with its capabilities and metadata
 */
const DEFAULT_MODEL: AIModel = {
  id: "gpt-4o",
  name: "ChatGPT 4o",
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

const DEFAULT_TOOL = "tools"
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
  // Configurações de LLM
  llmSettings: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
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

  // LLM Settings
  updateLLMSettings: (settings: Partial<UserPreferences['llmSettings']>) => void
  updateTemperature: (temperature: number) => void
  updateMaxTokens: (maxTokens: number) => void
  updateTopP: (topP: number) => void
  updateFrequencyPenalty: (frequencyPenalty: number) => void
  updatePresencePenalty: (presencePenalty: number) => void

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
  setSelectedPersonality: (personality: string) => void

  // Selected preset
  preset: string
  setPreset: (preset: string) => void

  // Apply preset
  applyPreset: (preset: { model: string; tool: string; personality: string }) => void

  // Settings - enabled models and tools
  enabledModels: string[]
  setEnabledModels: (models: string[]) => void
  enabledTools: string[]
  setEnabledTools: (tools: string[]) => void

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
  const [selectedPersonality, setSelectedPersonality] = useState<string>(DEFAULT_PERSONALITY)
  
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

  // Settings - enabled models and tools
  const [enabledModels, setEnabledModels] = useState<string[]>([])
  const [enabledTools, setEnabledTools] = useState<string[]>([])

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
   * Set personality (alias for setSelectedPersonality)
   */
  const setPersonality = useCallback((personality: string) => {
    setSelectedPersonality(personality)
  }, [])

  /**
   * Update LLM settings
   * @param settings Partial LLM settings to update
   */
  const updateLLMSettings = useCallback((settings: Partial<UserPreferences['llmSettings']>) => {
    setUserPreferences((prev) => ({
      ...prev,
      llmSettings: {
        ...prev.llmSettings,
        ...settings,
      },
    }))
  }, [])

  /**
   * Update temperature setting
   * @param temperature Temperature value (0-2)
   */
  const updateTemperature = useCallback((temperature: number) => {
    updateLLMSettings({ temperature })
  }, [updateLLMSettings])

  /**
   * Update max tokens setting
   * @param maxTokens Maximum tokens value
   */
  const updateMaxTokens = useCallback((maxTokens: number) => {
    updateLLMSettings({ maxTokens })
  }, [updateLLMSettings])

  /**
   * Update top P setting
   * @param topP Top P value (0-1)
   */
  const updateTopP = useCallback((topP: number) => {
    updateLLMSettings({ topP })
  }, [updateLLMSettings])

  /**
   * Update frequency penalty setting
   * @param frequencyPenalty Frequency penalty value (-2 to 2)
   */
  const updateFrequencyPenalty = useCallback((frequencyPenalty: number) => {
    updateLLMSettings({ frequencyPenalty })
  }, [updateLLMSettings])

  /**
   * Update presence penalty setting
   * @param presencePenalty Presence penalty value (-2 to 2)
   */
  const updatePresencePenalty = useCallback((presencePenalty: number) => {
    updateLLMSettings({ presencePenalty })
  }, [updateLLMSettings])

  /**
   * Apply preset configuration
   * @param preset The preset configuration to apply
   */
  const applyPreset = useCallback((preset: { model: string; tool: string; personality: string }) => {
    // Find the model object from the preset model ID
    const modelToSet = AVAILABLE_MODELS.find(model => model.id === preset.model) || DEFAULT_MODEL
    
    setSelectedModel(modelToSet)
    setSelectedTool(preset.tool)
    setSelectedPersonality(preset.personality)
    
    // Add to recent models
    updateUserPreferences({
      recentModels: [modelToSet, ...userPreferences.recentModels.filter(m => m.id !== modelToSet.id)].slice(0, 5)
    })
    
    setLastAction(`Preset aplicado: ${modelToSet.name}, ${preset.tool}, ${preset.personality}`)
  }, [userPreferences, updateUserPreferences])

  // Carregar preferências do localStorage ao iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Carregar tema
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme) {
        setThemeState(savedTheme)
      }
      
      // Carregar model selecionado
        const savedModel = localStorage.getItem('selectedModel')
        if (savedModel) {
          try {
          const modelObj = JSON.parse(savedModel)
          setSelectedModel(modelObj)
        } catch (error) {
          console.error('Erro ao carregar modelo salvo:', error)
          }
        }
        
        // Carregar ferramenta selecionada
        const savedTool = localStorage.getItem('selectedTool')
        if (savedTool) {
          setSelectedTool(savedTool)
        }
        
      // Carregar toolsEnabled
        const savedToolsEnabled = localStorage.getItem('toolsEnabled')
        if (savedToolsEnabled) {
          setToolsEnabled(savedToolsEnabled === 'true')
        }
        
        // Carregar personalidade selecionada
      const savedPersonality = localStorage.getItem('selectedPersonality')
        if (savedPersonality) {
        setSelectedPersonality(savedPersonality)
        }
        
      // Carregar user preferences
      const savedPreferences = localStorage.getItem('userPreferences')
      if (savedPreferences) {
        try {
          const preferences = JSON.parse(savedPreferences)
          setUserPreferences(preferences)
      } catch (error) {
        console.error('Erro ao carregar preferências:', error)
        }
      }
    }
  }, [])

  const contextValue: AppContextType = useMemo(
    () => ({
      // Theme
      theme: themeState,
      setTheme: setThemeState,

      // Sidebar
      isSidebarOpen,
      setIsSidebarOpen,

      // Focus mode
      focusMode,
      setFocusMode,

      // User preferences
      userPreferences,
      updateUserPreferences,

      // LLM Settings
      updateLLMSettings,
      updateTemperature,
      updateMaxTokens,
      updateTopP,
      updateFrequencyPenalty,
      updatePresencePenalty,

      // Selected model
      selectedModel,
      setSelectedModel: (model: AIModel) => {
        setSelectedModel(model)
        // Add to recent models
        updateUserPreferences({
          recentModels: [model, ...userPreferences.recentModels.filter(m => m.id !== model.id)].slice(0, 5)
        })
      },

      // Selected tool
      selectedTool,
      setSelectedTool: (tool: string) => {
        setSelectedTool(tool)
        // Add to recent tools
        updateUserPreferences({
          recentTools: [tool, ...userPreferences.recentTools.filter(t => t !== tool)].slice(0, 5)
        })
      },

      // Tools enabled/disabled
      toolsEnabled,
      setToolsEnabled,

      // Selected personality
      selectedPersonality,
      setPersonality: setSelectedPersonality,
      setSelectedPersonality: (personality: string) => {
        setSelectedPersonality(personality)
        // Add to recent personalities
        updateUserPreferences({
          recentPersonalities: [personality, ...userPreferences.recentPersonalities.filter(p => p !== personality)].slice(0, 5)
        })
      },

      // Selected preset
      preset,
      setPreset,

      // Apply preset
      applyPreset,

      // Settings - enabled models and tools
      enabledModels,
      setEnabledModels,
      enabledTools,
      setEnabledTools,

      // Last action
      lastAction,
      setLastAction,

      // Component selector
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
      isSidebarOpen,
      focusMode,
      userPreferences,
      updateUserPreferences,
      updateLLMSettings,
      updateTemperature,
      updateMaxTokens,
      updateTopP,
      updateFrequencyPenalty,
      updatePresencePenalty,
      selectedModel,
      selectedTool,
      toolsEnabled,
      selectedPersonality,
      preset,
      applyPreset,
      enabledModels,
      enabledTools,
      lastAction,
      isComponentSelectorActive,
      selectedComponent,
      hoveredComponent,
      dragState,
    ]
  )

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export default useApp
