/**
 * Página de Gestão de Equipe e Workspaces
 * Hub completo para gerenciar workspaces, membros, permissões e planos
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Building, 
  Settings, 
  Crown, 
  Plus, 
  ArrowUpRight,
  Briefcase,
  Calendar,
  Shield,
  TrendingUp,
  Activity,
  Database,
  Zap,
  BarChart3,
  Loader2,
  AlertTriangle,
  RefreshCcw
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { apiService, TeamStats, WorkspaceResponse as ApiWorkspaceResponse, WorkspaceMemberResponse } from '@/lib/api/service'
import { usePlan } from '@/context/plan-context'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/auth-context'
import EnhancedMembersTab from '@/components/team/enhanced-members-tab'
// import { WorkspaceResponse } from '@/types/workspace-types' - Removido, usando tipos da API
import { ProtectedRoute } from '@/components/auth/protected-route'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'pending' | 'inactive'
  last_activity: string
  workspace_count: number
  created_at: string
}

// Função auxiliar para transformar WorkspaceMemberResponse para TeamMember
const transformWorkspaceMemberToTeamMember = (member: WorkspaceMemberResponse): TeamMember => {
  return {
    id: String(member.id),
    name: member.user_name || member.user_email || 'Usuário sem nome',
    email: member.user_email || '',
    role: member.role.toLowerCase(),
    status: (member.status === 'active' ? 'active' : 'inactive') as 'active' | 'pending' | 'inactive',
    last_activity: member.last_seen_at || member.joined_at,
    workspace_count: 1,
    created_at: member.joined_at
  }
}

// Usar WorkspaceResponse diretamente da API

export default function TeamPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentPlan, limits } = usePlan()
  const { isAuthenticated, isInitialized } = useAuth()
  
  // Estados da página
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const hasLoadedData = useRef(false)
  
  // Estados dos dados
  const [teamStats, setTeamStats] = useState<TeamStats>({
    total_members: 0,
    total_workspaces: 0,
    total_projects: 0,
    storage_used_gb: 0,
    api_calls_this_month: 0,
    active_executions: 0
  })
  const [workspaces, setWorkspaces] = useState<ApiWorkspaceResponse[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  
  // Estado da aba ativa
  const [activeTab, setActiveTab] = useState('overview')

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [workspaceMembers, setWorkspaceMembers] = useState<TeamMember[]>([])

  /**
   * Carrega todos os dados da equipe usando os novos endpoints da API
   */
  const loadTeamData = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      if (isLoadingData) return;
      setIsLoadingData(true);
      if (showRefreshIndicator) setRefreshing(true); else setLoading(true);
      setError(null);

      // Buscar dados em paralelo usando os novos endpoints
      const [statsData, workspacesData, membersData] = await Promise.allSettled([
        apiService.getTeamStats(),
        apiService.getWorkspaces(),
        apiService.getAllTeamMembers()
      ]);

      // Processar estatísticas
      if (statsData.status === 'fulfilled') {
        setTeamStats(statsData.value);
      } else {
        console.error('Erro ao carregar estatísticas:', statsData.reason);
      }

      // Processar workspaces
      if (workspacesData.status === 'fulfilled') {
        const workspacesList = workspacesData.value || [];
        setWorkspaces(workspacesList);
        
        // Selecionar primeiro workspace se não há nenhum selecionado (apenas se não houve seleção manual)
        if (workspacesList.length > 0 && !selectedWorkspaceId) {
          setSelectedWorkspaceId(workspacesList[0].id);
        }
      } else {
        console.error('Erro ao carregar workspaces:', workspacesData.reason);
      }

      // Processar membros
      if (membersData.status === 'fulfilled') {
        const members = membersData.value || [];
        setTeamMembers(members.map(transformWorkspaceMemberToTeamMember));
      } else {
        console.error('Erro ao carregar membros:', membersData.reason);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro geral ao carregar dados da equipe:', err);
      
      toast({
        title: 'Erro ao carregar dados',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingData(false);
    }
  }, [isAuthenticated])

  /**
   * Calcular porcentagem de uso
   */
  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === 0 || limit === -1) return 0
    return Math.min((used / limit) * 100, 100)
  }

  /**
   * Formatar números grandes
   */
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  /**
   * Carrega membros do workspace selecionado
   */
  const loadWorkspaceMembers = useCallback(async (workspaceId: string) => {
    setIsLoadingData(true)
    setError(null)
    try {
      const members = await apiService.getWorkspaceMembers(workspaceId)
      setWorkspaceMembers(members.map(transformWorkspaceMemberToTeamMember))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: 'Erro ao carregar membros',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoadingData(false)
    }
  }, [toast])

  // Carregar dados quando a autenticação estiver inicializada e usuário autenticado (apenas uma vez)
  useEffect(() => {
    if (isInitialized && isAuthenticated && !hasLoadedData.current) {
      hasLoadedData.current = true
      loadTeamData()
    } else if (isInitialized && !isAuthenticated) {
      // Usuário não autenticado, limpar loading
      setLoading(false);
    }
  }, [isInitialized, isAuthenticated, loadTeamData])

  // Carregar membros do workspace selecionado (apenas quando o usuário muda manualmente)
  useEffect(() => {
    if (selectedWorkspaceId && hasLoadedData.current) {
      loadWorkspaceMembers(selectedWorkspaceId)
    }
  }, [selectedWorkspaceId, loadWorkspaceMembers])

  if (loading && !refreshing) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-lg font-medium">Carregando dados da equipe...</h3>
              <p className="text-sm text-muted-foreground">Buscando informações dos workspaces e membros</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error && !refreshing) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4 max-w-md">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Erro ao carregar dados</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => loadTeamData(true)} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Gestão de Equipe
            {refreshing && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie workspaces, membros e monitore o uso dos recursos da sua equipe
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => loadTeamData(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar Dados
          </Button>
          <Button
            variant="outline"
            onClick={() => selectedWorkspaceId && loadWorkspaceMembers(selectedWorkspaceId)}
            disabled={refreshing || !selectedWorkspaceId}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar Membros
          </Button>
          <Button onClick={() => router.push('/workspaces/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Workspace
          </Button>
        </div>
      </div>

      {/* Seletor de workspace */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium">Selecione o workspace</label>
        <Select value={selectedWorkspaceId || ''} onValueChange={setSelectedWorkspaceId}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Selecione um workspace" />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((ws) => (
              <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:inline-flex">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Membros</span>
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Workspaces</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total de Membros */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.total_members}</div>
                <p className="text-xs text-muted-foreground">
                  {limits?.max_members_per_workspace === -1 ? 'Ilimitados' : `de ${limits?.max_members_per_workspace || 0} permitidos`}
                </p>
              </CardContent>
            </Card>

            {/* Total de Workspaces */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workspaces Ativos</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.total_workspaces}</div>
                <p className="text-xs text-muted-foreground">
                  {limits?.max_workspaces === -1 ? 'Ilimitados' : `de ${limits?.max_workspaces || 0} permitidos`}
                </p>
              </CardContent>
            </Card>

            {/* Total de Projetos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.total_projects}</div>
                <p className="text-xs text-muted-foreground">
                  Distribuídos entre os workspaces
                </p>
              </CardContent>
            </Card>

            {/* Armazenamento */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.storage_used_gb.toFixed(1)} GB</div>
                <p className="text-xs text-muted-foreground">
                  {limits?.max_storage_gb === -1 ? 'Ilimitado' : `de ${limits?.max_storage_gb || 0} GB`}
                </p>
              </CardContent>
            </Card>

            {/* API Calls */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chamadas API</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(teamStats.api_calls_this_month)}</div>
                <p className="text-xs text-muted-foreground">
                  {limits?.max_api_requests_per_month === -1 ? 'Ilimitadas' : `de ${formatNumber(limits?.max_api_requests_per_month || 0)}`}
                </p>
              </CardContent>
            </Card>

            {/* Execuções Ativas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Execuções Ativas</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.active_executions}</div>
                <p className="text-xs text-muted-foreground">
                  Processamentos em andamento
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Card do Plano Atual e Uso de Recursos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plano Atual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Plano Atual
                </CardTitle>
                <CardDescription>
                  Informações sobre seu plano e limites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Plano:</span>
                  <Badge variant={currentPlan?.name === 'premium' ? 'default' : 'secondary'}>
                    {currentPlan?.name?.toUpperCase() || 'FREE'}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Membros</span>
                      <span>
                        {teamStats.total_members}
                        {limits?.max_members_per_workspace !== -1 && ` / ${limits?.max_members_per_workspace || 0}`}
                      </span>
                    </div>
                                       {limits?.max_members_per_workspace !== -1 && (
                     <Progress 
                       value={getUsagePercentage(teamStats.total_members, limits?.max_members_per_workspace || 1)} 
                       className="h-2"
                     />
                   )}
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Armazenamento</span>
                      <span>
                        {teamStats.storage_used_gb.toFixed(2)} GB
                        {limits?.max_storage_gb !== -1 && ` / ${limits?.max_storage_gb || 0} GB`}
                      </span>
                    </div>
                    {limits?.max_storage_gb !== -1 && (
                      <Progress 
                        value={getUsagePercentage(teamStats.storage_used_gb, limits?.max_storage_gb || 1)} 
                        className="h-2"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>API Calls</span>
                      <span>
                        {formatNumber(teamStats.api_calls_this_month)}
                        {limits?.max_api_requests_per_month !== -1 && ` / ${formatNumber(limits?.max_api_requests_per_month || 0)}`}
                      </span>
                    </div>
                    {limits?.max_api_requests_per_month !== -1 && (
                      <Progress 
                        value={getUsagePercentage(teamStats.api_calls_this_month, limits?.max_api_requests_per_month || 1)} 
                        className="h-2"
                      />
                    )}
                  </div>
                </div>

                <Separator />

                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => router.push('/settings/billing')}
                >
                  <TrendingUp className="h-4 w-4" />
                  Gerenciar Plano
                </Button>
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Resumo da Atividade
                </CardTitle>
                <CardDescription>
                  Atividade dos workspaces e membros
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Membros ativos</span>
                    </div>
                    <span className="font-medium">{teamStats.total_members}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Execuções hoje</span>
                    </div>
                    <span className="font-medium">{teamStats.active_executions}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Projetos ativos</span>
                    </div>
                    <span className="font-medium">{teamStats.total_projects}</span>
                  </div>
                </div>

                <Separator />

                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => router.push('/analytics')}
                >
                  <BarChart3 className="h-4 w-4" />
                  Ver Analytics Completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba: Membros */}
        <TabsContent value="members">
          <EnhancedMembersTab
            teamMembers={workspaceMembers}
            workspaces={workspaces}
            loading={loading || refreshing || isLoadingData}
            onDataRefresh={() => selectedWorkspaceId && loadWorkspaceMembers(selectedWorkspaceId)}
          />
        </TabsContent>

        {/* Aba: Workspaces */}
        <TabsContent value="workspaces" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Workspaces da Equipe</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie e monitore todos os workspaces da sua organização
              </p>
            </div>
            <Button onClick={() => router.push('/workspaces/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Workspace
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Card key={workspace.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <Badge variant={workspace.status === 'active' ? 'default' : 'secondary'}>
                      {workspace.status}
                    </Badge>
                  </div>
                  {workspace.description && (
                    <CardDescription>{workspace.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Membros:</span>
                      <span className="font-medium">{workspace.member_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Criado em:</span>
                      <span className="font-medium">
                        {new Date(workspace.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => router.push(`/workspaces/${workspace.id}`)}
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      Abrir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/workspaces/${workspace.id}/settings`)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {workspaces.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum workspace encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro workspace para começar a colaborar com sua equipe
              </p>
              <Button onClick={() => router.push('/workspaces/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Workspace
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </ProtectedRoute>
  )
}
