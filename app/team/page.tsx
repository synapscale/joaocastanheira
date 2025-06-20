import { Metadata } from 'next'
import EnhancedWorkspaceDashboard from '@/components/workspaces/enhanced-workspace-dashboard'
import WorkspaceErrorBoundary from '@/components/workspaces/workspace-error-boundary'

export const metadata: Metadata = {
  title: 'Gerenciamento de Equipe - Synapscale',
  description: 'Dashboard completo para gerenciar workspaces, membros da equipe e configurações avançadas.',
}

export default function TeamPage() {
  return (
    <WorkspaceErrorBoundary>
      <EnhancedWorkspaceDashboard />
    </WorkspaceErrorBoundary>
  )
}
