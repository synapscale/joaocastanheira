"use client";

import React from 'react';
import { NodeIntegrationValidator } from '@/components/node-creator/node-integration-validator';
import { useNodeDefinitionIntegration } from '@/hooks/use-node-definition-integration';
import { NodeCreationProviders } from '@/contexts/node-creator';

export default function WorkflowCanvasPage() {
  return (
    <NodeCreationProviders>
      <WorkflowCanvasContent />
    </NodeCreationProviders>
  );
}

// Componente interno que usa os hooks dentro do provider
function WorkflowCanvasContent() {
  // Integrar nodes personalizados ao workflow
  useNodeDefinitionIntegration();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Canvas de Workflow</h1>
      
      <NodeIntegrationValidator />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Área de Trabalho do Workflow</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Este é o Canvas de Workflow principal, onde você pode usar nodes personalizados criados no Canvas de Criação.
        </p>
        
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">Área do Canvas de Workflow</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Aqui você pode arrastar e soltar nodes para criar seu workflow
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Nodes Disponíveis</h2>
            
            <div className="space-y-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30">
                Entrada de Texto
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30">
                Saída de Texto
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30">
                Processador
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                Transformador
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30">
                Teste de Integração
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Propriedades do Workflow</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Workflow
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="Digite o nome do workflow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  rows={3}
                  placeholder="Digite uma descrição para o workflow"
                ></textarea>
              </div>
              
              <div className="flex space-x-4">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Salvar Workflow
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  Executar Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
