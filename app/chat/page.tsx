/**
 * Página de chat integrada com backend
 * Interface completa com WebSockets, histórico e sessões
 */

"use client"

import { useEffect } from 'react'
import { ChatProvider } from '@/context/chat-context'
import { ChatInterface } from '@/components/chat/chat-interface-integrated'
import { useSidebar } from '@/context/sidebar-context'
import { useAuth } from '@/context/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'

function ChatPageContent() {
  const { isCollapsed } = useSidebar()
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex h-full w-full">
      {/* Conteúdo principal */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatProvider>
        <ChatPageContent />
      </ChatProvider>
    </ProtectedRoute>
  )
}

