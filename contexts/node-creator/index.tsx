import React from 'react';
import { NodeCreatorProvider } from '@/contexts/node-creator/node-creator-context';
import { SharedNodesProvider } from '@/contexts/node-creator/shared-nodes-context';

/**
 * Provider composto que encapsula todos os contextos relacionados à criação e compartilhamento de nodes
 * Deve ser adicionado ao layout principal da aplicação
 */
export function NodeCreationProviders({ children }: { children: React.ReactNode }) {
  return (
    <NodeCreatorProvider>
      <SharedNodesProvider>
        {children}
      </SharedNodesProvider>
    </NodeCreatorProvider>
  );
}
