/**
 * ChatInterface Component
 *
 * The main interface for the chat application. Manages the display of messages,
 * text input, configuration settings, and user interactions.
 *
 * @ai-pattern main-component
 * Central component that orchestrates the chat experience
 */
"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChatInput } from "./chat-input"
import { ChatHeader } from "./chat-header"
import { MessagesArea } from "./messages-area"
import ConversationSidebar from "./conversation-sidebar"
import { useConversations } from "@/hooks/use-conversations"
import { useApp } from "@/contexts/app-context"
import type { Message, Conversation } from "../../types/chat";
import { useToast } from "@hooks/use-toast"
import ModelSelectorSidebar from "./model-selector-sidebar"
import ToolSelector from "./tool-selector"
import PersonalitySelector from "./personality-selector"
import PresetSelector from "./preset-selector"
import type { BaseComponentProps, Status } from "../../types/component-types";
import { ChevronDown } from "lucide-react"

/**
 * Props for the ChatInterface component
 */
export interface ChatInterfaceProps extends BaseComponentProps {
  id?: string
  className?: string
  style?: React.CSSProperties
  initialMessages?: Message[]
  showConfigByDefault?: boolean
  enableFileUploads?: boolean
  maxFileSize?: number
  allowedFileTypes?: string[]
  inputPlaceholder?: string
  maxInputHeight?: number
  enableAutoScroll?: boolean
  showMessageTimestamps?: boolean
  showMessageSenders?: boolean
  chatBackground?: string | React.ReactNode
  onMessageSent?: (message: Message) => void
  onMessageReceived?: (message: Message) => void
  onConversationExport?: (conversation: Conversation) => void
  onConversationCreated?: (conversation: Conversation) => void
  onConversationDeleted?: (conversationId: string) => void
  disabled?: boolean
  dataAttributes?: Record<string, any>
}

