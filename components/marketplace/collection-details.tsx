"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { MarketplaceService } from "@/services/marketplace-service"
import type { Collection, MarketplaceItem, SearchFilters } from "@/types/marketplace-types"
import { MarketplaceItemCard } from "./marketplace-item-card"
import { SearchBar } from "../ui/search-bar"
import { PaginationControls } from "../ui/pagination-controls"
import { CardSkeleton } from "../ui/skeletons/card-skeleton"
import { StatusBadge } from "../ui/data-display/status-badge"
import { useSearchFilters } from "@/hooks/use-search-filters"
import { usePagination } from "@/hooks/use-pagination"
import { useDialog } from "@/hooks/use-dialog"
import { ConfirmationDialog } from "../ui/confirmation-dialog"
import Image from "next/image"

/**
 * CollectionDetailsProps - Interface for the CollectionDetails component props
 *
 * @property {string | Collection} collection - Collection ID or Collection object to display
 * @property {boolean} [isEditable=false] - Whether the collection is editable by the current user
 * @property {boolean} [showBackButton=true] - Whether to show the back button
 * @property {() => void} [onBackClick] - Callback when the back button is clicked
 * @property {(item: MarketplaceItem) => void} [onItemClick] - Optional callback when an item is clicked
 * @property {SearchFilters} [initialFilters] - Optional initial search filters to apply
 * @property {boolean} [showSearchBar=true] - Whether to show the search bar
 * @property {boolean} [showPagination=true] - Whether to show pagination controls
 * @property {number} [itemsPerPage=12] - Number of items to display per page
 * @property {number} [skeletonCount=12] - Number of skeleton items to show during loading
 * @property {() => void} [onEdit] - Callback when the edit button is clicked
 * @property {() => void} [onDelete] - Callback when the delete button is clicked
 * @property {string} [className] - Optional additional CSS classes
 * @property {React.ReactNode} [emptyStateContent] - Optional custom content to display when no items are found
 * @property {React.ReactNode} [headerContent] - Optional custom content to display in the header
 * @property {React.ReactNode} [footerContent] - Optional custom content to display in the footer
 */
interface CollectionDetailsProps {
  collection: string | Collection
  isEditable?: boolean
  showBackButton?: boolean
  onBackClick?: () => void
  onItemClick?: (item: MarketplaceItem) => void
  initialFilters?: SearchFilters
  showSearchBar?: boolean
  showPagination?: boolean
  itemsPerPage?: number
  skeletonCount?: number
  onEdit?: () => void
  onDelete?: () => void
  className?: string
  emptyStateContent?: React.ReactNode
  headerContent?: React.ReactNode
  footerContent?: React.ReactNode
}

/**
 * CollectionDetails - A component for displaying collection details and its items
 *
 * This component provides a complete interface for viewing a collection's details
 * and browsing its items with search and pagination capabilities. It handles loading
 * states and empty states automatically.
 *
 * @example
 * // Basic usage with collection ID
 * <CollectionDetails collection="collection-123" />
 *
 * @example
 * // With collection object and edit capabilities
 * <CollectionDetails
 *   collection={collectionObject}
 *   isEditable={true}
 *   onEdit={() => openEditModal()}
 *   onDelete={() => handleDeleteCollection()}
 * />
 */
