/**
 * AI-Friendly Utility Functions
 *
 * Purpose: Provides a collection of utility functions designed with AI-friendly patterns
 * AI Context: These utilities follow predictable patterns that AI can easily understand,
 * extend, and compose together to solve complex problems
 *
 * Features:
 * - Pure functions with clear inputs and outputs
 * - Comprehensive error handling
 * - Type safety throughout
 * - Consistent naming conventions
 * - Extensive documentation
 */

/**
 * Type-safe object key checker
 *
 * Purpose: Safely check if a key exists in an object with proper typing
 * AI Context: This pattern helps AI understand type-safe object manipulation
 *
 * @param obj - Object to check
 * @param key - Key to check for
 * @returns Whether the key exists in the object
 *
 * @example
 * ```typescript
 * const user = { name: "John", age: 30 }
 * if (hasKey(user, "name")) {
 *   // TypeScript knows user.name exists and is string
 *   console.log(user.name.toUpperCase())
 * }
 * ```
 */
export function hasKey<T extends object>(obj: T, key: PropertyKey): key is keyof T {
  return key in obj
}

/**
 * Safe array access with default value
 *
 * Purpose: Safely access array elements without throwing errors
 * AI Context: Demonstrates safe array manipulation patterns
 *
 * @param array - Array to access
 * @param index - Index to access
 * @param defaultValue - Default value if index is out of bounds
 * @returns Array element or default value
 *
 * @example
 * ```typescript
 * const items = ["a", "b", "c"]
 * const item = safeArrayAccess(items, 5, "default") // Returns "default"
 * ```
 */
export function safeArrayAccess<T>(array: T[], index: number, defaultValue: T): T {
  if (index < 0 || index >= array.length) {
    return defaultValue
  }
  return array[index]
}

/**
 * Deep clone an object safely
 *
 * Purpose: Create a deep copy of an object without external dependencies
 * AI Context: Shows how to handle complex object cloning with error handling
 *
 * @param obj - Object to clone
 * @returns Deep cloned object
 * @throws Error if object contains circular references or non-serializable values
 *
 * @example
 * ```typescript
 * const original = { user: { name: "John", settings: { theme: "dark" } } }
 * const cloned = deepClone(original)
 * cloned.user.name = "Jane" // Original remains unchanged
 * ```
 */
