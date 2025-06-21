import React from 'react'

interface ChatProcessingStatusProps {
  status: 'idle' | 'sending' | 'processing' | 'completed' | 'error'
  message?: string
  isVisible: boolean
}

export const ChatProcessingStatus: React.FC<ChatProcessingStatusProps> = ({
  status,
  message,
  isVisible
}) => {
  if (!isVisible || status === 'idle') {
    return null
  }

  const getStatusContent = () => {
    switch (status) {
      case 'sending':
        return {
          text: 'Enviando...',
          color: 'text-muted-foreground/70'
        }
      case 'processing':
        return {
          text: 'Processando...',
          color: 'text-muted-foreground/70'
        }
      case 'completed':
        return {
          text: 'Enviado',
          color: 'text-muted-foreground/50'
        }
      case 'error':
        return {
          text: message || 'Erro',
          color: 'text-destructive/70'
        }
      default:
        return null
    }
  }

  const statusContent = getStatusContent()
  
  if (!statusContent) {
    return null
  }

  return (
    <div className={`text-xs ${statusContent.color} transition-all duration-300 ease-out`}>
      <span>{statusContent.text}</span>
    </div>
  )
} 