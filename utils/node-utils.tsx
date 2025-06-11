import type React from "react"
import type { Connection, Node } from "@/types/workflow"
import { Code, Clock, Bot, Globe, Wrench, FileText, Settings2 } from "lucide-react"

/**
 * Interface for node type information
 */
interface NodeTypeInfo {
  icon: React.ReactNode
  color: string
  bgColor: string
  name: string
}

/**
 * Check if a node has output connections.
 *
 * @param nodeId The ID of the node to check
 * @param connections Array of connections to search through
 * @returns True if the node has output connections, false otherwise
 */
export function hasOutputConnections(nodeId: string, connections: Connection[]): boolean {
  if (!connections || !Array.isArray(connections)) return false
  return connections.some((connection) => connection.from === nodeId)
}

/**
 * Check if a node has input connections.
 *
 * @param nodeId The ID of the node to check
 * @param connections Array of connections to search through
 * @returns True if the node has input connections, false otherwise
 */
export function hasInputConnections(nodeId: string, connections: Connection[]): boolean {
  if (!connections || !Array.isArray(connections)) return false
  return connections.some((connection) => connection.to === nodeId)
}

/**
 * Get all connections for a node.
 *
 * @param nodeId The ID of the node to get connections for
 * @param connections Array of connections to search through
 * @param direction The direction of connections to get (incoming, outgoing, or both)
 * @returns Array of connections for the node
 */
export function getNodeConnections(
  nodeId: string,
  connections: Connection[],
  direction: "incoming" | "outgoing" | "both" = "both",
): Connection[] {
  if (!connections || !Array.isArray(connections)) return []

  if (direction === "incoming") {
    return connections.filter((connection) => connection.to === nodeId)
  } else if (direction === "outgoing") {
    return connections.filter((connection) => connection.from === nodeId)
  } else {
    return connections.filter((connection) => connection.from === nodeId || connection.to === nodeId)
  }
}

/**
 * Calculate the center position of a node.
 *
 * @param node The node to calculate the center for
 * @returns The center position of the node
 */
export function getNodeCenter(node: Node): { x: number; y: number } {
  const width = node.width || 70
  const height = node.height || 70

  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
  }
}

/**
 * Find a node by ID in an array of nodes.
 *
 * @param nodeId The ID of the node to find
 * @param nodes Array of nodes to search through
 * @returns The node if found, undefined otherwise
 */
export function findNodeById(nodeId: string, nodes: Node[]): Node | undefined {
  if (!nodes || !Array.isArray(nodes)) return undefined
  return nodes.find((node) => node.id === nodeId)
}

/**
 * Get all nodes connected to a node.
 *
 * @param nodeId The ID of the node to get connected nodes for
 * @param nodes Array of nodes to search through
 * @param connections Array of connections to search through
 * @param direction The direction of connections to consider (incoming, outgoing, or both)
 * @returns Array of connected nodes
 */
export function getConnectedNodes(
  nodeId: string,
  nodes: Node[],
  connections: Connection[],
  direction: "incoming" | "outgoing" | "both" = "both",
): Node[] {
  if (!nodes || !Array.isArray(nodes) || !connections || !Array.isArray(connections)) return []

  const nodeConnections = getNodeConnections(nodeId, connections, direction)
  const connectedNodeIds = new Set<string>()

  nodeConnections.forEach((connection) => {
    if (direction === "incoming" || direction === "both") {
      if (connection.to === nodeId) {
        connectedNodeIds.add(connection.from)
      }
    }

    if (direction === "outgoing" || direction === "both") {
      if (connection.from === nodeId) {
        connectedNodeIds.add(connection.to)
      }
    }
  })

  return nodes.filter((node) => connectedNodeIds.has(node.id))
}

/**
 * Get node type information including icon, colors, and display name
 *
 * @param nodeType The type of node to get information for
 * @returns Object containing icon, color, background color, and display name
 */
export const getNodeTypeInfo = (nodeType?: string): NodeTypeInfo => {
  if (!nodeType)
    return {
      icon: <Settings2 className="h-5 w-5" />,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      name: "Node",
    }

  // Map of node types to their visual representation
  const nodeTypeMap: Record<string, NodeTypeInfo> = {
    code: {
      icon: <Code className="h-5 w-5" />,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      name: "Code",
    },
    filter: {
      icon: <FileText className="h-5 w-5" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      name: "Filter",
    },
    edit: {
      icon: <Settings2 className="h-5 w-5" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      name: "Edit Fields",
    },
    wait: {
      icon: <Clock className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      name: "Wait",
    },
    trigger: {
      icon: <Globe className="h-5 w-5" />,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      name: "Trigger",
    },
    ai: {
      icon: <Bot className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      name: "AI",
    },
    integration: {
      icon: <Globe className="h-5 w-5" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      name: "Integration",
    },
    action: {
      icon: <Wrench className="h-5 w-5" />,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      name: "Action",
    },
  }

  return (
    nodeTypeMap[nodeType] || {
      icon: <Settings2 className="h-5 w-5" />,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      name: nodeType,
    }
  )
}

/**
 * Generate a unique ID for a node
 *
 * @param prefix Optional prefix for the ID
 * @returns A unique ID string
 */
export function generateNodeId(prefix = "node"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

/**
 * Check if a point is inside a node
 *
 * @param point The point to check
 * @param node The node to check against
 * @returns True if the point is inside the node, false otherwise
 */
export function isPointInsideNode(point: { x: number; y: number }, node: Node): boolean {
  const nodeX = node.position.x
  const nodeY = node.position.y
  const nodeWidth = node.width || 70
  const nodeHeight = node.height || 70

  return point.x >= nodeX && point.x <= nodeX + nodeWidth && point.y >= nodeY && point.y <= nodeY + nodeHeight
}

/**
 * Calculate the distance between two points
 *
 * @param point1 First point
 * @param point2 Second point
 * @returns The Euclidean distance between the points
 */
export function calculateDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Find the closest node to a point
 *
 * @param point The point to check
 * @param nodes Array of nodes to search through
 * @param maxDistance Maximum distance to consider (optional)
 * @returns The closest node and its distance, or null if none found within maxDistance
 */
export function findClosestNode(
  point: { x: number; y: number },
  nodes: Node[],
  maxDistance?: number,
): { node: Node; distance: number } | null {
  if (!nodes || nodes.length === 0) return null

  let closestNode: Node | null = null
  let minDistance = Number.POSITIVE_INFINITY

  for (const node of nodes) {
    const nodeCenter = getNodeCenter(node)
    const distance = calculateDistance(point, nodeCenter)

    if (distance < minDistance) {
      minDistance = distance
      closestNode = node
    }
  }

  if (closestNode && (maxDistance === undefined || minDistance <= maxDistance)) {
    return { node: closestNode, distance: minDistance }
  }

  return null
}