/**
 * ChatInterface component
 * @param props Component props
 * @returns ChatInterface component
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className = "",
  style,
  id,
  disabled = false,
  dataAttributes,
  initialMessages = [],
  showConfigByDefault = true,
  enableFileUploads = true,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedFileTypes = ["image/*", "application/pdf", ".txt", ".md", ".csv"],
  inputPlaceholder = "Type your message here or @ to mention...",
  maxInputHeight = 200,
  enableAutoScroll = true,
  showMessageTimestamps = true,
  showMessageSenders = true,
  chatBackground,
  onMessageSent,
  onMessageReceived,
  onConversationExport,
  onConversationCreated,
  onConversationDeleted,
}: ChatInterfaceProps) => {
  // SECTION: Local state
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // SECTION: Application context
  const {
    selectedModel,
    selectedTool,
    selectedPersonality,
    showConfig,
    setShowConfig,
    isSidebarOpen,
    setIsSidebarOpen,
    theme,
    focusMode,
    setFocusMode,
    lastAction,
    setLastAction,
    isComponentSelectorActive,
    setComponentSelectorActive,
  } = useApp()

  // SECTION: Conversations hook
  const {
    conversations,
    currentConversationId,
    currentConversation,
    isLoaded,
    createConversation,
    updateConversation,
    addMessageToConversation,
    deleteConversation,
    clearAllConversations,
    setCurrentConversationId,
  } = useConversations()

  // SECTION: References
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // SECTION: Toast notifications
  const { toast } = useToast()

  // SECTION: Derived state
  const isConversationActive = useMemo(() => Boolean(currentConversationId), [currentConversationId])
  const isInputDisabled = useMemo(
    () => disabled || !isConversationActive || isLoading,
    [disabled, isConversationActive, isLoading],
  )

  // SECTION: Effects

  /**
   * Create a new conversation if none exists
   * @ai-pattern initialization
   * Ensures a conversation exists when the component loads
   */
  useEffect(() => {
    if (isLoaded && !currentConversationId && conversations.length === 0) {
      const newConversation = createConversation(initialMessages, {
        model: selectedModel.id,
        tool: selectedTool,
        personality: selectedPersonality,
      })

      onConversationCreated?.(newConversation)
    }
  }, [
    isLoaded,
    currentConversationId,
    conversations.length,
    createConversation,
    selectedModel,
    selectedTool,
    selectedPersonality,
    initialMessages,
    onConversationCreated,
  ])

  /**
   * Scroll to the latest message when new messages are added
   * @ai-pattern auto-scroll
   * Improves user experience by keeping the latest messages visible
   */
  useEffect(() => {
    if (enableAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentConversation?.messages, enableAutoScroll])

  /**
   * Apply focus mode styles
   * @ai-pattern ui-mode
   * Toggles focus mode styling for distraction-free experience
   */
  useEffect(() => {
    if (focusMode) {
      document.body.classList.add("focus-mode")
    } else {
      document.body.classList.remove("focus-mode")
    }
    return () => {
      document.body.classList.remove("focus-mode")
    }
  }, [focusMode])

  // SECTION: Event handlers

  /**
   * Sends a message and processes the response
   * @param message The message to send
   * @ai-pattern message-handling
   * Core message sending and response handling logic
   */
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading || !currentConversationId || disabled) return

      // Create user message
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "user",
        content: message,
        timestamp: Date.now(),
      }

      // Add message to conversation
      addMessageToConversation(userMessage)
      setStatus("loading")
      setIsLoading(true)

      // Call the onMessageSent callback
      onMessageSent?.(userMessage)

      try {
        // Send message to API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            model: selectedModel.id,
            personality: selectedPersonality,
            tools: selectedTool,
            files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
          }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        // Create assistant message
        const assistantMessage: Message = {
          id: data.id || `msg_${Date.now() + 1}`,
          role: "assistant",
          content: data.content,
          model: data.model || selectedModel.name,
          timestamp: Date.now(),
        }

        // Add message to conversation
        addMessageToConversation(assistantMessage)
        setStatus("success")

        // Call the onMessageReceived callback
        onMessageReceived?.(assistantMessage)

        // Clear uploaded files after successful message
        setUploadedFiles([])
      } catch (error) {
        console.error("Error sending message:", error)
        setStatus("error")

        // Add error message
        const errorMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: "Sorry, an error occurred while processing your message. Please try again.",
          model: selectedModel.name,
          isError: true,
          timestamp: Date.now(),
        }

        addMessageToConversation(errorMessage)
        onMessageReceived?.(errorMessage)

        // Show error toast
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [
      isLoading,
      currentConversationId,
      disabled,
      selectedModel,
      selectedPersonality,
      selectedTool,
      uploadedFiles,
      addMessageToConversation,
      onMessageSent,
      onMessageReceived,
      toast,
    ],
  )

  /**
   * Creates a new conversation
   * @ai-pattern conversation-management
   * Handles creation of new conversations
   */
  const handleNewConversation = useCallback(() => {
    const newConversation = createConversation([], {
      model: selectedModel.id,
      tool: selectedTool,
      personality: selectedPersonality,
    })

    setIsSidebarOpen(false) // Close sidebar on mobile after creating a new conversation
    onConversationCreated?.(newConversation)
  }, [createConversation, selectedModel, selectedTool, selectedPersonality, setIsSidebarOpen, onConversationCreated])

  /**
   * Updates the title of the current conversation
   * @param title The new title
   */
  const handleUpdateConversationTitle = useCallback(
    (title: string) => {
      if (currentConversationId) {
        updateConversation(currentConversationId, { title })
      }
    },
    [currentConversationId, updateConversation],
  )

  /**
   * Exports the current conversation as JSON
   * @ai-pattern data-export
   * Handles exporting conversation data
   */
  const handleExportConversation = useCallback(() => {
    if (!currentConversation) return

    const conversationData = {
      title: currentConversation.title,
      messages: currentConversation.messages,
      metadata: currentConversation.metadata,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${currentConversation.title.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    onConversationExport?.(currentConversation)
  }, [currentConversation, onConversationExport])

  /**
   * Handles file selection
   * @param e The change event
   * @ai-pattern file-handling
   * Processes and validates file uploads
   */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      // Validate file size and type
      const validFiles: File[] = []
      const invalidFiles: { file: File; reason: string }[] = []

      Array.from(files).forEach((file) => {
        // Check file size
        if (file.size > maxFileSize) {
          invalidFiles.push({
            file,
            reason: `File size exceeds the maximum allowed size (${(maxFileSize / (1024 * 1024)).toFixed(1)}MB)`,
          })
          return
        }

        // Check file type
        const isAllowedType = allowedFileTypes.some((type) => {
          if (type.startsWith(".")) {
            // Check file extension
            return file.name.toLowerCase().endsWith(type.toLowerCase())
          } else if (type.includes("*")) {
            // Check MIME type pattern (e.g., "image/*")
            const [category] = type.split("/")
            return file.type.startsWith(`${category}/`)
          } else {
            // Check exact MIME type
            return file.type === type
          }
        })

        if (!isAllowedType) {
          invalidFiles.push({ file, reason: "File type not allowed" })
          return
        }

        validFiles.push(file)
      })

      // Add valid files to state
      if (validFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...validFiles])
        toast({
          title: "Files added",
          description: `${validFiles.length} file(s) added successfully.`,
          variant: "success",
        })
      }

      // Show errors for invalid files
      if (invalidFiles.length > 0) {
        toast({
          title: "Some files couldn't be added",
          description: `${invalidFiles.length} file(s) were rejected due to size or type restrictions.`,
          variant: "warning",
        })
      }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [maxFileSize, allowedFileTypes, toast],
  )

  /**
   * Removes a file from the uploaded files list
   * @param index The index of the file to remove
   */
  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  /**
   * Handles the drag over event
   * @param e The drag event
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  /**
   * Handles the drag leave event
   * @param e The drag event
   */
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  /**
   * Handles the drop event
   * @param e The drag event
   * @ai-pattern drag-and-drop
   * Processes dropped files and components
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)

      // Handle dropped files
      if (enableFileUploads && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files)

        // Validate file size and type
        const validFiles: File[] = []
        const invalidFiles: { file: File; reason: string }[] = []

        droppedFiles.forEach((file) => {
          // Check file size
          if (file.size > maxFileSize) {
            invalidFiles.push({
              file,
              reason: `File size exceeds the maximum allowed size (${(maxFileSize / (1024 * 1024)).toFixed(1)}MB)`,
            })
            return
          }

          // Check file type
          const isAllowedType = allowedFileTypes.some((type) => {
            if (type.startsWith(".")) {
              // Check file extension
              return file.name.toLowerCase().endsWith(type.toLowerCase())
            } else if (type.includes("*")) {
              // Check MIME type pattern (e.g., "image/*")
              const [category] = type.split("/")
              return file.type.startsWith(`${category}/`)
            } else {
              // Check exact MIME type
              return file.type === type
            }
          })

          if (!isAllowedType) {
            invalidFiles.push({ file, reason: "File type not allowed" })
            return
          }

          validFiles.push(file)
        })

        // Add valid files to state
        if (validFiles.length > 0) {
          setUploadedFiles((prev) => [...prev, ...validFiles])
          toast({
            title: "Files added",
            description: `${validFiles.length} file(s) added successfully.`,
            variant: "success",
          })
        }

        // Show errors for invalid files
        if (invalidFiles.length > 0) {
          toast({
            title: "Some files couldn't be added",
            description: `${invalidFiles.length} file(s) were rejected due to size or type restrictions.`,
            variant: "warning",
          })
        }

        return
      }

      // Handle dropped component references
      try {
        const data = e.dataTransfer.getData("application/json")
        if (data) {
          const componentData = JSON.parse(data)

          // Create a formatted component reference
          const componentRef = `<ComponentReference name="${componentData.name}" path="${componentData.path}" />`

          // Notify the user
          toast({
            title: "Component inserted",
            description: `Reference to ${componentData.name} component added to chat`,
            variant: "success",
          })
        }
      } catch (error) {
        console.error("Error processing dropped component:", error)
        toast({
          title: "Error inserting component",
          description: "Could not process the dropped component",
          variant: "destructive",
        })
      }
    },
    [enableFileUploads, maxFileSize, allowedFileTypes, toast],
  )

  /**
   * Handles the deletion of a conversation
   * @param conversationId The ID of the conversation to delete
   */
  const handleDeleteConversation = useCallback(
    (conversationId: string) => {
      deleteConversation(conversationId)
      onConversationDeleted?.(conversationId)
    },
    [deleteConversation, onConversationDeleted],
  )

  /**
   * Toggles the component selector
   * @ai-pattern component-selection
   * Handles toggling the component selector visibility
   */
  const handleToggleComponentSelector = useCallback(() => {
    if (typeof setComponentSelectorActive === "function") {
      setComponentSelectorActive(!isComponentSelectorActive)
    }
  }, [setComponentSelectorActive, isComponentSelectorActive])

  /**
   * Toggles the configuration panel
   */
  const handleToggleConfig = useCallback(() => {
    setShowConfig((prev) => !prev)
  }, [setShowConfig])

  // Prepare data attributes
  const allDataAttributes = useMemo(
    () => ({
      "data-component": "ChatInterface",
      "data-component-path": "@/components/chat-interativo/chat/chat-interface",
      ...(dataAttributes || {}),
    }),
    [dataAttributes],
  )

  // Prepare class names
  const containerClassName = useMemo(
    () =>
      `flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${
        focusMode ? "focus-mode" : ""
      } ${className}`,
    [focusMode, className],
  )

  // SECTION: Render
  return (
    <div className={containerClassName} style={style} id={id} {...allDataAttributes}>
      {/* Notification for feedback */}
      {/* Notification for feedback */}
      {/* <Notification /> */}
      {/* Conversations sidebar (visible only when isSidebarOpen is true) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:relative md:z-0">
          <div className="absolute inset-0 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 md:w-auto md:relative md:block">
            <ConversationSidebar
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={setCurrentConversationId}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              onClearConversations={clearAllConversations}
            />
          </div>
        </div>
      )}

      {/* Main chat interface */}
      <div className="flex flex-col flex-1 h-full">
        {/* Chat header */}
        <ChatHeader
          currentConversation={currentConversation}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversation}
          onUpdateConversationTitle={handleUpdateConversationTitle}
          onDeleteConversation={handleDeleteConversation}
          onExportConversation={handleExportConversation}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleComponentSelector={handleToggleComponentSelector}
        />

        {/* Messages area */}
        <MessagesArea
          messages={currentConversation?.messages || []}
          isLoading={isLoading}
          showTimestamps={showMessageTimestamps}
          showSenders={showMessageSenders}
          focusMode={focusMode}
          theme={theme}
          chatBackground={chatBackground}
          messagesEndRef={messagesEndRef}
        />

        {/* Input area */}
        <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-lg transition-colors duration-200">
          <div className="max-w-3xl mx-auto">
            {/* Chat input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              disabled={isInputDisabled}
              isDragOver={isDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />

            {/* Model, tool, and personality selectors */}
            {showConfig && (
              <div className="flex flex-wrap items-center gap-2 mt-3 px-2 animate-in">
                <ModelSelectorSidebar />
                <ToolSelector />
                <PersonalitySelector />
                <PresetSelector />
              </div>
            )}

            {/* Config toggle */}
            <div className="flex justify-center mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full px-3"
                onClick={handleToggleConfig}
              >
                {showConfig ? "Hide" : "Show"} Settings
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${showConfig ? "rotate-180" : ""}`}
                />
              </Button>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary flex items-center gap-1 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-full px-3"
                >
                  Tutorial
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface;