export function deepClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (error) {
    throw new Error(`Failed to deep clone object: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Debounce function execution
 *
 * Purpose: Limit function execution frequency for performance optimization
 * AI Context: Demonstrates function composition and closure patterns
 *
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log("Searching for:", query)
 * }, 300)
 *
 * debouncedSearch("hello") // Will only execute after 300ms of no calls
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * Throttle function execution
 *
 * Purpose: Limit function execution to a maximum frequency
 * AI Context: Shows rate limiting patterns for performance optimization
 *
 * @param func - Function to throttle
 * @param limit - Minimum time between executions in milliseconds
 * @returns Throttled function
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle((event: Event) => {
 *   console.log("Scroll event:", event)
 * }, 100)
 *
 * window.addEventListener("scroll", throttledScroll)
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Generate unique identifier
 *
 * Purpose: Create unique IDs for components and data structures
 * AI Context: Demonstrates ID generation patterns with customizable prefixes
 *
 * @param prefix - Optional prefix for the ID
 * @param length - Length of the random part (default: 8)
 * @returns Unique identifier string
 *
 * @example
 * ```typescript
 * const nodeId = generateUniqueId("node") // "node_a1b2c3d4"
 * const genericId = generateUniqueId() // "id_a1b2c3d4"
 * ```
 */
export function generateUniqueId(prefix = "id", length = 8): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 2 + length)
  return `${prefix}_${timestamp}_${randomPart}`
}

/**
 * Format file size in human-readable format
 *
 * Purpose: Convert byte sizes to human-readable strings
 * AI Context: Shows number formatting and unit conversion patterns
 *
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted size string
 *
 * @example
 * ```typescript
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 * formatFileSize(1073741824, 1) // "1.0 GB"
 * ```
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Validate email address format
 *
 * Purpose: Check if a string is a valid email address
 * AI Context: Demonstrates regex patterns and validation logic
 *
 * @param email - Email string to validate
 * @returns Whether the email is valid
 *
 * @example
 * ```typescript
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid-email") // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Capitalize first letter of a string
 *
 * Purpose: Format strings with proper capitalization
 * AI Context: Shows string manipulation patterns
 *
 * @param str - String to capitalize
 * @returns String with first letter capitalized
 *
 * @example
 * ```typescript
 * capitalize("hello world") // "Hello world"
 * capitalize("HELLO") // "Hello"
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert camelCase to kebab-case
 *
 * Purpose: Transform naming conventions for different contexts
 * AI Context: Demonstrates string transformation patterns
 *
 * @param str - CamelCase string
 * @returns kebab-case string
 *
 * @example
 * ```typescript
 * camelToKebab("myComponentName") // "my-component-name"
 * camelToKebab("HTMLElement") // "html-element"
 * ```
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase()
}

/**
 * Convert kebab-case to camelCase
 *
 * Purpose: Transform naming conventions for different contexts
 * AI Context: Shows reverse string transformation patterns
 *
 * @param str - kebab-case string
 * @returns camelCase string
 *
 * @example
 * ```typescript
 * kebabToCamel("my-component-name") // "myComponentName"
 * kebabToCamel("html-element") // "htmlElement"
 * ```
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Clamp a number between min and max values
 *
 * Purpose: Ensure numbers stay within specified bounds
 * AI Context: Demonstrates mathematical constraint patterns
 *
 * @param value - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped number
 *
 * @example
 * ```typescript
 * clamp(15, 0, 10) // 10
 * clamp(-5, 0, 10) // 0
 * clamp(5, 0, 10) // 5
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation between two values
 *
 * Purpose: Calculate intermediate values for animations and transitions
 * AI Context: Shows mathematical interpolation patterns
 *
 * @param start - Starting value
 * @param end - Ending value
 * @param factor - Interpolation factor (0-1)
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * lerp(0, 100, 0.5) // 50
 * lerp(10, 20, 0.25) // 12.5
 * ```
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * clamp(factor, 0, 1)
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 *
 * Purpose: Comprehensive emptiness checking for various data types
 * AI Context: Demonstrates type checking and validation patterns
 *
 * @param value - Value to check
 * @returns Whether the value is considered empty
 *
 * @example
 * ```typescript
 * isEmpty(null) // true
 * isEmpty("") // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty("hello") // false
 * isEmpty([1, 2, 3]) // false
 * ```
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === "string") return value.length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "object") return Object.keys(value).length === 0
  return false
}

/**
 * Retry an async operation with exponential backoff
 *
 * Purpose: Handle unreliable async operations with intelligent retry logic
 * AI Context: Demonstrates error handling and retry patterns
 *
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelay - Base delay between retries in milliseconds
 * @returns Promise that resolves with the operation result
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => fetch("/api/data").then(r => r.json()),
 *   3,
 *   1000
 * )
 * ```
 */
export async function retryWithBackoff<T>(operation: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Create a promise that resolves after a specified delay
 *
 * Purpose: Simple delay utility for async operations
 * AI Context: Shows promise-based timing patterns
 *
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after the delay
 *
 * @example
 * ```typescript
 * await delay(1000) // Wait for 1 second
 * console.log("This runs after 1 second")
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Merge multiple objects deeply
 *
 * Purpose: Combine objects with nested properties safely
 * AI Context: Demonstrates deep object merging patterns
 *
 * @param target - Target object to merge into
 * @param sources - Source objects to merge from
 * @returns Merged object
 *
 * @example
 * ```typescript
 * const result = deepMerge(
 *   { a: { b: 1 } },
 *   { a: { c: 2 } },
 *   { d: 3 }
 * )
 * // Result: { a: { b: 1, c: 2 }, d: 3 }
 * ```
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (!source) return target

  for (const key in source) {
    if (hasKey(source, key)) {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        target[key] = deepMerge(targetValue, sourceValue)
      } else {
        target[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * Format date in a human-readable way
 *
 * Purpose: Convert dates to user-friendly strings
 * AI Context: Shows date formatting and localization patterns
 *
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatDate(new Date()) // "Dec 25, 2023"
 * formatDate(new Date(), { includeTime: true }) // "Dec 25, 2023 at 2:30 PM"
 * ```
 */
export function formatDate(
  date: Date,
  options: {
    includeTime?: boolean
    locale?: string
    format?: "short" | "medium" | "long"
  } = {},
): string {
  const { includeTime = false, locale = "en-US", format = "medium" } = options

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: format === "short" ? "numeric" : format === "medium" ? "short" : "long",
    day: "numeric",
  }

  if (includeTime) {
    dateOptions.hour = "numeric"
    dateOptions.minute = "2-digit"
    dateOptions.hour12 = true
  }

  return new Intl.DateTimeFormat(locale, dateOptions).format(date)
}
