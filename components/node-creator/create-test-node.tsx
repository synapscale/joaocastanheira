"use client";

import React from 'react';
import { useNodeCreator } from '@/contexts/node-creator/node-creator-context';
import { useSharedNodes } from '@/contexts/node-creator/shared-nodes-context';

/**
 * Componente para criar um node de exemplo para testes de integração
 * Este componente deve ser adicionado temporariamente ao Canvas de Criação para testes
 */
export function CreateTestNode() {
  const { addNodeTemplate, publishNodeTemplate, state } = useNodeCreator();
  const { addNodeToWorkflow, state: sharedNodesState } = useSharedNodes();

  const handleCreateTestNode = () => {
    // Criar um node de teste
    addNodeTemplate({
      name: "Teste de Integração",
      description: "Node criado para testar a integração entre canvases",
      category: "Teste",
      inputs: [
        {
          id: crypto.randomUUID(),
          name: "Entrada",
          type: "string",
          description: "Entrada de teste"
        }
      ],
      outputs: [
        {
          id: crypto.randomUUID(),
          name: "Saída",
          type: "string",
          description: "Saída de teste"
        }
      ],
      properties: [
        {
          id: crypto.randomUUID(),
          name: "Propriedade",
          type: "string",
          defaultValue: "Valor padrão",
          required: true,
          description: "Propriedade de teste"
        }
      ],
      icon: "TestIcon",
      author: "Sistema",
      version: "1.0.0"
    });
  };

  const handlePublishLatestNode = () => {
    // Publicar o último node criado
    if (state.nodeTemplates.length > 0) {
      const latestNode = state.nodeTemplates[state.nodeTemplates.length - 1];
      publishNodeTemplate(latestNode.id);
      
      // Adicionar ao contexto compartilhado para disponibilizar no Canvas Principal
      addNodeToWorkflow(latestNode);
    }
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
      <h3 className="text-lg font-medium mb-2">Teste de Integração</h3>
      <div className="space-y-3">
        <button
          onClick={handleCreateTestNode}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Criar Node de Teste
        </button>
        
        <button
          onClick={handlePublishLatestNode}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
          disabled={state.nodeTemplates.length === 0}
        >
          Publicar Último Node
        </button>
        
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-1">Nodes Criados:</h4>
          <ul className="text-sm space-y-1">
            {state.nodeTemplates.map(template => (
              <li key={template.id} className="flex items-center">
                <span className={`w-3 h-3 rounded-full ${template.published ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></span>
                {template.name} {template.published ? '(Publicado)' : ''}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-1">Nodes Disponíveis no Canvas Principal:</h4>
          <ul className="text-sm space-y-1">
            {sharedNodesState.sharedNodes.map(node => (
              <li key={node.id} className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                {node.name} (Disponível no Canvas Principal)
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
