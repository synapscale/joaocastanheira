/**
 * Página de Monitoramento Global de Execuções
 * Criado por José - O melhor Full Stack do mundo
 * Dashboard completo para administradores
 */

'use client';

import React, { useState, useEffect } from 'react';
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

  // Solicita lista de execuções quando conecta
  useEffect(() => {
    if (isConnected) {
      requestExecutionList();
      requestGlobalStats();
    }
  }, [isConnected]);

  // Processa eventos WebSocket
  useEffect(() => {
    events.forEach(event => {
      if (event.event_type === 'execution_list_response') {
        setExecutions(event.data);
      }
    });
  }, [events]);

  const requestExecutionList = () => {
    setRefreshing(true);
    sendMessage({ type: 'get_execution_list' });
    setTimeout(() => setRefreshing(false), 1000);
  };

  const requestGlobalStats = () => {
    sendMessage({ type: 'get_global_stats' });
  };

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
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execuções Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_executions || 0}</div>
            <p className="text-xs text-muted-foreground">
              workflows em execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_connections || 0}</div>
            <p className="text-xs text-muted-foreground">
              observadores conectados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              usuários online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins Conectados</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.global_connections || 0}</div>
            <p className="text-xs text-muted-foreground">
              administradores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de conteúdo */}
      <Tabs defaultValue="executions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="events">Eventos Globais</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Tab de Execuções */}
        <TabsContent value="executions" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por ID, workflow ou usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos os Status</option>
                  <option value="running">Executando</option>
                  <option value="pending">Pendente</option>
                  <option value="completed">Completo</option>
                  <option value="failed">Falhou</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de execuções */}
          <Card>
            <CardHeader>
              <CardTitle>Execuções Ativas</CardTitle>
              <CardDescription>
                {filteredExecutions.length} execuções encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredExecutions.map((execution) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedExecution(execution.id)}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <p className="font-medium">
                            {execution.workflow_name || `Workflow ${execution.workflow_id}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {execution.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Usuário: {execution.user_email || `ID ${execution.user_id}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {execution.connections} observadores
                        </div>
                        {execution.started_at && (
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(execution.started_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredExecutions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {executions.length === 0 
                        ? 'Nenhuma execução ativa no momento'
                        : 'Nenhuma execução encontrada com os filtros aplicados'
                      }
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Eventos Globais */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Eventos em Tempo Real</CardTitle>
                <CardDescription>
                  Todos os eventos do sistema
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={clearEvents}>
                Limpar
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
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
                      {event.execution_id && (
                        <p className="text-xs text-muted-foreground mb-1">
                          Execução: {event.execution_id}
                        </p>
                      )}
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

        {/* Tab de Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics do Sistema</CardTitle>
              <CardDescription>
                Métricas e estatísticas gerais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {executions.filter(e => e.status === 'running').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Executando</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {executions.filter(e => e.status === 'pending').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {executions.filter(e => e.status === 'completed').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Completas</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {executions.filter(e => e.status === 'failed').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Falharam</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {executions.reduce((sum, e) => sum + e.connections, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Observadores</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {events.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Eventos Recebidos</p>
                </div>
              </div>
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

