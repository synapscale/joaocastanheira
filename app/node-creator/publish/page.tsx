"use client";

import React from 'react';
import Link from 'next/link';

export default function NodeCreatorPublishPage() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Barra superior */}
          <div className="flex h-14 items-center justify-between border-b bg-white px-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-medium">Publicar Node</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-gray-50">
                <span className="text-sm">Voltar</span>
              </button>
            </div>
          </div>
          
          {/* Conteúdo principal */}
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Publicar Node</h2>
              <p className="text-gray-600 mb-4">
                Publique seu node para disponibilizá-lo no Canvas Principal e compartilhá-lo com outros usuários.
              </p>
            </div>
            
            {/* Formulário de publicação */}
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Node</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Processador de Texto Avançado"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-24"
                  placeholder="Descreva o que seu node faz e como ele pode ser utilizado..."
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Selecione uma categoria</option>
                  <option value="trigger">Trigger</option>
                  <option value="process">Process</option>
                  <option value="ai-task">AI Task</option>
                  <option value="output">Output</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: processamento, texto, análise (separadas por vírgula)"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Versão</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: 1.0.0"
                  value="1.0.0"
                  readOnly
                />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="isPublic" 
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                    Tornar público para todos os usuários
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Link 
                  href="/node-creator/canvas" 
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </Link>
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                  Publicar Node
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
