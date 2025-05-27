"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { TutorialModal } from "./tutorial-modal"
import { Button } from "@/components/ui/button"
import { ChatInput } from "./chat-input"
import { ChatHeader } from "./chat-header"
import { MessagesArea } from "./messages-area"
import { ChatHistorySidebar } from "./chat-history-sidebar"
import { useConversations } from "@/hooks/use-conversations"
import { useApp } from "@/context/app-context"
import type { Message, Conversation } from "@/types/chat"
import { useToast } from "@/hooks/use-toast"
import type { BaseComponentProps, Status } from "@/types/component-types"

interface ChatInterfaceProps extends BaseComponentProps {
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
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className = "",
  style,
  id,
  disabled = false,
  dataAttributes,
  initialMessages = [],
  showConfigByDefault = true,
  enableFileUploads = true,
  maxFileSize = 10 * 1024 * 1024,
  allowedFileTypes = ["image/*", "application/pdf", ".txt", ".md", ".csv"],
  inputPlaceholder = "Digite sua mensagem aqui ou @ para mencionar...",
  maxInputHeight = 200,
  enableAutoScroll = true,
  showMessageTimestamps = false,
  showMessageSenders = false,
  chatBackground,
  onMessageSent,
  onMessageReceived,
  onConversationExport,
  onConversationCreated,
  onConversationDeleted,
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showConfig, setShowConfig] = useState(showConfigByDefault)
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  const appContext = useApp()
  const {
    selectedModel,
    selectedTool,
    selectedPersonality,
    isSidebarOpen,
    setIsSidebarOpen,
    theme,
    focusMode,
    setFocusMode,
    lastAction,
    setLastAction,
    isComponentSelectorActive,
    setComponentSelectorActive,
  } = appContext || {}

  const conversationsHook = useConversations()
  const {
    conversations = [],
    currentConversationId,
    currentConversation,
    isLoaded = false,
    createConversation,
    updateConversation,
    addMessageToConversation,
    deleteConversation,
    clearAllConversations,
    setCurrentConversationId,
  } = conversationsHook || {}

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const isConversationActive = useMemo(() => Boolean(currentConversationId), [currentConversationId])
  const isInputDisabled = useMemo(
    () => disabled || !isConversationActive || isLoading,
    [disabled, isConversationActive, isLoading],
  )

  const safeMessages = useMemo(() => {
    return currentConversation?.messages || initialMessages || []
  }, [currentConversation?.messages, initialMessages])

  useEffect(() => {
    if (isLoaded && !currentConversationId && conversations.length === 0 && createConversation && selectedModel) {
      const newConversation = createConversation(initialMessages, {
        model: selectedModel.id,
        tool: selectedTool || "No Tools",
        personality: selectedPersonality || "Natural",
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

  useEffect(() => {
    if (enableAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [safeMessages, enableAutoScroll])

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

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (
        !message.trim() ||
        isLoading ||
        !currentConversationId ||
        disabled ||
        !addMessageToConversation ||
        !selectedModel
      )
        return

      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "user",
        content: message,
        timestamp: Date.now(),
      }

      addMessageToConversation(userMessage)
      setStatus("loading")
      setIsLoading(true)
      onMessageSent?.(userMessage)
      
      // Feedback visual para envio de mensagem
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada e está sendo processada.",
      })

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            model: selectedModel.id,
            personality: selectedPersonality || "Natural",
            tools: selectedTool || "No Tools",
            files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
          }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        const assistantMessage: Message = {
          id: data.id || `msg_${Date.now() + 1}`,
          role: "assistant",
          content: data.content,
          model: data.model || selectedModel.name,
          timestamp: Date.now(),
        }

        addMessageToConversation(assistantMessage)
        setStatus("success")
        onMessageReceived?.(assistantMessage)
        setUploadedFiles([])
        
        // Feedback visual para resposta recebida
        toast({
          title: "Resposta recebida",
          description: "A IA processou sua mensagem com sucesso.",
        })
      } catch (error) {
        console.error("Error sending message:", error)
        setStatus("error")

        const errorMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
          model: selectedModel.name,
          isError: true,
          timestamp: Date.now(),
        }

        addMessageToConversation(errorMessage)
        onMessageReceived?.(errorMessage)

        toast({
          title: "Erro",
          description: "Falha ao enviar mensagem. Por favor, tente novamente.",
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

  const handleNewConversation = useCallback(() => {
    if (!createConversation || !selectedModel) return

    const newConversation = createConversation([], {
      model: selectedModel.id,
      tool: selectedTool || "No Tools",
      personality: selectedPersonality || "Natural",
    })

    setIsSidebarOpen?.(false)
    setIsHistorySidebarOpen(false)
    onConversationCreated?.(newConversation)
    
    // Feedback visual
    toast({
      title: "Nova conversa criada",
      description: "Uma nova conversa foi iniciada com sucesso.",
    })
  }, [createConversation, selectedModel, selectedTool, selectedPersonality, setIsSidebarOpen, onConversationCreated, toast])

  const handleUpdateConversationTitle = useCallback(
    (title: string) => {
      if (currentConversationId && updateConversation) {
        updateConversation(currentConversationId, { title })
      }
    },
    [currentConversationId, updateConversation],
  )

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

  const handleDeleteConversation = useCallback(
    (conversationId: string) => {
      if (deleteConversation) {
        deleteConversation(conversationId)
        onConversationDeleted?.(conversationId)
      }
    },
    [deleteConversation, onConversationDeleted],
  )

  const handleToggleComponentSelector = useCallback(() => {
    if (typeof setComponentSelectorActive === "function") {
      setComponentSelectorActive(!isComponentSelectorActive)
    }
  }, [isComponentSelectorActive, setComponentSelectorActive])

  const handleToggleConfig = useCallback(() => {
    setShowConfig((prev: boolean) => !prev)
  }, [])
  
  const handleToggleHistorySidebar = useCallback(() => {
    setIsHistorySidebarOpen(prev => !prev)
  }, [])
  
  const handleSelectConversation = useCallback((id: string) => {
    if (setCurrentConversationId) {
      setCurrentConversationId(id)
      
      // Feedback visual
      toast({
        title: "Conversa selecionada",
        description: "Você mudou para outra conversa.",
      })
    }
  }, [setCurrentConversationId, toast])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)

      if (!enableFileUploads || disabled) return

      const files = Array.from(e.dataTransfer.files)
      
      // Verificar tamanho dos arquivos
      const oversizedFiles = files.filter(file => file.size > maxFileSize)
      if (oversizedFiles.length > 0) {
        toast({
          title: "Arquivo muito grande",
          description: `Alguns arquivos excedem o tamanho máximo de ${(maxFileSize / (1024 * 1024)).toFixed(0)}MB.`,
          variant: "destructive",
        })
        return
      }
      
      // Verificar tipos de arquivo permitidos
      const invalidFiles = files.filter(file => {
        // Verificar se algum dos tipos permitidos corresponde
        return !allowedFileTypes.some(type => {
          if (type.startsWith('.')) {
            // Verificar extensão
            return file.name.endsWith(type)
          } else if (type.includes('*')) {
            // Verificar mime type com wildcard
            const [category] = type.split('/')
            return file.type.startsWith(`${category}/`)
          } else {
            // Verificar mime type exato
            return file.type === type
          }
        })
      })
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Alguns arquivos não são suportados. Tipos permitidos: imagens, PDFs, TXT, MD e CSV.",
          variant: "destructive",
        })
        return
      }
      
      // Adicionar arquivos válidos
      setUploadedFiles(prev => [...prev, ...files])
      
      toast({
        title: "Arquivos adicionados",
        description: `${files.length} arquivo(s) adicionado(s) com sucesso.`,
      })
    },
    [enableFileUploads, maxFileSize, allowedFileTypes, disabled, toast],
  )

  const allDataAttributes = useMemo(
    () => ({
      "data-component": "ChatInterface",
      "data-component-path": "@/components/chat/chat-interface",
      ...(dataAttributes || {}),
    }),
    [dataAttributes],
  )

  // Constante para garantir o mesmo espaçamento em todos os lugares
  const contentContainerClasses = "max-w-[650px] mx-auto"

  return (
    <div className="flex flex-col h-full bg-[#F9F9F9] dark:bg-gray-900 w-full">
      {/* Chat header */}
      <ChatHeader
        currentConversation={currentConversation}
        currentConversationId={currentConversationId}
        conversations={conversations}
        onNewConversation={handleNewConversation}
        onUpdateConversationTitle={handleUpdateConversationTitle}
        onDeleteConversation={handleDeleteConversation}
        onExportConversation={handleExportConversation}
        onToggleSidebar={() => setIsSidebarOpen?.(!isSidebarOpen)}
        onToggleHistorySidebar={handleToggleHistorySidebar}
        onSelectConversation={handleSelectConversation}
        isHistorySidebarOpen={isHistorySidebarOpen}
        onToggleComponentSelector={handleToggleComponentSelector}
        onToggleFocusMode={() => setFocusMode?.(!focusMode)}
      />
      {/* Área principal do chat */}
      <div 
        className={`flex-1 overflow-y-auto bg-white dark:bg-gray-800 ${isDragOver ? 'border-2 border-dashed border-primary/50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="chat-container py-6 px-4">
          {/* Mensagem inicial do sistema */}
          {(!currentConversation?.messages || currentConversation.messages.length === 0) && (
            <div className="mb-8">
              <div className="text-secondary-foreground text-sm leading-relaxed mb-3">
                Olá! Como posso ajudar você hoje?
              </div>
            </div>
          )}

          {/* Área de mensagens */}
          <MessagesArea
            messages={safeMessages}
            isLoading={isLoading}
            showTimestamps={showMessageTimestamps}
            showSenders={showMessageSenders}
            focusMode={focusMode || false}
            theme={theme || "light"}
            chatBackground={chatBackground}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>

      {/* Área de input */}
      <div className="p-4 bg-white dark:bg-gray-900">
        <div className={`${contentContainerClasses}`}>
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={isInputDisabled}
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            showConfig={showConfig}
            onToggleConfig={handleToggleConfig}
          />
          
          {/* Tutorial e botões de ação - Ordem corrigida: Esconder Configurações à esquerda, Tutorial à direita */}
          <div className="flex justify-between items-center mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={handleToggleConfig}
            >
              {showConfig ? "Esconder Configurações" : "Mostrar Configurações"}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setShowTutorial(true)}
            >
              Tutorial
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar de histórico de conversas */}
      <ChatHistorySidebar
        isOpen={isHistorySidebarOpen}
        onClose={handleToggleHistorySidebar}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewConversation={handleNewConversation}
        onClearAllConversations={clearAllConversations}
      />

      {/* Modal de tutorial */}
      {showTutorial && (
        <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  )
}
