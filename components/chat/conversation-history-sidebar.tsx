"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/context/app-context"
import type { Conversation } from "@/types/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X, Plus, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationHistorySidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onUpdateConversationTitle?: (id: string, title: string) => void
  onDeleteConversation?: (id: string) => void
}

export function ConversationHistorySidebar({
  conversations,
  currentConversationId,
  isOpen,
  onClose,
  onSelectConversation,
  onNewConversation,
  onUpdateConversationTitle,
  onDeleteConversation
}: ConversationHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(conversations)
  
  // Filtrar conversas quando a busca ou as conversas mudarem
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations)
      return
    }
    
    const query = searchQuery.toLowerCase()
    const filtered = conversations.filter(
      conversation => 
        (conversation.title || "Nova conversa").toLowerCase().includes(query) ||
        (conversation.lastMessage || "").toLowerCase().includes(query)
    )
    
    setFilteredConversations(filtered)
  }, [searchQuery, conversations])
  
  // Ordenar conversas por data de atualização (mais recentes primeiro)
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const dateA = new Date(a.updatedAt || 0).getTime()
    const dateB = new Date(b.updatedAt || 0).getTime()
    return dateB - dateA
  })

  return (
    <div 
      className={cn(
        "fixed top-14 right-0 bottom-0 z-20 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Histórico de Conversas</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close history sidebar">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar conversas..."
              className="pl-9 bg-gray-50 dark:bg-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-2">
          {sortedConversations.length > 0 ? (
            <div className="space-y-1">
              {sortedConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                    currentConversationId === conversation.id 
                      ? "bg-gray-100 dark:bg-gray-800" 
                      : "bg-transparent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => onSelectConversation(conversation.id)}
                      className="flex-1 flex items-start gap-3 text-left"
                    >
                      <MessageSquare className="h-5 w-5 mt-0.5 text-gray-500 dark:text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {conversation.title || "Nova conversa"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage || "Sem mensagens"}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(conversation.updatedAt || Date.now()).toLocaleString()}
                        </div>
                      </div>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {onUpdateConversationTitle && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          onClick={() => {
                            const newTitle = prompt("Editar título da conversa:", conversation.title || "Nova conversa");
                            if (newTitle && newTitle.trim() && onUpdateConversationTitle) {
                              onUpdateConversationTitle(conversation.id, newTitle.trim());
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </Button>
                      )}
                      
                      {onDeleteConversation && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir esta conversa?") && onDeleteConversation) {
                              onDeleteConversation(conversation.id);
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery 
                  ? "Nenhuma conversa encontrada para esta busca" 
                  : "Nenhuma conversa encontrada"}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Limpar busca
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button 
            onClick={onNewConversation} 
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conversa
          </Button>
        </div>
      </div>
    </div>
  )
}
