"use client"

import type React from "react"

import { useState, useEffect, useCallback, memo } from "react"
import { MarketplaceService } from "@/services/marketplace-service"
import type { SkillCollection, CollectionFilters } from "@/types/marketplace-types"
import { CollectionCard } from "./collection-card"
import { SearchBar } from "../ui/search-bar"
import { PaginationControls } from "../ui/pagination-controls"
import { ResponsiveGrid } from "../ui/responsive-grid"
import { CardSkeleton } from "../ui/skeletons/card-skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { usePagination } from "@/hooks/use-pagination"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

export enum CollectionType {
  ALL = "all",
  FEATURED = "featured",
  PERSONAL = "personal",
  PUBLIC = "public",
}

interface CollectionsBrowserProps {
  title?: string
  description?: string
  collectionType?: CollectionType
  initialFilters?: CollectionFilters
  showSearchBar?: boolean
  showPagination?: boolean
  itemsPerPage?: number
  onCollectionClick?: (collection: SkillCollection) => void
  onCollectionTypeChange?: (type: CollectionType) => void
  emptyStateContent?: React.ReactNode
  className?: string
  showCreateButton?: boolean
  onCreateCollection?: () => void
}

export const CollectionsBrowser = memo(function CollectionsBrowser({
  title = "Collections",
  description = "Browse and discover curated collections of skills",
  collectionType = CollectionType.ALL,
  initialFilters = {},
  showSearchBar = true,
  showPagination = true,
  itemsPerPage = 12,
  onCollectionClick,
  onCollectionTypeChange,
  emptyStateContent,
  className = "",
  showCreateButton = false,
  onCreateCollection,
}: CollectionsBrowserProps) {
  const router = useRouter()

  // State
  const [collections, setCollections] = useState<SkillCollection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<CollectionType>(collectionType)
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || "")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Pagination
  const pagination = usePagination({
    totalItems: 0,
    itemsPerPage,
    onPageChange: () => {
      // Smooth scroll to top on page change
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
  })

  // Fetch collections
  const fetchCollections = useCallback(async () => {
    setIsLoading(true)
    try {
      const searchFilters: CollectionFilters = {
        ...initialFilters,
        query: debouncedSearchQuery,
        page: pagination.currentPage,
        pageSize: pagination.itemsPerPage,
      }

      let response
      switch (activeTab) {
        case CollectionType.FEATURED:
          const featured = await MarketplaceService.getFeaturedCollections(pagination.itemsPerPage)
          response = { collections: featured, totalCount: featured.length }
          break
        case CollectionType.PERSONAL:
          const personal = await MarketplaceService.getUserCollections()
          response = { collections: personal, totalCount: personal.length }
          break
        case CollectionType.PUBLIC:
          response = await MarketplaceService.getPublicCollections(searchFilters)
          break
        default:
          response = await MarketplaceService.getAllCollections(searchFilters)
      }

      setCollections(response.collections || [])
      pagination.setTotalItems(response.totalCount || 0)
    } catch (error) {
      console.error("Error fetching collections:", error)
      setCollections([])
      pagination.setTotalItems(0)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, debouncedSearchQuery, pagination, initialFilters])

  // Effects
  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  useEffect(() => {
    pagination.reset()
  }, [debouncedSearchQuery, activeTab])

  useEffect(() => {
    setActiveTab(collectionType)
  }, [collectionType])

  // Handlers
  const handleTabChange = (value: string) => {
    const newType = value as CollectionType
    setActiveTab(newType)
    onCollectionTypeChange?.(newType)
  }

  const handleCollectionClick = (collection: SkillCollection) => {
    if (onCollectionClick) {
      onCollectionClick(collection)
    } else {
      router.push(`/marketplace/collections/${collection.id}`)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  // Render functions
  const renderSkeletons = () => Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} className="h-[280px]" />)

  const renderEmptyState = () => {
    if (emptyStateContent) return emptyStateContent

    const isPersonalEmpty = activeTab === CollectionType.PERSONAL && !debouncedSearchQuery

    return (
      <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-xl font-semibold mb-2">
          {isPersonalEmpty ? "No collections yet" : "No collections found"}
        </h3>
        <p className="text-muted-foreground mb-4">
          {isPersonalEmpty
            ? "Create your first collection to organize your skills."
            : "Try adjusting your search or filters."}
        </p>
        <Button
          onClick={
            isPersonalEmpty
              ? onCreateCollection || (() => router.push("/marketplace/collections/new"))
              : fetchCollections
          }
        >
          {isPersonalEmpty ? "Create Collection" : "Refresh"}
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 p-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {showCreateButton && (
          <Button
            onClick={onCreateCollection || (() => router.push("/marketplace/collections/new"))}
            className="w-full sm:w-auto"
          >
            Create Collection
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value={CollectionType.ALL}>All</TabsTrigger>
            <TabsTrigger value={CollectionType.FEATURED}>Featured</TabsTrigger>
            <TabsTrigger value={CollectionType.PERSONAL}>My Collections</TabsTrigger>
            <TabsTrigger value={CollectionType.PUBLIC}>Public</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search */}
      {showSearchBar && (
        <div className="px-4">
          <SearchBar
            placeholder="Search collections..."
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange("")}
            className="w-full max-w-md"
          />
        </div>
      )}

      {/* Collections Grid */}
      <div className="px-4">
        <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
          {isLoading
            ? renderSkeletons()
            : collections.length > 0
              ? collections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onClick={() => handleCollectionClick(collection)}
                  />
                ))
              : renderEmptyState()}
        </ResponsiveGrid>
      </div>

      {/* Pagination */}
      {showPagination && !isLoading && collections.length > 0 && (
        <div className="px-4">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            isLoading={isLoading}
            showSummary
            summaryText={pagination.getSummary()}
            showItemsPerPage
            itemsPerPage={pagination.itemsPerPage}
            itemsPerPageOptions={[6, 12, 24, 48]}
            onItemsPerPageChange={pagination.setItemsPerPage}
            className="flex justify-center"
          />
        </div>
      )}
    </div>
  )
})
