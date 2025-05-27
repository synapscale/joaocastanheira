"use client";

import React, { useState, useCallback } from 'react';
import { useNodeDefinitionIntegration } from '@/hooks/use-node-definition-integration';
import { UnifiedCanvas } from '@/components/canvas/unified-canvas';
import { 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  RotateCcw, 
  Maximize2, 
  Download, 
  Upload, 
  Share2, 
  Plus, 
  HelpCircle, 
  Settings
} from 'lucide-react';

// Componente para a mensagem central quando não há nodes
function EmptyCanvasMessage({ onCreateTestNode, onPublishLastNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 text-blue-500">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 7L12 12L20 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 12L12 17L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="mb-2 text-xl font-medium">Crie ou selecione um node</h3>
      <p className="mb-6 max-w-md text-center text-sm text-gray-500">
        Clique no ícone da biblioteca no canto superior direito para abrir a biblioteca de nodes. Use <kbd className="rounded border px-1 py-0.5 text-xs">Ctrl</kbd> + <kbd className="rounded border px-1 py-0.5 text-xs">Scroll</kbd> para zoom.
      </p>
      
      {/* Componente de teste para criar e publicar nodes */}
      <div className="flex flex-col items-center gap-2">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onCreateTestNode}
        >
          Criar Node de Teste
        </button>
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={onPublishLastNode}
        >
          Publicar Último Node
        </button>
      </div>
    </div>
  );
}

export default function NodeCreatorCanvasPage() {
  // Estado para controle de zoom e posição
  const [zoom, setZoom] = useState(1);
  const [viewportPosition, setViewportPosition] = useState({ x: 0, y: 0 });
  
  // Estado para controle de nodes criados e publicados
  const [createdNodes, setCreatedNodes] = useState([]);
  const [lastNodeId, setLastNodeId] = useState(3);
  const [showEmptyMessage, setShowEmptyMessage] = useState(true);
  
  // Integração com o hook de definição de nodes
  const { publishNode, customNodesCount } = useNodeDefinitionIntegration();
  
  // Handler para criar node de teste
  const handleCreateTestNode = useCallback(() => {
    const newNodeId = lastNodeId + 1;
    const nodeTypes = ['Input', 'Process', 'Output'];
    const nodeColors = ['#22c55e', '#eab308', '#6366f1'];
    const randomType = Math.floor(Math.random() * 3);
    
    const newNode = {
      id: newNodeId,
      type: nodeTypes[randomType],
      title: `${nodeTypes[randomType]} ${newNodeId}`,
      color: nodeColors[randomType],
      position: { x: 200 + Math.random() * 300, y: 100 + Math.random() * 200 }
    };
    
    setCreatedNodes(prev => [...prev, newNode]);
    setLastNodeId(newNodeId);
    setShowEmptyMessage(false);
  }, [lastNodeId]);
  
  // Handler para publicar último node
  const handlePublishLastNode = useCallback(() => {
    if (createdNodes.length > 0) {
      const lastNode = createdNodes[createdNodes.length - 1];
      // Publicar o node usando o hook de integração
      publishNode({
        id: `node-${lastNode.id}`,
        name: lastNode.title,
        type: lastNode.type.toLowerCase(),
        properties: {}
      });
      alert(`Node "${lastNode.title}" publicado com sucesso!`);
    } else {
      alert('Nenhum node criado para publicar!');
    }
  }, [createdNodes, publishNode]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Barra superior */}
          <div className="flex h-14 items-center justify-between border-b bg-white px-4 z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
                <span className="text-sm font-medium">CA</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Canva & Agentes</span>
                <ArrowLeft className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-2 rounded-md bg-indigo-100 px-2 py-1 text-indigo-700">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500 text-white">
                  <span className="text-xs">CA</span>
                </div>
                <span className="text-sm font-medium">Canvas Editor</span>
              </div>
              <button className="ml-2 rounded-md border bg-white px-3 py-1 text-sm hover:bg-gray-50">
                Salvar
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50">
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="mx-1 h-5 border-r"></div>
              <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50">
                <Search className="h-4 w-4" />
              </button>
              <div className="flex items-center rounded-md border px-2 py-1">
                <span className="text-sm">{Math.round(zoom * 100)}%</span>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </button>
              <div className="mx-1 h-5 border-r"></div>
              <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50">
                <Maximize2 className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50">
                <Search className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border px-2 py-1">
                <span className="text-sm">Nodes: {customNodesCount}</span>
              </div>
              <div className="flex items-center gap-1 rounded-md border px-2 py-1">
                <span className="text-sm">Pos: {Math.round(viewportPosition.x)},{Math.round(viewportPosition.y)}</span>
              </div>
              <button className="flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-gray-50">
                <Download className="h-4 w-4" />
                <span className="text-sm">Importar</span>
              </button>
              <button className="flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                <span className="text-sm">Exportar</span>
              </button>
              <button className="flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-gray-50">
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Compartilhar</span>
              </button>
              <button className="flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-gray-50">
                <Plus className="h-4 w-4" />
                <span className="text-sm">Adicionar</span>
              </button>
              <button className="ml-1 flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50">
                <HelpCircle className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Área principal com o canvas */}
          <div className="relative flex-1 overflow-hidden bg-gray-50">
            {/* Canvas unificado - usando o componente existente */}
            <UnifiedCanvas />
            
            {/* Mensagem quando não há nodes */}
            {showEmptyMessage && (
              <EmptyCanvasMessage 
                onCreateTestNode={handleCreateTestNode}
                onPublishLastNode={handlePublishLastNode}
              />
            )}
            
            {/* Versão do canvas */}
            <div className="absolute bottom-4 left-4 text-xs text-gray-500">
              Canvas v2.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
