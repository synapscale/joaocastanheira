"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void

  // Optional props
  isLoading?: boolean
  showItemsPerPage?: boolean
  itemsPerPage?: number
  itemsPerPageOptions?: number[]
  onItemsPerPageChange?: (count: number) => void
  showSummary?: boolean
  summaryText?: string
  maxVisiblePages?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
  className?: string

  // Responsive overrides
  forceCompact?: boolean
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  showItemsPerPage = false,
  itemsPerPage = 10,
  itemsPerPageOptions = [5, 10, 25, 50],
  onItemsPerPageChange,
  showSummary = false,
  summaryText,
  maxVisiblePages,
  size = "sm",
  variant = "outline",
  className,
  forceCompact = false,
}: PaginationControlsProps) {
  const [windowWidth, setWindowWidth] = useState(1200)

  // Update window width
  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth)
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  // Responsive configuration
  const isMobile = windowWidth < 640
  const isTablet = windowWidth >= 640 && windowWidth < 1024
  const isDesktop = windowWidth >= 1024

  const config = {
    showFirstLast: !isMobile && !forceCompact,
    showPageNumbers: !forceCompact,
    showLabels: !isMobile,
    maxPages: maxVisiblePages || (isMobile ? 3 : isTablet ? 5 : 7),
    showItemsPerPage: showItemsPerPage && isDesktop,
    showSummary: showSummary && !isMobile,
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []

    if (totalPages <= config.maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const halfVisible = Math.floor(config.maxPages / 2)
      let start = Math.max(1, currentPage - halfVisible)
      const end = Math.min(totalPages, start + config.maxPages - 1)

      if (end === totalPages) {
        start = Math.max(1, end - config.maxPages + 1)
      }

      if (start > 1) {
        pages.push(1)
        if (start > 2) pages.push("ellipsis")
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("ellipsis")
        pages.push(totalPages)
      }
    }

    return pages
  }

  // Don't render if only one page
  if (totalPages <= 1) {
    return config.showSummary && summaryText ? (
      <div className={cn("text-sm text-muted-foreground text-center", className)}>{summaryText}</div>
    ) : null
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Summary and items per page row */}
      {(config.showSummary || config.showItemsPerPage) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {config.showSummary && summaryText && <p className="text-sm text-muted-foreground">{summaryText}</p>}

          {config.showItemsPerPage && onItemsPerPageChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Items per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => onItemsPerPageChange(Number.parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemsPerPageOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Pagination navigation */}
      <nav className="flex items-center justify-center gap-1" aria-label="Pagination" role="navigation">
        {/* First page */}
        {config.showFirstLast && (
          <Button
            variant={variant}
            size={size}
            disabled={currentPage === 1 || isLoading}
            onClick={() => onPageChange(1)}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous page */}
        <Button
          variant={variant}
          size={size}
          disabled={currentPage === 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          {config.showLabels && <span className="ml-1">Previous</span>}
        </Button>

        {/* Page numbers */}
        {config.showPageNumbers && (
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <div key={`ellipsis-${index}`} className="flex items-center justify-center w-9 h-9">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                )
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : variant}
                  size={size}
                  disabled={isLoading}
                  onClick={() => onPageChange(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                  className="w-9 h-9 p-0"
                >
                  {page}
                </Button>
              )
            })}
          </div>
        )}

        {/* Compact page indicator */}
        {forceCompact && (
          <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-md">
            {currentPage} / {totalPages}
          </span>
        )}

        {/* Next page */}
        <Button
          variant={variant}
          size={size}
          disabled={currentPage === totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Go to next page"
        >
          {config.showLabels && <span className="mr-1">Next</span>}
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        {config.showFirstLast && (
          <Button
            variant={variant}
            size={size}
            disabled={currentPage === totalPages || isLoading}
            onClick={() => onPageChange(totalPages)}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="ml-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </nav>
    </div>
  )
}
