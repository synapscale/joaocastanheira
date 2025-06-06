"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface OnboardingContextType {
  showOnboarding: boolean
  setShowOnboarding: (show: boolean) => void
  completedSteps: Record<string, boolean>
  markStepComplete: (stepId: string) => void
  resetOnboarding: () => void
  currentTour: string | null
  setCurrentTour: (tourId: string | null) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})
  const [currentTour, setCurrentTour] = useState<string | null>(null)

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: true
    }))
  }, [])

  const resetOnboarding = useCallback(() => {
    setCompletedSteps({})
    setShowOnboarding(true)
  }, [])

  return (
    <OnboardingContext.Provider
      value={{
        showOnboarding,
        setShowOnboarding,
        completedSteps,
        markStepComplete,
        resetOnboarding,
        currentTour,
        setCurrentTour
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

export default useOnboarding
