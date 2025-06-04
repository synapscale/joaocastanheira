/**
 * Lista de sessões de chat
 * Componente para exibir e gerenciar sessões de chat
 */

"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus, Trash2, Edit } from 'lucide-react'
import type { ChatSession } from '@/lib/types/chat'

interface ChatSessionListProps {
  sessions: ChatSession[]
  currentSessionId?: string
  onSessionSelect: (sessionId: string) => void
  onSessionCreate: () => void
  onSessionDelete: (sessionId: string) => void
  onSessionRename: (sessionId: string, newName: string) => void
}

export function ChatSessionList({
  sessions,
  currentSessionId,
  onSessionSelect,
  onSessionCreate,
  onSessionDelete,
  onSessionRename
}: ChatSessionListProps) {
  const [editingSession, setEditingSession] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleEditStart = (session: ChatSession) => {
    setEditingSession(session.id)
    setEditName(session.name)
  }

  const handleEditSave = () => {
    if (editingSession && editName.trim()) {
      onSessionRename(editingSession, editName.trim())
    }
    setEditingSession(null)
    setEditName('')
  }

  const handleEditCancel = () => {
    setEditingSession(null)
    setEditName('')
  }

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Conversas</h2>
          <Button
            onClick={onSessionCreate}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma conversa ainda</p>
            <p className="text-sm">Clique em + para começar</p>
          </div>
        ) : (
          sessions.map((session) => (
            <Card
              key={session.id}
              className={`cursor-pointer transition-colors hover:bg-accent ${
                currentSessionId === session.id ? 'bg-accent border-primary' : ''
              }`}
              onClick={() => onSessionSelect(session.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingSession === session.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 text-sm border rounded"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave()
                            if (e.key === 'Escape') handleEditCancel()
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={handleEditSave}
                            className="h-6 px-2 text-xs"
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                            className="h-6 px-2 text-xs"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium text-sm truncate">
                          {session.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {session.lastMessage || 'Sem mensagens'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {session.messageCount} mensagens
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {editingSession !== session.id && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditStart(session)
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSessionDelete(session.id)
                        }}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

