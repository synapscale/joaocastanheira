import React from 'react';
import { CreateTestNode } from '@/components/node-creator/create-test-node';
import { NodeCreationProviders } from '@/contexts/node-creator';

export default function NodeCreatorCanvasPage() {
  return (
    <NodeCreationProviders>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Canvas de Criação de Nodes</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Área de Trabalho</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Este é o Canvas de Criação de Nodes, onde você pode criar e configurar nodes personalizados
            para uso no Canvas de Workflow principal.
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">Área do Canvas</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Aqui você pode arrastar e soltar componentes para criar seu node personalizado
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Propriedades do Node</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome do Node
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="Digite o nome do node"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    rows={3}
                    placeholder="Digite uma descrição para o node"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md">
                    <option>Processamento</option>
                    <option>Entrada/Saída</option>
                    <option>Transformação</option>
                    <option>Análise</option>
                    <option>Personalizado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <CreateTestNode />
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Componentes Disponíveis</h2>
              
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </NodeCreationProviders>
  );
}
