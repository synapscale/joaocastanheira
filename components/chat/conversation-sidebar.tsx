"use client"

import React from 'react'
import { useChat } from '@/hooks/use-chat'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare, 
  Settings, 
  PlusCircle, 
  Trash2, 
  Star, 
  StarOff,
  Share2,
  Download,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import { Message } from '@/types/chat'
import { Badge } from '@/components/ui/badge'

interface ConversationSidebarProps {
  className?: string
}

export function ConversationSidebar({ className }: ConversationSidebarProps) {
  const { 
    conversations, 
    currentConversationId, 
    createNewConversation, 
    selectConversation,
    deleteConversation,
    favoriteConversation,
    exportConversation
  } = useChat()
  
  const [searchTerm, setSearchTerm] = React.useState('')
  
  // Filtrar conversas favoritas
  const favoriteConversations = React.useMemo(() => {
    return conversations.filter(conv => conv.isFavorite)
  }, [conversations])
  
  // Filtrar conversas por termo de busca
  const filteredConversations = React.useMemo(() => {
    if (!searchTerm) return conversations
    
    return conversations.filter(conv => {
      // Buscar em todas as mensagens do usuário
      const userMessages = conv.messages.filter(m => m.role === 'user')
      return userMessages.some(m => 
        m.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [conversations, searchTerm])
  
  // Obter título da conversa a partir da primeira mensagem do usuário
  const getConversationTitle = (messages: Message[]) => {
    const firstUserMessage = messages.find(m => m.role === 'user')
    if (firstUserMessage) {
      // Limitar a 30 caracteres e adicionar reticências se necessário
      const content = firstUserMessage.content
      return content.length > 30 ? `${content.substring(0, 30)}...` : content
    }
    return 'Nova conversa'
  }
  
  // Obter data formatada da última mensagem
  const getLastMessageDate = (messages: Message[]) => {
    if (messages.length === 0) return ''
    
    const lastMessage = messages[messages.length - 1]
    const date = new Date(lastMessage.timestamp || Date.now())
    
    // Se for hoje, mostrar apenas a hora
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // Se for este ano, mostrar dia e mês
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
    }
    
    // Caso contrário, mostrar data completa
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' })
  }
  
  // Obter modelo usado na conversa
  const getConversationModel = (conversation: any) => {
    return conversation.model || 'gpt-4'
  }
  
  // Renderizar item de conversa
  const renderConversationItem = (conversation: any) => (
    <div
      key={conversation.id}
      className={cn(
        "group flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        conversation.id === currentConversationId && "bg-gray-100 dark:bg-gray-800"
      )}
      onClick={() => selectConversation(conversation.id)}
    >
      <div className="flex items-center flex-1 min-w-0">
        <MessageSquare className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate max-w-[140px]">
              {getConversationTitle(conversation.messages)}
            </span>
            {conversation.isFavorite && (
              <Star className="h-3 w-3 text-yellow-400 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {getLastMessageDate(conversation.messages)}
            </span>
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
              {getConversationModel(conversation)}
            </Badge>
          </div>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
            <span className="sr-only">Opções</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              favoriteConversation(conversation.id, !conversation.isFavorite)
            }}
          >
            {conversation.isFavorite ? (
              <>
                <StarOff className="h-4 w-4 mr-2" />
                Remover dos favoritos
              </>
            ) : (
              <>
                <Star className="h-4 w-4 mr-2" />
                Adicionar aos favoritos
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              exportConversation(conversation.id)
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar conversa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              // Implementar compartilhamento
              alert('Funcionalidade de compartilhamento será implementada em breve.')
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onClick={(e) => {
              e.stopPropagation()
              deleteConversation(conversation.id)
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir conversa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
  
  return (
    <div className={cn("flex flex-col h-full border-r", className)}>
      <div className="p-4 border-b">
        <Button 
          onClick={createNewConversation} 
          className="w-full justify-start"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova conversa
        </Button>
      </div>
      
      <div className="px-4 py-2">
        <input
          type="text"
          placeholder="Buscar conversas..."
          className="w-full px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="chats" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4 mt-2">
          <TabsTrigger value="chats">Conversas</TabsTrigger>
          <TabsTrigger value="saved">Favoritos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chats" className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa iniciada'}
                </div>
              ) : (
                filteredConversations.map(renderConversationItem)
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="saved" className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {favoriteConversations.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  Nenhuma conversa favorita
                </div>
              ) : (
                favoriteConversations.map(renderConversationItem)
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <div className="p-4 border-t">
        <Button variant="outline" size="sm" className="w-full">
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </Button>
      </div>
    </div>
  )
}

export default ConversationSidebar
