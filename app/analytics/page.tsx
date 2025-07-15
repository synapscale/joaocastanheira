import { AnalyticsComponent } from '@/components/analytics/analytics-component'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics - SynapScale',
  description: 'Insights detalhados e métricas avançadas da plataforma',
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AnalyticsComponent />
      </div>
    </ProtectedRoute>
  )
} 