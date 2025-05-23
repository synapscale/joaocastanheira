"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Message } from '@/types/chat'

interface FeedbackContextType {
  messageFeedback: Record<string, MessageFeedback>
  addFeedback: (messageId: string, feedback: MessageFeedback) => void
  updateFeedback: (messageId: string, feedback: Partial<MessageFeedback>) => void
  getFeedback: (messageId: string) => MessageFeedback | undefined
  feedbackStats: FeedbackStats
}

export interface MessageFeedback {
  helpful: boolean | null
  reason?: string
  additionalInfo?: string
  timestamp: number
}

interface FeedbackStats {
  totalFeedback: number
  helpfulCount: number
  unhelpfulCount: number
  mostCommonReasons: Array<{reason: string, count: number}>
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [messageFeedback, setMessageFeedback] = useState<Record<string, MessageFeedback>>({})
  
  // Adicionar feedback para uma mensagem
  const addFeedback = useCallback((messageId: string, feedback: MessageFeedback) => {
    setMessageFeedback(prev => ({
      ...prev,
      [messageId]: feedback
    }))
    
    // Enviar feedback para análise (poderia ser uma API real)
    console.log(`Feedback enviado para mensagem ${messageId}:`, feedback)
    
    // Armazenar localmente para análise futura
    try {
      const storedFeedback = localStorage.getItem('messageFeedback')
      const feedbackData = storedFeedback ? JSON.parse(storedFeedback) : {}
      feedbackData[messageId] = feedback
      localStorage.setItem('messageFeedback', JSON.stringify(feedbackData))
    } catch (e) {
      console.error('Erro ao armazenar feedback:', e)
    }
  }, [])
  
  // Atualizar feedback existente
  const updateFeedback = useCallback((messageId: string, feedback: Partial<MessageFeedback>) => {
    setMessageFeedback(prev => {
      if (!prev[messageId]) return prev
      
      return {
        ...prev,
        [messageId]: {
          ...prev[messageId],
          ...feedback,
          timestamp: Date.now()
        }
      }
    })
  }, [])
  
  // Obter feedback para uma mensagem específica
  const getFeedback = useCallback((messageId: string) => {
    return messageFeedback[messageId]
  }, [messageFeedback])
  
  // Calcular estatísticas de feedback
  const feedbackStats = React.useMemo(() => {
    const feedbackEntries = Object.values(messageFeedback)
    const totalFeedback = feedbackEntries.length
    const helpfulCount = feedbackEntries.filter(f => f.helpful === true).length
    const unhelpfulCount = feedbackEntries.filter(f => f.helpful === false).length
    
    // Contar ocorrências de cada razão
    const reasonCounts: Record<string, number> = {}
    feedbackEntries.forEach(feedback => {
      if (feedback.reason) {
        reasonCounts[feedback.reason] = (reasonCounts[feedback.reason] || 0) + 1
      }
    })
    
    // Ordenar razões por contagem
    const mostCommonReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    return {
      totalFeedback,
      helpfulCount,
      unhelpfulCount,
      mostCommonReasons
    }
  }, [messageFeedback])
  
  // Carregar feedback do localStorage na inicialização
  React.useEffect(() => {
    try {
      const storedFeedback = localStorage.getItem('messageFeedback')
      if (storedFeedback) {
        setMessageFeedback(JSON.parse(storedFeedback))
      }
    } catch (e) {
      console.error('Erro ao carregar feedback:', e)
    }
  }, [])
  
  return (
    <FeedbackContext.Provider
      value={{
        messageFeedback,
        addFeedback,
        updateFeedback,
        getFeedback,
        feedbackStats
      }}
    >
      {children}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider')
  }
  return context
}

export default useFeedback
