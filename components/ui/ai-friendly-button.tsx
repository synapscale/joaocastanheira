"use client"

/**
 * AI-Friendly Button Component
 *
 * Purpose: Provides a highly reusable button component with AI-friendly patterns
 * AI Context: This component follows predictable patterns that AI can easily understand,
 * extend, and compose with other components
 *
 * Features:
 * - Consistent prop interface following project standards
 * - Built-in accessibility with ARIA support
 * - Loading states with customizable indicators
 * - Icon support with flexible positioning
 * - Keyboard navigation
 * - Clear visual feedback
 * - Tooltip integration
 * - Multiple variants and sizes
 *
 * @example
 * \`\`\`tsx
 * <AIFriendlyButton
 *   variant="primary"
 *   size="md"
 *   onClick={handleClick}
 *   isLoading={isSubmitting}
 *   leftIcon={<SaveIcon />}
 *   ariaLabel="Save document"
 * >
 *   Save Document
 * </AIFriendlyButton>
 * \`\`\`
 */

import type React from "react"
import { forwardRef, useMemo } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type {
  BaseComponentProps,
  AccessibilityProps,
  InteractionProps,
  VisualProps,
} from "@/types/component-interfaces"

/**
 * Props interface for the AI-Friendly Button component
 *
 * Extends base interfaces to provide consistent API patterns across the project
 */
export interface AIFriendlyButtonProps extends BaseComponentProps, AccessibilityProps, InteractionProps, VisualProps {
  // ===== CONTEÚDO =====
  /** Button content */
  children?: React.ReactNode
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode
  /** Text to display when loading */
  loadingText?: string
  /** Custom loading spinner */
  loadingSpinner?: React.ReactNode
  /** Tooltip text to display on hover */
  tooltip?: string

  // ===== COMPORTAMENTAIS =====
  /** Button type for form submission */
  type?: "button" | "submit" | "reset"
  /** Whether the button is in a pressed state */
  isPressed?: boolean
  /** Whether the button should show tooltip */
  showTooltip?: boolean
  /** Whether icons should be hidden when loading */
  hideIconsWhenLoading?: boolean
  /** Whether to prevent default click behavior */
  preventDefault?: boolean
  /** Whether to stop event propagation */
  stopPropagation?: boolean

  // ===== VISUAIS =====
  /** Icon size override */
  iconSize?: "xs" | "sm" | "md" | "lg" | "xl"
  /** Gap between icon and text */
  iconGap?: "none" | "xs" | "sm" | "md" | "lg"
  /** Text alignment */
  textAlign?: "left" | "center" | "right"
  /** Whether button should have rounded corners */
  rounded?: boolean | "sm" | "md" | "lg" | "full"
  /** Animation style */
  animation?: "none" | "subtle" | "bounce" | "pulse"

  // ===== EVENTOS =====
  /** Callback when button is double clicked */
  onDoubleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Callback when mouse enters */
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Callback when mouse leaves */
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

/**
 * Style variants for the button component
 *
 * AI Context: These styles are organized in a way that AI can easily understand
 * and modify. Each variant has a clear purpose and consistent naming.
 */
const buttonVariants = {
  default: "bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
} as const

/**
 * Size variants for the button component
 *
 * AI Context: Consistent sizing system that AI can understand and apply
 */
const buttonSizes = {
  xs: "h-7 px-2 text-xs",
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-6 text-base",
  xl: "h-11 px-8 text-base",
} as const

/**
 * Icon size configurations
 */
const iconSizes = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-7 w-7",
} as const

/**
 * Gap configurations
 */
const iconGaps = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
} as const

/**
 * Rounded configurations
 */
const roundedStyles = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const

/**
 * Animation configurations
 */
const animationStyles = {
  none: "",
  subtle: "transition-all duration-200",
  bounce: "transition-all duration-200 hover:scale-105 active:scale-95",
  pulse: "transition-all duration-200 hover:animate-pulse",
} as const

/**
 * Default loading spinner component
 *
 * AI Context: Simple, reusable loading indicator
 */
