"use client";

import { useEffect, useState } from 'react';
import { useNodeCreator } from '@/contexts/node-creator/node-creator-context';
import { useSharedNodes } from '@/contexts/node-creator/shared-nodes-context';

/**
 * Hook para gerenciar a integração entre o Canvas de Criação de Nodes e o Canvas de Workflow
 * Sincroniza nodes publicados e fornece métodos para publicação e adição ao workflow
 */
export function useCustomNodes() {
  const { state: nodeCreatorState } = useNodeCreator();
  const { state: sharedNodesState, addNodeToWorkflow } = useSharedNodes();
  const [isInitialized, setIsInitialized] = useState(false);

  // Sincronizar nodes publicados do NodeCreator para o Workflow
  useEffect(() => {
    if (!isInitialized) {
      // Inicialização: importar todos os nodes publicados
      const publishedTemplates = nodeCreatorState.nodeTemplates.filter(
        template => template.published
      );
      
      // Verificar quais nodes publicados ainda não estão no workflow
      const existingTemplateIds = sharedNodesState.sharedNodes
        .filter(node => node.isCustom && node.templateId)
        .map(node => node.templateId);
      
      // Adicionar apenas os novos
      publishedTemplates.forEach(template => {
        if (!existingTemplateIds.includes(template.id)) {
          addNodeToWorkflow(template);
        }
      });
      
      setIsInitialized(true);
    }
  }, [
    nodeCreatorState.nodeTemplates,
    sharedNodesState.sharedNodes,
    addNodeToWorkflow,
    isInitialized,
  ]);

  // Função para publicar e adicionar um node ao workflow
  const publishAndAddToWorkflow = (templateId: string) => {
    const template = nodeCreatorState.nodeTemplates.find(t => t.id === templateId);
    if (template) {
      // Verificar se já existe no workflow
      const existsInWorkflow = sharedNodesState.sharedNodes.some(
        node => node.isCustom && node.templateId === templateId
      );
      
      if (!existsInWorkflow) {
        addNodeToWorkflow(template);
      }
    }
  };

  return {
    customNodes: sharedNodesState.sharedNodes.filter(node => node.isCustom),
    publishedTemplates: nodeCreatorState.nodeTemplates.filter(t => t.published),
    publishAndAddToWorkflow,
  };
}
