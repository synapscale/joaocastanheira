"use client"

/**
 * Componentes de Mensagem
 * 
 * Este arquivo contém implementações dos componentes de mensagem
 * para o usuário e o assistente.
 */

import React from "react"
import { Message } from "@/types/chat"
import { User, Bot } from "lucide-react"

/**
 * Componente para mensagens do usuário
 */
export function UserMessage({ message }: { message: Message }) {
  return (
    <div className="bg-primary/10 text-primary-foreground p-3 rounded-lg">
      <div className="flex items-center mb-1">
        <User className="h-4 w-4 mr-2" />
        <span className="font-medium">Você</span>
      </div>
      <div className="whitespace-pre-wrap">{message.content}</div>
      
      {/* Exibe arquivos anexados, se houver */}
      {message.files && message.files.length > 0 && (
        <div className="mt-2 space-y-1">
          {message.files.map((file, index) => (
            <div key={index} className="flex items-center text-sm">
              <a 
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline flex items-center"
              >
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs ml-1">({(file.size / 1024).toFixed(1)} KB)</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Componente para mensagens do assistente
 */
export function AssistantMessage({ message }: { message: Message }) {
  return (
    <div className="bg-secondary/50 p-3 rounded-lg">
      <div className="flex items-center mb-1">
        <Bot className="h-4 w-4 mr-2" />
        <span className="font-medium">Assistente</span>
      </div>
      <div className="whitespace-pre-wrap">{message.content}</div>
    </div>
  )
}

/**
 * Componente para ações de mensagem
 */
export function MessageActions({ message }: { message: Message }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
      .then(() => {
        // Poderia mostrar uma notificação de sucesso aqui
        console.log("Conteúdo copiado para a área de transferência")
      })
      .catch(err => {
        console.error("Erro ao copiar conteúdo:", err)
      })
  }
  
  return (
    <div className="flex space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-1">
      <button 
        onClick={handleCopy}
        className="text-xs px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        Copiar
      </button>
    </div>
  )
}

/**
 * Componente para timestamp de mensagem
 */
export function MessageTimestamp({ timestamp }: { timestamp: number }) {
  // Formata o timestamp para exibição
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  
  return (
    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
      {formattedTime}
    </div>
  )
}
