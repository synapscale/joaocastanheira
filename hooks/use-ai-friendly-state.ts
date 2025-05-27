"use client"

/**
 * AI-Friendly State Management Hook
 *
 * Purpose: Provides a standardized way to manage component state with AI-friendly patterns
 * AI Context: This hook follows predictable patterns that AI can easily understand and extend
 *
 * @template T - The type of state being managed
 * @param initialState - Initial state value or factory function
 * @param options - Configuration options for state management
 * @returns State management utilities with consistent API
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   setState,
 *   resetState,
 *   updateState,
 *   isLoading,
 *   error
 * } = useAIFriendlyState({ count: 0 }, {
 *   validateState: (state) => state.count >= 0,
 *   onStateChange: (newState) => console.log('State changed:', newState)
 * })
 * ```
 */

import { useState, useCallback, useRef } from "react"

/**
 * Configuration options for the AI-friendly state hook
 */
interface StateHookOptions<T> {
  /** Function to validate state before setting */
  validateState?: (state: T) => boolean

  /** Callback fired when state changes */
  onStateChange?: (newState: T, previousState: T) => void

  /** Whether to persist state to localStorage */
  persistToStorage?: boolean

  /** Key for localStorage persistence */
  storageKey?: string

  /** Whether to enable debug logging */
  enableDebugLogging?: boolean
}

/**
 * Return type for the AI-friendly state hook
 */
interface StateHookReturn<T> {
  /** Current state value */
  state: T

  /** Function to set new state */
  setState: (newState: T | ((prevState: T) => T)) => void

  /** Function to reset state to initial value */
  resetState: () => void

  /** Function to update specific properties of state */
  updateState: (updates: Partial<T>) => void

  /** Whether a state update is in progress */
  isLoading: boolean

  /** Any error that occurred during state management */
  error: string | null

  /** Previous state value */
  previousState: T | null
}

export function useAIFriendlyState<T>(
  initialState: T | (() => T),
  options: StateHookOptions<T> = {},
): StateHookReturn<T> {
  const { validateState, onStateChange, persistToStorage = false, storageKey, enableDebugLogging = false } = options

  // Initialize state with proper handling of factory functions
  const [state, setInternalState] = useState<T>(() => {
    if (persistToStorage && storageKey) {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (enableDebugLogging) {
            console.log(`[useAIFriendlyState] Loaded from storage:`, parsed)
          }
          return parsed
        }
      } catch (error) {
        if (enableDebugLogging) {
          console.warn(`[useAIFriendlyState] Failed to load from storage:`, error)
        }
      }
    }

    return typeof initialState === "function" ? (initialState as () => T)() : initialState
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const previousStateRef = useRef<T | null>(null)
  const initialStateRef = useRef<T>(typeof initialState === "function" ? (initialState as () => T)() : initialState)

  /**
   * Enhanced setState function with validation and side effects
   */
  const setState = useCallback(
    (newState: T | ((prevState: T) => T)) => {
      setIsLoading(true)
      setError(null)

      try {
        const resolvedNewState = typeof newState === "function" ? (newState as (prevState: T) => T)(state) : newState

        // Validate state if validator is provided
        if (validateState && !validateState(resolvedNewState)) {
          throw new Error("State validation failed")
        }

        // Store previous state
        previousStateRef.current = state

        // Update state
        setInternalState(resolvedNewState)

        // Persist to storage if enabled
        if (persistToStorage && storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(resolvedNewState))
            if (enableDebugLogging) {
              console.log(`[useAIFriendlyState] Saved to storage:`, resolvedNewState)
            }
          } catch (storageError) {
            if (enableDebugLogging) {
              console.warn(`[useAIFriendlyState] Failed to save to storage:`, storageError)
            }
          }
        }

        // Fire change callback
        if (onStateChange) {
          onStateChange(resolvedNewState, state)
        }

        if (enableDebugLogging) {
          console.log(`[useAIFriendlyState] State updated:`, {
            previous: state,
            new: resolvedNewState,
          })
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError(errorMessage)

        if (enableDebugLogging) {
          console.error(`[useAIFriendlyState] Error updating state:`, err)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [state, validateState, onStateChange, persistToStorage, storageKey, enableDebugLogging],
  )

  /**
   * Reset state to initial value
   */
  const resetState = useCallback(() => {
    setState(initialStateRef.current)
  }, [setState])

  /**
   * Update specific properties of state (for object states)
   */
  const updateState = useCallback(
    (updates: Partial<T>) => {
      if (typeof state === "object" && state !== null) {
        setState((prevState) => ({ ...prevState, ...updates }))
      } else {
        if (enableDebugLogging) {
          console.warn(`[useAIFriendlyState] updateState called on non-object state`)
        }
      }
    },
    [setState, state, enableDebugLogging],
  )

  return {
    state,
    setState,
    resetState,
    updateState,
    isLoading,
    error,
    previousState: previousStateRef.current,
  }
}
