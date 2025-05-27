export interface MarketplaceItemAuthor {
  id: string
  username: string
  displayName: string
  createdAt: string
  isVerified: boolean
}

export interface MarketplaceItemPricing {
  type: "free" | "paid" | "subscription"
  price?: number
  currency?: string
  subscriptionPeriod?: "monthly" | "yearly"
}

export interface MarketplaceItemStats {
  views: number
  downloads: number
  favorites: number
  usageCount?: number
}

export interface MarketplaceItem {
  id: string
  type: "skill" | "node"
  originalId: string
  name: string
  description: string
  version: string
  author: MarketplaceItemAuthor
  publishedAt: string
  updatedAt: string
  downloads: number
  rating: number
  ratingsCount: number
  tags: string[]
  category: string
  isPublic: boolean
  isVerified: boolean
  isDeprecated: boolean
  license: string
  thumbnailUrl?: string
  pricing: MarketplaceItemPricing
  stats: MarketplaceItemStats
  metadata: Record<string, any>
}

export interface MarketplaceSearchFilters {
  query?: string
  type?: "skill" | "node" | "all"
  category?: string
  tags?: string[]
  author?: string
  minRating?: number
  pricing?: "free" | "paid" | "subscription" | "all"
  sortBy?: "relevance" | "downloads" | "rating" | "newest" | "oldest"
  page?: number
  pageSize?: number
}

export interface MarketplaceSearchResponse {
  items: MarketplaceItem[]
  totalCount: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface MarketplaceRating {
  id: string
  itemId: string
  userId: string
  rating: number
  comment?: string
  createdAt: string
  updatedAt: string
  isVerified: boolean
  likes: number
  dislikes: number
}

export interface ImportHistory {
  id: string
  userId: string
  itemId: string
  itemType: "skill" | "node"
  importedAt: string
  version: string
  status: "success" | "failed"
  localItemId?: string
  errorMessage?: string
}

export interface PublishRequest {
  id: string
  userId: string
  itemType: "skill" | "node"
  itemId: string
  version: string
  status: "pending" | "published" | "rejected"
  submittedAt: string
  reviewedAt?: string
  reviewerId?: string
  reviewNotes?: string
  isUpdate: boolean
  changelog?: string
}

export interface MarketplaceItemVersion {
  id: string
  itemId: string
  version: string
  publishedAt: string
  changelog?: string
  isDeprecated: boolean
}
