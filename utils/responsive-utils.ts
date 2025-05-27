/**
 * RESPONSIVE UTILITIES
 *
 * Utilities for preventing horizontal overflow and ensuring responsive layouts
 */

import { cn } from "@/lib/utils"

/**
 * Breakpoint definitions following Tailwind CSS standards
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

/**
 * Container classes that prevent horizontal overflow
 */
export const CONTAINER_CLASSES = {
  // Base container that prevents overflow
  base: "w-full max-w-full overflow-hidden",

  // Responsive containers with proper constraints
  responsive: "w-full max-w-full min-w-0 overflow-hidden",

  // Flex containers that prevent overflow
  flex: "flex w-full max-w-full min-w-0 overflow-hidden",

  // Grid containers that prevent overflow
  grid: "grid w-full max-w-full min-w-0 overflow-hidden",

  // Content containers with proper padding
  content: "w-full max-w-full min-w-0 px-4 sm:px-6 lg:px-8 overflow-hidden",

  // Page containers
  page: "w-full max-w-full min-w-0 h-full overflow-hidden",
} as const

/**
 * Text classes that prevent overflow
 */
export const TEXT_CLASSES = {
  // Truncate text with ellipsis
  truncate: "truncate",

  // Break long words
  breakWords: "break-words",

  // Break all characters if needed
  breakAll: "break-all",

  // Responsive text that adapts to screen size
  responsive: "text-sm sm:text-base lg:text-lg break-words",
} as const

/**
 * Layout classes for preventing overflow
 */
export const LAYOUT_CLASSES = {
  // Sidebar that doesn't cause overflow
  sidebar: "flex-shrink-0 w-full max-w-xs sm:max-w-sm lg:max-w-md overflow-hidden",

  // Main content that adapts to available space
  main: "flex-1 min-w-0 overflow-hidden",

  // Two column layout that prevents overflow
  twoColumn: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-full overflow-hidden",

  // Three column layout that prevents overflow
  threeColumn: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full max-w-full overflow-hidden",
} as const

/**
 * Utility function to create responsive container classes
 */
export function createResponsiveContainer(
  baseClasses = "",
  options: {
    preventOverflow?: boolean
    responsive?: boolean
    padding?: boolean
  } = {},
) {
  const { preventOverflow = true, responsive = true, padding = true } = options

  return cn(
    baseClasses,
    preventOverflow && "w-full max-w-full min-w-0 overflow-hidden",
    responsive && "flex-1",
    padding && "px-4 sm:px-6 lg:px-8",
  )
}

/**
 * Utility function to create responsive grid classes
 */
export function createResponsiveGrid(
  columns: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  } = {},
) {
  const { default: defaultCols = 1, sm = defaultCols, md = sm, lg = md, xl = lg } = columns

  const gridClasses = [
    `grid-cols-${defaultCols}`,
    sm !== defaultCols && `sm:grid-cols-${sm}`,
    md !== sm && `md:grid-cols-${md}`,
    lg !== md && `lg:grid-cols-${lg}`,
    xl !== lg && `xl:grid-cols-${xl}`,
  ].filter(Boolean)

  return cn("grid w-full max-w-full gap-4 overflow-hidden", ...gridClasses)
}

/**
 * Hook for detecting screen size and preventing overflow
 */
export function useResponsiveLayout() {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 1024,
    }
  }

  const screenWidth = window.innerWidth

  return {
    isMobile: screenWidth < BREAKPOINTS.md,
    isTablet: screenWidth >= BREAKPOINTS.md && screenWidth < BREAKPOINTS.lg,
    isDesktop: screenWidth >= BREAKPOINTS.lg,
    screenWidth,
  }
}
