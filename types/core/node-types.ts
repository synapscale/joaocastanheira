import type React from "react"
import type { ComponentBase, Clickable, Draggable, Selectable, Tooltipped, Droppable } from "./component-base"

/**
 * Interface for node data structure
 */
export interface NodeData {
  /**
   * Unique identifier for the node
   * Must be unique across all nodes in the canvas
   */
  id: string

  /**
   * Display name of the node
   * Should be concise and descriptive
   */
  name: string

  /**
   * Detailed description of the node's purpose and functionality
   */
  description: string

  /**
   * Category the node belongs to
   * Used for organization and filtering
   */
  category: string

  /**
   * Type of the node
   * Determines its behavior and appearance
   */
  type: string

  /**
   * Position of the node on the canvas
   */
  position: {
    /**
     * X coordinate in pixels
     */
    x: number

    /**
     * Y coordinate in pixels
     */
    y: number
  }

  /**
   * Additional configuration data specific to this node type
   * Structure depends on the node type
   */
  config?: Record<string, any>

  /**
   * Connection ports for the node
   */
  ports?: {
    /**
     * Input ports that receive data
     */
    inputs: Array<NodePort>

    /**
     * Output ports that send data
     */
    outputs: Array<NodePort>
  }

  /**
   * Metadata for the node
   */
  metadata?: {
    /**
     * Creation timestamp
     */
    createdAt?: string

    /**
     * Last update timestamp
     */
    updatedAt?: string

    /**
     * User who created the node
     */
    createdBy?: string

    /**
     * Version of the node
     */
    version?: string
  }
}

/**
 * Interface for node port data
 */
export interface NodePort {
  /**
   * Unique identifier for the port
   * Must be unique within the node
   */
  id: string

  /**
   * Display name of the port
   */
  name: string

  /**
   * Data type the port accepts or provides
   * Used for compatibility checking
   */
  dataType: string

  /**
   * IDs of connections to this port
   */
  connections: string[]

  /**
   * Whether the port is required for the node to function
   * @default false
   */
  isRequired?: boolean

  /**
   * Default value for the port if no connection is made
   */
  defaultValue?: any

  /**
   * Maximum number of connections allowed for this port
   * Null means unlimited
   * @default null
   */
  maxConnections?: number | null
}

/**
 * Interface for node connection data
 */
export interface NodeConnection {
  /**
   * Unique identifier for the connection
   */
  id: string

  /**
   * ID of the source node
   */
  sourceNodeId: string

  /**
   * ID of the source port
   */
  sourcePortId: string

  /**
   * ID of the target node
   */
  targetNodeId: string

  /**
   * ID of the target port
   */
  targetPortId: string

  /**
   * Whether the connection is selected
   * @default false
   */
  selected?: boolean

  /**
   * Custom data for the connection
   */
  data?: Record<string, any>
}

/**
 * Interface for node type definition
 */
export interface NodeTypeDefinition {
  /**
   * Unique identifier for the node type
   */
  id: string

  /**
   * Display name of the node type
   */
  name: string

  /**
   * Detailed description of the node type
   */
  description: string

  /**
   * Category the node type belongs to
   */
  category: string

  /**
   * Input port definitions for this node type
   */
  inputs: Array<{
    /**
     * Unique identifier for the input port
     */
    id: string

    /**
     * Display name of the input port
     */
    name: string

    /**
     * Data type the input port accepts
     */
    dataType: string

    /**
     * Whether the input is required
     * @default false
     */
    isRequired?: boolean

    /**
     * Default value if no connection is made
     */
    defaultValue?: any
  }>

  /**
   * Output port definitions for this node type
   */
  outputs: Array<{
    /**
     * Unique identifier for the output port
     */
    id: string

    /**
     * Display name of the output port
     */
    name: string

    /**
     * Data type the output port provides
     */
    dataType: string
  }>

  /**
   * Default configuration for this node type
   */
  defaultConfig?: Record<string, any>

  /**
   * Properties that can be configured for this node type
   */
  properties: Record<string, any>

  /**
   * Icon to represent this node type
   */
  icon?: string

  /**
   * Whether this node type is built-in or user-defined
   * @default false
   */
  isUserDefined?: boolean
}

/**
 * Props for the NodeTemplateCard component
 */
export interface NodeTemplateCardProps extends ComponentBase, Clickable, Draggable, Tooltipped {
  /**
   * Display name of the node template
   * Should be concise and descriptive
   */
  name: string

  /**
   * Detailed description of the node template's purpose and functionality
   */
  description: string

  /**
   * Category the node template belongs to
   * Used for organization and filtering
   */
  category: string

  /**
   * Callback fired when the edit action is triggered
   */
  onEdit?: () => void

  /**
   * Callback fired when the duplicate action is triggered
   */
  onDuplicate?: () => void

  /**
   * Callback fired when the delete action is triggered
   */
  onDelete?: () => void

  /**
   * Whether to show the actions menu
   * @default true
   */
  showActions?: boolean

