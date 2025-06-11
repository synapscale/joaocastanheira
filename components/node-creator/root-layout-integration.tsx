import React from 'react';
import { NodeCreationProviders } from '@/contexts/node-creator';
import { AppProps } from 'next/app';

/**
 * Modificação do layout principal para incluir os providers de criação de nodes
 * Este componente deve substituir o layout atual da aplicação
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <NodeCreationProviders>
      {/* Manter o restante do layout existente */}
      {children}
    </NodeCreationProviders>
  );
}
