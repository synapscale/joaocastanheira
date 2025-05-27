import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { BaseComponentProps } from "@/types/component-types"

/**
 * Props for the CardSkeleton component
 */
interface CardSkeletonProps extends BaseComponentProps {
  /** Whether to show tags skeleton */
  withTags?: boolean
  /** Whether to show footer skeleton */
  withFooter?: boolean
  /** Whether to show image skeleton */
  withImage?: boolean
  /** Height of image skeleton in pixels */
  imageHeight?: number
  /** Number of content lines to show */
  lines?: number
  /** Custom widths for content lines */
  lineWidths?: string[]
  /** Whether to show action buttons skeleton */
  showActions?: boolean
}

/**
 * CardSkeleton Component
 *
 * Provides a loading skeleton that matches the structure of content cards.
 * Configurable to match different card layouts and content types.
 *
 * Features:
 * - Configurable sections (image, tags, footer, actions)
 * - Customizable content line count and widths
 * - Consistent styling with actual cards
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <CardSkeleton
 *   withImage
 *   imageHeight={200}
 *   lines={3}
 *   withTags
 *   withFooter
 * />
 * ```
 */
export function CardSkeleton({
  withTags = true,
  withFooter = true,
  withImage = false,
  imageHeight = 200,
  lines = 2,
  lineWidths = ["100%", "75%"],
  showActions = false,
  className,
  testId,
}: CardSkeletonProps) {
  return (
    <Card className={className} data-testid={testId} aria-label="Loading content">
      {/* Image Skeleton */}
      {withImage && (
        <div className="w-full" style={{ height: `${imageHeight}px` }}>
          <Skeleton className="h-full w-full rounded-t-lg" />
        </div>
      )}

      {/* Header Skeleton */}
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          {showActions && <Skeleton className="h-8 w-8 rounded" />}
        </div>
      </CardHeader>

      {/* Content Skeleton */}
      <CardContent className="p-4 pt-0">
        {/* Content Lines */}
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={`line-${i}`}
            className="h-4 mt-1"
            style={{ width: lineWidths[i % lineWidths.length] || "100%" }}
          />
        ))}

        {/* Tags Skeleton */}
        {withTags && (
          <div className="flex gap-1 mt-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>
        )}
      </CardContent>

      {/* Footer Skeleton */}
      {withFooter && (
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </CardFooter>
      )}
    </Card>
  )
}
