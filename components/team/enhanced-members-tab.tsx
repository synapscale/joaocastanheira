'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserPlus, Users, Search, Filter, Crown, Shield, AlertTriangle, Activity } from 'lucide-react'
import { usePermissions } from '@/context/plan-context'
import { useAuth } from '@/context/auth-context'
import type { WorkspaceResponse } from '@/types/workspace-types'

// Import our new components
import TeamWorkspaceSelector from './team-workspace-selector'
import InviteMemberModal from './invite-member-modal'
import EditMemberModal from './edit-member-modal'
import RemoveMemberModal from './remove-member-modal'
import MemberActionsDropdown from './member-actions-dropdown'

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

interface EnhancedMembersTabProps {
  teamMembers: TeamMember[]
  workspaces: WorkspaceResponse[]
  loading: boolean
  onDataRefresh: () => void
}

export default function EnhancedMembersTab({ 
  teamMembers, 
  workspaces, 
  loading, 
  onDataRefresh 
}: EnhancedMembersTabProps) {
  // State management
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'admin' | 'member' | 'viewer'>('all')
  
  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  // Context hooks
  const { hasPermission } = usePermissions()
  const { user } = useAuth()

  // Get selected workspace
  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId)

  // Filter and search members
  const filteredMembers = useMemo(() => {
    let filtered = teamMembers

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter)
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter)
    }

    return filtered
  }, [teamMembers, searchTerm, statusFilter, roleFilter])

  // Handle modal actions
  const handleInviteMember = () => {
    if (!selectedWorkspaceId) {
      alert('Selecione um workspace específico para convidar membros')
      return
    }
    setIsInviteModalOpen(true)
  }

  const handleEditMember = (member: TeamMember) => {
    if (!selectedWorkspaceId) {
      alert('Selecione um workspace específico para editar membros')
      return
    }
    setSelectedMember(member)
    setIsEditModalOpen(true)
  }

  const handleRemoveMember = (member: TeamMember) => {
    if (!selectedWorkspaceId) {
      alert('Selecione um workspace específico para remover membros')
      return
    }
    setSelectedMember(member)
    setIsRemoveModalOpen(true)
  }

  const handleModalClose = () => {
    setIsInviteModalOpen(false)
    setIsEditModalOpen(false)
    setIsRemoveModalOpen(false)
    setSelectedMember(null)
  }

  const handleDataRefresh = () => {
    onDataRefresh()
  }

  // Get role icon and color
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />
      default: return <Users className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      active: 'Ativo',
      pending: 'Pendente',
      inactive: 'Inativo'
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.inactive}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Membros da Equipe</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os membros {selectedWorkspace ? `do workspace "${selectedWorkspace.name}"` : 'de todos os seus workspaces'}
          </p>
        </div>
        <Button 
          onClick={handleInviteMember}
          disabled={!hasPermission('members.invite') || loading}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar Membro
        </Button>
      </div>

      {/* Workspace Selector */}
      <TeamWorkspaceSelector
        workspaces={workspaces}
        selectedId={selectedWorkspaceId}
        onSelect={setSelectedWorkspaceId}
        loading={loading}
      />

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Membros</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <Label>Função</Label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todas as Funções</option>
                <option value="owner">Proprietário</option>
                <option value="admin">Administrador</option>
                <option value="member">Membro</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label>Resumo</Label>
              <div className="text-sm space-y-1">
                <p><strong>Total:</strong> {filteredMembers.length} membros</p>
                <p><strong>Ativos:</strong> {filteredMembers.filter(m => m.status === 'active').length}</p>
                <p><strong>Pendentes:</strong> {filteredMembers.filter(m => m.status === 'pending').length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Membros
            <Badge variant="outline">{filteredMembers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              <span className="ml-2">Carregando membros...</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center p-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {teamMembers.length === 0 
                  ? 'Nenhum membro encontrado' 
                  : 'Nenhum membro corresponde aos filtros aplicados'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getRoleIcon(member.role)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        {member.email === user?.email && (
                          <Badge variant="outline" className="text-xs">Você</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {member.workspace_count} workspace{member.workspace_count !== 1 ? 's' : ''}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Última atividade: {new Date(member.last_activity).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      {member.role}
                    </Badge>
                    {getStatusBadge(member.status)}
                    <MemberActionsDropdown
                      member={member}
                      workspaceId={selectedWorkspaceId}
                      onEditMember={handleEditMember}
                      onRemoveMember={handleRemoveMember}
                      onMemberUpdated={handleDataRefresh}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workspace Limitation Warning */}
      {!selectedWorkspaceId || selectedWorkspaceId === 'all' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Visualização Agregada:</strong> Você está vendo todos os membros de todos os workspaces. 
            Para convidar, editar ou remover membros, selecione um workspace específico acima.
          </AlertDescription>
        </Alert>
      )}

      {/* Activity Summary */}
      {selectedWorkspace && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade do Workspace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{selectedWorkspace.member_count}</p>
                <p className="text-sm text-muted-foreground">Total de Membros</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredMembers.filter(m => m.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Membros Ativos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredMembers.filter(m => m.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Convites Pendentes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {selectedWorkspace.status === 'active' ? 'Ativo' : 'Inativo'}
                </p>
                <p className="text-sm text-muted-foreground">Status do Workspace</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={handleModalClose}
        workspaceId={selectedWorkspaceId}
        workspace={selectedWorkspace}
        onSuccess={handleDataRefresh}
      />

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        member={selectedMember}
        workspaceId={selectedWorkspaceId}
        onSuccess={handleDataRefresh}
      />

      <RemoveMemberModal
        isOpen={isRemoveModalOpen}
        onClose={handleModalClose}
        member={selectedMember}
        workspaceId={selectedWorkspaceId}
        onSuccess={handleDataRefresh}
      />
    </div>
  )
} 