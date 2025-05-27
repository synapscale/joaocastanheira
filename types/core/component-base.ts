import type React from "react"
/**
 * Base interface for all component props
 * Provides common properties that should be available to all components
 */
export interface ComponentBase {
  /**
   * Optional CSS class name to apply to the component
   * @example "mt-4 bg-primary-100"
   */
  className?: string

  /**
   * Data attribute for testing purposes
   * Should follow a consistent pattern like "component-name"
   * @example "node-card"
   */
  testId?: string

  /**
   * Unique identifier for the component instance
   * Used for accessibility and form associations
   */
  id?: string

  /**
   * ARIA label for accessibility
   * Should be provided when the component's purpose isn't clear from its content
   */
  ariaLabel?: string

  /**
   * Whether the component should be hidden from screen readers
   * @default false
   */
  ariaHidden?: boolean
}

/**
 * Interface for components that can be disabled
 */
export interface Disableable {
  /**
   * Whether the component is disabled
   * When true, the component should be visually dimmed and not respond to interactions
   * @default false
   */
  disabled?: boolean

  /**
   * Optional reason for the disabled state, can be shown in a tooltip
   */
  disabledReason?: string
}

/**
 * Interface for components that can show a loading state
 */
export interface Loadable {
  /**
   * Whether the component is in a loading state
   * @default false
   */
  isLoading?: boolean

  /**
   * Text to display during loading state
   * @default "Loading..."
   */
  loadingText?: string

  /**
   * Whether to show a loading indicator
   * @default true
   */
  showLoadingIndicator?: boolean
}

/**
 * Interface for components that can be focused
 */
export interface Focusable {
  /**
   * Whether the component should receive focus when mounted
   * @default false
   */
  autoFocus?: boolean

  /**
   * Tab index for keyboard navigation
   * @default 0
   */
  tabIndex?: number

  /**
   * Callback fired when the component receives focus
   */
  onFocus?: (event: React.FocusEvent) => void

  /**
   * Callback fired when the component loses focus
   */
  onBlur?: (event: React.FocusEvent) => void
}

/**
 * Interface for components that can be clicked
 */
export interface Clickable extends Disableable {
  /**
   * Callback fired when the component is clicked
   */
  onClick?: (event: React.MouseEvent) => void

  /**
   * Callback fired when the component is double-clicked
   */
  onDoubleClick?: (event: React.MouseEvent) => void

  /**
   * Callback fired when the component is right-clicked
   */
  onContextMenu?: (event: React.MouseEvent) => void

  /**
   * Whether the component should have a pointer cursor on hover
   * @default true
   */
  showCursor?: boolean
}

/**
 * Interface for components that can be dragged
 */
export interface Draggable extends Disableable {
  /**
   * Whether the component can be dragged
   * @default true
   */
  isDraggable?: boolean

  /**
   * Data to be transferred during drag operations
   * Can be a string, object, or function that returns data
   */
  dragData?: any | (() => any)

  /**
   * Callback fired when a drag operation starts
   */
  onDragStart?: (event: React.DragEvent) => void

  /**
   * Callback fired when a drag operation ends
   */
  onDragEnd?: (event: React.DragEvent) => void

  /**
   * CSS class to apply during dragging
   */
  dragClassName?: string

  /**
   * Custom drag image element or function that returns an element
   */
  dragImage?: HTMLElement | ((event: React.DragEvent) => HTMLElement)
}

/**
 * Interface for components that can receive drops
 */
export interface Droppable extends Disableable {
  /**
   * Whether the component can receive drops
   * @default true
   */
  isDroppable?: boolean

  /**
   * Accepted data types for drop operations
   * @example ["text/plain", "application/json"]
   */
  acceptTypes?: string[]

  /**
   * Callback fired when a draggable element enters the drop target
   */
  onDragEnter?: (event: React.DragEvent) => void

  /**
   * Callback fired when a draggable element leaves the drop target
   */
  onDragLeave?: (event: React.DragEvent) => void

  /**
   * Callback fired when a draggable element is over the drop target
   */
  onDragOver?: (event: React.DragEvent) => void

  /**
   * Callback fired when a draggable element is dropped on the target
   */
  onDrop?: (event: React.DragEvent) => void

  /**
   * CSS class to apply when a draggable element is over the drop target
   */
  dropOverClassName?: string
}

/**
 * Interface for components that can be selected
 */
export interface Selectable extends Disableable {
  /**
   * Whether the component is selected
   * @default false
   */
  isSelected?: boolean

  /**
   * Callback fired when the selection state changes
   */
  onSelectionChange?: (isSelected: boolean) => void

  /**
   * CSS class to apply when the component is selected
   */
  selectedClassName?: string
}

/**
 * Interface for components that can be expanded/collapsed
 */
export interface Expandable {
  /**
   * Whether the component is expanded
   * @default false
   */
  isExpanded?: boolean

  /**
   * Callback fired when the expanded state changes
   */
  onExpandedChange?: (isExpanded: boolean) => void

  /**
   * Whether the component should animate its expansion/collapse
   * @default true
   */
  animate?: boolean

  /**
   * Duration of the expansion/collapse animation in milliseconds
   * @default 200
   */
  animationDuration?: number
}

/**
 * Interface for components with tooltips
 */
export interface Tooltipped {
  /**
   * Content to display in the tooltip
   */
  tooltip?: React.ReactNode

  /**
   * Delay before showing the tooltip in milliseconds
   * @default 500
   */
  tooltipDelay?: number

  /**
   * Position of the tooltip relative to the component
   * @default "top"
   */
  tooltipPosition?: "top" | "right" | "bottom" | "left"

  /**
   * Whether the tooltip should be disabled
   * @default false
   */
  tooltipDisabled?: boolean
}

/**
 * Interface for components with validation states
 */
export interface Validatable {
  /**
   * Whether the component is in an error state
   * @default false
   */
  hasError?: boolean

  /**
   * Error message to display
   */
  errorMessage?: string

  /**
   * Whether the component is in a warning state
   * @default false
   */
  hasWarning?: boolean

  /**
   * Warning message to display
   */
  warningMessage?: string

  /**
   * Whether the component is in a success state
   * @default false
   */
  hasSuccess?: boolean

  /**
   * Success message to display
   */
  successMessage?: string

  /**
   * Validation function that returns an error message or null
   */
  validate?: (value: any) => string | null
}

/**
 * Interface for components with themes
 */
export interface Themeable {
  /**
   * Visual variant of the component
   * @default "default"
   */
  variant?: string

  /**
   * Size variant of the component
   * @default "medium"
   */
  size?: "small" | "medium" | "large"

  /**
   * Color scheme of the component
   */
  colorScheme?: string

  /**
   * Whether to use the system's color scheme
   * @default true
   */
  useSystemColorScheme?: boolean
}

/**
 * Interface for components with animations
 */
export interface Animatable {
  /**
   * Whether the component should animate
   * @default true
   */
  animate?: boolean

  /**
   * Type of animation to apply
   */
  animationType?: "fade" | "slide" | "scale" | "custom"

  /**
   * Duration of the animation in milliseconds
   * @default 300
   */
  animationDuration?: number

  /**
   * Delay before starting the animation in milliseconds
   * @default 0
   */
  animationDelay?: number

  /**
   * Easing function for the animation
   * @default "ease"
   */
  animationEasing?: string
}
