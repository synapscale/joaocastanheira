import { Metadata } from 'next'
import PlanManagement from '@/components/admin/plan-management'

export const metadata: Metadata = {
  title: 'Administração de Planos - Synapscale',
  description: 'Gerencie planos, recursos e clientes da plataforma.',
}

export default function AdminPlansPage() {
  return <PlanManagement />
} 