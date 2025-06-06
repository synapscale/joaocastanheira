"use client";

import React from 'react';
import Link from 'next/link';

export default function NodeCreatorLibraryPage() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Barra superior */}
          <div className="flex h-14 items-center justify-between border-b bg-white px-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-medium">Biblioteca de Nodes</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-gray-50">
                <span className="text-sm">Novo Node</span>
              </button>
            </div>
          </div>
          
          {/* Conteúdo principal */}
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Biblioteca de Nodes</h2>
              <p className="text-gray-600 mb-4">
                Aqui você encontra todos os nodes disponíveis para uso no Canvas. 
                Você pode criar novos nodes, editar os existentes ou importar nodes de outras fontes.
              </p>
            </div>
            
            {/* Lista de categorias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Categoria: Triggers */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-orange-100 p-4">
                  <h3 className="font-medium text-lg">Triggers</h3>
                  <p className="text-sm text-gray-600">Nodes que iniciam fluxos de trabalho</p>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span>Webhook Trigger</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span>Schedule Trigger</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span>Manual Trigger</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Categoria: Process */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-purple-100 p-4">
                  <h3 className="font-medium text-lg">Process</h3>
                  <p className="text-sm text-gray-600">Nodes para processamento de dados</p>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span>Data Transform</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span>Filter</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span>Merge</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Categoria: AI Tasks */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-100 p-4">
                  <h3 className="font-medium text-lg">AI Tasks</h3>
                  <p className="text-sm text-gray-600">Nodes para tarefas de IA</p>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Text Generation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Image Analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Sentiment Analysis</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Nodes personalizados */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Seus Nodes Personalizados</h2>
              <div className="bg-gray-50 border rounded-lg p-6 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                </div>
                <p className="text-gray-600 mb-4 text-center">
                  Você ainda não criou nenhum node personalizado.
                </p>
                <Link href="/node-creator/canvas" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                  Criar Novo Node
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
