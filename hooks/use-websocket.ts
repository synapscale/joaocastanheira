/**
 * Hook para gerenciar conexões WebSocket de monitoramento
 * Criado por José - O melhor Full Stack do mundo
 * Sistema completo de comunicação real-time
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

export interface WebSocketEvent {
  event_type: string;
  data: any;
  timestamp: string;
  event_id: string;
  execution_id?: string;
  node_id?: string;
  user_id?: number;
}

export interface ExecutionStats {
  execution_id: string;
  active_connections: number;
  created_at: string;
  last_activity: string;
  event_count: number;
}

export interface GlobalStats {
  active_executions: number;
  total_connections: number;
  global_connections: number;
  active_users: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseWebSocketOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

export interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus;
  events: WebSocketEvent[];
  lastEvent: WebSocketEvent | null;
  stats: ExecutionStats | GlobalStats | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  clearEvents: () => void;
  isConnected: boolean;
  error: string | null;
}

export function useExecutionWebSocket(
  executionId: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const { user, token } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [events, setEvents] = useState<WebSocketEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [stats, setStats] = useState<ExecutionStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  const {
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000
  } = options;

  const connect = useCallback(() => {
    if (!user || !token || !executionId) {
      setError('Usuário não autenticado ou execution ID não fornecido');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Já conectado
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/api/v1/ws/execution/${executionId}?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`🔗 WebSocket conectado para execução ${executionId}`);
        setConnectionStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Inicia heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            }));
          }
        }, heartbeatInterval);
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);
          
          // Atualiza eventos
          setEvents(prev => [...prev, data]);
          setLastEvent(data);
          
          // Processa tipos específicos de eventos
          if (data.event_type === 'subscription_confirmed') {
            console.log('✅ Subscrição confirmada:', data.data);
          } else if (data.event_type === 'stats_response') {
            setStats(data.data as ExecutionStats);
          }
          
        } catch (err) {
          console.error('Erro ao processar mensagem WebSocket:', err);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket desconectado (código: ${event.code})`);
        setConnectionStatus('disconnected');
        
        // Limpa heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        
        // Tenta reconectar se habilitado
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Tentativa de reconexão ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Erro no WebSocket:', error);
        setConnectionStatus('error');
        setError('Erro na conexão WebSocket');
      };

      wsRef.current = ws;

    } catch (err) {
      console.error('Erro ao criar WebSocket:', err);
      setConnectionStatus('error');
      setError('Erro ao criar conexão WebSocket');
    }
  }, [user, token, executionId, autoReconnect, maxReconnectAttempts, reconnectInterval, heartbeatInterval]);

  const disconnect = useCallback(() => {
    // Limpa timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    // Fecha WebSocket
    if (wsRef.current) {
      wsRef.current.close(1000, 'Desconexão manual');
      wsRef.current = null;
    }
    
    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket não está conectado');
    }
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLastEvent(null);
  }, []);

  // Conecta automaticamente quando o hook é montado
  useEffect(() => {
    if (user && token && executionId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [user, token, executionId]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionStatus,
    events,
    lastEvent,
    stats,
    connect,
    disconnect,
    sendMessage,
    clearEvents,
    isConnected: connectionStatus === 'connected',
    error
  };
}

export function useGlobalWebSocket(
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const { user, token } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [events, setEvents] = useState<WebSocketEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  const {
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000
  } = options;

  const connect = useCallback(() => {
    if (!user || !token) {
      setError('Usuário não autenticado');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/api/v1/ws/global?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🌐 WebSocket global conectado');
        setConnectionStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Inicia heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            }));
          }
        }, heartbeatInterval);
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);
          
          setEvents(prev => [...prev, data]);
          setLastEvent(data);
          
          if (data.event_type === 'subscription_confirmed') {
            console.log('✅ Subscrição global confirmada:', data.data);
          } else if (data.event_type === 'global_stats_response') {
            setStats(data.data as GlobalStats);
          }
          
        } catch (err) {
          console.error('Erro ao processar mensagem WebSocket global:', err);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket global desconectado (código: ${event.code})`);
        setConnectionStatus('disconnected');
        
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Tentativa de reconexão global ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Erro no WebSocket global:', error);
        setConnectionStatus('error');
        setError('Erro na conexão WebSocket global');
      };

      wsRef.current = ws;

    } catch (err) {
      console.error('Erro ao criar WebSocket global:', err);
      setConnectionStatus('error');
      setError('Erro ao criar conexão WebSocket global');
    }
  }, [user, token, autoReconnect, maxReconnectAttempts, reconnectInterval, heartbeatInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Desconexão manual');
      wsRef.current = null;
    }
    
    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket global não está conectado');
    }
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLastEvent(null);
  }, []);

  useEffect(() => {
    if (user && token && user.is_admin) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [user, token]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionStatus,
    events,
    lastEvent,
    stats,
    connect,
    disconnect,
    sendMessage,
    clearEvents,
    isConnected: connectionStatus === 'connected',
    error
  };
}

