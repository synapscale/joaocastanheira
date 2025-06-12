import type React from "react"
/**
 * Common component parameter types for the application
 * These types provide consistent parameterization across components
 */

import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react"

/**
 * Base component properties that most components should support
 * @property className - CSS class to apply to the component
 * @property children - Child elements to render within the component
 * @property id - Unique identifier for the component
 * @property testId - Data attribute for testing purposes
 */
export interface BaseComponentProps {
  /** CSS class to apply to the component */
  className?: string
  /** Child elements to render within the component */
  children?: ReactNode
  /** Unique identifier for the component */
  id?: string
  /** Data attribute for testing purposes */
  testId?: string
}

/**
 * Status variants for components that can display different states
 */
export type StatusVariant = "default" | "primary" | "success" | "warning" | "danger" | "info"

/**
 * Size variants for components that can be displayed in different sizes
 */
export type SizeVariant = "xs" | "sm" | "md" | "lg" | "xl"

/**
 * Common properties for interactive components
 * @property disabled - Whether the component is disabled
 * @property loading - Whether the component is in a loading state
 * @property onClick - Function to call when the component is clicked
 */
export interface InteractiveComponentProps {
  /** Whether the component is disabled */
  disabled?: boolean
  /** Whether the component is in a loading state */
  loading?: boolean
  /** Function to call when the component is clicked */
  onClick?: () => void
}

/**
 * Properties for form field components
 * @property label - Label text for the field
 * @property name - Name attribute for the field
 * @property error - Error message to display
 * @property required - Whether the field is required
 * @property helperText - Additional text to help the user
 */
export interface FormFieldProps extends BaseComponentProps {
  /** Label text for the field */
  label?: string
  /** Name attribute for the field */
  name: string
  /** Error message to display */
  error?: string
  /** Whether the field is required */
  required?: boolean
  /** Additional text to help the user */
  helperText?: string
}

/**
 * Properties for input field components
 * @extends FormFieldProps
 * @extends InputHTMLAttributes<HTMLInputElement>
 */
export interface InputFieldProps extends FormFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  /** Placeholder text for the input */
  placeholder?: string
  /** Type of input (text, email, password, etc.) */
  type?: string
  /** Function to call when the input value changes */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** Current value of the input */
  value?: string | number
}

/**
 * Properties for select field components
 * @extends FormFieldProps
 * @extends SelectHTMLAttributes<HTMLSelectElement>
 * @property options - Array of options for the select
 */
export interface SelectFieldProps extends FormFieldProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> {
  /** Array of options for the select */
  options: Array<{ value: string; label: string }>
  /** Function to call when the select value changes */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  /** Current value of the select */
  value?: string
}

/**
 * Properties for button components
 * @extends ButtonHTMLAttributes<HTMLButtonElement>
 * @property variant - Visual style variant of the button
 * @property size - Size variant of the button
 * @property fullWidth - Whether the button should take up the full width of its container
 * @property leftIcon - Icon to display on the left side of the button
 * @property rightIcon - Icon to display on the right side of the button
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">, InteractiveComponentProps {
  /** Visual style variant of the button */
  variant?: "solid" | "outline" | "ghost" | "link"
  /** Size variant of the button */
  size?: SizeVariant
  /** Whether the button should take up the full width of its container */
  fullWidth?: boolean
  /** Icon to display on the left side of the button */
  leftIcon?: ReactNode
  /** Icon to display on the right side of the button */
  rightIcon?: ReactNode
  /** Color scheme for the button */
  colorScheme?: StatusVariant
}

/**
 * Properties for icon button components
 * @extends ButtonProps
 * @property icon - Icon to display in the button
 * @property ariaLabel - Accessible label for the button
 */
export interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon"> {
  /** Icon to display in the button */
  icon: ReactNode
  /** Accessible label for the button */
  ariaLabel: string
}

/**
 * Properties for badge components
 * @extends BaseComponentProps
 * @property variant - Visual style variant of the badge
 * @property size - Size variant of the badge
 * @property colorScheme - Color scheme for the badge
 * @property label - Text to display in the badge
 * @property onDelete - Function to call when the delete button is clicked
 * @property deletable - Whether the badge can be deleted
 */
export interface BadgeProps extends BaseComponentProps {
  /** Visual style variant of the badge */
  variant?: "solid" | "outline" | "subtle"
  /** Size variant of the badge */
  size?: "sm" | "md" | "lg"
  /** Color scheme for the badge */
  colorScheme?: StatusVariant
  /** Text to display in the badge */
  label: string
  /** Function to call when the delete button is clicked */
  onDelete?: () => void
  /** Whether the badge can be deleted */
  deletable?: boolean
}

/**
 * Properties for section components
 * @extends BaseComponentProps
 * @property title - Title of the section
 * @property description - Description of the section
 * @property actions - Actions to display in the section header
 * @property collapsible - Whether the section can be collapsed
 * @property defaultCollapsed - Whether the section is collapsed by default
 * @property onToggleCollapse - Function to call when the section is collapsed or expanded
 */
export interface SectionProps extends BaseComponentProps {
  /** Title of the section */
  title?: string
  /** Description of the section */
  description?: string
  /** Actions to display in the section header */
  actions?: ReactNode
  /** Whether the section can be collapsed */
  collapsible?: boolean
  /** Whether the section is collapsed by default */
  defaultCollapsed?: boolean
  /** Function to call when the section is collapsed or expanded */
  onToggleCollapse?: (isCollapsed: boolean) => void
}
