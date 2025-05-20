"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import type { AIModel, UserPreferences } from "@types"
import type { Component } from "@types"
import type { ChatPreset } from "../../../../packages/types/chat";

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

const DEFAULT_TOOL = "No Tools"
const DEFAULT_PERSONALITY = "Natural"

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

/**
 * Application context type definition
 * @ai-pattern context-type
 * Comprehensive type definition for the application context
 */
export interface AppContextType {
  // Model selection
  selectedModel: AIModel
  setSelectedModel: (model: AIModel) => void

  // Tool selection
  selectedTool: string
  setSelectedTool: (tool: string) => void

  // Personality selection
  selectedPersonality: string
  setSelectedPersonality: (personality: string) => void

  // UI state
  showConfig: boolean
  setShowConfig: (show: boolean) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
  isHistoryOpen: boolean
  setIsHistoryOpen: (isOpen: boolean) => void
  isModelSelectorOpen: boolean
  setIsModelSelectorOpen: (isOpen: boolean) => void

  // Component selector state
  isComponentSelectorActive: boolean
  setComponentSelectorActive: (isActive: boolean) => void

  // Focus mode
  focusMode: boolean
  setFocusMode: (enabled: boolean) => void

  // Theme
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
  effectiveTheme: "light" | "dark" // Computed actual theme

  // User feedback
  lastAction: string | null
  setLastAction: (action: string | null) => void

  // User preferences
  userPreferences: UserPreferences
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void

  // Recent items management
  addRecentModel: (model: AIModel) => void
  addRecentTool: (tool: string) => void
  addRecentPersonality: (personality: string) => void

  // Favorites management
  toggleFavoriteModel: (modelId: string) => void
  toggleFavoriteConversation: (conversationId: string) => void
  isFavoriteModel: (modelId: string) => boolean
  isFavoriteConversation: (conversationId: string) => boolean

  // Component selection
  selectedComponent: Component | null
  setSelectedComponent: (component: Component | null) => void
  hoveredComponent: Component | null
  setHoveredComponent: (component: Component | null) => void
  dragState: { isDragging: boolean; component?: Component; x?: number; y?: number } | null
  setDragState: (state: { isDragging: boolean; component?: Component; x?: number; y?: number } | null) => void
  updateDragPosition: (position: { x: number; y: number }) => void

  // Presets management
  savedPresets: ChatPreset[]
  savePreset: (preset: ChatPreset) => void
  deletePreset: (presetId: string) => void
  toggleFavoritePreset: (presetId: string) => void
  applyPreset: (preset: ChatPreset) => void
}

// Create the context with undefined default value
const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * Hook to access the application context
 * @returns The application context
 * @throws {Error} If used outside of an AppProvider
 * @ai-pattern context-hook
 * Custom hook for accessing context with proper error handling
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

/**
 * Props for the AppProvider component
 */
export interface AppProviderProps {
  children: React.ReactNode
  initialModel?: AIModel
  initialTool?: string
  initialPersonality?: string
  initialPreferences?: Partial<UserPreferences>
}

/**
 * Application context provider component
 * @param props Provider props
 * @returns Provider component
 * @ai-pattern context-provider
 * Central state management for the application
 */
