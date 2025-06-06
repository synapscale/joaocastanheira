/**
 * Componente de input de chat integrado
 * Input avançado com suporte a anexos, digitação e WebSocket
 */

"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatTyping, useChatDraft } from '@/hooks/useChat'
import { Send, Paperclip, Loader2 } from 'lucide-react'
import type { ChatInputProps } from '@/lib/types/chat'

interface ChatInputIntegratedProps extends ChatInputProps {
  sessionId?: string
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  isConnected = false,
  placeholder = "Digite sua mensagem...",
  maxLength = 4000,
  sessionId
}: ChatInputIntegratedProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isTypingActive, setIsTypingActive] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const { startTyping, stopTyping } = useChatTyping()
  const { saveDraft, loadDraft, clearDraft } = useChatDraft(sessionId)

  // Carregar rascunho ao montar componente
  useEffect(() => {
    if (sessionId) {
      const draft = loadDraft()
      if (draft) {
        setMessage(draft)
      }
    }
  }, [sessionId, loadDraft])

  // Auto-resize do textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  // Gerenciar indicador de digitação
  const handleTyping = useCallback(() => {
    if (!isConnected) return

    if (!isTypingActive) {
      setIsTypingActive(true)
      startTyping()
    }

    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Parar de digitar após 2 segundos de inatividade
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingActive(false)
      stopTyping()
    }, 2000)
  }, [isConnected, isTypingActive, startTyping, stopTyping])

  // Parar digitação ao desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTypingActive) {
        stopTyping()
      }
    }
  }, [isTypingActive, stopTyping])

  const handleMessageChange = (value: string) => {
    setMessage(value)
    handleTyping()
    
    // Salvar rascunho
    if (sessionId) {
      saveDraft(value)
    }
  }

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return
    if (isLoading) return

    const messageToSend = message.trim()
    const attachmentsToSend = [...attachments]

    // Limpar input
    setMessage('')
    setAttachments([])
    
    // Parar indicador de digitação
    if (isTypingActive) {
      setIsTypingActive(false)
      stopTyping()
    }

    // Limpar rascunho
    if (sessionId) {
      clearDraft()
    }

    try {
      await onSendMessage(messageToSend, attachmentsToSend)
    } catch (error) {
      // Restaurar mensagem em caso de erro
      setMessage(messageToSend)
      setAttachments(attachmentsToSend)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const canSend = (message.trim() || attachments.length > 0) && !isLoading

  return (
    <div className="p-4 space-y-3">
      {/* Anexos */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
            >
              <Paperclip className="h-3 w-3" />
              <span className="truncate max-w-32">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input principal */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? placeholder : `${placeholder} (modo offline)`}
            maxLength={maxLength}
            disabled={isLoading}
            className="min-h-[44px] max-h-32 resize-none pr-12"
            rows={1}
          />
          
          {/* Contador de caracteres */}
          {message.length > maxLength * 0.8 && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-1">
          {/* Botão de anexo */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="h-11 w-11"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Botão de enviar */}
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="h-11 w-11"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
      />

      {/* Status de conexão */}
      {!isConnected && (
        <div className="text-xs text-muted-foreground text-center">
          Modo offline - as mensagens serão sincronizadas quando a conexão for restabelecida
        </div>
      )}
    </div>
  )
}

