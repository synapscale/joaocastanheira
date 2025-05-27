"use client"

import type React from "react"
import type { RefObject } from "react"
import ChatMessage from "./chat-message"
import type { Message } from "@/types/chat"

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
    <div className={`space-y-4 ${focusMode ? 'focus-mode' : ''}`}>
      {/* Render messages */}
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          message={message}
          showTimestamp={showTimestamps}
          showSender={showSenders}
          focusMode={focusMode}
          isLatest={index === messages.length - 1}
        />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center mt-4 text-gray-500 dark:text-gray-400 animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-orange-500 dark:text-orange-400"
              >
                <path d="M12 3v3" />
                <path d="M18.5 8.5 16 11" />
                <path d="M8.5 18.5 11 16" />
                <path d="M3 12h3" />
                <path d="M18 12h3" />
                <path d="M12 18v3" />
                <path d="M16 6l-4 4" />
                <path d="M8 12l4 4" />
              </svg>
              <span>Gerando resposta...</span>
            </div>
          </div>
        </div>
      )}

      {/* Anchor for auto-scrolling */}
      <div ref={messagesEndRef} />
    </div>
  )
}
