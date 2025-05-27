"use client"
/**
 * ChatMessage Component
 *
 * Displays a single message in the chat interface, with support for
 * user, assistant, and system messages, reactions, and various actions.
 */

import type React from "react"

import { useState, createContext, useContext, useCallback, useMemo } from "react"
import { Copy, Check, ThumbsUp, ThumbsDown, MoreHorizontal, RefreshCw, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { BaseComponentProps } from "@/types/component-types"
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

  /** Whether the message is being edited */
  isEditing: boolean

  /** Set whether the message is being edited */
  setIsEditing: (editing: boolean) => void

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
   * @default false
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
  showTimestamp = false,
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
  const [isEditing, setIsEditing] = useState(false)

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
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "numeric",
      minute: "numeric",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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
    isEditing,
    setIsEditing,
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
      <div className={`mb-6 ${className}`} style={style} id={id} {...allDataAttributes}>
        {message.role === "system" ? (
          <SystemMessage
            content={contentRenderer ? contentRenderer(message.content) : processMessageContent(message.content)}
            timestamp={showTimestamp ? formattedTimestamp : undefined}
            disabled={disabled}
          />
        ) : message.role === "user" ? (
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
 * Props for the SystemMessage component
 */
interface SystemMessageProps {
  /** Message content */
  content: React.ReactNode

  /** Formatted timestamp */
  timestamp?: string

  /** Whether the message is disabled */
  disabled?: boolean
}

/**
 * SystemMessage component - blends with background, no styling
 */
function SystemMessage({ content, timestamp, disabled = false }: SystemMessageProps) {
  return (
    <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
      <div className="whitespace-pre-wrap bg-[#F9F9F9] dark:bg-gray-800 p-3 rounded-lg">{content}</div>
      {timestamp && <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timestamp}</div>}
    </div>
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
  const { copied, showActions, copyToClipboard, deleteMessage, isEditing, setIsEditing } = useChatMessage()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="flex justify-end">
        <div
          className={`max-w-3xl bg-[#F4F4F4] dark:bg-blue-900/20 p-3 rounded-lg transition-colors ${
            isEditing ? "bg-blue-100 dark:bg-blue-800/30" : ""
          }`}
        >
          <div className="text-gray-900 dark:text-gray-100">{content}</div>
        </div>
      </div>

      {/* Message actions positioned below and to the left */}
      <div
        className={`flex justify-end mt-2 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center space-x-1 mr-3">
          {allowCopy && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={copyToClipboard}
                    disabled={disabled}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{copied ? "Copiado!" : "Copiar"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  disabled={disabled}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Curtir</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  disabled={disabled}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Não curtir</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Dropdown com mais opções incluindo timestamp */}
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      disabled={disabled}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">Mais opções</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenuContent align="end" className="min-w-[200px]">
              <DropdownMenuItem onClick={() => setIsEditing(!isEditing)} disabled={disabled}>
                <Edit className="h-4 w-4 mr-2" />
                Editar mensagem
              </DropdownMenuItem>
              {timestamp && (
                <DropdownMenuItem disabled>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Enviado em: {timestamp}</span>
                </DropdownMenuItem>
              )}
              {allowDelete && (
                <DropdownMenuItem onClick={deleteMessage} disabled={disabled}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
  isError,
  allowCopy = true,
  allowReactions = true,
  allowRegenerate = true,
  allowDelete = false,
  disabled = false,
}: AssistantMessageProps) {
  const { copied, reaction, showActions, copyToClipboard, regenerateResponse, deleteMessage, handleReaction } =
    useChatMessage()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="flex">
        <div
          className={`max-w-3xl bg-white dark:bg-gray-800 p-3 rounded-lg transition-colors ${
            isError ? "border border-red-200 dark:border-red-800" : ""
          }`}
        >
          <div className="text-gray-900 dark:text-gray-100">{content}</div>

          {model && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <span className="font-medium">Modelo:</span>
              <span className="ml-1">{model}</span>
            </div>
          )}
        </div>
      </div>

      {/* Message actions positioned below */}
      <div
        className={`flex mt-2 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center space-x-1 ml-3">
          {allowCopy && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={copyToClipboard}
                    disabled={disabled}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{copied ? "Copiado!" : "Copiar"}</TooltipContent>
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
                      className={`h-7 w-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        reaction === "like"
                          ? "text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                      onClick={() => handleReaction("like")}
                      disabled={disabled}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Curtir</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        reaction === "dislike"
                          ? "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                      onClick={() => handleReaction("dislike")}
                      disabled={disabled}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Não curtir</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {allowRegenerate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={regenerateResponse}
                    disabled={disabled}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Regenerar resposta</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Dropdown com mais opções incluindo timestamp */}
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      disabled={disabled}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">Mais opções</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenuContent align="start" className="min-w-[200px]">
              {timestamp && (
                <DropdownMenuItem disabled>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Enviado em: {timestamp}</span>
                </DropdownMenuItem>
              )}
              {allowDelete && (
                <DropdownMenuItem onClick={deleteMessage} disabled={disabled}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
