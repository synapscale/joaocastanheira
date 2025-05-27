"use client"

import { useState, useCallback } from "react"
import { useWorkflow } from "@/context/workflow-context"
import type { Node } from "@/types/workflow"

interface UseNodeEditorDialogReturn {
  isOpen: boolean
  editingNode: Node | null
  openNodeEditor: (nodeId: string) => void
  closeNodeEditor: () => void
  saveNode: (updatedNode: Node) => void
  deleteNode: (nodeId: string) => void
  createNode: (node: Omit<Node, "id">) => void
}

/**
 * Hook for managing the node editor dialog.
 *
 * Provides functions to open, close, save, and delete nodes.
 *
 * @returns Object containing state and functions for managing the node editor dialog
 */
export function useNodeEditorDialog(): UseNodeEditorDialogReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const { nodes, updateNode, deleteNode: removeNode, addNode } = useWorkflow()

  /**
   * Opens the node editor dialog for a specific node
   */
  const openNodeEditor = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (node) {
        setEditingNode(node)
        setIsOpen(true)
      }
    },
    [nodes],
  )

  /**
   * Closes the node editor dialog
   */
  const closeNodeEditor = useCallback(() => {
    setIsOpen(false)
    setEditingNode(null)
  }, [])

  /**
   * Saves changes to a node
   */
  const saveNode = useCallback(
    (updatedNode: Node) => {
      updateNode(updatedNode.id, updatedNode)
      closeNodeEditor()
    },
    [updateNode, closeNodeEditor],
  )

  /**
   * Deletes a node
   */
  const deleteNode = useCallback(
    (nodeId: string) => {
      removeNode(nodeId)
      closeNodeEditor()
    },
    [removeNode, closeNodeEditor],
  )

  /**
   * Creates a new node
   */
  const createNode = useCallback(
    (node: Omit<Node, "id">) => {
      const newNode = {
        ...node,
        id: `node-${Date.now()}`,
      }
      addNode(newNode)
    },
    [addNode],
  )

  return {
    isOpen,
    editingNode,
    openNodeEditor,
    closeNodeEditor,
    saveNode,
    deleteNode,
    createNode,
  }
}
