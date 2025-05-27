"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook for debouncing values
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up the timeout
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up on unmount or when value/delay changes
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
