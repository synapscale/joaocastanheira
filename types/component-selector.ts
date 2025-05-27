/**
 * @fileoverview
 * Type definitions for the component selector functionality.
 */

/**
 * Component interface
 */
export interface Component {
  /**
   * Unique identifier for the component
   */
  id: string

  /**
   * Name of the component
   */
  name: string

  /**
   * Path to the component file
   */
  path: string

  /**
   * DOM element associated with the component
   */
  element: HTMLElement

  /**
   * Component props
   */
  props?: Record<string, any>

  /**
   * Component state
   */
  state?: Record<string, any>

  /**
   * Detection method used to identify the component
   */
  detectionMethod?: string
}

/**
 * @fileoverview
 * Type definitions for component events.
 */

/**
 * Component event interface
 */
export interface ComponentEvent {
  /**
   * Type of the event
   */
  type: string

  /**
   * Event details
   */
  payload?: Record<string, any>
}
