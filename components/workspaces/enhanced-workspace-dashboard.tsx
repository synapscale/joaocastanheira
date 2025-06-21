'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Building, Users, Package, Search, Settings, Trash2, Calendar, Globe, Lock, Activity, Zap, BarChart3, Star, Filter, UserPlus, Archive } from 'lucide-react'
import { apiService } from '@/lib/api/service'
import { toast } from 'sonner'
import type { 
  Workspace, 
  WorkspaceStats, 
  WorkspaceMember, 
  WorkspaceSearchParams,
  WorkspaceCreationRules,
  WorkspaceCreate,
  ActivityResponse,
  WorkspaceType 
} from '@/types/workspace-types'

/**
 * Dashboard avançado de Workspaces com múltiplas abas
 * (versão enxuta, sem código duplicado)
 */

export default function EnhancedWorkspaceDashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [workspaceStats, setWorkspaceStats] = useState<WorkspaceStats | null>(null)
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([])
  const [workspaceActivities, setWorkspaceActivities] = useState<ActivityResponse[]>([])
  const [creationRules, setCreationRules] = useState<WorkspaceCreationRules | null>(null)
  const [filterType, setFilterType] = useState<WorkspaceType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'activity' | 'members' | 'projects' | 'created' | 'name'>('activity')

  useEffect(() => {
    loadWorkspaces()
    loadCreationRules()
  }, [])

  useEffect(() => {
    filterWorkspaces()
  }, [workspaces, searchQuery, filterType, sortBy])

  const loadWorkspaces = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 DEBUG loadWorkspaces - Iniciando carregamento...');
      console.log('🔍 DEBUG loadWorkspaces - ApiService autenticado:', apiService.isAuthenticated());
      console.log('🔍 DEBUG loadWorkspaces - Token disponível:', !!apiService.getAccessToken());
      
      // Verificar localStorage
      const localStorageToken = localStorage.getItem('synapsefrontend_auth_token');
      const refreshToken = localStorage.getItem('synapsefrontend_refresh_token');
      console.log('🔍 DEBUG localStorage tokens:', {
        hasAccessToken: !!localStorageToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPrefix: localStorageToken?.substring(0, 20) + '...',
        refreshTokenPrefix: refreshToken?.substring(0, 20) + '...'
      });
      
      const searchParams: WorkspaceSearchParams = {
        sort_by: sortBy,
        limit: 50
      }

      if (filterType !== 'all') {
        // Note: Filtro por tipo será implementado quando a API suportar
      }

      console.log('🔍 DEBUG loadWorkspaces - Parâmetros:', searchParams);
      
      // Tentar sincronizar tokens se não estiver autenticado
      if (!apiService.isAuthenticated() && localStorageToken && refreshToken) {
        console.log('🔄 DEBUG loadWorkspaces - Sincronizando tokens...');
        apiService.syncTokensWithAuthService(localStorageToken, refreshToken);
      }
      
      // Testar conectividade se necessário
      if (!apiService.isAuthenticated()) {
        console.log('❌ DEBUG loadWorkspaces - Usuário não autenticado após sincronização');
        toast.error('Usuário não autenticado. Faça login novamente.');
        return;
      }
      
      const workspacesData = await apiService.getWorkspaces(searchParams)
      
      console.log('✅ Workspaces carregados:', {
        count: workspacesData?.length || 0,
        data: workspacesData
      });
      
      setWorkspaces(workspacesData || [])
    } catch (error) {
      console.error('❌ Erro ao carregar workspaces:', error)
      console.log('🔍 DEBUG loadWorkspaces - Erro detalhado:', error);
      toast.error('Erro ao carregar workspaces')
    } finally {
      setLoading(false)
    }
  }

  const loadCreationRules = async () => {
    try {
      const rules = await apiService.getWorkspaceCreationRules()
      setCreationRules(rules)
    } catch (error) {
      console.warn('⚠️ Erro ao carregar regras de criação (fallback aplicado):', error)
      // API service will handle the fallback, but this catch is for any unexpected errors
    }
  }

  const filterWorkspaces = () => {
    let filtered = [...workspaces]

    // Filtro por pesquisa
    if (searchQuery) {
      filtered = filtered.filter(workspace => 
        workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(workspace => workspace.type === filterType)
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'members':
          return b.member_count - a.member_count
        case 'projects':
          return b.project_count - a.project_count
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'activity':
        default:
          return new Date(b.last_activity_at || b.updated_at).getTime() - 
                 new Date(a.last_activity_at || a.updated_at).getTime()
      }
    })

    setFilteredWorkspaces(filtered)
  }

  const loadWorkspaceDetails = async (workspace: Workspace) => {
    try {
      setSelectedWorkspace(workspace)
      
      // Carregar dados em paralelo
      const [stats, members, activities] = await Promise.all([
        apiService.getWorkspaceStats(workspace.id),
        apiService.getWorkspaceMembers(workspace.id),
        apiService.getWorkspaceActivities(workspace.id, { limit: 10 })
      ])

      setWorkspaceStats(stats)
      setWorkspaceMembers(members)
      setWorkspaceActivities(activities)
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes do workspace:', error)
      toast.error('Erro ao carregar detalhes do workspace')
    }
  }

  const handleCreateWorkspace = async () => {
    if (!creationRules?.can_create) {
      toast.error('Você não pode criar mais workspaces no seu plano atual')
      return
    }

    // Implementar criação de workspace
    toast.info('Funcionalidade de criação em desenvolvimento')
  }

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este workspace?')) return

    try {
      await apiService.deleteWorkspace(workspaceId)
      toast.success('Workspace excluído com sucesso')
      loadWorkspaces()
      setSelectedWorkspace(null)
    } catch (error) {
      console.error('❌ Erro ao excluir workspace:', error)
      toast.error('Erro ao excluir workspace')
    }
  }

  const getWorkspaceTypeColor = (type: WorkspaceType) => {
    switch (type) {
      case 'individual': return 'bg-blue-100 text-blue-800'
      case 'team': return 'bg-green-100 text-green-800'
      case 'organization': return 'bg-purple-100 text-purple-800'
      case 'enterprise': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getWorkspaceTypeIcon = (type: WorkspaceType) => {
    switch (type) {
      case 'individual': return <Users className="h-4 w-4" />
      case 'team': return <Building className="h-4 w-4" />
      case 'organization': return <Globe className="h-4 w-4" />
      case 'enterprise': return <Star className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com informações do plano */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Seus Workspaces</h2>
          <p className="text-muted-foreground">
            Gerencie e organize seus projetos em workspaces colaborativos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {creationRules && (
            <div className="text-sm text-muted-foreground">
              {creationRules.current_workspaces}/{creationRules.max_workspaces || '∞'} workspaces
            </div>
          )}
          <Button onClick={handleCreateWorkspace} disabled={!creationRules?.can_create}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Workspace
          </Button>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as WorkspaceType | 'all')}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">Todos os tipos</option>
            <option value="individual">Individual</option>
            <option value="team">Equipe</option>
            <option value="organization">Organização</option>
            <option value="enterprise">Empresa</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="activity">Atividade</option>
            <option value="name">Nome</option>
            <option value="members">Membros</option>
            <option value="projects">Projetos</option>
            <option value="created">Data de criação</option>
          </select>
        </div>
      </div>

      {/* Lista de workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkspaces.map((workspace) => (
          <Card 
            key={workspace.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => loadWorkspaceDetails(workspace)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {workspace.avatar_url ? (
                    <img 
                      src={workspace.avatar_url} 
                      alt={workspace.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: workspace.color || '#6366f1' }}
                    >
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getWorkspaceTypeColor(workspace.type)}`}
                    >
                      {getWorkspaceTypeIcon(workspace.type)}
                      <span className="ml-1 capitalize">{workspace.type}</span>
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {workspace.is_public && <Globe className="h-4 w-4 text-blue-500" />}
                  {!workspace.is_public && <Lock className="h-4 w-4 text-gray-500" />}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4 line-clamp-2">
                {workspace.description || 'Sem descrição'}
              </CardDescription>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {workspace.member_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {workspace.project_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      {workspace.activity_count}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {workspace.last_activity_at 
                      ? `Ativo há ${new Date(workspace.last_activity_at).toLocaleDateString()}`
                      : `Criado em ${new Date(workspace.created_at).toLocaleDateString()}`
                    }
                  </span>
                  <Badge variant={workspace.status === 'active' ? 'default' : 'secondary'}>
                    {workspace.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workspace vazio */}
      {filteredWorkspaces.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchQuery ? 'Nenhum workspace encontrado' : 'Você ainda não tem workspaces'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Tente ajustar sua busca ou filtros'
              : 'Crie seu primeiro workspace para começar a colaborar'
            }
          </p>
          {!searchQuery && (
            <Button onClick={handleCreateWorkspace} disabled={!creationRules?.can_create}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Workspace
            </Button>
          )}
        </div>
      )}

      {/* Modal/Painel de detalhes do workspace selecionado */}
      {selectedWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {selectedWorkspace.avatar_url ? (
                  <img 
                    src={selectedWorkspace.avatar_url} 
                    alt={selectedWorkspace.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: selectedWorkspace.color || '#6366f1' }}
                  >
                    {selectedWorkspace.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold">{selectedWorkspace.name}</h2>
                  <p className="text-muted-foreground">{selectedWorkspace.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteWorkspace(selectedWorkspace.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedWorkspace(null)}>
                  ✕
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Estatísticas */}
              {workspaceStats && (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Membros</p>
                          <p className="text-2xl font-bold">{workspaceStats.member_count}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Projetos</p>
                          <p className="text-2xl font-bold">{workspaceStats.project_count}</p>
                        </div>
                        <Package className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Armazenamento</p>
                          <p className="text-2xl font-bold">{Math.round(workspaceStats.storage_used_mb)}MB</p>
                          <p className="text-xs text-muted-foreground">
                            de {workspaceStats.storage_limit_mb}MB
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Membros */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Membros ({workspaceMembers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workspaceMembers.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {member.user_avatar ? (
                            <img 
                              src={member.user_avatar} 
                              alt={member.user_name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              {member.user_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{member.user_name}</p>
                            <p className="text-sm text-muted-foreground">{member.user_email}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                    {workspaceMembers.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{workspaceMembers.length - 5} membros adicionais
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Atividades recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Atividades Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workspaceActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user_name}</span>{' '}
                            {activity.action}{' '}
                            {activity.resource_name && (
                              <span className="font-medium">{activity.resource_name}</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {workspaceActivities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma atividade recente
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 