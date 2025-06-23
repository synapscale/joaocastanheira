import { Metadata } from 'next'
import PlanManagement from '@/components/admin/plan-management'
import { ProtectedRoute } from '@/components/auth/protected-route'

export const metadata: Metadata = {
  title: 'Administração de Planos e Clientes - Synapscale',
  description: 'Gerencie planos, recursos e clientes da plataforma.',
}

export default function AdminPlansPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Administração de Planos e Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie planos, recursos e clientes da plataforma SynapScale.
            </p>
          </div>
          <PlanManagement />
        </div>
      </div>
    </ProtectedRoute>
  )
} 