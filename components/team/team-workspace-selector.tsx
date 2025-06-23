'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building, Users, Activity } from 'lucide-react'
import type { WorkspaceResponse } from '@/types/workspace-types'

interface WorkspaceSelectorProps {
  workspaces: WorkspaceResponse[]
  selectedId: string
  onSelect: (workspaceId: string) => void
  loading?: boolean
}

export default function TeamWorkspaceSelector({ 
  workspaces, 
  selectedId, 
  onSelect, 
  loading = false 
}: WorkspaceSelectorProps) {
  const selectedWorkspace = workspaces.find(w => w.id === selectedId)

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Selecionar Workspace
            </h4>
            <p className="text-sm text-muted-foreground">
              Escolha um workspace para gerenciar seus membros específicos
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="space-y-4">
          <Select 
            value={selectedId || 'all'} 
            onValueChange={onSelect}
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ver todos os membros (agregado)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Todos os Workspaces (Visão Agregada)</span>
                </div>
              </SelectItem>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{workspace.name}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {workspace.member_count} membro{workspace.member_count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Informações do workspace selecionado */}
          {selectedWorkspace && (
            <div className="p-3 bg-muted rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedWorkspace.name}</p>
                  {selectedWorkspace.description && (
                    <p className="text-sm text-muted-foreground">{selectedWorkspace.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {selectedWorkspace.member_count} membros
                    </div>
                    <Badge 
                      variant={selectedWorkspace.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {selectedWorkspace.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 