export function AppProvider({
  children,
  initialModel = DEFAULT_MODEL,
  initialTool = DEFAULT_TOOL,
  initialPersonality = DEFAULT_PERSONALITY,
  initialPreferences = {},
}: AppProviderProps) {
  // Model, tool, and personality state
  const [selectedModel, setSelectedModel] = useState<AIModel>(initialModel)
  const [selectedTool, setSelectedTool] = useState<string>(initialTool)
  const [selectedPersonality, setSelectedPersonality] = useState<string>(initialPersonality)

  // UI state
  const [showConfig, setShowConfig] = useState<boolean>(
    initialPreferences.interface?.showConfigByDefault ?? INITIAL_USER_PREFERENCES.interface.showConfigByDefault,
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState<boolean>(false)
  const [focusMode, setFocusMode] = useState<boolean>(false)

  // Component selector state
  const [isComponentSelectorActive, setComponentSelectorActive] = useState<boolean>(false)

  // Theme state
  const [theme, setThemeState] = useState<"light" | "dark" | "system">(
    initialPreferences.theme ?? INITIAL_USER_PREFERENCES.theme,
  )

  // Computed effective theme based on system preference
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light")

  // User feedback state
  const [lastAction, setLastAction] = useState<string | null>(null)

  // User preferences state
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    ...INITIAL_USER_PREFERENCES,
    ...initialPreferences,
  })

  // Component selection state
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
    setUserPreferences((prev) => ({
      ...prev,
      ...preferences,
    }))
  }, [])

  /**
   * Set theme and update preferences
   * @param newTheme The new theme to set
   */
  const setTheme = useCallback(
    (newTheme: "light" | "dark" | "system") => {
      setThemeState(newTheme)
      updateUserPreferences({ theme: newTheme })
    },
    [updateUserPreferences],
  )

  /**
   * Add a model to recent models
   * @param model The model to add to recents
   */
  const addRecentModel = useCallback((model: AIModel) => {
    if (!model || !model.id) return

    setUserPreferences((prev) => {
      // Filter out the current model if it already exists
      const filteredModels = prev.recentModels.filter((m) => m.id !== model.id)

      // Add the model to the beginning of the list and limit to 5 items
      const updatedModels = [model, ...filteredModels].slice(0, 5)

      return {
        ...prev,
        recentModels: updatedModels,
      }
    })
  }, [])

  /**
   * Add a tool to recent tools
   * @param tool The tool to add to recents
   */
  const addRecentTool = useCallback((tool: string) => {
    if (!tool) return

    setUserPreferences((prev) => {
      // Filter out the current tool if it already exists
      const filteredTools = prev.recentTools.filter((t) => t !== tool)

      // Add the tool to the beginning of the list and limit to 5 items
      const updatedTools = [tool, ...filteredTools].slice(0, 5)

      return {
        ...prev,
        recentTools: updatedTools,
      }
    })
  }, [])

  /**
   * Add a personality to recent personalities
   * @param personality The personality to add to recents
   */
  const addRecentPersonality = useCallback((personality: string) => {
    if (!personality) return

    setUserPreferences((prev) => {
      // Filter out the current personality if it already exists
      const filteredPersonalities = prev.recentPersonalities.filter((p) => p !== personality)

      // Add the personality to the beginning of the list and limit to 5 items
      const updatedPersonalities = [personality, ...filteredPersonalities].slice(0, 5)

      return {
        ...prev,
        recentPersonalities: updatedPersonalities,
      }
    })
  }, [])

  /**
   * Toggle a model as favorite
   * @param modelId The model ID to toggle
   */
  const toggleFavoriteModel = useCallback((modelId: string) => {
    if (!modelId) return

    setUserPreferences((prev) => {
      const isFavorite = prev.favoriteModels.includes(modelId)

      return {
        ...prev,
        favoriteModels: isFavorite
          ? prev.favoriteModels.filter((id) => id !== modelId)
          : [...prev.favoriteModels, modelId],
      }
    })
  }, [])

  /**
   * Toggle a conversation as favorite
   * @param conversationId The conversation ID to toggle
   */
  const toggleFavoriteConversation = useCallback((conversationId: string) => {
    if (!conversationId) return

    setUserPreferences((prev) => {
      const isFavorite = prev.favoriteConversations.includes(conversationId)

      return {
        ...prev,
        favoriteConversations: isFavorite
          ? prev.favoriteConversations.filter((id) => id !== conversationId)
          : [...prev.favoriteConversations, conversationId],
      }
    })
  }, [])

  /**
   * Check if a model is favorited
   * @param modelId The model ID to check
   * @returns Whether the model is favorited
   */
  const isFavoriteModel = useCallback(
    (modelId: string) => {
      return userPreferences.favoriteModels.includes(modelId)
    },
    [userPreferences.favoriteModels],
  )

  /**
   * Check if a conversation is favorited
   * @param conversationId The conversation ID to check
   * @returns Whether the conversation is favorited
   */
  const isFavoriteConversation = useCallback(
    (conversationId: string) => {
      return userPreferences.favoriteConversations.includes(conversationId)
    },
    [userPreferences.favoriteConversations],
  )

  /**
   * Update drag position
   * @param position The new position
   */
  const updateDragPosition = useCallback((position: { x: number; y: number }) => {
    setDragState((prev) => (prev ? { ...prev, ...position } : null))
  }, [])

  // Effect to apply focus mode styles
  useEffect(() => {
    if (focusMode) {
      document.body.classList.add("chat-focus-mode")
    } else {
      document.body.classList.remove("chat-focus-mode")
    }

    return () => {
      document.body.classList.remove("chat-focus-mode")
    }
  }, [focusMode])

  // Effect to apply theme to document
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    // Determine effective theme based on system preference
    const newEffectiveTheme =
      theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme

    // Update effective theme state
    setEffectiveTheme(newEffectiveTheme as "light" | "dark")

    // Apply theme class to document
    if (newEffectiveTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Listen for system theme changes if using system theme
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

      const handleChange = (e: MediaQueryListEvent) => {
        setEffectiveTheme(e.matches ? "dark" : "light")
        if (e.matches) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }

      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      selectedModel,
      setSelectedModel,
      selectedTool,
      setSelectedTool,
      selectedPersonality,
      setSelectedPersonality,
      showConfig,
      setShowConfig,
      isSidebarOpen,
      setIsSidebarOpen,
      isHistoryOpen,
      setIsHistoryOpen,
      isModelSelectorOpen,
      setIsModelSelectorOpen,
      isComponentSelectorActive,
      setComponentSelectorActive,
      focusMode,
      setFocusMode,
      theme,
      setTheme,
      effectiveTheme,
      lastAction,
      setLastAction,
      userPreferences,
      updateUserPreferences,
      addRecentModel,
      addRecentTool,
      addRecentPersonality,
      toggleFavoriteModel,
      toggleFavoriteConversation,
      isFavoriteModel,
      isFavoriteConversation,
      selectedComponent,
      setSelectedComponent,
      hoveredComponent,
      setHoveredComponent,
      dragState,
      setDragState,
      updateDragPosition,
    }),
    [
      selectedModel,
      selectedTool,
      selectedPersonality,
      showConfig,
      isSidebarOpen,
      isHistoryOpen,
      isModelSelectorOpen,
      isComponentSelectorActive,
      focusMode,
      theme,
      effectiveTheme,
      lastAction,
      userPreferences,
      updateUserPreferences,
      addRecentModel,
      addRecentTool,
      addRecentPersonality,
      toggleFavoriteModel,
      toggleFavoriteConversation,
      isFavoriteModel,
      isFavoriteConversation,
      selectedComponent,
      hoveredComponent,
      dragState,
      setDragState,
      updateDragPosition,
    ],
  )

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}
