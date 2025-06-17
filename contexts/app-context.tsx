"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface AppContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  currentTab: string
  setCurrentTab: (tab: string) => void
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  personality: string
  setPersonality: (personality: string) => void
  selectedModel: any
  setSelectedModel: (model: any) => void
  toolsEnabled: boolean
  setToolsEnabled: (enabled: boolean) => void
  userPreferences: any
  selectedTool: string
  setSelectedTool: (tool: string) => void
  selectedPersonality: string
  setSelectedPersonality: (personality: string) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  focusMode: boolean
  setFocusMode: (focus: boolean) => void
  lastAction: string
  setLastAction: (action: string) => void
  isComponentSelectorActive: boolean
  setComponentSelectorActive: (active: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentTab, setCurrentTab] = useState('canvas')
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [personality, setPersonality] = useState('natural')
  const [selectedModel, setSelectedModel] = useState({
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Modelo de teste',
    capabilities: { text: true, vision: false, files: false, fast: true },
    contextLength: 128000,
  })
  const [toolsEnabled, setToolsEnabled] = useState(false)
  const [userPreferences] = useState({})
  const [selectedTool, setSelectedTool] = useState('No Tools')
  const [selectedPersonality, setSelectedPersonality] = useState('natural')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [focusMode, setFocusMode] = useState(false)
  const [lastAction, setLastAction] = useState('')
  const [isComponentSelectorActive, setComponentSelectorActive] = useState(false)

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        currentTab,
        setCurrentTab,
        theme,
        setTheme,
        personality,
        setPersonality,
        selectedModel,
        setSelectedModel,
        toolsEnabled,
        setToolsEnabled,
        userPreferences,
        selectedTool,
        setSelectedTool,
        selectedPersonality,
        setSelectedPersonality,
        isSidebarOpen,
        setIsSidebarOpen,
        focusMode,
        setFocusMode,
        lastAction,
        setLastAction,
        isComponentSelectorActive,
        setComponentSelectorActive,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default useApp
