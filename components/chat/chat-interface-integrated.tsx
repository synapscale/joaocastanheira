/**
 * Interface de chat integrada com backend
 * Componente principal que gerencia toda a experiência de chat
 */

"use client"

import { useState, useEffect } from 'react'
import { useChat, useChatSessions, useChatMessages, useChatConnection } from '@/hooks/useChat'
import { ChatSessionList } from './chat-session-list'
import { ChatMessageList } from './chat-message-list'
import { ChatInput } from './chat-input-integrated'
import { ChatHeader } from './chat-header'
import { ChatConnectionStatus } from './chat-connection-status'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, Plus, Settings, Wifi, WifiOff } from 'lucide-react'

export function ChatInterface() {
  const [showSessions, setShowSessions] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const {
    currentSession,
    sessions,
    isLoading,
    error,
    createSession,
    switchSession,
    deleteSession
  } = useChatSessions()

  const {
    messages,
    sendMessage,
    resendMessage,
    deleteMessage,
    isTyping
  } = useChatMessages()

  const {
    isConnected,
    connectionStatus,
    connect,
    disconnect
  } = useChatConnection()

  // Criar sessão inicial se não houver nenhuma
  useEffect(() => {
    if (sessions.length === 0 && !isLoading) {
      createSession('Nova Conversa')
    }
  }, [sessions.length, isLoading, createSession])

  // Handlers
  const handleCreateSession = async () => {
    try {
      await createSession('Nova Conversa')
    } catch (error) {
      console.error('Erro ao criar sessão:', error)
    }
  }

  const handleSendMessage = async (message: string, attachments?: File[]) => {
    try {
      await sendMessage(message, attachments)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleResendMessage = async (messageId: string) => {
    try {
      await resendMessage(messageId)
    } catch (error) {
      console.error('Erro ao reenviar mensagem:', error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId)
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error)
    }
  }

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar com sessões */}
      {showSessions && (
        <div className="w-80 border-r border-border flex flex-col">
          {/* Header da sidebar */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversas
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateSession}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Status de conexão */}
            <ChatConnectionStatus 
              isConnected={isConnected}
              status={connectionStatus}
              onReconnect={connect}
            />
          </div>

          {/* Lista de sessões */}
          <div className="flex-1 overflow-auto">
            <ChatSessionList
              sessions={sessions}
              currentSessionId={currentSession?.id}
              onSelectSession={switchSession}
              onDeleteSession={deleteSession}
              onCreateSession={handleCreateSession}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {/* Header do chat */}
        <ChatHeader
          session={currentSession}
          isConnected={isConnected}
          onToggleSessions={() => setShowSessions(!showSessions)}
          onToggleSettings={() => setShowSettings(!showSettings)}
          showSessions={showSessions}
        />

        {/* Área de mensagens */}
        <div className="flex-1 overflow-hidden">
          {currentSession ? (
            <ChatMessageList
              messages={messages}
              isLoading={isLoading}
              isTyping={isTyping}
              onResendMessage={handleResendMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="w-96">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    Bem-vindo ao Chat
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Crie uma nova conversa para começar a interagir com o assistente.
                  </p>
                  <Button onClick={handleCreateSession} disabled={isLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conversa
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Input de mensagem */}
        {currentSession && (
          <div className="border-t border-border">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isConnected={isConnected}
              placeholder="Digite sua mensagem..."
              maxLength={4000}
            />
          </div>
        )}

        {/* Erro global */}
        {error && (
          <div className="p-4 bg-destructive/10 border-t border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

