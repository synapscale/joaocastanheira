/**
 * Página do Marketplace
 * Criado por José - O melhor Full Stack do mundo
 * Marketplace completo para componentes
 */

import { MarketplaceComponent } from '@/components/marketplace/marketplace-component'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketplace - SynapScale',
  description: 'Descubra e compartilhe componentes incríveis para seus workflows',
}

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Marketplace de Componentes
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubra, compartilhe e monetize componentes incríveis para seus workflows. 
              Acelere seu desenvolvimento com a maior biblioteca de componentes do mercado.
            </p>
          </div>
        </div>
      </div>
      
      <MarketplaceComponent />
    </div>
  )
}

