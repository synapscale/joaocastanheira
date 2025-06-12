"use client"

/**
 * Sidebar Context
 *
 * This context manages the state of the sidebar, including open/closed state,
 * collapsed state, and provides functions to manipulate these states.
 *
 * @module SidebarContext
 */


import type React from "react"

import { createContext, useContext, useState, useCallback, useEffect } from "react"

/**
 * Interface defining the shape of the sidebar context
 */
interface SidebarContextType {
  /** Whether the sidebar is currently open */
  isOpen: boolean
  /** Whether the sidebar is in collapsed mode (narrow view) */
  isCollapsed: boolean
  /** Toggle the open/closed state of the sidebar */
  toggle: () => void
  /** Close the sidebar */
  close: () => void
  /** Toggle the collapsed state of the sidebar */
  toggleCollapse: () => void
}

/**
 * Create the sidebar context with default values
 */
const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  isCollapsed: false,
  toggle: () => {},
  close: () => {},
  toggleCollapse: () => {},
})

/**
 * Sidebar Provider Component
 *
 * Provides sidebar state and functions to all child components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // State for sidebar open/closed and collapsed states
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      // On large screens, sidebar is open by default
      setIsOpen(window.innerWidth >= 1024)
    }

    // Set initial state
    if (typeof window !== "undefined") {
      checkScreenSize()
    }

    // Update state on window resize
    window.addEventListener("resize", checkScreenSize)

    // Clean up event listener on unmount
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Toggle sidebar open/closed state
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  // Close the sidebar
  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Toggle sidebar collapsed state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  // Create context value object
  const contextValue = {
    isOpen,
    isCollapsed,
    toggle,
    close,
    toggleCollapse,
  }

  return <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>
}

/**
 * Custom hook to use the sidebar context
 *
 * @returns {SidebarContextType} The sidebar context value
 */
export const useSidebar = () => useContext(SidebarContext)
