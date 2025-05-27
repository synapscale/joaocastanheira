"use client"

/**
 * @module useWorkflowConnections
 * @description A hook for managing workflow connections between nodes.
 */

import { useCallback, useMemo } from "react"
import { useWorkflow } from "@/context/workflow-context"
import type { Connection, Node } from "@/types/workflow"

/**
 * Interface for the return value of the useWorkflowConnections hook
 */
interface UseWorkflowConnectionsReturn {
  /** List of all connections in the workflow */
  connections: Connection[]
  /** Function to add a new connection */
  addConnection: (connection: Omit<Connection, "id">) => void
  /** Function to remove a connection */
  removeConnection: (id: string) => void
  /** Function to update a connection's type */
  updateConnectionType: (id: string, type: "bezier" | "straight" | "step") => void
  /** Function to get a connection by ID */
  getConnectionById: (id: string) => Connection | null
  /** Function to get connections for a specific node */
  getConnectionsForNode: (nodeId: string, direction?: "incoming" | "outgoing" | "both") => Connection[]
  /** Function to check if a node has outgoing connections */
  hasOutgoingConnections: (nodeId: string) => boolean
  /** Function to check if a node has incoming connections */
  hasIncomingConnections: (nodeId: string) => boolean
  /** Function to check if a connection is valid */
  isValidConnection: (sourceNodeId: string, targetNodeId: string) => boolean
  /** Function to update a connection's label */
  updateConnectionLabel: (id: string, label: string) => void
  /** Function to get all nodes connected to a specific node */
  getConnectedNodes: (nodeId: string, nodes: Node[], direction?: "incoming" | "outgoing" | "both") => Node[]
}

/**
 * Custom hook for managing workflow connections.
 *
 * Provides functions to add, remove, update, and query connections.
 *
 * @returns Object containing state and functions for managing connections
 *
 * @example
 * \`\`\`tsx
 * const {
 *   connections,
 *   addConnection,
 *   removeConnection,
 *   getConnectionsForNode,
 *   isValidConnection
 * } = useWorkflowConnections();
 *
 * // Add a new connection
 * const handleConnect = (sourceId, targetId) => {
 *   if (isValidConnection(sourceId, targetId)) {
 *     addConnection({
 *       from: sourceId,
 *       to: targetId,
 *       type: "bezier"
 *     });
 *   }
 * };
 * \`\`\`
 */
