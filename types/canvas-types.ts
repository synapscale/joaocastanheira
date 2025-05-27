export interface Position {
  x: number
  y: number
}

export interface NodePort {
  id: string
  name: string
  type: string
  connected?: boolean
  connections?: string[]
  optional?: boolean
}

export interface Node {
  id: string
  type: string
  position: { x: number; y: number }
  data: any
  inputs?: NodePort[]
  outputs?: NodePort[]
  isExpanded?: boolean
  isLocked?: boolean
  isHidden?: boolean
  width?: number
  height?: number
  zIndex?: number
  [key: string]: any
}

export interface Connection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  sourcePort?: string
  targetPort?: string
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface CanvasState {
  nodes: Node[]
  connections: Connection[]
  viewport: Viewport
  selectedNodes: string[]
}

export type NodeInteractionHandler = (nodeId: string) => void
export type NodePositionHandler = (nodeId: string, x: number, y: number) => void
export type NodeConnectionHandler = (
  sourceNodeId: string,
  sourcePortId: string,
  targetNodeId: string,
  targetPortId: string,
) => void
export type PortDragHandler = (nodeId: string, portId: string, portType: "input" | "output") => void
