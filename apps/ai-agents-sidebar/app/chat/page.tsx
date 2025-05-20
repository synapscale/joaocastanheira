"use client"

import React from "react"
import { ChatInterface } from "@chat-interativo/chat/chat-interface"

export default function ChatPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Interativo</h1>
      <div className="bg-white rounded-lg shadow-md p-4">
        <ChatInterface />
      </div>
    </div>
  )
}
