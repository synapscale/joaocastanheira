import type React from "react"
/**
 * Shared type definitions for consistent typing across components
 */

// Base component props interface
export interface BaseComponentProps {
  className?: string
  testId?: string
}

// Node related types
export interface NodeBase {
  id: string
  name: string
  description: string
  category: string
}

export interface NodePort {
  id: string
  name: string
  type: string
  connected?: boolean
}

export interface Node extends NodeBase {
  position: { x: number; y: number }
  inputs: NodePort[]
  outputs: NodePort[]
  config?: Record<string, any>
}

export interface NodeTemplate extends NodeBase {
  icon?: React.ReactNode
  inputs?: NodePort[]
  outputs?: NodePort[]
}

// Canvas related types
export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface Connection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}

// Category related types
export interface Category {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  count: number
}

// UI related types
export interface SearchOptions {
  debounceMs?: number
  minLength?: number
  placeholder?: string
}

export interface PaginationOptions {
  itemsPerPage: number
  totalItems: number
  currentPage: number
  onPageChange: (page: number) => void
}
