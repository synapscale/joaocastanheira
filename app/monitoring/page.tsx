/**
 * Página de Monitoramento Global de Execuções
 * Dashboard completo para administradores
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  Zap, 
  Clock, 
  Search,
  Filter,
  RefreshCw,
  Eye,
  BarChart3,
  Globe,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause
} from 'lucide-react';
import { useGlobalWebSocket } from '@/hooks/use-websocket';
import { ExecutionMonitor } from '@/components/execution/execution-monitor';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface ExecutionSummary {
  id: string;
  workflow_id: number;
  user_id: number;
  status: string;
  started_at: string | null;
  connections: number;
  workflow_name?: string;
  user_email?: string;
}

export default function MonitoringPage() {
  const { user } = useAuth();
  const {
    connectionStatus,
    events,
    stats,
    isConnected,
    error,
    sendMessage,
    clearEvents
  } = useGlobalWebSocket();

  const [executions, setExecutions] = useState<ExecutionSummary[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const requestExecutionList = useCallback(() => {
    setRefreshing(true);
    sendMessage({ type: 'get_execution_list' });
    setTimeout(() => setRefreshing(false), 1000);
  }, [sendMessage]);

  const requestGlobalStats = useCallback(() => {
    sendMessage({ type: 'get_global_stats' });
  }, [sendMessage]);

  // Solicita lista de execuções quando conecta
  useEffect(() => {
    if (isConnected) {
      requestExecutionList();
      requestGlobalStats();
    }
  }, [isConnected, requestExecutionList, requestGlobalStats]);

  // Processa eventos WebSocket
  useEffect(() => {
    events.forEach(event => {
      if (event.event_type === 'execution_list_response') {
        setExecutions(event.data);
      }
    });
  }, [events]);

  // Verifica se o usuário é admin
  if (!user?.is_admin) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Acesso Negado</span>
            </div>
            <p className="mt-2 text-sm text-red-600">
              Esta página é restrita a administradores.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }



  // Filtra execuções
  const filteredExecutions = executions.filter(execution => {
    const matchesSearch = searchTerm === '' || 
      execution.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.workflow_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Função para obter ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Pause className="h-4 w-4 text-gray-400" />;
    }
  };

  // Função para obter cor do badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Se uma execução está selecionada, mostra o monitor
  if (selectedExecution) {
    return (
      <div className="container mx-auto py-6">
        <ExecutionMonitor
          executionId={selectedExecution}
          workflowName={executions.find(e => e.id === selectedExecution)?.workflow_name}
          onClose={() => setSelectedExecution(null)}
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Monitoramento Global</h1>
            <p className="text-muted-foreground">
              Dashboard administrativo para monitorar todas as execuções
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={requestExecutionList}
            disabled={refreshing}
          >
            <RefreshCw className={refreshing ? 'animate-spin h-4 w-4 mr-2' : 'h-4 w-4 mr-2'} />
            Atualizar
          </Button>
        </div>
      </div>
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por ID, workflow ou usuário..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="ml-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="running">Em execução</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
            <TabsTrigger value="failed">Falhados</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Lista de execuções */}
      <ScrollArea className="h-[500px] border rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iniciada</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredExecutions.map(execution => (
              <tr key={execution.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{execution.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{execution.workflow_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{execution.user_email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                    {getStatusIcon(execution.status)}
                    <span className="ml-1">{execution.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {execution.started_at ? formatDistanceToNow(new Date(execution.started_at), { addSuffix: true, locale: ptBR }) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button size="sm" variant="outline" onClick={() => setSelectedExecution(execution.id)}>
                    <Eye className="h-4 w-4 mr-1" /> Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      </div>
    </ProtectedRoute>
  );
} 