/**
 * ChatMessage Component
 *
 * Displays a single message in the chat interface, with support for
 * user and assistant messages, reactions, and various actions.
 */
"use client"

import type React from "react"

import { useState, createContext, useContext, useCallback, useMemo } from "react"
import { Copy, Check, ThumbsUp, ThumbsDown, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { BaseComponentProps } from "../../../../shared/types/component-types"
import type { Message, MessageReaction } from "@/types/chat"

/**
 * Context for the ChatMessage component
 */
interface ChatMessageContextType {
  /** The message being displayed */
  message: Message

  /** Whether the message has been copied to clipboard */
  copied: boolean

  /** Set whether the message has been copied */
  setCopied: (copied: boolean) => void

  /** The user's reaction to the message */
  reaction: MessageReaction

  /** Set the user's reaction to the message */
  setReaction: (reaction: MessageReaction) => void

  /** Whether to show message actions */
  showActions: boolean

  /** Set whether to show message actions */
  setShowActions: (show: boolean) => void

  /** Copy the message content to clipboard */
  copyToClipboard: () => void

  /** Regenerate the assistant's response */
  regenerateResponse: () => void

  /** Delete the message */
  deleteMessage: () => void

  /** Handle reaction to message */
  onReaction?: (message: Message, reaction: MessageReaction) => void
}

/**
 * Context provider for the ChatMessage component
 */
const ChatMessageContext = createContext<ChatMessageContextType | undefined>(undefined)

/**
 * Hook to access the ChatMessage context
 */
export function useChatMessage() {
  const context = useContext(ChatMessageContext)
  if (context === undefined) {
    throw new Error("useChatMessage must be used within a ChatMessageProvider")
  }
  return context
}

/**
 * Props for the ChatMessage component
 */
export interface ChatMessageProps extends BaseComponentProps {
  /**
   * The message to display
   */
  message: Message

  /**
   * Whether to show the timestamp
   * @default true
   */
  showTimestamp?: boolean

  /**
   * Whether to show the sender name
   * @default true
   */
  showSender?: boolean

  /**
   * Whether to show message actions (copy, react, etc.)
   * @default true
   */
  showActions?: boolean

  /**
   * Whether to allow reactions to the message
   * @default true
   */
  allowReactions?: boolean

  /**
   * Whether to allow copying the message
   * @default true
   */
  allowCopy?: boolean

  /**
   * Whether to allow regenerating the message (assistant messages only)
   * @default true
   */
  allowRegenerate?: boolean

  /**
   * Whether to allow deleting the message
   * @default false
   */
  allowDelete?: boolean

  /**
   * Custom avatar for the user
   */
  userAvatar?: React.ReactNode

  /**
   * Custom avatar for the assistant
   */
  assistantAvatar?: React.ReactNode

  /**
   * Custom name for the user
   * @default "You"
   */
  userName?: string

  /**
   * Custom name for the assistant
   * @default "Assistant"
   */
  assistantName?: string

  /**
   * Custom renderer for message content
   * @param content The message content
   * @returns Rendered content
   */
  contentRenderer?: (content: string) => React.ReactNode

  /**
   * Callback fired when the message is copied
   * @param message The copied message
   */
  onCopy?: (message: Message) => void

  /**
   * Callback fired when the user reacts to the message
   * @param message The message
   * @param reaction The reaction
   */
  onReaction?: (message: Message, reaction: MessageReaction) => void

  /**
   * Callback fired when the user requests to regenerate the message
   * @param message The message to regenerate
   */
  onRegenerate?: (message: Message) => void

  /**
   * Callback fired when the user deletes the message
   * @param message The message to delete
   */
  onDelete?: (message: Message) => void
}

/**
 * Process message content for display
 * @param content Raw message content
 * @returns Processed content
 */
export function processMessageContent(content: string): React.ReactNode {
  // Simple processing for now - could be expanded to handle markdown, code blocks, etc.
  return content
}

/**
 * ChatMessage component
 */
export default function ChatMessage({
  className = "",
  style,
  id,
  disabled = false,
  dataAttributes,
  message,
  showTimestamp = true,
  showSender = true,
  showActions: initialShowActions = true,
  allowReactions = true,
  allowCopy = true,
  allowRegenerate = true,
  allowDelete = false,
  userAvatar,
  assistantAvatar,
  userName = "You",
  assistantName = "Assistant",
  contentRenderer,
  onCopy,
  onReaction,
  onRegenerate,
  onDelete,
}: ChatMessageProps) {
  // SECTION: Local state
  const [copied, setCopied] = useState(false)
  const [reaction, setReaction] = useState<MessageReaction>(message.reaction || null)
  const [showActions, setShowActions] = useState(initialShowActions)

  // SECTION: Event handlers

  /**
   * Copy message content to clipboard
   */
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.(message)
  }, [message, onCopy])

  /**
   * Handle reaction to message
   */
  const handleReaction = useCallback(
    (newReaction: MessageReaction) => {
      // Toggle reaction if clicking the same one
      const updatedReaction = reaction === newReaction ? null : newReaction
      setReaction(updatedReaction)
      onReaction?.(message, updatedReaction)
    },
    [message, reaction, onReaction, setReaction, onReaction],
  )

  /**
   * Regenerate assistant response
   */
  const regenerateResponse = useCallback(() => {
    onRegenerate?.(message)
  }, [message, onRegenerate])

  /**
   * Delete message
   */
  const deleteMessage = useCallback(() => {
    onDelete?.(message)
  }, [message, onDelete])

  // SECTION: Render helpers

  /**
   * Format timestamp for display
   */
  const formattedTimestamp = useMemo(() => {
    if (!message.timestamp) return ""

    const date = new Date(message.timestamp)
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }, [message.timestamp])

  // Prepare context value
  const contextValue = {
    message,
    copied,
    setCopied,
    reaction,
    setReaction,
    showActions,
    setShowActions,
    copyToClipboard,
    regenerateResponse,
    deleteMessage,
    onReaction,
  }

  // Prepare data attributes
  const allDataAttributes = {
    "data-component": "ChatMessage",
    "data-component-path": "@/components/chat/chat-message",
    "data-message-role": message.role,
    "data-message-id": message.id,
    ...(dataAttributes || {}),
  }

  // SECTION: Render
  return (
    <ChatMessageContext.Provider value={contextValue}>
      <div
        className={`flex mb-4 ${message.role === "user" ? "justify-end" : "justify-start"} ${className}`}
        style={style}
        id={id}
        {...allDataAttributes}
      >
        {message.role === "user" ? (
          <UserMessage
            content={contentRenderer ? contentRenderer(message.content) : processMessageContent(message.content)}
            timestamp={showTimestamp ? formattedTimestamp : undefined}
            senderName={showSender ? userName : undefined}
            avatar={userAvatar}
            allowCopy={allowCopy}
            allowDelete={allowDelete}
            disabled={disabled}
          />
        ) : (
          <AssistantMessage
            content={contentRenderer ? contentRenderer(message.content) : processMessageContent(message.content)}
            timestamp={showTimestamp ? formattedTimestamp : undefined}
            senderName={showSender ? assistantName : undefined}
            avatar={assistantAvatar}
            model={message.model}
            isError={message.isError}
            allowCopy={allowCopy}
            allowReactions={allowReactions}
            allowRegenerate={allowRegenerate}
            allowDelete={allowDelete}
            disabled={disabled}
          />
        )}
      </div>
    </ChatMessageContext.Provider>
  )
}

