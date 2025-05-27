// Arquivo: components/canvas/canvas-node.tsx

/**
 * Componente CanvasNode
 * 
 * Este componente representa um node no canvas, com suporte a
 * drag-and-drop, seleção, conexões e edição de propriedades.
 */

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
      case "trigger": return "#FF5C00";
      case "process": return "#6E6E6E";
      case "ai-task": return "#7B68EE";
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
        "absolute flex w-[150px] flex-col rounded-lg border shadow-md",
        "bg-white",
        isSelected && "ring-2 ring-blue-400",
        isDragging && "cursor-grabbing opacity-90"
      )}
      style={{
        borderColor: getNodeColor(),
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
        
        {/* Portas de conexão */}
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-200 rounded-full border-2 border-white"></div>
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-200 rounded-full border-2 border-white"></div>
      </div>
    </motion.div>
  );
}
