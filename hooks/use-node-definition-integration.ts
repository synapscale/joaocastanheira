"use client";

import { useEffect, useCallback } from 'react';
import { useSharedNodes } from '@/contexts/node-creator/shared-nodes-context';
import { useNodeCreator } from '@/contexts/node-creator/node-creator-context';

/**
 * Hook aprimorado para integrar os nodes personalizados ao contexto de definição de nodes
 * Deve ser usado no componente que renderiza o Canvas de Workflow
 */
export function useNodeDefinitionIntegration() {
  const { state: sharedNodesState, addNodeToWorkflow } = useSharedNodes();
  const { state: nodeCreatorState } = useNodeCreator();
  
  // Função para sincronizar nodes publicados do NodeCreator para o SharedNodes
  const syncPublishedNodes = useCallback(() => {
    // Filtrar apenas templates publicados que ainda não estão no SharedNodes
    const publishedTemplates = nodeCreatorState.nodeTemplates.filter(template => 
      template.published && 
      !sharedNodesState.sharedNodes.some(node => 
        node.isCustom && node.templateId === template.id
      )
    );
    
    // Adicionar cada template publicado ao SharedNodes
    publishedTemplates.forEach(template => {
      console.log('Sincronizando node publicado para o Canvas Principal:', template.name);
      addNodeToWorkflow(template);
    });
  }, [nodeCreatorState.nodeTemplates, sharedNodesState.sharedNodes, addNodeToWorkflow]);
  
  // Sincronizar nodes publicados quando a lista de templates ou nodes compartilhados mudar
  useEffect(() => {
    syncPublishedNodes();
  }, [nodeCreatorState.nodeTemplates, syncPublishedNodes]);
  
  // Monitorar nodes personalizados disponíveis
  useEffect(() => {
    const customNodes = sharedNodesState.sharedNodes.filter(node => node.isCustom);
    
    if (customNodes.length > 0) {
      console.log('Nodes personalizados disponíveis para o Canvas Principal:', customNodes.length);
    }
  }, [sharedNodesState.sharedNodes]);

  return {
    customNodesCount: sharedNodesState.sharedNodes.filter(node => node.isCustom).length,
    totalNodesCount: sharedNodesState.sharedNodes.length,
    nodeTemplates: nodeCreatorState.nodeTemplates,
    publishedTemplates: nodeCreatorState.nodeTemplates.filter(template => template.published),
    syncPublishedNodes,
  };
}