export function CollectionDetails({
  collection,
  isEditable = false,
  showBackButton = true,
  onBackClick,
  onItemClick,
  initialFilters = {},
  showSearchBar = true,
  showPagination = true,
  itemsPerPage = 12,
  skeletonCount = 12,
  onEdit,
  onDelete,
  className = "",
  emptyStateContent,
  headerContent,
  footerContent,
}: CollectionDetailsProps) {
  // State for collection data, items, and loading status
  const [collectionData, setCollectionData] = useState<Collection | null>(null)
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isItemsLoading, setIsItemsLoading] = useState<boolean>(true)
  const [totalItems, setTotalItems] = useState<number>(0)

  // Use custom hooks for search filters, pagination, and dialog
  const { filters, setFilters, handleSearchChange } = useSearchFilters(initialFilters)

  const pagination = usePagination({
    itemsPerPage,
    totalItems,
    initialPage: 1,
  })

  const { currentPage, totalPages, goToPage: handlePageChange } = pagination

  // Use these separately to avoid the "not a function" error
  const setCurrentPage = (page: number) => {
    pagination.goToPage(page)
  }
  const setTotalPages = (pages: number) => {
    // This is just for state tracking, the actual pagination is handled by totalItems
    setTotalItems(pages * itemsPerPage)
  }

  const { isOpen: isDeleteDialogOpen, open: openDeleteDialog, close: closeDeleteDialog } = useDialog()

  // Fetch collection data if collection is a string ID
  useEffect(() => {
    const fetchCollectionData = async () => {
      if (typeof collection === "string") {
        setIsLoading(true)
        try {
          const data = await MarketplaceService.getCollectionById(collection)
          setCollectionData(data)
        } catch (error) {
          console.error("Error fetching collection:", error)
          setCollectionData(null)
        } finally {
          setIsLoading(false)
        }
      } else {
        setCollectionData(collection)
        setIsLoading(false)
      }
    }

    fetchCollectionData()
  }, [collection])

  // Fetch collection items based on current filters and pagination
  useEffect(() => {
    const fetchCollectionItems = async () => {
      if (!collectionData) return

      setIsItemsLoading(true)
      try {
        // Calculate pagination parameters
        const offset = (currentPage - 1) * itemsPerPage
        const limit = itemsPerPage

        // Fetch items from the marketplace service
        const response = await MarketplaceService.getCollectionItems(collectionData.id, {
          ...filters,
          offset,
          limit,
        })

        // Update state with fetched data
        setItems(response.items)
        setTotalItems(response.totalCount)
        setTotalPages(Math.ceil(response.totalCount / itemsPerPage))
      } catch (error) {
        console.error("Error fetching collection items:", error)
        setItems([])
        setTotalItems(0)
        setTotalPages(1)
      } finally {
        setIsItemsLoading(false)
      }
    }

    fetchCollectionItems()
  }, [collectionData, filters, currentPage, itemsPerPage])

  // Reset to first page when filters change
  useEffect(() => {
    if (pagination && typeof pagination.goToPage === "function") {
      pagination.goToPage(1)
    }
  }, [filters, pagination])

  // Handle item click with optional callback
  const handleItemClick = (item: MarketplaceItem) => {
    if (onItemClick) {
      onItemClick(item)
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete()
    }
    closeDeleteDialog()
  }

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(skeletonCount)
      .fill(0)
      .map((_, index) => (
        <CardSkeleton key={`skeleton-${index}`} className="h-[280px]" imageHeight={140} lines={3} showFooter />
      ))
  }

  // Render empty state
  const renderEmptyState = () => {
    if (emptyStateContent) {
      return emptyStateContent
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No items in this collection</h3>
        <p className="text-gray-500 mb-4">This collection doesn't have any items yet.</p>
        {isEditable && (
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            onClick={onEdit}
          >
            Add Items
          </button>
        )}
      </div>
    )
  }

  // If collection data is loading, show skeleton
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 w-full bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    )
  }

  // If collection data is not found, show error
  if (!collectionData) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Collection not found</h3>
          <p className="text-gray-500 mb-4">The collection you're looking for doesn't exist or has been removed.</p>
          {showBackButton && onBackClick && (
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              onClick={onBackClick}
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header section */}
      <div className="mb-8">
        {showBackButton && onBackClick && (
          <button
            onClick={onBackClick}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Collection image */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
              {collectionData.imageUrl ? (
                <Image
                  src={collectionData.imageUrl || "/placeholder.svg"}
                  alt={collectionData.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 15v4a2 2 0 0 0 2 2h4" />
                    <path d="M21 9V5a2 2 0 0 0-2-2h-4" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Collection details */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{collectionData.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <StatusBadge
                    status={collectionData.isPublic ? "Public" : "Private"}
                    variant={collectionData.isPublic ? "success" : "warning"}
                  />
                  {collectionData.isFeatured && <StatusBadge status="Featured" variant="info" />}
                </div>
              </div>

              {isEditable && (
                <div className="flex gap-2">
                  <button
                    onClick={onEdit}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    aria-label="Edit collection"
                  >
                    Edit
                  </button>
                  <button
                    onClick={openDeleteDialog}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    aria-label="Delete collection"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-4">{collectionData.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {collectionData.tags?.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                  {tag}
                </span>
              ))}
            </div>

            <div className="text-sm text-gray-500">
              <p>Created by: {collectionData.createdBy}</p>
              <p>Items: {collectionData.itemCount || totalItems}</p>
              <p>Last updated: {new Date(collectionData.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Custom header content */}
        {headerContent}
      </div>

      {/* Search bar */}
      {showSearchBar && (
        <div className="mb-6">
          <SearchBar
            placeholder="Search items in this collection..."
            value={filters.searchTerm || ""}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange("")}
            className="w-full max-w-xl"
            debounceMs={300}
            aria-label="Search items in collection"
          />
        </div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {isItemsLoading ? (
          renderSkeletons()
        ) : items.length > 0 ? (
          items.map((item) => (
            <MarketplaceItemCard
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
              aria-label={`View details for ${item.name}`}
            />
          ))
        ) : (
          <div className="col-span-full">{renderEmptyState()}</div>
        )}
      </div>

      {/* Pagination controls */}
      {showPagination && !isItemsLoading && items.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="flex justify-center"
          aria-label="Collection items pagination"
        />
      )}

      {/* Custom footer content */}
      {footerContent}

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Collection"
        message={`Are you sure you want to delete "${collectionData.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        cancelLabel="Cancel"
      />
    </div>
  )
}
