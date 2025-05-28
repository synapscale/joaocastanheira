"use client";

import React, { useState, useCallback } from 'react';
import { useNodeDefinitionIntegration } from '@/hooks/use-node-definition-integration';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import { Sidebar } from '@/components/sidebar';
import { 
  Plus, 
  Share, 
  Save, 
  MoreHorizontal, 
  Star
} from 'lucide-react';

// Logo SynapScale
function SynapScaleLogo() {
  return (
    <div className="flex items-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FF5C00" stroke="#FF5C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="ml-2 font-semibold text-[#FF5C00]">SynapScale</span>
    </div>
  );
}

export default function CanvasPage() {
  // Estado para controle de zoom e posição
  const [zoom, setZoom] = useState(1);
  const [viewportPosition, setViewportPosition] = useState({ x: 0, y: 0 });
  
  // Integração com o hook de definição de nodes
  const { customNodesCount, nodeTemplates, publishedTemplates, syncPublishedNodes } = useNodeDefinitionIntegration();
  
  // Handlers para controles de zoom
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);
  
  const handleReset = useCallback(() => {
    setZoom(1);
    setViewportPosition({ x: 0, y: 0 });
  }, []);
  
  const handleCenter = useCallback(() => {
    setViewportPosition({ x: 0, y: 0 });
  }, []);

  // Handler para abrir a biblioteca de nodes (ponto de conexão com o canvas secundário)
  const handleOpenNodeLibrary = useCallback(() => {
    // Aqui seria implementada a lógica para abrir a biblioteca de nodes
    console.log("Abrindo biblioteca de nodes");
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Barra superior */}
        <div className="flex h-14 items-center justify-between border-b bg-white px-4 z-10">
          <div className="flex items-center gap-3">
            <button className="p-1 rounded-md hover:bg-gray-100">
              <Plus className="h-5 w-5" />
            </button>
            <span className="font-medium">Untitled Workflow</span>
            <div className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm">
              <span>Agentes IA</span>
              <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-xs">+1</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="mr-2 text-sm">Active</span>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <div className="absolute h-5 w-5 transform rounded-full bg-white shadow-md transition-transform translate-x-5"></div>
                <div className="absolute inset-0 rounded-full bg-[#FF5C00]"></div>
                <div className="absolute h-5 w-5 transform rounded-full bg-white shadow-md transition-transform translate-x-5"></div>
              </div>
            </div>
            
            <button className="flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-gray-50">
              <Share className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </button>
            
            <button className="flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-gray-50">
              <Save className="h-4 w-4" />
              <span className="text-sm">Saved</span>
            </button>
            
            <button className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-1 ml-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">88,435</span>
            </div>
          </div>
        </div>
        
        {/* Área principal com o canvas */}
        <div className="relative flex-1 overflow-hidden">
          <WorkflowCanvas 
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomChange={setZoom}
            onFitView={handleCenter}
            onOpenNodeLibrary={handleOpenNodeLibrary}
          />
          
          {/* Removido indicador duplicado de tipos de nodes, já presente no WorkflowCanvas */}
        </div>
      </div>
    </div>
  );
}
