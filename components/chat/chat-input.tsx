"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useTextarea } from "@/hooks/use-textarea"
import { Paperclip, ArrowRight, AlertTriangle } from "lucide-react"
import { useApp } from "@/context/app-context"
import ModelSelector from "@/components/chat/model-selector"
import ToolSelector from "@/components/chat/tool-selector"
import PersonalitySelector from "@/components/chat/personality-selector"
import PresetSelector from "@/components/chat/preset-selector"
import { ErrorFeedback, useChatErrorHandler, type ChatError } from "@/components/chat/error-feedback"
import { useRouter } from "next/navigation"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  disabled: boolean
  isDragOver: boolean
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  showConfig: boolean
  onToggleConfig?: () => void
  lastError?: Error | string | null
}

export function ChatInput({
  onSendMessage,
  isLoading,
  disabled,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  showConfig,
  onToggleConfig,
  lastError,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [currentError, setCurrentError] = useState<ChatError | null>(null)
  const [lastMessageTime, setLastMessageTime] = useState<number | null>(null)
  
  const appContext = useApp()
  const router = useRouter()
  const { handleError } = useChatErrorHandler()
  
  // Funções de tracking simplificadas (localStorage)
  const trackEvent = (event: string, data: any) => {
    try {
      const logEntry = {
        event,
        data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
      
      const existingLogs = localStorage.getItem('chatAnalyticsLogs')
      const logs = existingLogs ? JSON.parse(existingLogs) : []
      logs.push(logEntry)
      
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }
      
      localStorage.setItem('chatAnalyticsLogs', JSON.stringify(logs))
    } catch (error) {
      console.error('Erro ao fazer tracking:', error)
    }
  }

  const {
    value,
    setValue,
    textareaRef,
    handleInput,
    handleKeyDown,
    resetTextarea
  } = useTextarea({
    onSubmit: async () => {
      if (value.trim() && !isLoading && !disabled) {
        const startTime = Date.now()
        setLastMessageTime(startTime)
        
        try {
          await onSendMessage(value.trim())
          
          resetTextarea()
          setAttachments([])
          setCurrentError(null) // Limpar erro anterior em caso de sucesso
        } catch (error) {
          
          // Mostrar erro para o usuário
          const chatError = handleError(error instanceof Error ? error : new Error(String(error)))
          setCurrentError(chatError)
        }
      }
    }
  })

  // Processar erro externo
  useEffect(() => {
    if (lastError) {
      const chatError = handleError(lastError)
      setCurrentError(chatError)
      
      // Track erro
      trackEvent('error_occurred', {
        error: lastError instanceof Error ? lastError.message : String(lastError),
        source: 'external'
      })
    }
  }, [lastError, handleError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isLoading && !disabled) {
      try {
        await onSendMessage(value.trim())
        
        setValue('')
        setAttachments([])
        setCurrentError(null)
      } catch (error) {
        const chatError = handleError(error instanceof Error ? error : new Error(String(error)))
        setCurrentError(chatError)
      }
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleRetryMessage = async () => {
    if (value.trim()) {
      setCurrentError(null)
      await handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }
  }

  const handleConfigureApiKeys = () => {
    router.push('/user-variables')
  }

  const handleDismissError = () => {
    setCurrentError(null)
  }

  const handleSaveConfiguration = async () => {
    // Configuration saved
    console.log('Configuration saved')
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Error Feedback */}
      {currentError && (
        <div className="px-6 py-3 border-b border-red-200/50 dark:border-red-700/50 bg-red-50/50 dark:bg-red-900/20">
          <ErrorFeedback
            error={currentError}
            onRetry={handleRetryMessage}
            onConfigureApiKeys={handleConfigureApiKeys}
            onDismiss={handleDismissError}
          />
        </div>
      )}

      {/* Attachments Preview - Refinado */}
      {attachments.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-200/30 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-600/60 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-0.5 transition-all duration-200 text-xs font-bold"
                  title="Remover anexo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area - Mantendo estrutura original */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`chat-input-container ${
            isDragOver ? 'border-primary/50 bg-primary/5' : ''
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem aqui..."
            disabled={disabled || isLoading}
            className="w-full min-h-[56px] max-h-32 resize-none bg-transparent border-0 outline-none px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm leading-relaxed focus:ring-0"
            rows={1}
          />
          
          {/* Action Buttons e Dropdowns na margem inferior - Refinado mas mantendo estrutura */}
          <div className="flex items-end justify-between px-4 py-2">
            {/* Dropdowns à esquerda - harmonizados */}
            <div className="flex items-end gap-2">
              {showConfig && (
                <>
                  <div className="chat-dropdown-refined">
                    <ModelSelector />
                  </div>
                  <div className="chat-dropdown-refined">
                    <ToolSelector 
                      onToolSelect={(tool) => {
                        console.log('Tool selected:', tool)
                      }}
                    />
                  </div>
                  <div className="chat-dropdown-refined">
                    <PersonalitySelector 
                      onPersonalitySelect={(personality) => {
                        console.log('Personality selected:', personality)
                      }}
                    />
                  </div>
                  <div className="chat-dropdown-refined">
                    <PresetSelector />
                  </div>
                </>
              )}
            </div>
            
            {/* Ícones de ação à direita - refinados */}
            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleFileUpload}
                disabled={disabled || isLoading}
                className="h-8 w-8 p-0 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 group"
                title="Anexar arquivo"
              >
                <Paperclip className="h-4 w-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200" />
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf,.txt,.doc,.docx"
              />
              
              <button
                type="submit"
                disabled={!value.trim() || disabled || isLoading}
                className="h-8 w-8 p-0 rounded-full text-white shadow-sm hover:shadow-md transition-all duration-200 group flex items-center justify-center"
                style={{
                  backgroundColor: '#F97316',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="Enviar mensagem"
              >
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