  /**
   * Custom icon to display for the node template
   */
  icon?: React.ReactNode

  /**
   * Whether the node template is featured or highlighted
   * @default false
   */
  isFeatured?: boolean

  /**
   * Custom badge text to display
   */
  badgeText?: string

  /**
   * Custom badge color
   */
  badgeColor?: string
}

/**
 * Props for the NodeCategory component
 */
export interface NodeCategoryProps extends ComponentBase, Clickable, Draggable, Tooltipped {
  /**
   * Unique identifier for the category
   */
  id?: string

  /**
   * Display name of the category
   */
  name: string

  /**
   * Detailed description of the category
   */
  description: string

  /**
   * Type of category
   * @default "core"
   */
  category?: string

  /**
   * Whether this is a user-defined node
   * @default false
   */
  isUserNode?: boolean

  /**
   * Callback fired when the edit action is triggered
   */
  onEdit?: () => void

  /**
   * Callback fired when the delete action is triggered
   */
  onDelete?: () => void

  /**
   * Whether to show the actions menu
   * @default true
   */
  showActions?: boolean

  /**
   * Custom icon to display for the category
   */
  icon?: React.ReactNode

  /**
   * Number of nodes in this category
   */
  nodeCount?: number

  /**
   * Whether the category is expanded
   * @default false
   */
  isExpanded?: boolean

  /**
   * Callback fired when the expanded state changes
   */
  onExpandedChange?: (isExpanded: boolean) => void
}

/**
 * Props for the CanvasNode component
 */
export interface CanvasNodeProps extends ComponentBase, Clickable, Draggable, Selectable {
  /**
   * Node data to render
   */
  node: NodeData

  /**
   * Whether the node is selected
   * @default false
   */
  isSelected: boolean

  /**
   * Callback fired when the node is moved
   */
  onMove?: (nodeId: string, position: { x: number; y: number }) => void

  /**
   * Callback fired when the node is removed
   */
  onRemove?: (nodeId: string) => void

  /**
   * Callback fired when a port on the node is connected
   */
  onConnect?: (sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string) => void

  /**
   * Callback fired when a connection to a port on the node is removed
   */
  onDisconnect?: (connectionId: string) => void

  /**
   * Whether the node is in edit mode
   * @default false
   */
  isEditing?: boolean

  /**
   * Callback fired when the edit mode changes
   */
  onEditingChange?: (isEditing: boolean) => void

  /**
   * Whether the node is in a readonly state
   * @default false
   */
  isReadonly?: boolean

  /**
   * Scale factor for the node
   * @default 1
   */
  scale?: number

  /**
   * Z-index for the node
   * Higher values bring the node to the front
   */
  zIndex?: number
}

/**
 * Props for the NodePort component
 */
export interface NodePortProps extends ComponentBase, Clickable, Draggable, Droppable {
  /**
   * ID of the node this port belongs to
   */
  nodeId: string

  /**
   * Port data
   */
  port: {
    /**
     * Unique identifier for the port
     */
    id: string

    /**
     * Type of port: "input" or "output"
     */
    type: "input" | "output"

    /**
     * Display name of the port
     */
    name: string

    /**
     * Data type the port accepts or provides
     */
    dataType: string
  }

  /**
   * IDs of connections to this port
   */
  connections: string[]

  /**
   * Whether the port is required
   * @default false
   */
  isRequired?: boolean

  /**
   * Whether the port is compatible with the currently dragged connection
   * @default false
   */
  isCompatible?: boolean

  /**
   * Callback fired when a connection is started from this port
   */
  onConnectionStart?: (nodeId: string, portId: string) => void

  /**
   * Callback fired when a connection is ended at this port
   */
  onConnectionEnd?: (nodeId: string, portId: string) => void

  /**
   * Callback fired when a connection to this port is selected
   */
  onConnectionSelect?: (connectionId: string) => void

  /**
   * Maximum number of connections allowed for this port
   * Null means unlimited
   * @default null
   */
  maxConnections?: number | null

  /**
   * Whether the port has reached its maximum number of connections
   * @default false
   */
  isAtMaxConnections?: boolean
}

/**
 * Props for the ConnectionLine component
 */
export interface ConnectionLineProps extends ComponentBase, Clickable, Selectable {
  /**
   * Connection data
   */
  connection: NodeConnection

  /**
   * Callback fired when the connection is removed
   */
  onRemove?: (connectionId: string) => void

  /**
   * Whether to animate the connection
   * @default false
   */
  animate?: boolean

  /**
   * Stroke width of the connection line
   * @default 2
   */
  strokeWidth?: number

  /**
   * Stroke style of the connection line
   * @default "solid"
   */
  strokeStyle?: "solid" | "dashed" | "dotted"

  /**
   * Color of the connection line
   * If not provided, will use the theme color based on the data type
   */
  color?: string

  /**
   * Whether the connection is being created (not yet complete)
   * @default false
   */
  isCreating?: boolean

  /**
   * Whether the connection is valid
   * @default true
   */
  isValid?: boolean
}
