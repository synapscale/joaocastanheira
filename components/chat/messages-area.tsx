"use client"

import type React from "react"
import type { RefObject } from "react"
import ChatMessage from "./chat-message"
import type { Message } from "@/types/chat"
import { Loader } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessagesAreaProps {
  messages: Message[]
  isLoading: boolean
  showTimestamps?: boolean
  showSenders?: boolean
  focusMode?: boolean
  theme: string
  chatBackground?: string | React.ReactNode
  messagesEndRef: RefObject<HTMLDivElement>
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
      {/* Messages container with improved spacing and transitions */}
      <div className="space-y-6 pb-2">
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className={cn(
              "transition-all duration-200 ease-in-out",
              index === messages.length - 1 ? "animate-fade-in" : ""
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

      {/* Enhanced loading indicator */}
      {isLoading && (
        <div className="flex items-center mt-4 mb-2">
          <div className={cn(
            "bg-background rounded-lg p-3 shadow-sm border border-border",
            "transition-all duration-300 ease-in-out animate-fade-in"
          )}>
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center">
                <div className="h-5 w-5 rounded-full border-2 border-orange-500/30 dark:border-orange-400/30 animate-ping absolute" />
                <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-orange-500 dark:border-orange-400 animate-spin" />
              </div>
              <span className="text-sm text-foreground/80 font-medium">Gerando resposta...</span>
            </div>
          </div>
        </div>
      )}

      {/* Anchor for auto-scrolling */}
      <div ref={messagesEndRef} className="h-0.5" />
    </div>
  )
}
