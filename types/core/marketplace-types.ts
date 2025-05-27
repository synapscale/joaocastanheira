import type { ComponentBase, Clickable } from "./component-base"

/**
 * Interface for marketplace item data
 */
export interface MarketplaceItemData {
  /**
   * Unique identifier for the item
   */
  id: string

  /**
   * Display name of the item
   */
  name: string

  /**
   * Detailed description of the item
   */
  description: string

  /**
   * Type of the item: "skill" or "node"
   */
  type: "skill" | "node"

  /**
   * Category the item belongs to
   */
  category: string

  /**
   * Tags associated with the item
   */
  tags: string[]

  /**
   * Version of the item
   */
  version: string

  /**
   * Author information
   */
  author: {
    /**
     * Unique identifier for the author
     */
    id: string

    /**
     * Display name of the author
     */
    displayName: string

    /**
     * Whether the author is verified
     */
    isVerified: boolean
  }

  /**
   * License information
   */
  license: string

  /**
   * Publication date
   */
  publishedAt: string

  /**
   * Average rating (0-5)
   */
  rating: number

  /**
   * Number of downloads
   */
  downloads: number

  /**
   * Preview image URL
   */
  previewUrl?: string

  /**
   * Whether the item is featured
   */
  isFeatured?: boolean

  /**
   * Pricing information
   */
  pricing?: {
    /**
     * Type of pricing: "free", "paid", "subscription"
     */
    type: "free" | "paid" | "subscription"

    /**
     * Price in the specified currency
     */
    price?: number

    /**
     * Currency code
     */
    currency?: string
  }
}

/**
 * Interface for collection data
 */
export interface CollectionData {
  /**
   * Unique identifier for the collection
   */
  id: string

  /**
   * Display name of the collection
   */
  name: string

  /**
   * Detailed description of the collection
   */
  description: string

  /**
   * User ID of the collection owner
   */
  userId: string

  /**
   * Whether the collection is public
   */
  isPublic: boolean

  /**
   * Tags associated with the collection
   */
  tags?: string[]

  /**
   * Items in the collection
   */
  items: Array<{
    /**
     * Item ID
     */
    id: string

    /**
     * Item type: "skill" or "node"
     */
    type: "skill" | "node"
  }>

  /**
   * Collection statistics
   */
  stats: {
    /**
     * Number of favorites
     */
    favorites: number

    /**
     * Number of downloads
     */
    downloads: number

    /**
     * Number of views
     */
    views: number
  }

  /**
   * Creation date
   */
  createdAt: string

  /**
   * Last update date
   */
  updatedAt: string

  /**
   * Cover image URL
   */
  coverUrl?: string
}

/**
 * Props for the MarketplaceItemCard component
 */
export interface MarketplaceItemCardProps extends ComponentBase, Clickable {
  /**
   * Marketplace item data
   */
  item: MarketplaceItemData

  /**
   * Callback fired when the user clicks to view item details
   */
  onViewDetails?: (item: MarketplaceItemData) => void

  /**
   * Callback fired when the user clicks to import the item
   */
  onImport?: (item: MarketplaceItemData) => void

  /**
   * Callback fired when the user clicks to add the item to a collection
   */
  onAddToCollection?: (item: MarketplaceItemData) => void

  /**
   * Callback fired when the user clicks to remove the item from a collection
   */
  onRemoveFromCollection?: (item: MarketplaceItemData) => void

  /**
   * Callback fired when the user clicks to favorite/unfavorite the item
   */
  onFavorite?: (item: MarketplaceItemData, isFavorite: boolean) => void

  /**
   * Whether the item is favorited by the current user
   * @default false
   */
  isFavorited?: boolean

  /**
   * Maximum number of tags to display before showing a "+X" badge
   * @default 3
   */
  maxVisibleTags?: number

  /**
   * Whether to show a verified badge for verified authors
   * @default true
   */
  showVerifiedBadge?: boolean

  /**
   * Whether to truncate the description after 2 lines
   * @default true
   */
  truncateDescription?: boolean

  /**
   * Whether to show the item's rating
   * @default true
   */
  showRating?: boolean

  /**
   * Whether to show the number of downloads
   * @default true
   */
  showDownloads?: boolean

  /**
   * Whether to show the publication date
   * @default true
   */
  showPublishedDate?: boolean

  /**
   * Format for displaying the publication date
   * @default "dd/MM/yyyy"
   */
  dateFormat?: string | ((date: Date) => string)

  /**
   * Whether the entire card is clickable
   * @default false
   */
  clickableCard?: boolean

  /**
   * Whether to apply a hover effect to the card
   * @default true
   */
  hoverEffect?: boolean

  /**
   * Available actions for the item
   * If not provided, all actions with handlers will be shown
   */
  availableActions?: Array<"view" | "import" | "addToCollection" | "removeFromCollection" | "favorite">
}

/**
 * Props for the CollectionCard component
 */
export interface CollectionCardProps extends ComponentBase, Clickable {
  /**
   * Collection data
   */
  collection: CollectionData

  /**
   * Whether the current user is the owner of the collection
   * @default false
   */
  isOwner?: boolean

  /**
   * Callback fired when the user clicks to view the collection
   */
  onView?: (id: string) => void

  /**
   * Callback fired when the user clicks to edit the collection
   * Only shown if isOwner is true
   */
  onEdit?: (collection: CollectionData) => void

  /**
   * Callback fired when the user clicks to delete the collection
   * Only shown if isOwner is true
   */
  onDelete?: (collection: CollectionData) => void

  /**
   * Callback fired when the user clicks to share the collection
   */
  onShare?: (collection: CollectionData) => void

  /**
   * Callback fired when the user clicks to favorite/unfavorite the collection
   */
  onFavorite?: (collection: CollectionData, isFavorite: boolean) => void

  /**
   * Whether the collection is favorited by the current user
   * @default false
   */
  isFavorited?: boolean

  /**
   * Maximum number of tags to display before showing a "+X" badge
   * @default 3
   */
  maxVisibleTags?: number

  /**
   * Whether to apply a hover effect to the card
   * @default true
   */
  hoverEffect?: boolean

  /**
   * Whether the entire card is clickable
   * @default false
   */
  clickableCard?: boolean

  /**
   * Whether to show a folder icon before the collection name
   * @default false
   */
  showFolderIcon?: boolean

  /**
   * Whether to show the number of items in the collection
   * @default true
   */
  showItemCount?: boolean

  /**
   * Whether to show the visibility of the collection (public/private)
   * @default true
   */
  showVisibility?: boolean

  /**
   * Whether to show the number of favorites
   * @default true
   */
  showFavorites?: boolean

  /**
   * Whether to show the number of downloads
   * @default true
   */
  showDownloads?: boolean

  /**
   * Whether to truncate the description after 2 lines
   * @default true
   */
  truncateDescription?: boolean

  /**
   * Available actions for the collection
   * If not provided, all applicable actions will be shown based on isOwner
   */
  availableActions?: Array<"view" | "edit" | "delete" | "share">
}
