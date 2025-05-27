import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with Tailwind CSS classes
 *
 * @param inputs - Class names to combine
 * @returns Combined class names
 *
 * @example
 * ```tsx
 * <div className={cn('fixed inset-0', isOpen && 'bg-black/50')} />
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a unique ID
 *
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 *
 * @example
 * ```tsx
 * const id = generateId('node');
 * // => 'node-1a2b3c4d'
 * ```
 */
export function generateId(prefix = ""): string {
  const random = Math.random().toString(36).substring(2, 10)
  return prefix ? `${prefix}-${random}` : random
}

/**
 * Throttles a function to limit how often it can be called
 *
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns A throttled function
 *
 * @example
 * ```tsx
 * const handleMouseMove = throttle((e) => {
 *   console.log(e.clientX, e.clientY);
 * }, 100);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * Debounces a function to delay its execution
 *
 * @param func - The function to debounce
 * @param wait - The wait time in milliseconds
 * @returns A debounced function
 *
 * @example
 * ```tsx
 * const handleSearch = debounce((term) => {
 *   searchApi(term);
 * }, 300);
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
