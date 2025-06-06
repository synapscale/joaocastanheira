/**
 * Componente de Workspaces
 * Criado por José - O melhor Full Stack do mundo
 * Sistema completo de colaboração em equipe
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Users, Settings, Search, MoreVertical, Crown, UserPlus, Calendar, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface Workspace {
  id: number
  name: string
  description: string
  slug: string
  is_public: boolean
  owner: {
    id: number
    name: string
    email: string
    avatar?: string
  }
  member_count: number
  project_count: number
  role: 'owner' | 'admin' | 'member'
  created_at: string
  updated_at: string
}

interface WorkspaceMember {
  id: number
  user: {
    id: number
    name: string
    email: string
    avatar?: string
  }
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

interface Project {
  id: number
  name: string
  description: string
  status: 'active' | 'archived' | 'draft'
  owner: {
    id: number
    name: string
    avatar?: string
  }
  collaborator_count: number
  updated_at: string
}

export function WorkspacesComponent() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    is_public: false
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const { toast } = useToast()

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceDetails(selectedWorkspace.id)
    }
  }, [selectedWorkspace])

  const fetchWorkspaces = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workspaces')
      if (response.ok) {
        const data = await response.json()
        setWorkspaces(data.workspaces || [])
        if (data.workspaces.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(data.workspaces[0])
        }
      }
    } catch (error) {
      console.error('Erro ao buscar workspaces:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar workspaces",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkspaceDetails = async (workspaceId: number) => {
    try {
      const [membersResponse, projectsResponse] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/members`),
        fetch(`/api/workspaces/${workspaceId}/projects`)
      ])

      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        setMembers(membersData.members || [])
      }

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.projects || [])
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do workspace:', error)
    }
  }

  const createWorkspace = async () => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWorkspace)
      })

      if (response.ok) {
        const workspace = await response.json()
        setWorkspaces([workspace, ...workspaces])
        setSelectedWorkspace(workspace)
        setShowCreateDialog(false)
        setNewWorkspace({ name: '', description: '', is_public: false })
        
        toast({
          title: "Workspace criado",
          description: "Seu novo workspace foi criado com sucesso"
        })
      }
    } catch (error) {
      console.error('Erro ao criar workspace:', error)
      toast({
        title: "Erro",
        description: "Falha ao criar workspace",
        variant: "destructive"
      })
    }
  }

  const inviteMember = async () => {
    if (!selectedWorkspace) return

    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspace.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        })
      })

      if (response.ok) {
        setShowInviteDialog(false)
        setInviteEmail('')
        setInviteRole('member')
        
        toast({
          title: "Convite enviado",
          description: `Convite enviado para ${inviteEmail}`
        })
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error)
      toast({
        title: "Erro",
        description: "Falha ao enviar convite",
        variant: "destructive"
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin':
        return <Settings className="w-4 h-4 text-blue-500" />
      default:
        return <Users className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      owner: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={variants[role as keyof typeof variants]}>
        {role === 'owner' ? 'Proprietário' : role === 'admin' ? 'Admin' : 'Membro'}
      </Badge>
    )
  }

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspace.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Workspaces */}
        <div className="lg:w-80">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Meus Workspaces</CardTitle>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Workspace</DialogTitle>
                      <DialogDescription>
                        Crie um workspace para colaborar com sua equipe
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={newWorkspace.name}
                          onChange={(e) => setNewWorkspace({...newWorkspace, name: e.target.value})}
                          placeholder="Nome do workspace"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={newWorkspace.description}
                          onChange={(e) => setNewWorkspace({...newWorkspace, description: e.target.value})}
                          placeholder="Descreva o propósito do workspace"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="public"
                          checked={newWorkspace.is_public}
                          onCheckedChange={(checked) => setNewWorkspace({...newWorkspace, is_public: checked})}
                        />
                        <Label htmlFor="public">Workspace público</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={createWorkspace} disabled={!newWorkspace.name}>
                        Criar Workspace
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {filteredWorkspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
                      selectedWorkspace?.id === workspace.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-transparent'
                    }`}
                    onClick={() => setSelectedWorkspace(workspace)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{workspace.name}</h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {workspace.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {workspace.member_count}
                          </span>
                          <span>{workspace.project_count} projetos</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getRoleIcon(workspace.role)}
                        {workspace.is_public && (
                          <Badge variant="outline" className="text-xs">Público</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {selectedWorkspace ? (
            <div className="space-y-8">
              {/* Header do Workspace */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedWorkspace.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {selectedWorkspace.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={selectedWorkspace.owner.avatar} />
                            <AvatarFallback>{selectedWorkspace.owner.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">
                            Criado por {selectedWorkspace.owner.name}
                          </span>
                        </div>
                        {getRoleBadge(selectedWorkspace.role)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(selectedWorkspace.role === 'owner' || selectedWorkspace.role === 'admin') && (
                        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                          <DialogTrigger asChild>
                            <Button>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Convidar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Convidar Membro</DialogTitle>
                              <DialogDescription>
                                Convide alguém para colaborar neste workspace
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  placeholder="email@exemplo.com"
                                />
                              </div>
                              <div>
                                <Label htmlFor="role">Função</Label>
                                <select
                                  id="role"
                                  value={inviteRole}
                                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                                  className="w-full p-2 border rounded-md"
                                >
                                  <option value="member">Membro</option>
                                  <option value="admin">Administrador</option>
                                </select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={inviteMember} disabled={!inviteEmail}>
                                Enviar Convite
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Configurações
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="w-4 h-4 mr-2" />
                            Atividades
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Tabs de Conteúdo */}
              <Tabs defaultValue="projects">
                <TabsList>
                  <TabsTrigger value="projects">Projetos</TabsTrigger>
                  <TabsTrigger value="members">Membros</TabsTrigger>
                  <TabsTrigger value="activity">Atividades</TabsTrigger>
                </TabsList>

                <TabsContent value="projects" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Projetos</h3>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Projeto
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                              {project.status === 'active' ? 'Ativo' : 
                               project.status === 'archived' ? 'Arquivado' : 'Rascunho'}
                            </Badge>
                          </div>
                          <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={project.owner.avatar} />
                                <AvatarFallback>{project.owner.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>{project.owner.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {project.collaborator_count}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">
                            Abrir Projeto
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  {projects.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Calendar className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum projeto ainda
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Crie seu primeiro projeto para começar a colaborar
                      </p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Projeto
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="members" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Membros ({members.length})</h3>
                  </div>

                  <div className="space-y-4">
                    {members.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.user.avatar} />
                                <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{member.user.name}</h4>
                                <p className="text-sm text-gray-600">{member.user.email}</p>
                                <p className="text-xs text-gray-500">
                                  Membro desde {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getRoleBadge(member.role)}
                              {getRoleIcon(member.role)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <h3 className="text-lg font-medium">Atividades Recentes</h3>
                  
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Activity className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma atividade recente
                    </h3>
                    <p className="text-gray-600">
                      As atividades do workspace aparecerão aqui
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione um workspace
              </h3>
              <p className="text-gray-600">
                Escolha um workspace na barra lateral para ver os detalhes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