/**
 * Props for the UserMessage component
 */
interface UserMessageProps {
  /** Message content */
  content: React.ReactNode

  /** Formatted timestamp */
  timestamp?: string

  /** Sender name */
  senderName?: string

  /** Custom avatar */
  avatar?: React.ReactNode

  /** Whether to allow copying */
  allowCopy?: boolean

  /** Whether to allow deleting */
  allowDelete?: boolean

  /** Whether the message is disabled */
  disabled?: boolean
}

/**
 * UserMessage component
 */
function UserMessage({
  content,
  timestamp,
  senderName,
  avatar,
  allowCopy = true,
  allowDelete = false,
  disabled = false,
}: UserMessageProps) {
  const { copied, showActions, copyToClipboard, deleteMessage } = useChatMessage()

  return (
    <div className="flex flex-col items-end max-w-[80%]">
      {senderName && <div className="text-xs text-gray-500 mb-1">{senderName}</div>}

      <div className="flex items-start gap-2">
        {/* Message actions */}
        {showActions && (
          <div className="flex flex-col gap-1 mt-2">
            {allowCopy && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={copyToClipboard}
                      disabled={disabled}
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-500" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">{copied ? "Copied!" : "Copy message"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {allowDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={deleteMessage}
                      disabled={disabled}
                    >
                      <Trash2 className="h-3 w-3 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Delete message</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-sm">
          <div className="whitespace-pre-wrap">{content}</div>

          {timestamp && <div className="text-xs opacity-70 mt-1 text-right">{timestamp}</div>}
        </div>

        {/* Avatar */}
        {avatar || (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
            {senderName?.[0] || "U"}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Props for the AssistantMessage component
 */
interface AssistantMessageProps {
  /** Message content */
  content: React.ReactNode

  /** Formatted timestamp */
  timestamp?: string

  /** Sender name */
  senderName?: string

  /** Custom avatar */
  avatar?: React.ReactNode

  /** Model name */
  model?: string

  /** Whether the message is an error */
  isError?: boolean

  /** Whether to allow copying */
  allowCopy?: boolean

  /** Whether to allow reactions */
  allowReactions?: boolean

  /** Whether to allow regenerating */
  allowRegenerate?: boolean

  /** Whether to allow deleting */
  allowDelete?: boolean

  /** Whether the message is disabled */
  disabled?: boolean
}

/**
 * AssistantMessage component
 */
function AssistantMessage({
  content,
  timestamp,
  senderName,
  avatar,
  model,
  isError = false,
  allowCopy = true,
  allowReactions = true,
  allowRegenerate = true,
  allowDelete = false,
  disabled = false,
}: AssistantMessageProps) {
  const { copied, reaction, setReaction, showActions, copyToClipboard, regenerateResponse, deleteMessage, message } =
    useChatMessage()

  /**
   * Handle reaction button click
   */
  const handleReaction = useCallback(
    (newReaction: MessageReaction) => {
      // Toggle reaction if clicking the same one
      const updatedReaction = reaction === newReaction ? null : newReaction
      setReaction(updatedReaction)
      // Use the onReaction from context if available
      useChatMessage().onReaction?.(message, updatedReaction)
    },
    [message, reaction, setReaction, useChatMessage, message],
  )

  return (
    <div className="flex flex-col items-start max-w-[80%]">
      {senderName && (
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <span>{senderName}</span>
          {model && <span className="ml-2 opacity-70">({model})</span>}
        </div>
      )}

      <div className="flex items-start gap-2">
        {/* Avatar */}
        {avatar || (
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium">
            {senderName?.[0] || "A"}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border ${
            isError ? "border-red-200 dark:border-red-900/50" : "border-gray-100 dark:border-gray-700"
          }`}
        >
          <div className="whitespace-pre-wrap">{content}</div>

          {timestamp && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timestamp}</div>}
        </div>

        {/* Message actions */}
        {showActions && (
          <div className="flex flex-col gap-1 mt-2">
            {allowCopy && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={copyToClipboard}
                      disabled={disabled}
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-500" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{copied ? "Copied!" : "Copy message"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {allowReactions && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 rounded-full ${
                          reaction === "like"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                        }`}
                        onClick={() => handleReaction("like")}
                        disabled={disabled}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Like</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 rounded-full ${
                          reaction === "dislike"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                        }`}
                        onClick={() => handleReaction("dislike")}
                        disabled={disabled}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Dislike</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            {/* More actions dropdown */}
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        disabled={disabled}
                      >
                        <MoreHorizontal className="h-3 w-3 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">More options</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenuContent align="end" className="min-w-[160px]">
                {allowRegenerate && (
                  <DropdownMenuItem onClick={regenerateResponse} disabled={disabled}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </DropdownMenuItem>
                )}

                {allowDelete && (
                  <DropdownMenuItem onClick={deleteMessage} disabled={disabled}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
}
