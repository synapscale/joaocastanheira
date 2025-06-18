'use client'

import React from 'react'
import { AlertTriangle, Key, Settings, Clock, Wifi, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface ChatError {
  type: 'api_keys' | 'invalid_config' | 'rate_limit' | 'network' | 'unknown'
  message: string
  details?: string[]
  timestamp: Date
  retryable?: boolean
}

interface ErrorFeedbackProps {
  error: ChatError
  onRetry?: () => void
  onConfigureApiKeys?: () => void
  onDismiss?: () => void
}

const errorIcons = {
  api_keys: Key,
  invalid_config: Settings,
  rate_limit: Clock,
  network: Wifi,
  unknown: AlertTriangle
}

const errorColors = {
  api_keys: 'destructive',
  invalid_config: 'destructive',
  rate_limit: 'default',
  network: 'destructive',
  unknown: 'destructive'
} as const

const errorTitles = {
  api_keys: 'Chaves API Necessárias',
  invalid_config: 'Configuração Inválida',
  rate_limit: 'Limite de Requisições',
  network: 'Erro de Conexão',
  unknown: 'Erro Desconhecido'
}

const errorSuggestions = {
  api_keys: [
    'Configure suas chaves API em Variáveis do Usuário',
    'Verifique se as chaves estão corretas e ativas',
    'Consulte a documentação do provedor para obter as chaves'
  ],
  invalid_config: [
    'Verifique se o modelo selecionado é válido',
    'Confirme se a temperatura está entre 0 e 2',
    'Escolha uma ferramenta compatível com o modelo'
  ],
  rate_limit: [
    'Aguarde alguns minutos antes de tentar novamente',
    'Considere usar um modelo com menor custo',
    'Verifique os limites da sua conta no provedor'
  ],
  network: [
    'Verifique sua conexão com a internet',
    'Tente novamente em alguns segundos',
    'Verifique se o servidor está disponível'
  ],
  unknown: [
    'Tente novamente em alguns momentos',
    'Verifique se todas as configurações estão corretas',
    'Entre em contato com o suporte se o problema persistir'
  ]
}

export function ErrorFeedback({ 
  error, 
  onRetry, 
  onConfigureApiKeys, 
  onDismiss 
}: ErrorFeedbackProps) {
  const Icon = errorIcons[error.type]
  const color = errorColors[error.type]
  const title = errorTitles[error.type]
  const suggestions = errorSuggestions[error.type]

  return (
    <div className="space-y-4">
      <Alert variant={color}>
        <Icon className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline" className="ml-2">
            {error.timestamp.toLocaleTimeString()}
          </Badge>
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm">{error.message}</p>
          
          {error.details && error.details.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Detalhes:
              </p>
              <ul className="text-xs space-y-1">
                {error.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-muted-foreground mr-1">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Sugestões para resolver:
            </p>
            <ul className="text-xs space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-muted-foreground mr-1">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2 mt-4">
            {error.type === 'api_keys' && onConfigureApiKeys && (
              <Button
                variant="outline"
                size="sm"
                onClick={onConfigureApiKeys}
                className="flex items-center gap-1"
              >
                <Key className="h-3 w-3" />
                Configurar Chaves API
              </Button>
            )}
            
            {error.retryable !== false && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Tentar Novamente
              </Button>
            )}
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-muted-foreground"
              >
                Dispensar
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Hook para categorizar erros
export function useChatErrorHandler() {
  const categorizeError = (error: Error | string): ChatError => {
    const message = typeof error === 'string' ? error : error.message
    
    if (message.includes('API keys') || message.includes('🔑')) {
      return {
        type: 'api_keys',
        message: message.replace('🔑 ', ''),
        timestamp: new Date(),
        retryable: false
      }
    }
    
    if (message.includes('Configurações') || message.includes('⚙️')) {
      return {
        type: 'invalid_config',
        message: message.replace('⚙️ ', ''),
        timestamp: new Date(),
        retryable: false
      }
    }
    
    if (message.includes('rate limit') || message.includes('⏱️')) {
      return {
        type: 'rate_limit',
        message: message.replace('⏱️ ', ''),
        timestamp: new Date(),
        retryable: true
      }
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('HTTP')) {
      return {
        type: 'network',
        message: message,
        timestamp: new Date(),
        retryable: true
      }
    }
    
    return {
      type: 'unknown',
      message: message,
      timestamp: new Date(),
      retryable: true
    }
  }

  const handleError = (error: Error | string, context?: any) => {
    const chatError = categorizeError(error)
    
    // Log para analytics
    console.error('Chat Error:', {
      ...chatError,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    })
    
    // Salvar no localStorage para analytics
    try {
      const errorLogs = localStorage.getItem('chatErrorLogs')
      const logs = errorLogs ? JSON.parse(errorLogs) : []
      logs.push({
        ...chatError,
        context,
        userAgent: navigator.userAgent,
        url: window.location.href
      })
      
      // Manter apenas os últimos 50 erros
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50)
      }
      
      localStorage.setItem('chatErrorLogs', JSON.stringify(logs))
    } catch (e) {
      console.error('Erro ao salvar log de erro:', e)
    }
    
    return chatError
  }

  const getErrorStats = () => {
    try {
      const errorLogs = localStorage.getItem('chatErrorLogs')
      if (!errorLogs) return null
      
      const logs = JSON.parse(errorLogs)
      const last24h = logs.filter((log: any) => 
        new Date(log.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      )
      
      const errorsByType = last24h.reduce((acc: any, log: any) => {
        acc[log.type] = (acc[log.type] || 0) + 1
        return acc
      }, {})
      
      return {
        total: last24h.length,
        byType: errorsByType,
        mostRecent: logs[logs.length - 1]
      }
    } catch (e) {
      return null
    }
  }

  return {
    categorizeError,
    handleError,
    getErrorStats
  }
} 