"use client"

import type React from "react"
import type { RefObject } from "react"
import ChatMessage from "./chat-message"
import type { Message } from "@/types/chat"
import { Loader } from "lucide-react"
import { cn } from "@/lib/utils"
import { TypingIndicator } from "./typing-indicator"

interface MessagesAreaProps {
  messages: Message[]
  isLoading: boolean
  showTimestamps?: boolean
  showSenders?: boolean
  focusMode?: boolean
  theme: string
  chatBackground?: string | React.ReactNode
  messagesEndRef: RefObject<HTMLDivElement>
  showTypingIndicator?: boolean
}

export function MessagesArea({
  messages,
  isLoading,
  showTimestamps = true,
  showSenders = true,
  focusMode = false,
  theme,
  chatBackground,
  messagesEndRef,
  showTypingIndicator = false,
}: MessagesAreaProps) {
  return (
    <div 
      className={cn(
        "space-y-4 relative px-1",
        focusMode ? "focus-mode opacity-95" : ""
      )}
      style={{
        backgroundImage: typeof chatBackground === "string" ? chatBackground : undefined,
      }}
    >
      {/* Messages container with refined spacing */}
      <div className="space-y-4 pb-2">
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className={cn(
              "transition-opacity duration-150 ease-out",
              index === messages.length - 1 ? "animate-message-slide-up" : ""
            )}
          >
            <ChatMessage
              message={message}
              showTimestamp={showTimestamps}
              showSender={showSenders}
              focusMode={focusMode}
              isLatest={index === messages.length - 1}
            />
          </div>
        ))}
      </div>

      {/* Indicador de digitação moderno */}
      <TypingIndicator isVisible={showTypingIndicator} />

      {/* Anchor for auto-scrolling */}
      <div ref={messagesEndRef} className="h-0.5" />
    </div>
  )
}
