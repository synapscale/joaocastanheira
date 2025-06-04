/**
 * Componente de status de conexão WebSocket
 * Mostra o status da conexão e permite reconectar
 */

"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, RotateCcw, AlertCircle } from 'lucide-react'
import type { WebSocketStatus } from '@/lib/services/websocket'

interface ChatConnectionStatusProps {
  isConnected: boolean
  status: WebSocketStatus
  onReconnect: () => void
}

export function ChatConnectionStatus({ 
  isConnected, 
  status, 
  onReconnect 
}: ChatConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Conectado',
          variant: 'default' as const,
          color: 'text-green-600'
        }
      case 'connecting':
        return {
          icon: RotateCcw,
          text: 'Conectando...',
          variant: 'secondary' as const,
          color: 'text-yellow-600'
        }
      case 'reconnecting':
        return {
          icon: RotateCcw,
          text: 'Reconectando...',
          variant: 'secondary' as const,
          color: 'text-yellow-600'
        }
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Erro',
          variant: 'destructive' as const,
          color: 'text-red-600'
        }
      default:
        return {
          icon: WifiOff,
          text: 'Desconectado',
          variant: 'outline' as const,
          color: 'text-gray-600'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className="flex items-center justify-between">
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className="text-xs">{config.text}</span>
      </Badge>
      
      {!isConnected && status !== 'connecting' && status !== 'reconnecting' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReconnect}
          className="h-6 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reconectar
        </Button>
      )}
    </div>
  )
}

