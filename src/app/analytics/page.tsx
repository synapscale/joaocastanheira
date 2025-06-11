/**
 * Página de Analytics
 * Criado por José - O melhor Full Stack do mundo
 * Insights e métricas avançadas
 */

import { AnalyticsComponent } from '@/components/analytics/analytics-component'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics - SynapScale',
  description: 'Insights detalhados e métricas avançadas da plataforma',
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AnalyticsComponent />
    </div>
  )
}