export function useWorkflowConnections(): UseWorkflowConnectionsReturn {
  const {
    connections,
    nodes,
    addConnection: addConnectionToWorkflow,
    removeConnection,
    updateConnectionType,
    updateConnectionLabel,
  } = useWorkflow()

  /**
   * Add a new connection
   *
   * @param connection - The connection to add (without ID)
   */
  const addConnection = useCallback(
    (connection: Omit<Connection, "id">) => {
      const connectionWithId = {
        ...connection,
        id: `connection-${Date.now()}`,
      }
      addConnectionToWorkflow(
        connectionWithId.from,
        connectionWithId.to,
        connectionWithId.type,
        connectionWithId.id,
        connectionWithId.label,
      )
    },
    [addConnectionToWorkflow],
  )

  /**
   * Get a connection by ID
   *
   * @param id - The ID of the connection to find
   * @returns The connection object or null if not found
   */
  const getConnectionById = useCallback(
    (id: string): Connection | null => {
      return connections.find((conn) => conn.id === id) || null
    },
    [connections],
  )

  /**
   * Get connections for a specific node, filtering by direction
   *
   * @param nodeId - The ID of the node
   * @param direction - The direction of connections to get ("incoming", "outgoing", or "both")
   * @returns Array of connections
   */
  const getConnectionsForNode = useCallback(
    (nodeId: string, direction: "incoming" | "outgoing" | "both" = "both"): Connection[] => {
      if (direction === "incoming") {
        return connections.filter((conn) => conn.to === nodeId)
      } else if (direction === "outgoing") {
        return connections.filter((conn) => conn.from === nodeId)
      } else {
        return connections.filter((conn) => conn.from === nodeId || conn.to === nodeId)
      }
    },
    [connections],
  )

  /**
   * Check if a node has outgoing connections
   *
   * @param nodeId - The ID of the node to check
   * @returns True if the node has outgoing connections
   */
  const hasOutgoingConnections = useCallback(
    (nodeId: string): boolean => {
      return connections.some((conn) => conn.from === nodeId)
    },
    [connections],
  )

  /**
   * Check if a node has incoming connections
   *
   * @param nodeId - The ID of the node to check
   * @returns True if the node has incoming connections
   */
  const hasIncomingConnections = useCallback(
    (nodeId: string): boolean => {
      return connections.some((conn) => conn.to === nodeId)
    },
    [connections],
  )

  /**
   * Get all nodes connected to a specific node
   *
   * @param nodeId - The ID of the node
   * @param allNodes - Array of all nodes in the workflow
   * @param direction - The direction of connections to consider
   * @returns Array of connected nodes
   */
  const getConnectedNodes = useCallback(
    (nodeId: string, allNodes: Node[], direction: "incoming" | "outgoing" | "both" = "both"): Node[] => {
      const nodeConnections = getConnectionsForNode(nodeId, direction)
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

      return allNodes.filter((node) => connectedNodeIds.has(node.id))
    },
    [getConnectionsForNode],
  )

  /**
   * Check if a connection is valid
   *
   * @param sourceNodeId - The ID of the source node
   * @param targetNodeId - The ID of the target node
   * @returns True if the connection is valid
   */
  const isValidConnection = useCallback(
    (sourceNodeId: string, targetNodeId: string): boolean => {
      // Don't allow connections to the same node
      if (sourceNodeId === targetNodeId) return false

      // Don't allow duplicate connections
      const existingConnection = connections.find((conn) => conn.from === sourceNodeId && conn.to === targetNodeId)
      if (existingConnection) return false

      // Don't allow circular connections
      const wouldCreateCycle = checkForCycle(sourceNodeId, targetNodeId, connections)
      if (wouldCreateCycle) return false

      return true
    },
    [connections],
  )

  /**
   * Check if adding a connection would create a cycle
   *
   * @param sourceNodeId - The ID of the source node
   * @param targetNodeId - The ID of the target node
   * @param connectionsList - List of existing connections
   * @returns True if adding the connection would create a cycle
   */
  const checkForCycle = useCallback(
    (sourceNodeId: string, targetNodeId: string, connectionsList: Connection[]): boolean => {
      // If the target node is the same as the source, we have a cycle
      if (targetNodeId === sourceNodeId) return true

      // Set to track visited nodes to avoid infinite loops
      const visited = new Set<string>()

      // Function to recursively check if there's a path from targetNodeId back to sourceNodeId
      const hasPathBack = (currentNodeId: string): boolean => {
        if (visited.has(currentNodeId)) return false
        visited.add(currentNodeId)

        // Find all connections that go out from this node
        const outgoingConnections = connectionsList.filter((conn) => conn.from === currentNodeId)

        // Check if any of these connections lead back to the source node
        for (const conn of outgoingConnections) {
          if (conn.to === sourceNodeId) return true
          if (hasPathBack(conn.to)) return true
        }

        return false
      }

      return hasPathBack(targetNodeId)
    },
    [],
  )

  // Memoize the return value to prevent unnecessary re-renders
  const returnValue = useMemo(
    () => ({
      connections,
      addConnection,
      removeConnection,
      updateConnectionType,
      getConnectionById,
      getConnectionsForNode,
      hasOutgoingConnections,
      hasIncomingConnections,
      isValidConnection,
      updateConnectionLabel,
      getConnectedNodes,
    }),
    [
      connections,
      addConnection,
      removeConnection,
      updateConnectionType,
      getConnectionById,
      getConnectionsForNode,
      hasOutgoingConnections,
      hasIncomingConnections,
      isValidConnection,
      updateConnectionLabel,
      getConnectedNodes,
    ],
  )

  return returnValue
}
