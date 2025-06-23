"use client"

import React, { useState } from 'react'
import { Check, ChevronsUpDown, Plus, Building, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useWorkspace, useCurrentWorkspace } from '@/context/workspace-context'
import { useWorkspacePermissions } from '@/hooks/use-workspace-permissions'
import { WorkspaceLimitModal, useWorkspaceLimitModal } from '@/components/ui/workspace-limit-modal'
import { cn } from '@/lib/utils'

interface WorkspaceSelectorProps {
  className?: string
  showCreateButton?: boolean
  onCreateWorkspace?: () => void
}

export function WorkspaceSelector({ 
  className, 
  showCreateButton = true, 
  onCreateWorkspace 
}: WorkspaceSelectorProps) {
  const [open, setOpen] = useState(false)
  const { state, setCurrentWorkspace, getWorkspaces } = useWorkspace()
  const currentWorkspace = useCurrentWorkspace()
  const workspaces = getWorkspaces()
  const { 
    validateWorkspaceCreation, 
    isNearLimit, 
    isAtLimit, 
    getLimitStatus 
  } = useWorkspacePermissions()
  const { isOpen: isLimitModalOpen, limitData, showLimitModal, hideLimitModal } = useWorkspaceLimitModal()

  const handleWorkspaceSelect = (workspace: any) => {
    setCurrentWorkspace(workspace)
    setOpen(false)
  }

  const handleCreateWorkspace = () => {
    if (!validateWorkspaceCreation()) {
      return // Modal de limite será mostrado pelo hook
    }
    
    setOpen(false)
    onCreateWorkspace?.()
  }

  const limitStatus = getLimitStatus()

  const getWorkspaceInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getWorkspaceColor = (color?: string) => {
    return color || '#3B82F6'
  }

  if (state.isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-8 h-8 bg-muted rounded-lg"></div>
          <div className="w-32 h-4 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!currentWorkspace) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building className="h-4 w-4" />
          <span className="text-sm">Nenhum workspace</span>
        </div>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between min-w-[200px] max-w-[300px]", className)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentWorkspace.avatar_url} alt={currentWorkspace.name} />
              <AvatarFallback 
                className="text-xs font-medium"
                style={{ backgroundColor: getWorkspaceColor(currentWorkspace.color) + '20' }}
              >
                {getWorkspaceInitials(currentWorkspace.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium truncate">
                {currentWorkspace.name}
              </span>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {currentWorkspace.member_count} membro{currentWorkspace.member_count !== 1 ? 's' : ''}
                </Badge>
                {currentWorkspace.is_public && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    Público
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar workspace..." />
          <CommandEmpty>Nenhum workspace encontrado.</CommandEmpty>
          
          <CommandGroup heading="Workspaces">
            {workspaces.map((workspace) => (
              <CommandItem
                key={workspace.id}
                value={workspace.name}
                onSelect={() => handleWorkspaceSelect(workspace)}
                className="flex items-center gap-2 p-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={workspace.avatar_url} alt={workspace.name} />
                  <AvatarFallback 
                    className="text-xs font-medium"
                    style={{ backgroundColor: getWorkspaceColor(workspace.color) + '20' }}
                  >
                    {getWorkspaceInitials(workspace.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{workspace.name}</span>
                    {workspace.id === currentWorkspace?.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {workspace.member_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {workspace.project_count}
                    </div>
                    {workspace.is_public && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Público
                      </Badge>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          
          {showCreateButton && (
            <>
              <Separator />
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateWorkspace}
                  className={cn(
                    "flex items-center gap-2 p-2",
                    isAtLimit('workspaces') ? "text-muted-foreground cursor-not-allowed" : "text-primary"
                  )}
                  disabled={isAtLimit('workspaces')}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg border-2 border-dashed",
                    isAtLimit('workspaces') ? "border-muted-foreground/30" : "border-primary/50"
                  )}>
                    <Plus className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">Criar novo workspace</span>
                    {limitStatus && limitStatus.workspaces.max !== -1 && (
                      <div className="text-xs text-muted-foreground">
                        {limitStatus.workspaces.current} de {limitStatus.workspaces.max} utilizados
                        {isNearLimit('workspaces') && !isAtLimit('workspaces') && (
                          <span className="text-orange-500 ml-1">• Próximo ao limite</span>
                        )}
                        {isAtLimit('workspaces') && (
                          <span className="text-red-500 ml-1">• Limite atingido</span>
                        )}
                      </div>
                    )}
                  </div>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
      
      {/* Modal de limite */}
      {limitData && (
        <WorkspaceLimitModal
          isOpen={isLimitModalOpen}
          onClose={hideLimitModal}
          limitType={limitData.limitType}
          currentCount={limitData.currentCount}
          maxAllowed={limitData.maxAllowed}
          planName={limitData.planName}
          onUpgrade={() => {
            hideLimitModal()
            // Aqui você pode adicionar lógica para redirecionar para upgrade
            console.log('Redirect to upgrade plan')
          }}
        />
      )}
    </Popover>
  )
}

// Componente simplificado para mostrar apenas o workspace atual
export function WorkspaceDisplay({ className }: { className?: string }) {
  const currentWorkspace = useCurrentWorkspace()
  const { state } = useWorkspace()

  const getWorkspaceInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getWorkspaceColor = (color?: string) => {
    return color || '#3B82F6'
  }

  if (state.isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-8 h-8 bg-muted rounded-lg"></div>
          <div className="w-32 h-4 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!currentWorkspace) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building className="h-4 w-4" />
          <span className="text-sm">Nenhum workspace</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={currentWorkspace.avatar_url} alt={currentWorkspace.name} />
        <AvatarFallback 
          className="text-xs font-medium"
          style={{ backgroundColor: getWorkspaceColor(currentWorkspace.color) + '20' }}
        >
          {getWorkspaceInitials(currentWorkspace.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{currentWorkspace.name}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {currentWorkspace.member_count} membro{currentWorkspace.member_count !== 1 ? 's' : ''}
          </div>
          {currentWorkspace.is_public && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              Público
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
} 