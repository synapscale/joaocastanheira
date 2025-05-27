"use client"

import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { MarketplaceService } from "@/services/marketplace-service"
import type { Collection, SearchFilters } from "@/types/marketplace-types"
import { CollectionCard } from "./collection-card"
import { SearchBar } from "../ui/search-bar"
import { PaginationControls } from "../ui/pagination-controls"
import { CardSkeleton } from "../ui/skeletons/card-skeleton"
import { useSearchFilters } from "@/hooks/use-search-filters"
import { usePagination } from "@/hooks/use-pagination"
import { useDialog } from "@/hooks/use-dialog"
import { ConfirmationDialog } from "../ui/confirmation-dialog"

/**
 * Form data structure for collection creation/editing
 */
export interface CollectionFormData {
  name: string
  description: string
  tags: string[]
  isPublic: boolean
  imageUrl?: string
}

/**
 * Props for the UserCollections component
 */
interface UserCollectionsProps {
  /** Custom title for the collections section */
  title?: string
  /** Custom description for the collections section */
  description?: string
  /** Initial search filters to apply */
  initialFilters?: SearchFilters
  /** Whether to show the search bar */
  showSearchBar?: boolean
  /** Whether to show pagination controls */
  showPagination?: boolean
  /** Number of collections per page */
  itemsPerPage?: number
  /** Number of skeleton items during loading */
  skeletonCount?: number
  /** Callback when a collection is clicked */
  onCollectionClick?: (collection: Collection) => void
  /** Callback when edit collection is triggered */
  onEditCollection?: (collection: Collection) => void
  /** Callback when delete collection is triggered */
  onDeleteCollection?: (collection: Collection) => void
  /** Callback when create collection is triggered */
  onCreateCollection?: () => void
  /** Custom empty state content */
  emptyStateContent?: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Custom header content */
  headerContent?: React.ReactNode
  /** Custom footer content */
  footerContent?: React.ReactNode
  /** Whether to show create collection button */
  showCreateButton?: boolean
  /** Whether to show action buttons on cards */
  showActionButtons?: boolean
  /** Callback when collection form is submitted */
  onSubmitCollectionForm?: (formData: CollectionFormData) => Promise<void>
}

/**
 * UserCollections Component
 *
 * Displays and manages user's collections with search, pagination, and CRUD operations.
 * Provides a complete interface for viewing and managing personal collections.
 *
 * Features:
 * - Search and filtering capabilities
 * - Pagination for large datasets
 * - CRUD operations with confirmation dialogs
 * - Loading states and error handling
 * - Customizable empty states
 * - Responsive grid layout
 *
 * @param props - Component configuration options
 */
