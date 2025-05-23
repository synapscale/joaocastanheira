"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface AppContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  currentTab: string
  setCurrentTab: (tab: string) => void
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentTab, setCurrentTab] = useState('canvas')
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        currentTab,
        setCurrentTab,
        theme,
        setTheme
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
