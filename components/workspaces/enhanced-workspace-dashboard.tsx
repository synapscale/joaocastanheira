'use client'
import React, { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { RefreshCw, Building, Users, Package } from 'lucide-react'
import { apiService } from '@/lib/api/service'
import type { Workspace, WorkspaceMember } from '@/types/workspace-types'

/**
 * Dashboard avançado de Workspaces com múltiplas abas
 * (versão enxuta, sem código duplicado)
 */

export default function EnhancedWorkspaceDashboard() {
  const [tab, setTab] = useState<'overview' | 'workspaces' | 'members'>('overview')
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selected, setSelected] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [loading, setLoading] = useState(false)

  // -------- API LOADERS --------
  const loadWorkspaces = async () => {
    try {
      setLoading(true)
      const data = await apiService.getWorkspaces()
      setWorkspaces(data)
      if (data.length && !selected) {
        setSelected(data[0])
      }
    } catch (err) {
      console.error('Erro ao carregar workspaces', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async (workspaceId: string | number) => {
    try {
      const data = await apiService.getWorkspaceMembers(workspaceId)
      setMembers(data)
    } catch (err) {
      console.error('Erro ao carregar membros', err)
    }
  }

  // -------- EFFECTS --------
  useEffect(() => {
    loadWorkspaces()
  }, [])

  useEffect(() => {
    if (selected) {
      loadMembers(selected.id)
    }
  }, [selected])

  // -------- RENDER HELPERS --------
  const Overview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-4 h-4" /> Workspaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{workspaces.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Membros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{members.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-4 h-4" /> Projetos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{selected?.project_count ?? 0}</p>
        </CardContent>
      </Card>
    </div>
  )

  const WorkspacesTab = () => (
    <div className="space-y-4">
      {workspaces.map(ws => (
        <Card key={ws.id} className="cursor-pointer" onClick={() => setSelected(ws)}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{ws.name}</CardTitle>
              <CardDescription>{ws.description}</CardDescription>
            </div>
            <Badge variant={selected?.id === ws.id ? 'default' : 'secondary'}>
              {ws.is_public ? 'Público' : 'Privado'}
            </Badge>
          </CardHeader>
        </Card>
      ))}
      {!workspaces.length && <p>Nenhum workspace encontrado.</p>}
    </div>
  )

  const MembersTab = () => (
    <div>
      {!selected && <p>Selecione um workspace para ver os membros.</p>}
      {selected && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(m => (
              <TableRow key={m.id}>
                <TableCell>{m.user_name}</TableCell>
                <TableCell>{m.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciamento de Workspaces</h1>
        <Button variant="outline" onClick={loadWorkspaces} disabled={loading}>
          {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
          Atualizar
        </Button>
      </div>

      <Tabs value={tab} onValueChange={v => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Overview /></TabsContent>
        <TabsContent value="workspaces"><WorkspacesTab /></TabsContent>
        <TabsContent value="members"><MembersTab /></TabsContent>
      </Tabs>
    </div>
  )
} 