export function UserCollections({
  title = "My Collections",
  description = "Manage your personal collections of skills",
  initialFilters = {},
  showSearchBar = true,
  showPagination = true,
  itemsPerPage = 12,
  skeletonCount = 12,
  onCollectionClick,
  onEditCollection,
  onDeleteCollection,
  onCreateCollection,
  emptyStateContent,
  className = "",
  headerContent,
  footerContent,
  showCreateButton = true,
  showActionButtons = true,
  onSubmitCollectionForm,
}: UserCollectionsProps) {
  // Component state
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null)

  // Custom hooks for functionality
  const { filters, setFilters, handleSearchChange } = useSearchFilters(initialFilters)
  const { currentPage, setCurrentPage, totalPages, setTotalPages, handlePageChange } = usePagination({
    itemsPerPage,
    totalItems,
    initialPage: 1,
  })
  const { isOpen: isDeleteDialogOpen, open: openDeleteDialog, close: closeDeleteDialog } = useDialog()

  /**
   * Fetches user collections based on current filters and pagination
   */
  const fetchUserCollections = useCallback(async () => {
    setIsLoading(true)
    try {
      const offset = (currentPage - 1) * itemsPerPage
      const limit = itemsPerPage

      const response = await MarketplaceService.getUserCollections({
        ...filters,
        offset,
        limit,
      })

      setCollections(response.collections)
      setTotalItems(response.totalCount)
      setTotalPages(Math.ceil(response.totalCount / itemsPerPage))
    } catch (error) {
      console.error("Error fetching user collections:", error)
      setCollections([])
      setTotalItems(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [filters, currentPage, itemsPerPage, setTotalPages])

  // Fetch collections when dependencies change
  useEffect(() => {
    fetchUserCollections()
  }, [fetchUserCollections])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, setCurrentPage])

  /**
   * Handles collection click with optional callback
   */
  const handleCollectionClick = useCallback(
    (collection: Collection) => {
      onCollectionClick?.(collection)
    },
    [onCollectionClick],
  )

  /**
   * Handles edit collection with optional callback
   */
  const handleEditCollection = useCallback(
    (collection: Collection, e: React.MouseEvent) => {
      e.stopPropagation()
      onEditCollection?.(collection)
    },
    [onEditCollection],
  )

  /**
   * Handles delete collection click
   */
  const handleDeleteClick = useCallback(
    (collection: Collection, e: React.MouseEvent) => {
      e.stopPropagation()
      setCollectionToDelete(collection)
      openDeleteDialog()
    },
    [openDeleteDialog],
  )

  /**
   * Confirms and executes collection deletion
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (collectionToDelete && onDeleteCollection) {
      await onDeleteCollection(collectionToDelete)

      // Update local state
      const newTotalItems = totalItems - 1
      setTotalItems(newTotalItems)

      // Navigate to previous page if needed
      const newTotalPages = Math.ceil(newTotalItems / itemsPerPage)
      if (currentPage > newTotalPages && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        // Refresh current page
        await fetchUserCollections()
      }
    }

    closeDeleteDialog()
    setCollectionToDelete(null)
  }, [
    collectionToDelete,
    onDeleteCollection,
    totalItems,
    itemsPerPage,
    currentPage,
    setCurrentPage,
    fetchUserCollections,
    closeDeleteDialog,
  ])

  /**
   * Handles create collection with optional callback
   */
  const handleCreateCollection = useCallback(() => {
    onCreateCollection?.()
  }, [onCreateCollection])

  /**
   * Renders loading skeleton cards
   */
  const renderSkeletons = useMemo(() => {
    return Array(skeletonCount)
      .fill(0)
      .map((_, index) => (
        <CardSkeleton key={`skeleton-${index}`} className="h-[280px]" imageHeight={140} lines={3} showFooter />
      ))
  }, [skeletonCount])

  /**
   * Renders empty state when no collections found
   */
  const renderEmptyState = useMemo(() => {
    if (emptyStateContent) {
      return emptyStateContent
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">You don't have any collections yet</h3>
        <p className="text-gray-500 mb-4">Create your first collection to organize your skills.</p>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          onClick={handleCreateCollection}
        >
          Create Collection
        </button>
      </div>
    )
  }, [emptyStateContent, handleCreateCollection])

  return (
    <div className={`w-full ${className}`}>
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-gray-500">{description}</p>
        </div>

        {showCreateButton && (
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            onClick={handleCreateCollection}
            aria-label="Create new collection"
          >
            Create Collection
          </button>
        )}
      </div>

      {/* Custom Header Content */}
      {headerContent}

      {/* Search Bar */}
      {showSearchBar && (
        <div className="mb-6">
          <SearchBar
            placeholder="Search your collections..."
            value={filters.searchTerm || ""}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange("")}
            className="w-full max-w-xl"
            debounceMs={300}
            aria-label="Search your collections"
          />
        </div>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          renderSkeletons
        ) : collections.length > 0 ? (
          collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onClick={() => handleCollectionClick(collection)}
              showActions={showActionButtons}
              onEdit={(e) => handleEditCollection(collection, e)}
              onDelete={(e) => handleDeleteClick(collection, e)}
              aria-label={`Collection: ${collection.name}`}
            />
          ))
        ) : (
          <div className="col-span-full">{renderEmptyState}</div>
        )}
      </div>

      {/* Pagination Controls */}
      {showPagination && !isLoading && collections.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="flex justify-center"
          aria-label="Collections pagination"
        />
      )}

      {/* Custom Footer Content */}
      {footerContent}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Collection"
        message={
          collectionToDelete
            ? `Are you sure you want to delete "${collectionToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this collection? This action cannot be undone."
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        cancelLabel="Cancel"
      />
    </div>
  )
}
