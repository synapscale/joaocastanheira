"use client"

import { useEffect } from "react"
import { AppProvider } from "@/context/app-context"
import { ChatInterface } from "@/components/chat/chat-interface"
import { useSidebar } from "@/context/sidebar-context"

export default function ChatPage() {
  const { isCollapsed } = useSidebar()

  return (
    <AppProvider>
      <div className="flex h-full w-full">
        {/* Conteúdo principal - usando a sidebar principal do projeto unificado */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </AppProvider>
  )
}