const DefaultLoadingSpinner: React.FC<{ size?: keyof typeof iconSizes }> = ({ size = "sm" }) => (
  <svg
    className={cn("animate-spin", iconSizes[size])}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

/**
 * AI-Friendly Button Component
 *
 * This component is designed to be easily understood and extended by AI systems.
 * It follows consistent patterns and provides clear interfaces for customization.
 */
export const AIFriendlyButton = forwardRef<HTMLButtonElement, AIFriendlyButtonProps>(
  (
    {
      // Conteúdo
      children,
      leftIcon,
      rightIcon,
      loadingText,
      loadingSpinner,
      tooltip,

      // Comportamentais
      type = "button",
      isPressed = false,
      showTooltip = true,
      hideIconsWhenLoading = false,
      preventDefault = false,
      stopPropagation = false,
      disabled = false,
      isLoading = false,
      isSelected = false,
      isActive = false,

      // Visuais
      variant = "default",
      size = "md",
      colorScheme = "default",
      fullWidth = false,
      iconSize,
      iconGap = "sm",
      textAlign = "center",
      rounded = true,
      animation = "subtle",

      // Eventos
      onClick,
      onDoubleClick,
      onKeyDown,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,

      // Acessibilidade
      ariaLabel,
      ariaDescription,
      ariaDescribedBy,
      ariaLabelledBy,
      role = "button",
      tabIndex = 0,

      // Base
      className,
      id,
      testId,
      ...props
    },
    ref,
  ) => {
    /**
     * Determine icon size based on button size if not explicitly set
     */
    const effectiveIconSize = useMemo(() => {
      if (iconSize) return iconSize

      const sizeToIconMap = {
        xs: "xs" as const,
        sm: "sm" as const,
        md: "sm" as const,
        lg: "md" as const,
        xl: "lg" as const,
      }

      return sizeToIconMap[size]
    }, [iconSize, size])

    /**
     * Compute button classes using memoization for performance
     *
     * AI Context: This pattern shows how to efficiently compute styles
     * based on props while maintaining readability
     */
    const buttonClasses = useMemo(() => {
      return cn(
        // Base button styles
        "inline-flex items-center justify-center font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",

        // Variant styles
        buttonVariants[variant],

        // Size styles
        buttonSizes[size],

        // Gap styles
        iconGaps[iconGap],

        // Rounded styles
        rounded === true && "rounded-md",
        typeof rounded === "string" && roundedStyles[rounded],
        rounded === false && "rounded-none",

        // Animation styles
        animationStyles[animation],

        // Text alignment
        textAlign === "left" && "justify-start",
        textAlign === "right" && "justify-end",
        textAlign === "center" && "justify-center",

        // State-based styles
        {
          "w-full": fullWidth,
          "bg-accent text-accent-foreground": isPressed || isSelected || isActive,
          "cursor-not-allowed": disabled || isLoading,
        },

        // Custom className
        className,
      )
    }, [
      variant,
      size,
      iconGap,
      rounded,
      animation,
      textAlign,
      fullWidth,
      isPressed,
      isSelected,
      isActive,
      disabled,
      isLoading,
      className,
    ])

    /**
     * Handle click events with loading state consideration
     *
     * AI Context: This pattern shows how to handle events while respecting component state
     */
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) {
        event.preventDefault()
        return
      }

      if (preventDefault) {
        event.preventDefault()
      }

      if (stopPropagation) {
        event.stopPropagation()
      }

      onClick?.(event)
    }

    /**
     * Handle keyboard events for accessibility
     *
     * AI Context: This shows how to implement keyboard accessibility patterns
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) {
        return
      }

      // Handle Enter and Space keys
      if (event.key === "Enter" || event.key === " ") {
        if (preventDefault) {
          event.preventDefault()
        }
        handleClick(event as any)
      }

      onKeyDown?.(event)
    }

    /**
     * Render button content with proper loading state handling
     *
     * AI Context: This pattern shows how to conditionally render content
     * while maintaining accessibility and user experience
     */
    const renderButtonContent = () => {
      const showLeftIcon = leftIcon && (!isLoading || !hideIconsWhenLoading)
      const showRightIcon = rightIcon && (!isLoading || !hideIconsWhenLoading)
      const displayText = isLoading && loadingText ? loadingText : children

      return (
        <>
          {/* Loading spinner */}
          {isLoading && (
            <span className="flex-shrink-0" aria-hidden="true">
              {loadingSpinner || <DefaultLoadingSpinner size={effectiveIconSize} />}
            </span>
          )}

          {/* Left icon */}
          {showLeftIcon && (
            <span className={cn("flex-shrink-0", iconSizes[effectiveIconSize])} aria-hidden="true">
              {leftIcon}
            </span>
          )}

          {/* Text content */}
          {displayText && <span className="truncate">{displayText}</span>}

          {/* Right icon */}
          {showRightIcon && (
            <span className={cn("flex-shrink-0", iconSizes[effectiveIconSize])} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </>
      )
    }

    /**
     * Render the button element
     */
    const buttonElement = (
      <button
        ref={ref}
        id={id}
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label={ariaLabel}
        aria-description={ariaDescription}
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabelledBy}
        aria-pressed={isPressed}
        aria-selected={isSelected}
        aria-busy={isLoading}
        role={role}
        tabIndex={disabled ? -1 : tabIndex}
        data-testid={testId}
        title={!showTooltip ? tooltip : undefined}
        {...props}
      >
        {renderButtonContent()}
      </button>
    )

    /**
     * Wrap with tooltip if enabled and tooltip text is provided
     */
    if (showTooltip && tooltip && !disabled) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return buttonElement
  },
)

// Set display name for debugging and dev tools
AIFriendlyButton.displayName = "AIFriendlyButton"

/**
 * Export button variants and sizes for external use
 *
 * AI Context: These exports allow AI to understand available options
 * and use them in other components or configurations
 */
export { buttonVariants, buttonSizes, iconSizes, iconGaps, roundedStyles, animationStyles }
export type { AIFriendlyButtonProps }
