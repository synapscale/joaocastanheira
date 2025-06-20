/**
 * Advanced Workspace Management Dashboard
 * Integrado com sistema de planos, permissões e API oficial
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Settings, 
  Users, 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  Crown, 
  Shield, 
  Eye,
  BarChart3,
  Calendar,
  Mail,
  Building,
  Globe,
  Lock,
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

// Hooks
import { usePlan, usePermissions, useBilling } from '@/context/plan-context'
import { apiService } from '@/lib/api/service'
import type { 
  WorkspaceDetailed, 
  WorkspaceMemberWithRole, 
  Plan, 
  SystemPermissionKey 
} from '@/types/plan-types'

interface Invitation {
  id: string
  email: string
  role: string
  workspace_id: string
  sent_at: string
  expires_at: string
  status: 'pending' | 'accepted' | 'expired' | 'declined'
  invited_by: {
    name: string
    email: string
  }
}

export default function AdvancedWorkspaceManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [workspaces, setWorkspaces] = useState<WorkspaceDetailed[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceDetailed | null>(null)
  const [members, setMembers] = useState<WorkspaceMemberWithRole[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)

  // Context hooks
  const { hasPermission } = usePermissions()
  const { billingInfo, subscription, usage, limits, upgradePlan } = useBilling()
  const { plans, currentPlan } = usePlan()

  // Dialog states
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false)
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' })
  const [newInvitation, setNewInvitation] = useState({ email: '', role: 'member' })

  // ===== LOAD DATA =====

  const loadWorkspaces = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/workspaces/')
      setWorkspaces(response.workspaces || [])
      
      if (response.workspaces?.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(response.workspaces[0])
      }
    } catch (error) {
      console.error('Erro ao carregar workspaces:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWorkspaceMembers = async (workspaceId: string) => {
    try {
      const response = await apiService.get(`/workspaces/${workspaceId}/members`)
      setMembers(response.members || [])
    } catch (error) {
      console.error('Erro ao carregar membros:', error)
    }
  }

  const loadInvitations = async () => {
    try {
      const response = await apiService.get('/workspaces/invitations')
      setInvitations(response.invitations || [])
    } catch (error) {
      console.error('Erro ao carregar convites:', error)
    }
  }

  // ===== ACTIONS =====

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) return
    
    if (!hasPermission('workspace.create')) {
      alert('Você não tem permissão para criar workspaces')
      return
    }

    try {
      setLoading(true)
      const response = await apiService.post('/workspaces/', {
        name: newWorkspace.name,
        description: newWorkspace.description,
        is_public: false
      })
      
      if (response.workspace) {
        setWorkspaces([...workspaces, response.workspace])
        setNewWorkspace({ name: '', description: '' })
        setIsCreateWorkspaceOpen(false)
      }
    } catch (error) {
      console.error('Erro ao criar workspace:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async () => {
    if (!newInvitation.email.trim() || !selectedWorkspace) return
    
    if (!hasPermission('members.invite')) {
      alert('Você não tem permissão para convidar membros')
      return
    }

    try {
      setLoading(true)
      await apiService.post(`/workspaces/${selectedWorkspace.id}/invite`, {
        email: newInvitation.email,
        role: newInvitation.role
      })
      
      setNewInvitation({ email: '', role: 'member' })
      setIsInviteMemberOpen(false)
      await loadInvitations()
    } catch (error) {
      console.error('Erro ao convidar membro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await apiService.post(`/workspaces/invitations/${invitationId}/accept`)
      await loadInvitations()
      await loadWorkspaces()
    } catch (error) {
      console.error('Erro ao aceitar convite:', error)
    }
  }

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await apiService.post(`/workspaces/invitations/${invitationId}/decline`)
      await loadInvitations()
    } catch (error) {
      console.error('Erro ao recusar convite:', error)
    }
  }

  // ===== HELPERS =====

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />
      case 'member': return <Users className="h-4 w-4 text-green-500" />
      case 'viewer': return <Eye className="h-4 w-4 text-gray-500" />
      default: return null
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800'
      case 'pro': return 'bg-blue-100 text-blue-800'
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // ===== EFFECTS =====

  useEffect(() => {
    loadWorkspaces()
    loadInvitations()
  }, [])

  useEffect(() => {
    if (selectedWorkspace) {
      loadWorkspaceMembers(selectedWorkspace.id)
    }
  }, [selectedWorkspace])

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Workspaces</h1>
            <p className="text-muted-foreground">Gerencie seus workspaces, membros e plano</p>
          </div>
          
          {hasPermission('workspace.create') && (
            <Dialog open={isCreateWorkspaceOpen} onOpenChange={setIsCreateWorkspaceOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Workspace</DialogTitle>
                  <DialogDescription>
                    Crie um novo workspace para organizar seus projetos e equipe.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workspace-name">Nome do Workspace</Label>
                    <Input
                      id="workspace-name"
                      value={newWorkspace.name}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                      placeholder="Digite o nome do workspace"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workspace-description">Descrição</Label>
                    <Input
                      id="workspace-description"
                      value={newWorkspace.description}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                      placeholder="Digite a descrição do workspace"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateWorkspaceOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateWorkspace} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Criar Workspace
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Plano & Cobrança
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Workspaces</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workspaces.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Limite: {limits?.max_workspaces === -1 ? 'Ilimitado' : limits?.max_workspaces || 0}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Membros</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{members.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Limite: {limits?.max_members_per_workspace === -1 ? 'Ilimitado' : limits?.max_members_per_workspace || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{currentPlan?.name || 'Free'}</div>
                  <p className="text-xs text-muted-foreground">
                    {subscription?.status === 'active' ? 'Ativo' : 'Inativo'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Convites Pendentes</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{invitations.filter(i => i.status === 'pending').length}</div>
                  <p className="text-xs text-muted-foreground">Aguardando resposta</p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Stats */}
            {usage && limits && (
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Uso</CardTitle>
                  <CardDescription>Uso atual em todos os workspaces</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Projetos</span>
                      <span>{usage.projects_count}/{limits.max_projects_per_workspace === -1 ? '∞' : limits.max_projects_per_workspace}</span>
                    </div>
                    <Progress 
                      value={limits.max_projects_per_workspace === -1 ? 0 : (usage.projects_count / limits.max_projects_per_workspace) * 100} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Armazenamento</span>
                      <span>{usage.storage_used_gb}GB/{limits.max_storage_gb === -1 ? '∞' : `${limits.max_storage_gb}GB`}</span>
                    </div>
                    <Progress 
                      value={limits.max_storage_gb === -1 ? 0 : (usage.storage_used_gb / limits.max_storage_gb) * 100} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Chamadas API</span>
                      <span>{usage.api_requests_count.toLocaleString()}/{limits.max_api_requests_per_month === -1 ? '∞' : limits.max_api_requests_per_month.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={limits.max_api_requests_per_month === -1 ? 0 : (usage.api_requests_count / limits.max_api_requests_per_month) * 100} 
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Workspaces Tab */}
          <TabsContent value="workspaces" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <Card 
                  key={workspace.id} 
                  className={`cursor-pointer transition-colors ${selectedWorkspace?.id === workspace.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedWorkspace(workspace)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <Badge className={getPlanBadgeColor(workspace.subscription?.plan?.slug || 'free')}>
                        {workspace.subscription?.plan?.name || 'Free'}
                      </Badge>
                    </div>
                    <CardDescription>{workspace.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Membros</span>
                        <span>{workspace.member_count}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Projetos</span>
                        <span>{workspace.project_count}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Seu papel</span>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(workspace.current_user_role)}
                          <span className="capitalize">{workspace.current_user_role}</span>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex gap-2">
                        {hasPermission('workspace.edit') && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        )}
                        {workspace.current_user_role === 'owner' && hasPermission('workspace.delete') && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Membros da Equipe</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedWorkspace ? `Workspace: ${selectedWorkspace.name}` : 'Selecione um workspace'}
                </p>
              </div>
              
              {hasPermission('members.invite') && selectedWorkspace && (
                <Dialog open={isInviteMemberOpen} onOpenChange={setIsInviteMemberOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Convidar Membro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Convidar Membro da Equipe</DialogTitle>
                      <DialogDescription>
                        Envie um convite para participar do workspace.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="invite-email">Email</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          value={newInvitation.email}
                          onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                          placeholder="Digite o email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="invite-role">Função</Label>
                        <Select value={newInvitation.role} onValueChange={(value) => setNewInvitation({ ...newInvitation, role: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                            <SelectItem value="member">Membro</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsInviteMemberOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleInviteMember} disabled={loading}>
                        {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Enviar Convite
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {selectedWorkspace && (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Membro</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Entrou em</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.user.avatar} />
                                <AvatarFallback>
                                  {member.user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.user.name}</p>
                                <p className="text-sm text-muted-foreground">{member.user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(member.role.slug)}
                              <span className="capitalize">{member.role.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(member.joined_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {hasPermission('members.edit_roles') && member.role.slug !== 'owner' && (
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {hasPermission('members.remove') && member.role.slug !== 'owner' && (
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Convites Pendentes</CardTitle>
                  <CardDescription>Convites aguardando resposta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{invitation.email}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Função: {invitation.role}</span>
                            <span>Enviado: {new Date(invitation.sent_at).toLocaleDateString()}</span>
                            <span>Expira: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={invitation.status === 'pending' ? 'secondary' : 'outline'}>
                            {invitation.status}
                          </Badge>
                          {invitation.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAcceptInvitation(invitation.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aceitar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeclineInvitation(invitation.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {selectedWorkspace && hasPermission('workspace.manage_settings') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Workspace</CardTitle>
                    <CardDescription>Configure as preferências do workspace</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="workspace-name-setting">Nome do Workspace</Label>
                      <Input id="workspace-name-setting" defaultValue={selectedWorkspace.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workspace-description-setting">Descrição</Label>
                      <Input id="workspace-description-setting" defaultValue={selectedWorkspace.description} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Workspace Público</Label>
                        <p className="text-sm text-muted-foreground">Permitir que qualquer pessoa descubra este workspace</p>
                      </div>
                      <Switch defaultChecked={selectedWorkspace.is_public} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Convites de Membros</Label>
                        <p className="text-sm text-muted-foreground">Permitir que membros convidem outros</p>
                      </div>
                      <Switch defaultChecked={selectedWorkspace.settings?.allow_public_projects} />
                    </div>
                    <Button>Salvar Alterações</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Segurança</CardTitle>
                    <CardDescription>Gerencie segurança e acesso do workspace</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Autenticação de Dois Fatores</Label>
                        <p className="text-sm text-muted-foreground">Exigir 2FA para todos os membros</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Integração SSO</Label>
                        <p className="text-sm text-muted-foreground">Habilitar single sign-on</p>
                      </div>
                      <Switch disabled={!limits?.can_use_sso} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Restrições de IP</Label>
                        <p className="text-sm text-muted-foreground">Limitar acesso a faixas específicas de IP</p>
                      </div>
                      <Switch />
                    </div>
                    <Button>Atualizar Segurança</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedWorkspace?.current_user_role === 'owner' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
                  <CardDescription>Ações irreversíveis e destrutivas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Essas ações não podem ser desfeitas. Prossiga com cautela.
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-600">Deletar Workspace</h4>
                      <p className="text-sm text-muted-foreground">Deletar permanentemente este workspace e todos os seus dados</p>
                    </div>
                    <Button variant="destructive">Deletar Workspace</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Plano Atual</CardTitle>
                  <CardDescription>Detalhes da sua assinatura atual</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold capitalize">{currentPlan?.name || 'Free'}</h3>
                      <p className="text-muted-foreground">
                        {subscription ? `$${subscription.plan.price}/${subscription.plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}` : 'Gratuito'}
                      </p>
                    </div>
                    <Badge className={subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {subscription?.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  {subscription && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Próxima cobrança</span>
                          <span>{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ciclo de cobrança</span>
                          <span className="capitalize">{subscription.plan.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Atualizar Pagamento
                        </Button>
                        <Button variant="outline">
                          <Calendar className="h-4 w-4 mr-2" />
                          Histórico de Cobrança
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {usage && limits && (
                <Card>
                  <CardHeader>
                    <CardTitle>Uso Este Mês</CardTitle>
                    <CardDescription>Estatísticas de uso atual</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Chamadas API</span>
                        <span>{limits.max_api_requests_per_month === -1 ? '0%' : `${((usage.api_requests_count / limits.max_api_requests_per_month) * 100).toFixed(0)}%`}</span>
                      </div>
                      <Progress value={limits.max_api_requests_per_month === -1 ? 0 : (usage.api_requests_count / limits.max_api_requests_per_month) * 100} />
                      <p className="text-xs text-muted-foreground">
                        {usage.api_requests_count.toLocaleString()} de {limits.max_api_requests_per_month === -1 ? '∞' : limits.max_api_requests_per_month.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Armazenamento</span>
                        <span>{limits.max_storage_gb === -1 ? '0%' : `${((usage.storage_used_gb / limits.max_storage_gb) * 100).toFixed(0)}%`}</span>
                      </div>
                      <Progress value={limits.max_storage_gb === -1 ? 0 : (usage.storage_used_gb / limits.max_storage_gb) * 100} />
                      <p className="text-xs text-muted-foreground">
                        {usage.storage_used_gb}GB de {limits.max_storage_gb === -1 ? '∞' : `${limits.max_storage_gb}GB`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Available Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Planos Disponíveis</CardTitle>
                <CardDescription>Escolha o plano que melhor atende às suas necessidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div key={plan.id} className={`border rounded-lg p-6 space-y-4 ${plan.is_featured ? 'border-2 border-blue-500 relative' : ''}`}>
                      {plan.is_featured && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                          Mais Popular
                        </Badge>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        <p className="text-2xl font-bold">
                          ${plan.price}
                          <span className="text-sm font-normal">/{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}</span>
                        </p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>• {plan.limits.max_projects_per_workspace === -1 ? 'Projetos ilimitados' : `Até ${plan.limits.max_projects_per_workspace} projetos`}</li>
                        <li>• {plan.limits.max_storage_gb === -1 ? 'Armazenamento ilimitado' : `${plan.limits.max_storage_gb}GB de armazenamento`}</li>
                        <li>• {plan.limits.max_api_requests_per_month === -1 ? 'Chamadas API ilimitadas' : `${plan.limits.max_api_requests_per_month.toLocaleString()} chamadas API/mês`}</li>
                        <li>• {plan.limits.max_members_per_workspace === -1 ? 'Membros ilimitados' : `Até ${plan.limits.max_members_per_workspace} membros`}</li>
                        {plan.limits.has_priority_support && <li>• Suporte prioritário</li>}
                        {plan.limits.can_use_sso && <li>• Integração SSO</li>}
                      </ul>
                      
                      {currentPlan?.id === plan.id ? (
                        <Button variant="outline" className="w-full" disabled>
                          Plano Atual
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          variant={plan.is_featured ? 'default' : 'outline'}
                          onClick={() => upgradePlan(plan.id)}
                        >
                          {plan.is_featured && <Zap className="h-4 w-4 mr-2" />}
                          {plan.price === 0 ? 'Downgrade' : `Upgrade para ${plan.name}`}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 