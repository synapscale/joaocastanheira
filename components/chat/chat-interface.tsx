"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { TutorialModal } from "./tutorial-modal"
import { Button } from "@/components/ui/button"
import { ChatInput } from "./chat-input"
import { ChatHeader } from "./chat-header"
import { MessagesArea } from "./messages-area"
import { ChatHistorySidebar } from "./chat-history-sidebar"
import { ChatSettingsSidebar } from "./chat-settings-sidebar"
import { useConversations } from "@/hooks/use-conversations"
import { useApp } from "@/context/app-context"
import type { Message, Conversation } from "@/types/chat"
import { useToast } from "@/hooks/use-toast"
import type { BaseComponentProps } from "@/types/component-types"
import { sendChatMessage } from "@/lib/ai-utils"

type Status = "idle" | "loading" | "error"

interface ChatInterfaceProps extends BaseComponentProps {
  style?: React.CSSProperties
  disabled?: boolean
  dataAttributes?: Record<string, string>
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
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'sending' | 'processing' | 'completed' | 'error'>('idle')
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false)
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [localMessages, setLocalMessages] = useState<Message[]>(initialMessages || [])

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
    messages: conversationMessages = [],
    isLoading: conversationsLoading = false,
    createConversation,
    updateConversation,
    addMessageToConversation,
    deleteConversation,
    setCurrentConversation,
    sendMessage: sendConversationMessage,
    getMessages,
  } = conversationsHook || {}

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const isConversationActive = useMemo(() => Boolean(currentConversationId), [currentConversationId])
  const isInputDisabled = useMemo(
    () => disabled || isLoading,
    [disabled, isLoading],
  )

  // Mensagens da conversa atual ou mensagens locais como fallback
  const safeMessages = useMemo(() => {
    // Priorizar mensagens do hook de conversas
    if (conversationMessages.length > 0) {
      return conversationMessages
    }
    // Fallback para conversa atual se disponível
    if (currentConversation?.messages) {
      return currentConversation.messages
    }
    // Último fallback para mensagens locais
    return localMessages
  }, [conversationMessages, currentConversation?.messages, localMessages])

  // Removido useEffect que criava conversas automaticamente
  // Conversas agora são criadas apenas quando o usuário envia uma mensagem

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
        disabled ||
        !selectedModel
      )
        return

              setStatus("loading")
        setIsLoading(true)

      try {
        // Adicionar mensagem do usuário IMEDIATAMENTE (sem temporária)
        const userMessage: Message = {
          id: `user_${Date.now()}`,
          role: "user",
          content: message,
          timestamp: Date.now(),
          status: "sent",
        }

        // A mensagem do usuário será adicionada automaticamente pelo hook sendMessage
        // Não precisamos adicionar manualmente para evitar duplicação
        
        // Mostrar indicador de digitação do LLM (lado esquerdo)
        setProcessingStatus('processing')

        // Usar o novo sistema de conversas integrado
        if (conversationsHook?.sendMessage) {
          // Se há conversa ativa, usar sendMessage do hook
          if (currentConversationId) {
            const result = await conversationsHook.sendMessage(message, uploadedFiles)
            
            // O hook sendMessage já adiciona as mensagens automaticamente
            // Não precisamos adicionar manualmente para evitar duplicação
            
            onMessageSent?.(userMessage)
            onMessageReceived?.(result.assistantMessage)
          } else {
            // Criar nova conversa APENAS quando o usuário enviar uma mensagem
            // O título é baseado na primeira mensagem do usuário
            const conversationTitle = message.length > 50 ? message.substring(0, 50) + '...' : message
            
            const newConversation = await conversationsHook.createConversation({
              title: conversationTitle,
              settings: {
                model: selectedModel.id,
                tool: selectedTool || "tools",
                personality: selectedPersonality || "natural",
                provider: selectedModel.provider || "openai",
              }
            })
            
            // Notificar sobre a nova conversa criada
            if (onConversationCreated) {
              onConversationCreated(newConversation)
            }
            
            // Enviar a mensagem na conversa recém-criada
            const result = await conversationsHook.sendMessage(message, uploadedFiles)
            
            // O hook sendMessage já adiciona as mensagens automaticamente
            // Não precisamos adicionar manualmente para evitar duplicação
            
            onMessageSent?.(userMessage)
            onMessageReceived?.(result.assistantMessage)
          }
        } else {
          // Fallback para o sistema anterior se o hook não estiver disponível
          onMessageSent?.(userMessage)

          // Usar a função sendChatMessage do ai-utils como fallback
          const currentMessages = localMessages
          const messages = [
            ...currentMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: "user", content: message }
          ];

          const data = await sendChatMessage(messages, undefined, {
            model: selectedModel.id,
            provider: selectedModel.provider || "openai",
            temperature: 0.7,
            max_tokens: 2048,
            files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
          });

          const assistantMessage: Message = {
            id: `msg_${Date.now()}_assistant`,
            role: "assistant",
            content: data.content || "Desculpe, ocorreu um erro ao processar sua mensagem.",
            timestamp: Date.now(),
            status: "sent",
            model: data.model || selectedModel.id,
            metadata: {
              provider: data.provider,
              usage: data.usage,
              finish_reason: data.finish_reason,
              metadata: data.metadata,
            },
          }

          setLocalMessages(prev => [...prev, assistantMessage])
          onMessageReceived?.(assistantMessage)
        }

        // Limpar arquivos enviados
        setUploadedFiles([])
        setStatus("idle")
        setProcessingStatus('completed')
        
        // Limpar status de forma mais natural
        setTimeout(() => setProcessingStatus('idle'), 1000)
      } catch (error) {
        console.error("Error sending message:", error)
        setStatus("error")
        setProcessingStatus('error')
        
        // Em caso de erro, a mensagem do usuário já foi enviada e deve permanecer
        
        // Limpar status de erro de forma mais rápida
        setTimeout(() => setProcessingStatus('idle'), 3000)

        const errorMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
          model: selectedModel?.name || "unknown",
          isError: true,
          timestamp: Date.now(),
        }

        // Adicionar mensagem de erro
        if (conversationsHook?.addMessageToConversation) {
          conversationsHook.addMessageToConversation(errorMessage)
        } else {
          setLocalMessages(prev => [...prev, errorMessage])
        }
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
      conversationsHook,
      onMessageSent,
      onMessageReceived,
      onConversationCreated,
      localMessages,
      toast,
    ],
  )

  const handleNewConversation = useCallback(() => {
    if (!createConversation || !selectedModel) return

    const newConversation = createConversation({
      title: `Conversa ${new Date().toLocaleTimeString()}`,
      settings: {
        model: selectedModel.id,
        tool: selectedTool || "tools",
        personality: selectedPersonality || "natural",
      }
    })

    setIsSidebarOpen?.(false)
    setIsHistorySidebarOpen(false)
    // onConversationCreated será chamado após a criação bem-sucedida
    
    // Nova conversa criada silenciosamente
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

  const handleToggleChatSettings = useCallback(() => {
    setIsChatSettingsOpen(prev => !prev)
  }, [])

  const handleToggleConfig = useCallback(() => {
    setShowConfig(prev => !prev)
  }, [])
  
  const handleToggleHistorySidebar = useCallback(() => {
    setIsHistorySidebarOpen(prev => !prev)
  }, [])
  
  const handleSelectConversation = useCallback((id: string) => {
    if (setCurrentConversation) {
      setCurrentConversation(id)
      
      // Conversa selecionada silenciosamente
    }
  }, [setCurrentConversation, toast])

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
  const contentContainerClasses = "max-w-5xl mx-auto px-6"

  // Calcular largura do conteúdo principal baseado nas sidebars abertas
  const getSidebarWidth = () => {
    let width = 0
    if (isHistorySidebarOpen) width += 320 // 80 * 4 = 320px (w-80)
    if (isChatSettingsOpen) width += 320 // 320px da sidebar de configurações (w-80)
    return width
  }

  const contentStyle = {
    marginRight: `${getSidebarWidth()}px`,
    transition: 'margin-right 0.3s ease-in-out'
  }

  return (
    <div className="flex flex-col h-full bg-background w-full relative">
      {/* Chat header */}
      <div style={contentStyle}>
        <ChatHeader
          currentConversation={currentConversation || undefined}
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
          onToggleChatSettings={handleToggleChatSettings}
        />
      </div>
      
      {/* Área principal do chat */}
      <div 
        className={`flex-1 overflow-y-auto bg-background ${isDragOver ? 'border-2 border-dashed border-primary/50' : ''}`}
        style={contentStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`${contentContainerClasses} py-6`}>
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
            showTypingIndicator={processingStatus === 'processing'}
          />
        </div>
      </div>

      {/* Área de input */}
      <div className="bg-card/30 backdrop-blur-md" style={contentStyle}>
        <div className={contentContainerClasses}>
          <div className="py-4">
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
          <div className="flex justify-between items-center mt-0.5">
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
      />

      {/* Sidebar de configurações do chat */}
      <ChatSettingsSidebar
        isOpen={isChatSettingsOpen}
        onClose={handleToggleChatSettings}
      />

      {/* Modal de tutorial */}
      {showTutorial && (
        <TutorialModal
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  )
}
