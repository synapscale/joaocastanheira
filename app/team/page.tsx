/**
 * Página de Gestão de Equipe e Workspaces
 * Hub completo para gerenciar workspaces, membros, permissões e planos
 */

'use client'

import { useState, useEffect } from 'react'
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
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  Package,
  BarChart3,
  UserPlus,
  Calendar,
  Clock,
  Globe,
  Lock,
  FileText,
  Download,
  Upload,
  Webhook,
  Key,
  Star,
  Activity,
  RefreshCw
} from 'lucide-react'

// Contexts
import { usePlan, useBilling, usePermissions } from '@/context/plan-context'
import { useAuth } from '@/context/auth-context'

// Components
import EnhancedWorkspaceDashboard from '@/components/workspaces/enhanced-workspace-dashboard'
import PlanManagement from '@/components/admin/plan-management'

// API Service
import { apiService } from '@/lib/api/service'
import { useWorkspace, useCurrentWorkspace } from '@/context/workspace-context'

// Types
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

interface TeamStats {
  total_members: number
  active_members: number
  pending_invites: number
  total_workspaces: number
  storage_used: number
  api_calls_used: number
}

export default function TeamPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats>({
    total_members: 0,
    active_members: 0,
    pending_invites: 0,
    total_workspaces: 0,
    storage_used: 0,
    api_calls_used: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Contexts
  const { user, isAuthenticated, isInitialized } = useAuth()
  const { currentPlan, usage, limits } = usePlan()
  const { billingInfo } = useBilling()
  const { hasPermission } = usePermissions()
  const { state: workspaceState } = useWorkspace()
  const currentWorkspace = useCurrentWorkspace()
  
  // Usar dados do WorkspaceContext
  const workspaces = workspaceState.workspaces
  const workspacesLoading = workspaceState.isLoading
  const workspacesError = workspaceState.error

  // DEBUG: Log dos dados do workspace
  useEffect(() => {
    console.log('🔍 DEBUG TeamPage - WorkspaceState:', {
      workspaces: workspaces,
      workspacesCount: workspaces.length,
      workspacesLoading,
      workspacesError,
      isInitialized: workspaceState.isInitialized,
      currentWorkspace,
      user: user?.email
    })
  }, [workspaces, workspacesLoading, workspacesError, workspaceState.isInitialized, currentWorkspace, user])

  // Verificar se é admin
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@synapscale.com'

  // Loading state se não inicializou ainda
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirect se não autenticado
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      console.log('🔐 Usuario não autenticado, redirecionando para /login...')
      router.push('/login')
    }
  }, [isInitialized, isAuthenticated, router])

  // Se não está autenticado, mostrar loading enquanto redireciona
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  // ===== WORKSPACE DATA =====
  // Os workspaces são gerenciados pelo WorkspaceContext automaticamente

  // ===== LOAD TEAM DATA =====

  const loadTeamData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 DEBUG loadTeamData - Carregando dados da equipe...')
      console.log('🔍 DEBUG loadTeamData - User autenticado:', !!user)
      console.log('🔍 DEBUG loadTeamData - User email:', user?.email)
      console.log('🔍 DEBUG loadTeamData - ApiService autenticado:', apiService.isAuthenticated())
      console.log('🔍 DEBUG loadTeamData - Token disponível:', !!apiService.getAccessToken())
      console.log('🔍 DEBUG loadTeamData - Workspaces disponíveis:', workspaces.length)
      console.log('🔍 DEBUG loadTeamData - Workspaces:', workspaces.map(w => ({ id: w.id, name: w.name })))

      // Verificar se há workspaces para processar
      if (workspaces.length === 0) {
        console.log('⚠️ DEBUG loadTeamData - Nenhum workspace encontrado')
        setTeamStats({
          total_members: 0,
          active_members: 0,
          pending_invites: 0,
          total_workspaces: 0,
          storage_used: 0,
          api_calls_used: 0
        })
        setTeamMembers([])
        return
      }

      // Teste de conectividade com a API antes de buscar dados
      try {
        const healthCheck = await apiService.healthCheck()
        console.log('✅ DEBUG loadTeamData - API Health Check:', healthCheck)
      } catch (healthError) {
        console.warn('⚠️ DEBUG loadTeamData - API Health Check failed:', healthError)
      }

      // Carregar estatísticas agregadas, execução e membros em paralelo
      const promises = [
        apiService.getTeamStats().catch(error => {
          console.error('❌ Erro ao carregar team stats:', error)
          throw new Error(`Falha ao carregar estatísticas da equipe: ${error.message}`)
        }),
        apiService.getExecutionStats().catch(error => {
          console.warn('⚠️ Erro ao carregar estatísticas de execução:', error)
          return { total_executions: 0 }
        }),
        ...workspaces.map(workspace => 
          apiService.getWorkspaceMembers(workspace.id).catch(error => {
            console.warn(`⚠️ Erro ao carregar membros do workspace ${workspace.name}:`, error)
            return []
          })
        )
      ]

      console.log('🔍 DEBUG loadTeamData - Executando', promises.length, 'promises em paralelo...')
      
      const [teamStatsFromApi, executionStatsFromApi, ...memberPromises] = await Promise.all(promises)

      console.log('✅ DEBUG loadTeamData - Todas as promises resolvidas')
      console.log('✅ DEBUG loadTeamData - Estatísticas da API:', teamStatsFromApi)
      console.log('✅ DEBUG loadTeamData - Estatísticas de execução:', executionStatsFromApi)
      console.log('✅ DEBUG loadTeamData - Membros por workspace:', memberPromises.map((members, i) => ({ workspace: workspaces[i].name, count: members.length })))

      // Processar membros de todos os workspaces
      let allMembers: TeamMember[] = []
      memberPromises.forEach((members, index) => {
        const workspace = workspaces[index]
        console.log(`🔍 DEBUG loadTeamData - Processando ${members.length} membros do workspace "${workspace.name}"`)
        
        const workspaceMembers: TeamMember[] = members.map(member => ({
          id: `${workspace.id}-${member.id}`,
          name: member.user_name,
          email: member.user_email,
          role: member.role,
          status: member.status === 'active' ? 'active' as const : 'inactive' as const,
          last_activity: member.last_active_at || member.joined_at,
          workspace_count: 1, // Será recalculado abaixo
          created_at: member.joined_at
        }))
        allMembers = [...allMembers, ...workspaceMembers]
      })

      // Remover duplicatas de membros (mesmo usuário em múltiplos workspaces)
      const uniqueMembers = allMembers.reduce((acc: TeamMember[], current) => {
        const exists = acc.find(member => member.email === current.email)
        if (!exists) {
          // Contar em quantos workspaces o usuário está
          const workspaceCount = allMembers.filter(m => m.email === current.email).length
          acc.push({
            ...current,
            workspace_count: workspaceCount
          })
        }
        return acc
      }, [])

      console.log(`✅ DEBUG loadTeamData - Processamento de membros concluído: ${allMembers.length} total, ${uniqueMembers.length} únicos`)

      // Combinar estatísticas da API com dados processados
      const stats: TeamStats = {
        total_members: Math.max(uniqueMembers.length, teamStatsFromApi.total_members),
        active_members: uniqueMembers.filter(m => m.status === 'active').length,
        pending_invites: uniqueMembers.filter(m => m.status === 'pending').length,
        total_workspaces: teamStatsFromApi.total_workspaces,
        storage_used: teamStatsFromApi.total_storage_mb / 1024, // Converter MB para GB
        api_calls_used: executionStatsFromApi.total_executions || 0 // Dados reais de execução da API
      }

      console.log('✅ DEBUG loadTeamData - Estatísticas finais:', stats)
      console.log('✅ DEBUG loadTeamData - Membros únicos:', uniqueMembers.length)

      setTeamMembers(uniqueMembers)
      setTeamStats(stats)

    } catch (err) {
      console.error('❌ DEBUG loadTeamData - Erro detalhado:', err)
      console.error('❌ DEBUG loadTeamData - Stack trace:', (err as Error).stack)
      
      // Mostrar erro mais específico para o usuário
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados da equipe'
      setError(`Erro ao carregar dados da equipe: ${errorMessage}`)
      
      // Analytics de erro (se disponível)
      if ('gtag' in window) {
        (window as any).gtag('event', 'team_data_load_error', {
          error_message: errorMessage,
          user_email: user?.email,
          workspaces_count: workspaces.length
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // ===== EFFECTS =====

  useEffect(() => {
    if (workspaceState.isInitialized && !workspacesLoading) { // Aguardar carregamento dos workspaces
      loadTeamData()
    }
  }, [workspaceState.isInitialized, workspaces, user, workspacesLoading])

  // ===== RENDER HELPERS =====

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Ilimitado
    return Math.min((used / limit) * 100, 100)
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'free': return <Package className="h-5 w-5" />
      case 'pro': return <Zap className="h-5 w-5" />
      case 'enterprise': return <Crown className="h-5 w-5" />
      default: return <Package className="h-5 w-5" />
    }
  }

  const getFeatureBadge = (hasFeature: boolean) => {
    return hasFeature ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Disponível
      </Badge>
    ) : (
      <Badge variant="outline" className="text-gray-500">
        <Lock className="h-3 w-3 mr-1" />
        Upgrade
      </Badge>
    )
  }

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Equipe</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie sua equipe, workspaces e configurações
            </p>
            {/* Badge indicando dados reais */}
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
              ✅ Dados reais da API oficial
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-2">
              {getPlanIcon(currentPlan.slug)}
              {currentPlan.name}
            </Badge>
            {billingInfo?.next_billing_date && (
              <Badge variant="secondary">
                <Calendar className="h-3 w-3 mr-1" />
                Próximo: {new Date(billingInfo.next_billing_date).toLocaleDateString('pt-BR')}
              </Badge>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {workspacesError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Erro ao carregar workspaces: {workspacesError}</AlertDescription>
          </Alert>
        )}

        {/* Status da Conexão com API */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">
                  Status da API
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {teamStats.total_workspaces > 0 ? 
                    `✅ Conectado - ${teamStats.total_workspaces} workspace(s) carregado(s)` : 
                    '⚠️ Aguardando dados...'
                  }
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">
              • Usuário: {user?.email || 'N/A'}<br />
              • Workspaces: {workspaces.length}<br />
              • Membros: {teamStats.total_members}<br />
              • API Calls: {teamStats.api_calls_used} (dados reais de execução)
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.total_workspaces}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {limits.max_workspaces === -1 ? 'Ilimitado' : `de ${limits.max_workspaces}`}
                </p>
                {limits.max_workspaces !== -1 && (
                  <span className="text-xs text-muted-foreground">
                    {getUsagePercentage(teamStats.total_workspaces, limits.max_workspaces).toFixed(0)}%
                  </span>
                )}
              </div>
              {limits.max_workspaces !== -1 && (
                <Progress 
                  value={getUsagePercentage(teamStats.total_workspaces, limits.max_workspaces)} 
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.active_members}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {limits.max_members_per_workspace === -1 ? 'Ilimitado' : `de ${limits.max_members_per_workspace} por workspace`}
                </p>
                {teamStats.pending_invites > 0 && (
                  <span className="text-xs text-blue-600">
                    +{teamStats.pending_invites} pendentes
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.storage_used.toFixed(1)}GB</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {limits.max_storage_gb === -1 ? 'Ilimitado' : `de ${limits.max_storage_gb}GB`}
                </p>
                {limits.max_storage_gb !== -1 && (
                  <span className="text-xs text-muted-foreground">
                    {getUsagePercentage(teamStats.storage_used, limits.max_storage_gb).toFixed(0)}%
                  </span>
                )}
              </div>
              {limits.max_storage_gb !== -1 && (
                <Progress 
                  value={getUsagePercentage(teamStats.storage_used, limits.max_storage_gb)} 
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.api_calls_used}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {limits.max_api_requests_per_month === -1 ? 'Ilimitado' : `de ${limits.max_api_requests_per_month.toLocaleString()} este mês`}
                </p>
                {limits.max_api_requests_per_month !== -1 && (
                  <span className="text-xs text-muted-foreground">
                    {getUsagePercentage(teamStats.api_calls_used, limits.max_api_requests_per_month).toFixed(0)}%
                  </span>
                )}
              </div>
              {limits.max_api_requests_per_month !== -1 && (
                <Progress 
                  value={getUsagePercentage(teamStats.api_calls_used, limits.max_api_requests_per_month)} 
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="workspaces" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Workspaces
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissões
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plan Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getPlanIcon(currentPlan.slug)}
                    Plano Atual: {currentPlan.name}
                  </CardTitle>
                  <CardDescription>{currentPlan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Preço:</span>
                      <p className="font-medium">
                        {currentPlan.price === 0 ? 'Gratuito' : `$${currentPlan.price}/mês`}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Próximo pagamento:</span>
                      <p className="font-medium">
                        {billingInfo ? new Date(billingInfo.next_billing_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recursos Inclusos</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Workspaces:</span>
                        <span className="text-sm font-medium">
                          {limits.max_workspaces === -1 ? 'Ilimitado' : limits.max_workspaces}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Membros por workspace:</span>
                        <span className="text-sm font-medium">
                          {limits.max_members_per_workspace === -1 ? 'Ilimitado' : limits.max_members_per_workspace}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Storage:</span>
                        <span className="text-sm font-medium">
                          {limits.max_storage_gb === -1 ? 'Ilimitado' : `${limits.max_storage_gb}GB`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">API Calls/mês:</span>
                        <span className="text-sm font-medium">
                          {limits.max_api_requests_per_month === -1 ? 'Ilimitado' : limits.max_api_requests_per_month.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {currentPlan.slug === 'free' && (
                    <Button className="w-full">
                      <Crown className="h-4 w-4 mr-2" />
                      Fazer Upgrade
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Últimas ações nos seus workspaces</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.slice(0, 3).map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Ativo há {new Date(member.last_activity).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                    ))}
                    
                    {teamMembers.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma atividade recente
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Uso dos Recursos</CardTitle>
                <CardDescription>Acompanhe o uso dos recursos do seu plano</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Workspaces</span>
                      <span className="text-sm text-muted-foreground">
                        {teamStats.total_workspaces} / {limits.max_workspaces === -1 ? '∞' : limits.max_workspaces}
                      </span>
                    </div>
                    <Progress 
                      value={limits.max_workspaces === -1 ? 0 : getUsagePercentage(teamStats.total_workspaces, limits.max_workspaces)}
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Storage</span>
                      <span className="text-sm text-muted-foreground">
                        {teamStats.storage_used.toFixed(1)}GB / {limits.max_storage_gb === -1 ? '∞' : `${limits.max_storage_gb}GB`}
                      </span>
                    </div>
                    <Progress 
                      value={limits.max_storage_gb === -1 ? 0 : getUsagePercentage(teamStats.storage_used, limits.max_storage_gb)}
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Calls</span>
                      <span className="text-sm text-muted-foreground">
                        {teamStats.api_calls_used} / {limits.max_api_requests_per_month === -1 ? '∞' : limits.max_api_requests_per_month.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={limits.max_api_requests_per_month === -1 ? 0 : getUsagePercentage(teamStats.api_calls_used, limits.max_api_requests_per_month)}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workspaces Tab */}
          <TabsContent value="workspaces" className="space-y-6">
            <EnhancedWorkspaceDashboard />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Membros da Equipe</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie os membros de todos os seus workspaces
                </p>
              </div>
              <Button disabled={!hasPermission('members.invite')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar Membro
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{member.role}</Badge>
                        <Badge className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {member.status === 'active' ? 'Ativo' : 'Pendente'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permissões e Recursos</CardTitle>
                <CardDescription>
                  Recursos disponíveis baseados no seu plano atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Recursos Básicos</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Criar Workspaces</span>
                        {getFeatureBadge(hasPermission('workspace.create'))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Convidar Membros</span>
                        {getFeatureBadge(hasPermission('members.invite'))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Acesso à API</span>
                        {getFeatureBadge(hasPermission('api.use'))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Recursos Avançados</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Roles Customizadas</span>
                        {getFeatureBadge(hasPermission('custom_roles.create'))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Exportar Dados</span>
                        {getFeatureBadge(hasPermission('data.export'))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Webhooks</span>
                        {getFeatureBadge(hasPermission('webhooks.use'))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Integrações</span>
                        {getFeatureBadge(hasPermission('integrations.use'))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SSO</span>
                        {getFeatureBadge(hasPermission('sso.use'))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {currentPlan.slug === 'free' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Desbloqueie mais recursos</h4>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                      Faça upgrade para o plano Pro ou Enterprise para acessar recursos avançados como roles customizadas, webhooks e integrações.
                    </p>
                    <Button>
                      Ver Planos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          {isAdmin && (
            <TabsContent value="admin">
              <PlanManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
