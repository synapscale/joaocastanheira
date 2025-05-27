/**
 * Base types for AI-friendly component architecture
 *
 * This file contains fundamental types that enable AI systems to better understand
 * and work with our component structure. Each type is documented with clear
 * purpose, usage examples, and relationships to other types.
 */

import type React from "react"

/**
 * Base interface for all component props in the application
 *
 * Purpose: Provides consistent foundation for all components
 * AI Context: This interface helps AI understand common patterns across components
 *
 * @example
 * ```tsx
 * interface MyComponentProps extends BaseComponentProps {
 *   title: string
 *   onAction: () => void
 * }
 * ```
 */
export interface BaseComponentProps {
  /** Unique identifier for the component instance */
  id?: string

  /** Additional CSS classes to apply */
  className?: string

  /** Test identifier for automated testing */
  testId?: string

  /** ARIA label for accessibility */
  ariaLabel?: string

  /** Whether the component is disabled */
  disabled?: boolean

  /** Custom styles to apply */
  style?: React.CSSProperties
}

/**
 * Interface for components that can be interacted with
 *
 * Purpose: Standardizes interaction patterns across clickable components
 * AI Context: Helps AI identify and work with interactive elements
 */
export interface InteractiveComponentProps extends BaseComponentProps {
  /** Handler for click events */
  onClick?: (event: React.MouseEvent) => void

  /** Handler for keyboard events */
  onKeyDown?: (event: React.KeyboardEvent) => void

  /** Whether the component is currently focused */
  isFocused?: boolean

  /** Whether the component is in a loading state */
  isLoading?: boolean
}

/**
 * Interface for components that can be dragged
 *
 * Purpose: Standardizes drag and drop functionality
 * AI Context: Enables AI to understand drag/drop patterns
 */
export interface DraggableComponentProps extends BaseComponentProps {
  /** Whether the component can be dragged */
  isDraggable?: boolean

  /** Data to transfer during drag operations */
  dragData?: any

  /** Handler for drag start events */
  onDragStart?: (event: React.DragEvent) => void

  /** Handler for drag end events */
  onDragEnd?: (event: React.DragEvent) => void

  /** CSS class to apply during dragging */
  dragClassName?: string
}

/**
 * Interface for components that can receive drops
 *
 * Purpose: Standardizes drop target functionality
 * AI Context: Helps AI understand drop zones and their behavior
 */
export interface DroppableComponentProps extends BaseComponentProps {
  /** Whether the component can receive drops */
  isDroppable?: boolean

  /** Accepted data types for drops */
  acceptedTypes?: string[]

  /** Handler for drop events */
  onDrop?: (event: React.DragEvent, data: any) => void

  /** Handler for drag over events */
  onDragOver?: (event: React.DragEvent) => void

  /** CSS class to apply when drag is over */
  dropOverClassName?: string
}

/**
 * Common size variants used throughout the application
 *
 * Purpose: Provides consistent sizing options
 * AI Context: Helps AI understand size relationships and apply them consistently
 */
export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl"

/**
 * Common visual variants used throughout the application
 *
 * Purpose: Provides consistent visual styling options
 * AI Context: Enables AI to understand and apply visual patterns
 */
export type ComponentVariant = "default" | "primary" | "secondary" | "outline" | "ghost" | "destructive"

/**
 * Common status types used throughout the application
 *
 * Purpose: Standardizes status representation
 * AI Context: Helps AI understand state and status patterns
 */
export type ComponentStatus = "idle" | "loading" | "success" | "error" | "warning"

/**
 * Interface for components with validation capabilities
 *
 * Purpose: Standardizes form validation patterns
 * AI Context: Enables AI to understand validation states and messages
 */
export interface ValidatableComponentProps extends BaseComponentProps {
  /** Whether the component has validation errors */
  hasError?: boolean

  /** Error message to display */
  errorMessage?: string

  /** Whether the component is required */
  isRequired?: boolean

  /** Validation function */
  validate?: (value: any) => string | null
}

/**
 * Interface for components that manage their own state
 *
 * Purpose: Standardizes controlled vs uncontrolled component patterns
 * AI Context: Helps AI understand state management patterns
 */
export interface StatefulComponentProps<T> extends BaseComponentProps {
  /** Current value (controlled mode) */
  value?: T

  /** Default value (uncontrolled mode) */
  defaultValue?: T

  /** Handler for value changes */
  onChange?: (value: T) => void
}

/**
 * Interface for components with async operations
 *
 * Purpose: Standardizes async operation handling
 * AI Context: Enables AI to understand loading states and error handling
 */
export interface AsyncComponentProps extends BaseComponentProps {
  /** Whether an async operation is in progress */
  isLoading?: boolean

  /** Error from async operation */
  error?: Error | string | null

  /** Handler for retry operations */
  onRetry?: () => void

  /** Loading text to display */
  loadingText?: string
}
