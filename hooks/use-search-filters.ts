"use client"

import { useState, useCallback } from "react"

export function useSearchFilters() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filteredResults, setFilteredResults] = useState<any[]>([])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedTags([])
    setFilteredResults([])
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    clearFilters,
    filteredResults,
    setFilteredResults,
  }
}
