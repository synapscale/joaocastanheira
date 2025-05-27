"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MarketplaceService } from "@/services/marketplace-service"
import { MarketplaceItemCard } from "@/components/marketplace/marketplace-item-card"
import { Search, Filter, RefreshCw, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import type { MarketplaceItem, SkillCategory } from "@/types/marketplace-types"

interface TestResult {
  name: string
  status: "success" | "warning" | "error"
  message: string
  duration?: number
}

interface TestScenario {
  name: string
  description: string
  test: () => Promise<TestResult>
}

/**
 * MarketplaceFeatureTester Component
 *
 * Comprehensive testing interface for marketplace functionality.
 * Tests search, filtering, browsing, and item interactions.
 */
export function MarketplaceFeatureTester() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState("relevance")
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([])

  // Test scenarios for marketplace functionality
  const testScenarios: TestScenario[] = [
    {
      name: "Load Marketplace Items",
      description: "Test loading initial marketplace items",
      test: async () => {
        const startTime = Date.now()
        try {
          const response = await MarketplaceService.searchItems()
          const duration = Date.now() - startTime

          if (response.items && response.items.length > 0) {
            setItems(response.items)
            setFilteredItems(response.items)
            return {
              name: "Load Marketplace Items",
              status: "success",
              message: `Loaded ${response.items.length} items successfully`,
              duration,
            }
          } else {
            return {
              name: "Load Marketplace Items",
              status: "warning",
              message: "No items found in marketplace",
              duration,
            }
          }
        } catch (error) {
          return {
            name: "Load Marketplace Items",
            status: "error",
            message: `Failed to load items: ${error.message}`,
            duration: Date.now() - startTime,
          }
        }
      },
    },
    {
      name: "Load Categories",
      description: "Test loading marketplace categories",
      test: async () => {
        const startTime = Date.now()
        try {
          const categoriesData = await MarketplaceService.getCategories()
          const duration = Date.now() - startTime

          if (categoriesData && categoriesData.length > 0) {
            setCategories(categoriesData)
            return {
              name: "Load Categories",
              status: "success",
              message: `Loaded ${categoriesData.length} categories`,
              duration,
            }
          } else {
            return {
              name: "Load Categories",
              status: "warning",
              message: "No categories found",
              duration,
            }
          }
        } catch (error) {
          return {
            name: "Load Categories",
            status: "error",
            message: `Failed to load categories: ${error.message}`,
            duration: Date.now() - startTime,
          }
        }
      },
    },
    {
      name: "Search Functionality",
      description: "Test search with various queries",
      test: async () => {
        const startTime = Date.now()
        try {
          const searchQueries = ["text", "AI", "data", "integration"]
          let totalResults = 0

          for (const query of searchQueries) {
            const response = await MarketplaceService.searchItems({ query })
            totalResults += response.items.length
          }

          const duration = Date.now() - startTime
          return {
            name: "Search Functionality",
            status: "success",
            message: `Search tested with ${searchQueries.length} queries, ${totalResults} total results`,
            duration,
          }
        } catch (error) {
          return {
            name: "Search Functionality",
            status: "error",
            message: `Search failed: ${error.message}`,
            duration: Date.now() - startTime,
          }
        }
      },
    },
    {
      name: "Category Filtering",
      description: "Test filtering by categories",
      test: async () => {
        const startTime = Date.now()
        try {
          const testCategories = ["ai", "data-transformation", "ui-interaction"]
          let filteredCount = 0

          for (const category of testCategories) {
            const response = await MarketplaceService.searchItems({ category })
            filteredCount += response.items.length
          }

          const duration = Date.now() - startTime
          return {
            name: "Category Filtering",
            status: "success",
            message: `Category filtering tested, ${filteredCount} filtered results`,
            duration,
          }
        } catch (error) {
          return {
            name: "Category Filtering",
            status: "error",
            message: `Category filtering failed: ${error.message}`,
            duration: Date.now() - startTime,
          }
        }
      },
    },
    {
      name: "Sorting Options",
      description: "Test different sorting options",
      test: async () => {
        const startTime = Date.now()
        try {
          const sortOptions = ["downloads", "rating", "newest", "oldest"]
          let sortedResults = 0

          for (const sortBy of sortOptions) {
            const response = await MarketplaceService.searchItems({ sortBy })
            sortedResults += response.items.length
          }

          const duration = Date.now() - startTime
          return {
            name: "Sorting Options",
            status: "success",
            message: `Sorting tested with ${sortOptions.length} options, ${sortedResults} sorted results`,
            duration,
          }
        } catch (error) {
          return {
            name: "Sorting Options",
            status: "error",
            message: `Sorting failed: ${error.message}`,
            duration: Date.now() - startTime,
          }
        }
      },
    },
    {
      name: "Item Details",
      description: "Test loading item details",
      test: async () => {
        const startTime = Date.now()
        try {
          if (items.length === 0) {
            return {
              name: "Item Details",
              status: "warning",
              message: "No items available to test details",
              duration: Date.now() - startTime,
            }
          }

          const testItem = items[0]
          const details = await MarketplaceService.getItemDetails(testItem.id)
          const duration = Date.now() - startTime

          if (details) {
            return {
              name: "Item Details",
              status: "success",
              message: `Item details loaded for "${details.name}"`,
              duration,
            }
          } else {
            return {
              name: "Item Details",
              status: "error",
              message: "Failed to load item details",
              duration,
            }
          }
        } catch (error) {
          return {
            name: "Item Details",
            status: "error",
            message: `Item details failed: ${error.message}`,
            duration: Date.now() - startTime,
          }
        }
      },
    },
    {
      name: "Import Functionality",
      description: "Test item import simulation",
      test: async () => {
        const startTime = Date.now()
        try {
          if (items.length === 0) {
            return {
              name: "Import Functionality",
              status: "warning",
              message: "No items available to test import",
              duration: Date.now() - startTime,
            }
          }

          const testItem = items[0]
          const importResult = await MarketplaceService.importItem(testItem.id)
          const duration = Date.now() - startTime

          if (importResult && importResult.status === "success") {
            return {
              name: "Import Functionality",
              status: "success",
              message: `Item "${testItem.name}" imported successfully`,
              duration,
            }
          } else {
            return {
              name: "Import Functionality",
              status: "error",
              message: "Import failed",
              duration,
            }
          }
        } catch (error) {
          return {
            name: "Import Functionality",
            status: "error",
            message: `Import failed: ${error.message}`,
            duration: Date.now() - startTime,
          }
        }
      },
    },
  ]

  /**
   * Runs all test scenarios
   */
  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])

    for (const scenario of testScenarios) {
      try {
        const result = await scenario.test()
        setResults((prev) => [...prev, result])
      } catch (error) {
        setResults((prev) => [
          ...prev,
          {
            name: scenario.name,
            status: "error",
            message: `Test execution failed: ${error.message}`,
          },
        ])
      }
    }

    setIsRunning(false)
  }

  /**
   * Handles live search functionality
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredItems(items)
      return
    }

    try {
      const response = await MarketplaceService.searchItems({
        query: searchQuery,
        category: selectedCategory || undefined,
        sortBy,
      })
      setFilteredItems(response.items)
    } catch (error) {
      console.error("Search failed:", error)
    }
  }

  /**
   * Handles category filtering
   */
  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category)

    try {
      const response = await MarketplaceService.searchItems({
        query: searchQuery || undefined,
        category: category || undefined,
        sortBy,
      })
      setFilteredItems(response.items)
    } catch (error) {
      console.error("Category filtering failed:", error)
    }
  }

  /**
   * Handles sorting
   */
  const handleSort = async (newSortBy: string) => {
    setSortBy(newSortBy)

    try {
      const response = await MarketplaceService.searchItems({
        query: searchQuery || undefined,
        category: selectedCategory || undefined,
        sortBy: newSortBy,
      })
      setFilteredItems(response.items)
    } catch (error) {
      console.error("Sorting failed:", error)
    }
  }

  /**
   * Gets status icon for test results
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  /**
   * Calculates test summary
   */
  const getTestSummary = () => {
    const total = results.length
    const success = results.filter((r) => r.status === "success").length
    const warnings = results.filter((r) => r.status === "warning").length
    const errors = results.filter((r) => r.status === "error").length

    return { total, success, warnings, errors }
  }

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [itemsResponse, categoriesData] = await Promise.all([
          MarketplaceService.searchItems(),
          MarketplaceService.getCategories(),
        ])

        setItems(itemsResponse.items)
        setFilteredItems(itemsResponse.items)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to load initial data:", error)
      }
    }

    loadInitialData()
  }, [])

  const summary = getTestSummary()

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Marketplace Feature Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button onClick={runAllTests} disabled={isRunning}>
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>

            {results.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className="text-green-600">
                  ✅ {summary.success} Passed
                </Badge>
                {summary.warnings > 0 && (
                  <Badge variant="outline" className="text-yellow-600">
                    ⚠️ {summary.warnings} Warnings
                  </Badge>
                )}
                {summary.errors > 0 && (
                  <Badge variant="outline" className="text-red-600">
                    ❌ {summary.errors} Errors
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Test Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Test Results:</h4>
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}:</span>
                    <span>{result.message}</span>
                    {result.duration && <span className="text-muted-foreground">({result.duration}ms)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Testing Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Live Marketplace Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search marketplace..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="downloads">Downloads</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Showing {filteredItems.length} of {items.length} items
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <MarketplaceItemCard
                    key={item.id}
                    item={item}
                    onViewDetails={() => console.log("View details:", item.name)}
                    onImport={() => console.log("Import:", item.name)}
                    onAddToCollection={() => console.log("Add to collection:", item.name)}
                  />
                ))}
              </div>

              {filteredItems.length === 0 && items.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">No items match your current filters</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
