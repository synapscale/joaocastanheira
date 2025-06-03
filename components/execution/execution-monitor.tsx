/**
 * Componente de Monitoramento de Execução em Tempo Real
 * Criado por José - O melhor Full Stack do mundo
 * Dashboard completo para acompanhar execuções de workflows
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Zap,
  Users,
  Eye,
  Wifi,
  WifiOff,
  RefreshCw,
  Terminal,
  BarChart3,
  Settings
} from 'lucide-react';
import { useExecutionWebSocket, WebSocketEvent } from '@/hooks/use-websocket';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExecutionMonitorProps {
  executionId: string;
  workflowName?: string;
  onClose?: () => void;
}

interface ExecutionProgress {
  progress: number;
  currentNode?: string;
  totalNodes?: number;
  completedNodes?: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
}

interface NodeStatus {
  nodeId: string;
  nodeName?: string;
  nodeType?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  executionTime?: number;
  error?: string;
  result?: any;
}

export function ExecutionMonitor({ executionId, workflowName, onClose }: ExecutionMonitorProps) {
  const {
    connectionStatus,
    events,
    lastEvent,
    stats,
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    clearEvents
  } = useExecutionWebSocket(executionId);

  const [executionProgress, setExecutionProgress] = useState<ExecutionProgress>({
    progress: 0,
    status: 'pending'
  });
  
  const [nodeStatuses, setNodeStatuses] = useState<Map<string, NodeStatus>>(new Map());
  const [logs, setLogs] = useState<WebSocketEvent[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);

  // Processa eventos WebSocket
  useEffect(() => {
    if (!lastEvent) return;

    const event = lastEvent;

    switch (event.event_type) {
      case 'execution_started':
        setExecutionProgress(prev => ({
          ...prev,
          status: 'running',
          progress: 0
        }));
        break;

      case 'execution_progress':
        setExecutionProgress(prev => ({
          ...prev,
          progress: event.data.progress || 0,
          currentNode: event.data.current_node,
          status: 'running'
        }));
        break;

      case 'execution_completed':
        setExecutionProgress(prev => ({
          ...prev,
          status: 'completed',
          progress: 100
        }));
        break;

      case 'execution_failed':
        setExecutionProgress(prev => ({
          ...prev,
          status: 'failed'
        }));
        break;

      case 'execution_cancelled':
        setExecutionProgress(prev => ({
          ...prev,
          status: 'cancelled'
        }));
        break;

      case 'node_started':
        if (event.node_id) {
          setNodeStatuses(prev => new Map(prev.set(event.node_id!, {
            nodeId: event.node_id!,
            nodeType: event.data.node_type,
            status: 'running',
            startedAt: event.data.started_at || event.timestamp
          })));
        }
        break;

      case 'node_completed':
        if (event.node_id) {
          setNodeStatuses(prev => {
            const existing = prev.get(event.node_id!) || { nodeId: event.node_id!, status: 'pending' };
            return new Map(prev.set(event.node_id!, {
              ...existing,
              status: 'completed',
              completedAt: event.data.completed_at || event.timestamp,
              executionTime: event.data.execution_time_ms,
              result: event.data.result
            }));
          });
        }
        break;

      case 'node_failed':
        if (event.node_id) {
          setNodeStatuses(prev => {
            const existing = prev.get(event.node_id!) || { nodeId: event.node_id!, status: 'pending' };
            return new Map(prev.set(event.node_id!, {
              ...existing,
              status: 'failed',
              error: event.data.error
            }));
          });
        }
        break;

      case 'log_message':
        setLogs(prev => [...prev, event]);
        break;

      case 'performance_update':
        setPerformanceMetrics(prev => [...prev, {
          timestamp: event.timestamp,
          ...event.data.metrics
        }]);
        break;
    }
  }, [lastEvent]);

  // Estatísticas computadas
  const computedStats = useMemo(() => {
    const nodes = Array.from(nodeStatuses.values());
    const totalNodes = nodes.length;
    const completedNodes = nodes.filter(n => n.status === 'completed').length;
    const failedNodes = nodes.filter(n => n.status === 'failed').length;
    const runningNodes = nodes.filter(n => n.status === 'running').length;

    const totalExecutionTime = nodes
      .filter(n => n.executionTime)
      .reduce((sum, n) => sum + (n.executionTime || 0), 0);

    return {
      totalNodes,
      completedNodes,
      failedNodes,
      runningNodes,
      totalExecutionTime,
      averageExecutionTime: totalNodes > 0 ? totalExecutionTime / totalNodes : 0
    };
  }, [nodeStatuses]);

  // Função para obter ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <Square className="h-4 w-4 text-gray-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  // Função para obter cor do badge de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitor de Execução</h1>
          <p className="text-muted-foreground">
            {workflowName && `Workflow: ${workflowName} • `}
            ID: {executionId}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Status da conexão */}
          <Badge variant="outline" className="flex items-center gap-1">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" />
                Conectado
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                Desconectado
              </>
            )}
          </Badge>
          
          {/* Botões de controle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => isConnected ? disconnect() : connect()}
          >
            {isConnected ? 'Desconectar' : 'Reconectar'}
          </Button>
          
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </div>

      {/* Cards de status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {getStatusIcon(executionProgress.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className={getStatusColor(executionProgress.status)}>
                {executionProgress.status.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(executionProgress.progress)}%</div>
            <Progress value={executionProgress.progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nós</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {computedStats.completedNodes}/{computedStats.totalNodes}
            </div>
            <p className="text-xs text-muted-foreground">
              {computedStats.runningNodes} executando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_connections || 0}</div>
            <p className="text-xs text-muted-foreground">
              observadores ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de conteúdo */}
      <Tabs defaultValue="nodes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nodes">Nós</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        {/* Tab de Nós */}
        <TabsContent value="nodes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Nós</CardTitle>
              <CardDescription>
                Acompanhe o progresso de cada nó do workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {Array.from(nodeStatuses.values()).map((node) => (
                    <div
                      key={node.nodeId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(node.status)}
                        <div>
                          <p className="font-medium">{node.nodeName || node.nodeId}</p>
                          <p className="text-sm text-muted-foreground">
                            {node.nodeType && `Tipo: ${node.nodeType}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getStatusColor(node.status)}>
                          {node.status}
                        </Badge>
                        {node.executionTime && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {node.executionTime}ms
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {nodeStatuses.size === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum nó em execução ainda
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Logs de Execução</CardTitle>
                <CardDescription>
                  Mensagens e eventos em tempo real
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoScroll(!autoScroll)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearEvents}
                >
                  Limpar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 font-mono text-sm">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 border-l-2 border-l-blue-200"
                    >
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex-1">{log.data.message}</span>
                    </div>
                  ))}
                  
                  {logs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum log ainda
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Performance */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>
                Estatísticas de execução e performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {computedStats.totalExecutionTime}ms
                  </div>
                  <p className="text-sm text-muted-foreground">Tempo Total</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(computedStats.averageExecutionTime)}ms
                  </div>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {computedStats.completedNodes}
                  </div>
                  <p className="text-sm text-muted-foreground">Nós Completos</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {computedStats.failedNodes}
                  </div>
                  <p className="text-sm text-muted-foreground">Nós Falharam</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Eventos */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Eventos</CardTitle>
              <CardDescription>
                Histórico completo de eventos WebSocket
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {events.map((event, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{event.event_type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.timestamp), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                  
                  {events.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum evento ainda
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Erro de conexão */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Erro de Conexão:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

