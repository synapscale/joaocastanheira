"use client";

import { useEffect } from 'react';
import { useSharedNodes } from '@/contexts/node-creator/shared-nodes-context';

/**
 * Hook para integrar os nodes personalizados ao contexto de definição de nodes
 * Deve ser usado no componente que renderiza o Canvas de Workflow
 */
export function useNodeDefinitionIntegration() {
  const { state: sharedNodesState } = useSharedNodes();
  
  // Mock para simular a integração com o contexto de definição de nodes
  // Em um ambiente real, isso seria substituído pela integração real
  const nodeDefinitions = [];
  const setNodeDefinitions = () => {};
  
  // Adicionar nodes personalizados ao contexto de definição de nodes
  useEffect(() => {
    // Filtrar apenas nodes personalizados
    const customNodes = sharedNodesState.sharedNodes.filter(node => node.isCustom);
    
    if (customNodes.length > 0) {
      console.log('Nodes personalizados disponíveis:', customNodes.length);
      // Em um ambiente real, aqui seria feita a integração com o contexto existente
    }
  }, [sharedNodesState.sharedNodes]);

  return {
    customNodesCount: sharedNodesState.sharedNodes.filter(node => node.isCustom).length,
    totalNodesCount: nodeDefinitions.length || 0,
  };
}
