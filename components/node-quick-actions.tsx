"use client"

import type React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCallback } from "react"
import { useWorkflow } from "@/context/workflow-context"

interface NodeQuickActionsProps {
  /** Handler for edit button click */
  onEditClick: () => void
  /** Width of the node, used for positioning */
  nodeWidth: number
  /** ID of the node these actions apply to */
  nodeId?: string
  /** Callback for hover state changes */
  onHoverChange?: (hovered: boolean) => void
}

/**
 * NodeQuickActions component.
 *
 * Displays a toolbar of quick action buttons above a node when it's hovered.
 * Includes buttons for common operations like execute, toggle active state, delete,
 * and a dropdown menu for additional options.
 */
export function NodeQuickActions({ onEditClick, nodeWidth = 70, nodeId, onHoverChange }: NodeQuickActionsProps) {
  const { removeNode, duplicateNode, executeNode, toggleNodeDisabled } = useWorkflow()

  // Handle mouse enter event
  const handleMouseEnter = useCallback(() => {
    if (onHoverChange) onHoverChange(true)
  }, [onHoverChange])

  // Handle mouse leave event
  const handleMouseLeave = useCallback(() => {
    if (onHoverChange) onHoverChange(false)
  }, [onHoverChange])

  const handleExecuteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (nodeId) {
        executeNode(nodeId)
      }
    },
    [nodeId, executeNode],
  )

  const handleToggleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (nodeId) {
        toggleNodeDisabled(nodeId)
      }
    },
    [nodeId, toggleNodeDisabled],
  )

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (nodeId && removeNode) {
        removeNode(nodeId)
      }
    },
    [nodeId, removeNode],
  )

  const handleDuplicateClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (nodeId && duplicateNode) {
        duplicateNode(nodeId)
      }
    },
    [nodeId, duplicateNode],
  )

  return (
    <div
      className="flex items-center justify-center gap-1 pointer-events-auto bg-transparent rounded-md shadow-sm border border-border/30 p-0.5"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ width: nodeWidth }}
    >
      <div className="flex items-center justify-between w-full">
        <ActionButton onClick={handleExecuteClick} tooltip="Execute node">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <polygon points="5 3 19 12 5 21" />
          </svg>
        </ActionButton>

        <ActionButton onClick={handleToggleClick} tooltip="Toggle active state">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
            <line x1="12" y1="2" x2="12" y2="12"></line>
          </svg>
        </ActionButton>

        <ActionButton onClick={handleDeleteClick} tooltip="Delete node">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" />
          </svg>
        </ActionButton>

        <ActionButton onClick={onEditClick} tooltip="Edit node">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </ActionButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              aria-label="More options"
              onMouseEnter={handleMouseEnter}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 10C4.9 10 4 10.9 4 12C4 13.1 4.9 14 6 14C7.1 14 8 13.1 8 12C8 10.9 7.1 10 6 10ZM18 10C16.9 10 16 10.9 16 12C16 13.1 16.9 14 18 14C19.1 14 20 13.1 20 12C20 10.9 19.1 10 18 10ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-48"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <DropdownMenuItem onClick={onEditClick}>
              Open...
              <div className="ml-auto text-xs text-muted-foreground">↵</div>
            </DropdownMenuItem>
            <DropdownMenuItem>Test step</DropdownMenuItem>
            <DropdownMenuItem>
              Rename
              <div className="ml-auto text-xs text-muted-foreground">F2</div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleClick}>
              Deactivate
              <div className="ml-auto text-xs text-muted-foreground">D</div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Pin
              <div className="ml-auto text-xs text-muted-foreground">P</div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Copy
              <div className="ml-auto text-xs text-muted-foreground">⌘C</div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicateClick}>
              Duplicate
              <div className="ml-auto text-xs text-muted-foreground">⌘D</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Tidy up workflow
              <div className="ml-auto text-xs text-muted-foreground">T</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Select all
              <div className="ml-auto text-xs text-muted-foreground">⌘A</div>
            </DropdownMenuItem>
            <DropdownMenuItem>Clear selection</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 focus:text-red-600">
              Delete
              <div className="ml-auto text-xs text-muted-foreground">Del</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  /** Handler for button click */
  onClick: (e: React.MouseEvent) => void
  /** Tooltip text */
  tooltip?: string
  /** Icon component */
  children: React.ReactNode
}

/**
 * ActionButton component.
 *
 * A small button used in the node quick actions toolbar.
 */
function ActionButton({ onClick, tooltip, children }: ActionButtonProps) {
  return (
    <button
      className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
      onClick={onClick}
      title={tooltip}
      aria-label={tooltip}
    >
      {children}
    </button>
  )
}
