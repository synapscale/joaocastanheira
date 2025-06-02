"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useNodeDefinitionIntegration } from '@/hooks/use-node-definition-integration';
import { useInitializeDefaultNodes } from '@/app/node-creator/init';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import { 
  Plus, 
  Share, 
  Save, 
  MoreHorizontal, 
  Star,
  Check
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
  
  // Estado para controle de salvamento
  const [isSaved, setIsSaved] = useState(false);
  
  // Estado para nome do workflow
  const [workflowName, setWorkflowName] = useState('');
  
  // Integração com o hook de definição de nodes e inicialização de nodes padrão
  const { customNodesCount, nodeTemplates, publishedTemplates, syncPublishedNodes } = useNodeDefinitionIntegration();
  useInitializeDefaultNodes();
  
  // Efeito para definir título da página
  useEffect(() => {
    document.title = 'SynapScale - Editor de Workflow';
  }, []);
  
  // Efeito para gerar nome automático do workflow
  useEffect(() => {
    // Verificar se já existe um nome temporário
    const tempName = localStorage.getItem('temp_workflow_name');
    if (tempName) {
      setWorkflowName(tempName);
      return;
    }
    
    // Recuperar workflows existentes para gerar nome sequencial
    const existingWorkflows = JSON.parse(localStorage.getItem('workflows') || '[]');
    
    // Encontrar o maior número X em "My Workflow X"
    let maxNumber = 0;
    existingWorkflows.forEach(workflow => {
      const match = workflow.name.match(/My Workflow (\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    
    // Gerar novo nome sequencial
    const newName = `My Workflow ${maxNumber + 1}`;
    setWorkflowName(newName);
    
    // Salvar temporariamente
    localStorage.setItem('temp_workflow_name', newName);
  }, []);
  
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

  // Handler para abrir a biblioteca de nodes
  const handleOpenNodeLibrary = useCallback(() => {
    // Implementação da abertura da biblioteca de nodes
    console.log('Abrindo biblioteca de nodes');
    // Aqui seria implementada a lógica para abrir a biblioteca de nodes
  }, []);

  // Handler para salvar o workflow
  const handleSaveWorkflow = useCallback(() => {
    // Recuperar o nome do workflow
    const workflowNameToSave = workflowName || 'Novo Workflow';
    
    // Criar um novo workflow e salvar na lista
    const newWorkflow = {
      id: `wf-${Date.now()}`,
      name: workflowNameToSave,
      status: 'inactive', // Workflow começa inativo por padrão
      visibility: 'personal',
      lastUpdated: 'Agora',
      created: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
      tags: []
    };
    
    // Salvar no localStorage para persistência
    const existingWorkflows = JSON.parse(localStorage.getItem('workflows') || '[]');
    localStorage.setItem('workflows', JSON.stringify([newWorkflow, ...existingWorkflows]));
    
    // Limpar o nome temporário
    localStorage.removeItem('temp_workflow_name');
    
    // Atualizar estado para indicar que foi salvo
    setIsSaved(true);
    
    // Mostrar mensagem de sucesso
    alert('Workflow salvo com sucesso!');
    
    // Opcional: redirecionar para a lista de workflows após um breve delay
    setTimeout(() => {
      window.location.href = '/workflows';
    }, 1500);
  }, [workflowName]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Barra superior */}
        <div className="flex h-14 items-center justify-between border-b bg-white px-4 z-10">
          <div className="flex items-center gap-3">
            <span 
              className="font-medium cursor-pointer" 
              onDoubleClick={(e) => {
                const target = e.target as HTMLElement;
                const input = document.createElement('input');
                input.value = workflowName || 'Untitled Workflow';
                input.className = 'font-medium border rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500';
                input.style.width = `${target.offsetWidth + 20}px`;
                
                input.onblur = () => {
                  setWorkflowName(input.value);
                  localStorage.setItem('temp_workflow_name', input.value);
                  target.replaceWith(target);
                };
                
                input.onkeydown = (e) => {
                  if (e.key === 'Enter') {
                    input.blur();
                  }
                };
                
                target.replaceWith(input);
                input.focus();
                input.select();
              }}
            >
              {workflowName || 'Untitled Workflow'}
            </span>
            <button className="flex items-center gap-1 p-1 rounded-md hover:bg-gray-100 text-sm">
              <Plus className="h-4 w-4" />
              <span>Add Tag</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="mr-2 text-sm">Inactive</span>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <div className="absolute h-5 w-5 transform rounded-full bg-white shadow-md transition-transform"></div>
              </div>
            </div>
            
            <button className="flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-gray-50">
              <Share className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </button>
            
            <button 
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 ${
                isSaved ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-[#EF4E39] text-white border-none hover:bg-[#D83C29]'
              }`} 
              onClick={handleSaveWorkflow}
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Saved</span>
                </>
              ) : (
                <span className="text-sm">Salvar</span>
              )}
            </button>
            
            <button className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-1 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500">
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path>
                <path d="M12 7v5l2.5 2.5"></path>
                <path d="M16.24 16.24 14 14"></path>
              </svg>
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
        </div>
      </div>
    </div>
  );
}
