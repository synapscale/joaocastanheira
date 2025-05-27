"use client"

import { useState, useCallback, useMemo, useEffect } from "react"

/**
 * Pagination configuration options
 */
export interface UsePaginationOptions {
  totalItems: number
  itemsPerPage?: number
  initialPage?: number
  onPageChange?: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
}

/**
 * Pagination return interface
 */
export interface UsePaginationReturn {
  // Core pagination state
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalItems: number

  // Calculated indices
  startIndex: number
  endIndex: number

  // Navigation functions
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  firstPage: () => void
  lastPage: () => void

  // State checks
  canGoNext: boolean
  canGoPrev: boolean
  isFirstPage: boolean
  isLastPage: boolean

  // Responsive page numbers
  getPageNumbers: (maxVisible?: number) => (number | "ellipsis")[]

  // Utility functions
  setItemsPerPage: (count: number) => void
  setTotalItems: (count: number) => void
  reset: () => void

  // Summary text
  getSummary: () => string
}

/**
 * Enhanced pagination hook with responsive design
 */
export function usePagination({
  totalItems,
  itemsPerPage: initialItemsPerPage = 10,
  initialPage = 1,
  onPageChange,
  onItemsPerPageChange,
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(Math.max(1, initialPage))
  const [itemsPerPage, setItemsPerPageState] = useState(Math.max(1, initialItemsPerPage))
  const [internalTotalItems, setInternalTotalItems] = useState(Math.max(0, totalItems))

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(internalTotalItems / itemsPerPage))
  }, [internalTotalItems, itemsPerPage])

  // Ensure current page is within bounds
  const normalizedPage = useMemo(() => {
    return Math.min(Math.max(1, currentPage), totalPages)
  }, [currentPage, totalPages])

  // Update current page if it's out of bounds
  useEffect(() => {
    if (normalizedPage !== currentPage) {
      setCurrentPage(normalizedPage)
    }
  }, [normalizedPage, currentPage])

  // Update total items when prop changes
  useEffect(() => {
    setInternalTotalItems(Math.max(0, totalItems))
  }, [totalItems])

  // Calculate start and end indices
  const startIndex = useMemo(() => {
    return (normalizedPage - 1) * itemsPerPage
  }, [normalizedPage, itemsPerPage])

  const endIndex = useMemo(() => {
    return Math.min(startIndex + itemsPerPage - 1, internalTotalItems - 1)
  }, [startIndex, itemsPerPage, internalTotalItems])

  // Navigation state
  const canGoNext = normalizedPage < totalPages
  const canGoPrev = normalizedPage > 1
  const isFirstPage = normalizedPage === 1
  const isLastPage = normalizedPage === totalPages

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      const targetPage = Math.min(Math.max(1, page), totalPages)
      if (targetPage !== normalizedPage) {
        setCurrentPage(targetPage)
        onPageChange?.(targetPage)
      }
    },
    [normalizedPage, totalPages, onPageChange],
  )

  const nextPage = useCallback(() => {
    if (canGoNext) goToPage(normalizedPage + 1)
  }, [canGoNext, goToPage, normalizedPage])

  const prevPage = useCallback(() => {
    if (canGoPrev) goToPage(normalizedPage - 1)
  }, [canGoPrev, goToPage, normalizedPage])

  const firstPage = useCallback(() => {
    goToPage(1)
  }, [goToPage])

  const lastPage = useCallback(() => {
    goToPage(totalPages)
  }, [goToPage, totalPages])

  // Generate responsive page numbers
  const getPageNumbers = useCallback(
    (maxVisible = 5) => {
      const pages: (number | "ellipsis")[] = []

      if (totalPages <= maxVisible) {
        // Show all pages if total is less than max
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Calculate visible range
        const halfVisible = Math.floor(maxVisible / 2)
        let start = Math.max(1, normalizedPage - halfVisible)
        const end = Math.min(totalPages, start + maxVisible - 1)

        // Adjust start if end is at the boundary
        if (end === totalPages) {
          start = Math.max(1, end - maxVisible + 1)
        }

        // Add first page and ellipsis if needed
        if (start > 1) {
          pages.push(1)
          if (start > 2) {
            pages.push("ellipsis")
          }
        }

        // Add visible pages
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }

        // Add ellipsis and last page if needed
        if (end < totalPages) {
          if (end < totalPages - 1) {
            pages.push("ellipsis")
          }
          pages.push(totalPages)
        }
      }

      return pages
    },
    [normalizedPage, totalPages],
  )

  // Items per page change
  const setItemsPerPage = useCallback(
    (count: number) => {
      const newCount = Math.max(1, count)
      if (newCount !== itemsPerPage) {
        // Calculate new page to maintain position
        const currentFirstItem = (normalizedPage - 1) * itemsPerPage
        const newPage = Math.floor(currentFirstItem / newCount) + 1

        setItemsPerPageState(newCount)
        setCurrentPage(newPage)

        onItemsPerPageChange?.(newCount)
        onPageChange?.(newPage)
      }
    },
    [itemsPerPage, normalizedPage, onItemsPerPageChange, onPageChange],
  )

  // Set total items
  const setTotalItems = useCallback((count: number) => {
    setInternalTotalItems(Math.max(0, count))
  }, [])

  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(1)
    onPageChange?.(1)
  }, [onPageChange])

  // Get summary text
  const getSummary = useCallback(() => {
    if (internalTotalItems === 0) {
      return "No items"
    }

    const start = startIndex + 1
    const end = Math.min(startIndex + itemsPerPage, internalTotalItems)
    const total = internalTotalItems

    return `Showing ${start}-${end} of ${total} ${total === 1 ? "item" : "items"}`
  }, [startIndex, itemsPerPage, internalTotalItems])

  return {
    currentPage: normalizedPage,
    itemsPerPage,
    totalPages,
    totalItems: internalTotalItems,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    canGoNext,
    canGoPrev,
    isFirstPage,
    isLastPage,
    getPageNumbers,
    setItemsPerPage,
    setTotalItems,
    reset,
    getSummary,
  }
}
