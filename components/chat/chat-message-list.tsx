/**
 * Lista de mensagens do chat
 * Componente para exibir mensagens de uma sessão de chat
 */

"use client"

import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bot, User, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import type { ChatMessage } from '@/lib/types/chat'

interface ChatMessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
  error?: string | null
}

export function ChatMessageList({ messages, isLoading, error }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-blue-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      case 'pending':
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />
    }
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar mensagens</h3>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma mensagem ainda</p>
            <p className="text-sm">Comece uma conversa digitando uma mensagem</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="/bot-avatar.png" />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[70%] ${
                  message.role === 'user' ? 'order-1' : 'order-2'
                }`}
              >
                <Card
                  className={`${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    
                    {message.metadata && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="flex flex-wrap gap-1">
                          {message.metadata.tokens && (
                            <Badge variant="outline" className="text-xs">
                              {message.metadata.tokens} tokens
                            </Badge>
                          )}
                          {message.metadata.model && (
                            <Badge variant="outline" className="text-xs">
                              {message.metadata.model}
                            </Badge>
                          )}
                          {message.metadata.processingTime && (
                            <Badge variant="outline" className="text-xs">
                              {message.metadata.processingTime}ms
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.role === 'user' && getStatusIcon(message.status)}
                </div>
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8 mt-1 order-2">
                  <AvatarImage src="/user-avatar.png" />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-muted max-w-[70%]">
                <CardContent className="p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}

