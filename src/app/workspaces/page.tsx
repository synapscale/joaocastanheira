/**
 * Página de Workspaces
 * Criado por José - O melhor Full Stack do mundo
 * Colaboração em equipe avançada
 */

import { WorkspacesComponent } from '@/components/workspaces/workspaces-component'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workspaces - SynapScale',
  description: 'Colabore com sua equipe em projetos incríveis',
}

export default function WorkspacesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Workspaces Colaborativos
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Colabore com sua equipe, gerencie projetos e acelere o desenvolvimento 
              com workspaces organizados e ferramentas de colaboração avançadas.
            </p>
          </div>
        </div>
      </div>
      
      <WorkspacesComponent />
    </div>
  )
}

