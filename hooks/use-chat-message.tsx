"use client"

import { useState, useCallback } from 'react'
import { Message } from '@/types/chat'

/**
 * Hook para gerenciar interações com mensagens de chat
 */
export function useChatMessage(message?: Message) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState<boolean | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  const copyToClipboard = useCallback(() => {
    if (message && typeof message.content === 'string') {
      navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [message])

  const regenerateResponse = useCallback(() => {
    // Implementação simplificada
    console.log('Regenerar resposta para:', message?.id)
  }, [message])

  return {
    message,
    copied,
    liked,
    showActions,
    focusMode,
    setLiked,
    setShowActions,
    setFocusMode,
    copyToClipboard,
    regenerateResponse
  }
}

export default useChatMessage
