"use client";

import React from 'react';
import { useNodeDefinitionIntegration } from '@/hooks/use-node-definition-integration';
import { useCustomNodes } from '@/hooks/use-custom-nodes';

/**
 * Componente para validar a integração entre o Canvas de Criação de Nodes e o Canvas de Workflow
 * Este componente deve ser adicionado temporariamente ao Canvas de Workflow para testes
 */
export function NodeIntegrationValidator() {
  const { customNodesCount, totalNodesCount } = useNodeDefinitionIntegration();
  const { customNodes, publishedTemplates } = useCustomNodes();

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
      <h3 className="text-lg font-medium mb-2">Validação de Integração de Nodes</h3>
      <div className="space-y-2">
        <p>
          <span className="font-medium">Nodes Personalizados:</span> {customNodesCount} de {totalNodesCount} total
        </p>
        <p>
          <span className="font-medium">Templates Publicados:</span> {publishedTemplates.length}
        </p>
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-1">Nodes Personalizados Disponíveis:</h4>
          <ul className="text-sm space-y-1">
            {customNodes.length > 0 ? (
              customNodes.map(node => (
                <li key={node.id} className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                  {node.name} ({node.category})
                </li>
              ))
            ) : (
              <li className="text-gray-500">Nenhum node personalizado disponível</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
