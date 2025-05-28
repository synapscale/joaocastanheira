"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NodePort } from "./node-port";
import { MoreHorizontal } from "lucide-react";

// Tipos para o node e suas propriedades
interface NodePortType {
  id: string;
  type: "input" | "output";
  name: string;
  dataType: string;
}

interface NodeProps {
  node: {
    id: string;
    type: string;
    name: string;
    position: { x: number; y: number };
    inputs: NodePortType[];
    outputs: NodePortType[];
    properties: Record<string, any>;
  };
  isSelected: boolean;
  onSelect: (isMultiSelect: boolean) => void;
  onDrag: (position: { x: number; y: number }) => void;
  onPortStartConnect: (portId: string, type: "input" | "output") => void;
  onPortEndConnect: (portId: string, type: "input" | "output") => void;
}

export function CanvasNode({
  node,
  isSelected,
  onSelect,
  onDrag,
  onPortStartConnect,
  onPortEndConnect
}: NodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determinar tipo normalizado para consistência
  const normalizedType = node.type.toLowerCase();
  
  // Mapear tipos para valores padronizados
  const nodeType = 
    normalizedType.includes("trigger") ? "trigger" :
    normalizedType.includes("process") ? "process" :
    normalizedType.includes("ai") ? "ai-task" : 
    "default";

  // Determinar cor do node com base no tipo
  const getNodeColor = () => {
    switch (nodeType) {
      case "trigger": return "#FF7A00"; // Laranja mais vibrante
      case "process": return "#7E7E86"; // Cinza mais refinado
      case "ai-task": return "#8A63FF"; // Roxo mais vibrante
      default: return "#999999";
    }
  };

  // Determinar label do tipo para exibição
  const getNodeTypeLabel = () => {
    switch (nodeType) {
      case "trigger": return "trigger";
      case "process": return "process";
      case "ai-task": return "ai-task";
      default: return nodeType;
    }
  };

  // Determinar ícone do node com base no tipo
  const getNodeIcon = () => {
    switch (nodeType) {
      case "trigger":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "process":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "ai-task":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="18" height="18" x="3" y="3" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <motion.div
      className={cn(
        "absolute flex w-[150px] flex-col rounded-md border shadow-sm",
        "bg-white",
        isSelected && "ring-2 ring-blue-400",
        isDragging && "cursor-grabbing opacity-90"
      )}
      style={{
        borderColor: getNodeColor(),
        borderWidth: "1px",
        left: node.position.x,
        top: node.position.y,
        zIndex: isDragging ? 10 : isSelected ? 5 : 1
      }}
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        onDrag({
          x: node.position.x + info.offset.x,
          y: node.position.y + info.offset.y
        });
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect(e.ctrlKey || e.shiftKey);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cabeçalho do node */}
      <div 
        className="flex items-center justify-between rounded-t-md p-2 text-white"
        style={{ backgroundColor: getNodeColor() }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-sm text-white">
            {getNodeIcon()}
          </div>
          <span className="font-medium text-sm">{node.name}</span>
        </div>
        <button className="p-0.5 rounded hover:bg-white/20">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      
      {/* Corpo do node */}
      <div className="p-3 bg-white">
        <div className="text-xs text-gray-500 mb-2">{getNodeTypeLabel()}</div>
        <div className="text-sm">Configurações do node</div>
      </div>
      
      {/* Portas de conexão */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-200 rounded-full border-2 border-white"></div>
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-200 rounded-full border-2 border-white"></div>
      
      {/* Funcionalidades rápidas em cima dos nodes - visíveis quando selecionado ou hover */}
      {(isSelected || isHovered) && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white rounded-md shadow-sm border border-gray-200 p-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Ação de play
            }}
            className="p-1 rounded-sm hover:bg-gray-100"
            title="Executar node"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Ação de edição
            }}
            className="p-1 rounded-sm hover:bg-gray-100"
            title="Editar node"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Ação de exclusão
            }}
            className="p-1 rounded-sm hover:bg-gray-100"
            title="Excluir node"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      )}
      
      {/* Botão de adição à direita do node - visível quando selecionado ou hover */}
      {(isSelected || isHovered) && (
        <div 
          className="absolute right-0 top-1/2 transform translate-x-3 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm border border-gray-200 z-10 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            // Ação de adicionar conexão
          }}
          title="Criar nova conexão"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
      )}
    </motion.div>
  );
}
