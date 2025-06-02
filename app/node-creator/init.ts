"use client";

import { useEffect } from 'react';
import { useNodeDefinitions } from '@/context/node-definition-context';
import { manualTriggerNode } from '@/data/manual-trigger-node';

/**
 * Hook para inicializar nodes padrão no sistema
 */
export function useInitializeDefaultNodes() {
  const { nodeDefinitions, addNodeDefinition } = useNodeDefinitions();
  
  useEffect(() => {
    // Verificar se o node de trigger manual já existe
    const manualTriggerExists = nodeDefinitions.some(
      def => def.id === 'manual-trigger' || def.type === 'manual-trigger'
    );
    
    // Se não existir, adicionar ao contexto
    if (!manualTriggerExists) {
      console.log('Adicionando node de trigger manual ao sistema');
      
      // Converter NodeTemplate para NodeDefinition
      const nodeDefinition = {
        id: manualTriggerNode.id,
        name: manualTriggerNode.name,
        type: manualTriggerNode.id,
        category: 'triggers' as const,
        description: manualTriggerNode.description,
        version: manualTriggerNode.version,
        color: manualTriggerNode.color,
        icon: manualTriggerNode.icon,
        author: 'Sistema',
        tags: manualTriggerNode.tags || [],
        inputs: manualTriggerNode.inputs.map(input => ({
          id: input.id,
          name: input.name,
          description: input.description,
          required: false
        })),
        outputs: manualTriggerNode.outputs.map(output => ({
          id: output.id,
          name: output.name,
          description: output.description
        })),
        parameters: [],
        codeTemplate: '// Node de trigger manual - não requer código',
        createdAt: new Date(),
        updatedAt: new Date(),
        deprecated: false
      };
      
      addNodeDefinition(nodeDefinition);
    }
  }, [nodeDefinitions, addNodeDefinition]);
}
