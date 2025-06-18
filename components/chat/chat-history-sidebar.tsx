"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X, Clock, Star, Trash, ChevronLeft, MoreHorizontal, Edit, Copy, Archive } from "lucide-react"
import logger from "@/utils/logger"
import type { Conversation } from "@/types/chat"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ChatHistorySidebarProps {
  isOpen: boolean
  onClose: () => void
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onNewConversation: () => void
}

export function ChatHistorySidebar({
  isOpen,
  onClose,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
}: ChatHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(conversations)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Detectar cliques fora da sidebar para fechá-la
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Filtrar conversas quando a busca ou a lista de conversas mudar
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = conversations.filter(
      (conversation) =>
        conversation.title?.toLowerCase().includes(query) ||
        conversation.messages.some((message) => message.content.toLowerCase().includes(query))
    )
    setFilteredConversations(filtered)
  }, [searchQuery, conversations])

  // Agrupar conversas por data
  const groupedConversations = filteredConversations.reduce<Record<string, Conversation[]>>(
    (groups, conversation) => {
      const date = new Date(conversation.createdAt || Date.now())
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let groupKey: string

      if (date.toDateString() === today.toDateString()) {
        groupKey = "Hoje"
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Ontem"
      } else {
        groupKey = date.toLocaleDateString("pt-BR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(conversation)
      return groups
    },
    {}
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={sidebarRef}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="fixed top-0 right-0 z-50 h-full w-80 bg-background border-l border-border shadow-lg"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-medium">Histórico de Conversas</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-muted"
                aria-label="Fechar histórico"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Nova Conversa Button */}
            <div className="p-4 border-b border-border">
              <Button
                onClick={() => {
                  onNewConversation()
                  onClose()
                }}
                className="w-full mb-4 font-medium"
                size="sm"
              >
                Iniciar Nova Conversa
              </Button>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-muted/50 border-muted focus-visible:ring-1 focus-visible:ring-offset-0"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full hover:bg-muted"
                    aria-label="Limpar busca"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Conversation List */}
            <ScrollArea className="flex-1 px-3 py-2">
              {Object.entries(groupedConversations).length > 0 ? (
                Object.entries(groupedConversations).map(([date, dateConversations]) => (
                  <div key={date} className="mb-6">
                    <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">{date}</h3>
                    <div className="space-y-1.5">
                      {dateConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`group p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                            conversation.id === currentConversationId
                              ? "bg-primary/10 dark:bg-primary/20"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => onSelectConversation(conversation.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <Avatar className="h-8 w-8 mt-0.5">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {conversation.title?.substring(0, 2) || "NC"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-medium truncate">
                                    {conversation.title || "Nova conversa"}
                                  </h4>
                                  {conversation.metadata?.isFavorite && (
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {conversation.messages.length > 0
                                    ? (() => {
                                        const lastMessage = conversation.messages[conversation.messages.length - 1];
                                        const content = lastMessage?.content || "";
                                        return content.length > 50 ? content.substring(0, 50) + "..." : content;
                                      })()
                                    : "Sem mensagens"}
                                </p>
                                <div className="flex items-center mt-1.5 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>
                                    {new Date(conversation.createdAt || Date.now()).toLocaleTimeString("pt-BR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {conversation.messages.length > 0 && (
                                    <Badge variant="outline" className="ml-2 px-1.5 py-0 h-4 text-[10px] font-normal">
                                      {conversation.messages.length} {conversation.messages.length === 1 ? 'mensagem' : 'mensagens'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Menu de três pontos */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 hover:bg-muted"
                                  aria-label="Opções da conversa"
                                >
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Implementar editar título
                                    logger.log('Editar título:', conversation.id)
                                  }}
                                  className="flex items-center gap-2 py-1.5"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span>Editar título</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Implementar copiar link
                                    logger.log('Copiar link:', conversation.id)
                                  }}
                                  className="flex items-center gap-2 py-1.5"
                                >
                                  <Copy className="h-4 w-4" />
                                  <span>Copiar link</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Implementar arquivar
                                    logger.log('Arquivar:', conversation.id)
                                  }}
                                  className="flex items-center gap-2 py-1.5"
                                >
                                  <Archive className="h-4 w-4" />
                                  <span>Arquivar</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteConversation(conversation.id)
                                  }}
                                  className="flex items-center gap-2 py-1.5 text-destructive focus:text-destructive"
                                >
                                  <Trash className="h-4 w-4" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="bg-muted rounded-full p-3 mb-4">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium mb-1">Nenhuma conversa encontrada</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {searchQuery
                      ? "Tente uma busca diferente"
                      : "Inicie uma nova conversa para começar"}
                  </p>
                  <Button
                    onClick={() => {
                      onNewConversation()
                      onClose()
                    }}
                    className="w-full"
                    size="sm"
                  >
                    Nova conversa
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
