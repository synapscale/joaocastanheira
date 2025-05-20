/**
 * ConversationHeader Component
 *
 * Displays the header for a conversation with options to edit the title,
 * delete the conversation, and export the conversation data.
 */
"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Edit2, Check, X, MoreHorizontal, Trash2, Download, Star, StarOff, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useApp } from "@/contexts/app-context"
import type { BaseComponentProps } from "../../../../shared/types/component-types"
import type { Conversation } from "@/types/chat"

/**
 * Props for the ConversationHeader component
 */
export interface ConversationHeaderProps extends BaseComponentProps {
  /**
   * The conversation to display
   */
  conversation: Conversation

  /**
   * Callback fired when the conversation title is updated
   * @param title The new title
   */
  onUpdateTitle?: (title: string) => void

  /**
   * Callback fired when the conversation is deleted
   */
  onDeleteConversation?: () => void

  /**
   * Callback fired when the conversation is exported
   */
  onExportConversation?: () => void

  /**
   * Callback fired when the conversation is shared
   */
  onShareConversation?: () => void

  /**
   * Whether to allow editing the title
   * @default true
   */
  allowTitleEdit?: boolean

  /**
   * Whether to allow deleting the conversation
   * @default true
   */
  allowDelete?: boolean

  /**
   * Whether to allow exporting the conversation
   * @default true
   */
  allowExport?: boolean

  /**
   * Whether to allow sharing the conversation
   * @default true
   */
  allowShare?: boolean

  /**
   * Whether to allow favoriting the conversation
   * @default true
   */
  allowFavorite?: boolean

  /**
   * Maximum length of the conversation title
   * @default 50
   */
  maxTitleLength?: number
}

/**
 * ConversationHeader component
 */
export default function ConversationHeader({
  className = "",
  style,
  id,
  disabled = false,
  dataAttributes,
  conversation,
  onUpdateTitle,
  onDeleteConversation,
  onExportConversation,
  onShareConversation,
  allowTitleEdit = true,
  allowDelete = true,
  allowExport = true,
  allowShare = true,
  allowFavorite = true,
  maxTitleLength = 50,
}: ConversationHeaderProps) {
  // SECTION: Local state
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(conversation.title)

  // SECTION: References
  const inputRef = useRef<HTMLInputElement>(null)

  // SECTION: Application context
  const { toggleFavoriteConversation } = useApp()

  // SECTION: Effects

  /**
   * Focus the input when editing starts
   */
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  /**
   * Update local title when conversation changes
   */
  useEffect(() => {
    setTitle(conversation.title)
  }, [conversation.title])

  // SECTION: Event handlers

  /**
   * Start editing the title
   */
  const handleStartEditing = useCallback(() => {
    if (!allowTitleEdit || disabled) return
    setIsEditing(true)
  }, [allowTitleEdit, disabled])

  /**
   * Save the edited title
   */
  const handleSaveTitle = useCallback(() => {
    if (!title.trim()) {
      setTitle(conversation.title)
    } else if (title !== conversation.title) {
      onUpdateTitle?.(title)
    }

    setIsEditing(false)
  }, [title, conversation.title, onUpdateTitle])

  /**
   * Cancel editing the title
   */
  const handleCancelEditing = useCallback(() => {
    setTitle(conversation.title)
    setIsEditing(false)
  }, [conversation.title])

  /**
   * Handle key press in the title input
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSaveTitle()
      } else if (e.key === "Escape") {
        handleCancelEditing()
      }
    },
    [handleSaveTitle, handleCancelEditing],
  )

  /**
   * Toggle favorite status
   */
  const handleToggleFavorite = useCallback(() => {
    toggleFavoriteConversation(conversation.id)
  }, [conversation.id, toggleFavoriteConversation])

  // Prepare data attributes
  const allDataAttributes = {
    "data-component": "ConversationHeader",
    "data-component-path": "@/components/chat/conversation-header",
    ...(dataAttributes || {}),
  }

  // SECTION: Render
  return (
    <div className={`flex items-center ${className}`} style={style} id={id} {...allDataAttributes}>
      {isEditing ? (
        <div className="flex items-center">
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, maxTitleLength))}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
            disabled={disabled}
          />
          <div className="flex items-center ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleSaveTitle}
              disabled={disabled}
            >
              <Check className="h-3.5 w-3.5 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleCancelEditing}
              disabled={disabled}
            >
              <X className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <h2
            className="font-medium text-sm truncate max-w-[200px] text-gray-700 dark:text-gray-200"
            onClick={handleStartEditing}
          >
            {title}
          </h2>
          {allowTitleEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-1"
              onClick={handleStartEditing}
              disabled={disabled}
            >
              <Edit2 className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            </Button>
          )}
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-2"
            disabled={disabled}
          >
            <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {allowFavorite && (
            <DropdownMenuItem onClick={handleToggleFavorite} disabled={disabled}>
              {conversation.isFavorite ? (
                <>
                  <StarOff className="h-4 w-4 mr-2" />
                  Remove from favorites
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Add to favorites
                </>
              )}
            </DropdownMenuItem>
          )}

          {allowExport && (
            <DropdownMenuItem onClick={onExportConversation} disabled={disabled}>
              <Download className="h-4 w-4 mr-2" />
              Export conversation
            </DropdownMenuItem>
          )}

          {allowShare && (
            <DropdownMenuItem onClick={onShareConversation} disabled={disabled}>
              <Share2 className="h-4 w-4 mr-2" />
              Share conversation
            </DropdownMenuItem>
          )}

          {allowDelete && (
            <DropdownMenuItem
              onClick={onDeleteConversation}
              disabled={disabled}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete conversation
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
