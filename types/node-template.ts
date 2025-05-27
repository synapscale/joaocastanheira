import type { Node, Connection } from "@/types/workflow"

/**
 * Node Template Types
 *
 * This module defines the types related to workflow templates.
 *
 * @module types/node-template
 */

/**
 * Represents a node template that can be saved and reused
 */
export interface NodeTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  thumbnail?: string
  nodes: Node[]
  connections: Connection[]
  isBuiltIn?: boolean
  author?: string
  version?: string
}

/**
 * Represents a node within a template
 */
export interface TemplateNode {
  /** Unique identifier for the node */
  id: string
  /** Type of node (determines functionality) */
  type: string
  /** Position coordinates on the canvas */
  position: {
    x: number
    y: number
  }
  /** Additional data specific to this node type */
  data: Record<string, any>
}

/**
 * Represents a connection between nodes in a template
 */
export interface TemplateConnection {
  /** Unique identifier for the connection */
  id: string
  /** ID of the source node */
  source: string
  /** ID of the target node */
  target: string
  /** Optional label for the connection */
  label?: string
  /** Optional source handle identifier */
  sourceHandle?: string
  /** Optional target handle identifier */
  targetHandle?: string
}

/**
 * Represents a node template category
 */
export interface TemplateCategory {
  id: string
  name: string
  description?: string
  color?: string
}

/**
 * Template filter options
 */
export interface TemplateFilters {
  search: string
  categories: string[]
  tags: string[]
}
