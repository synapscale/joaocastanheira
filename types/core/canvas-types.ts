/**
 * Tipos fundamentais para o sistema de canvas
 */

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface NodePort {
  id: string
  name: string
  type: "input" | "output"
  dataType?: string
  connected?: boolean
  connections?: string[]
  optional?: boolean
  description?: string
}

export interface NodeData {
  name: string
  description?: string
  inputs?: number
  outputs?: number
  [key: string]: any
}

export interface Node {
  id: string
  type: string
  position: Position
  size?: Size
  data: NodeData
  inputs?: NodePort[]
  outputs?: NodePort[]
  isExpanded?: boolean
  isLocked?: boolean
  isHidden?: boolean
  zIndex?: number
  width?: number
  height?: number
}

export interface Connection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  sourcePort?: string
  targetPort?: string
  label?: string
  data?: Record<string, any>
}

export interface CanvasState {
  nodes: Node[]
  connections: Connection[]
  viewport: Viewport
  selectedNodes: string[]
}

// Tipos para handlers de eventos
export type NodeSelectionHandler = (nodeId: string, isMultiSelect?: boolean) => void
export type NodePositionHandler = (nodeId: string, position: Position) => void
export type NodeConnectionHandler = (
  sourceId: string,
  sourcePortId: string,
  targetId: string,
  targetPortId: string,
) => void
export type PortDragHandler = (nodeId: string, portId: string, portType: "input" | "output") => void
