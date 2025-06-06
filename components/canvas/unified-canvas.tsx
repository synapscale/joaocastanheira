"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CanvasGrid } from "./canvas-grid";
import { CanvasNode } from "./canvas-node";
import { ConnectionLine } from "./connection-line";
import { SelectionBox } from "./selection-box";
import { CanvasMiniMap } from "./canvas-mini-map";
import { NavigationHints } from "./navigation-hints";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2,
  Instagram
} from "lucide-react";

// Tipos para os nodes e conexões
interface NodePort {
  id: string;
  type: "input" | "output";
  name: string;
  dataType: string;
  position?: { x: number; y: number };
}

interface CanvasNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  inputs: NodePort[];
  outputs: NodePort[];
  properties: Record<string, any>;
}

interface Connection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
}

export function UnifiedCanvas() {
  // Estado do canvas
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const [connectingPort, setConnectingPort] = useState<{ nodeId: string; portId: string; type: "input" | "output" } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Exemplo de node para demonstração
  useEffect(() => {
    // Inicializar com alguns nodes de exemplo
    setNodes([
      {
        id: "node1",
        type: "trigger",
        name: "Webhook",
        position: { x: 100, y: 100 },
        inputs: [],
        outputs: [
          { id: "output1", type: "output", name: "Output", dataType: "any" }
        ],
        properties: {}
      },
      {
        id: "node2",
        type: "process",
        name: "Transform Data",
        position: { x: 400, y: 200 },
        inputs: [
          { id: "input1", type: "input", name: "Input", dataType: "any" }
        ],
        outputs: [
          { id: "output1", type: "output", name: "Output", dataType: "any" }
        ],
        properties: {}
      },
      {
        id: "node3",
        type: "ai task",
        name: "Generate Text",
        position: { x: 700, y: 100 },
        inputs: [
          { id: "input1", type: "input", name: "Input", dataType: "any" }
        ],
        outputs: [],
        properties: {}
      }
    ]);

    // Adicionar uma conexão de exemplo
    setConnections([
      {
        id: "connection1",
        sourceNodeId: "node1",
        sourcePortId: "output1",
        targetNodeId: "node2",
        targetPortId: "input1"
      },
      {
        id: "connection2",
        sourceNodeId: "node2",
        sourcePortId: "output1",
        targetNodeId: "node3",
        targetPortId: "input1"
      }
    ]);
  }, []);

  // Manipuladores de eventos
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !e.ctrlKey && !e.shiftKey) {
      // Iniciar arrasto do canvas
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      
      // Limpar seleção se clicou no canvas vazio
      setSelectedNodeIds([]);
      setSelectedConnectionIds([]);
    } else if (e.button === 0 && (e.ctrlKey || e.shiftKey)) {
      // Iniciar seleção por área
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - position.x) / scale;
        const y = (e.clientY - rect.top - position.y) / scale;
        setSelectionBox({ start: { x, y }, end: { x, y } });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left - position.x) / scale;
      const y = (e.clientY - rect.top - position.y) / scale;
      setMousePosition({ x, y });
    }

    if (isDragging) {
      // Mover o canvas
      setPosition({
        x: position.x + (e.clientX - dragStart.x),
        y: position.y + (e.clientY - dragStart.y)
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (selectionBox) {
      // Atualizar caixa de seleção
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - position.x) / scale;
        const y = (e.clientY - rect.top - position.y) / scale;
        setSelectionBox({ ...selectionBox, end: { x, y } });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    
    if (selectionBox) {
      // Selecionar nodes dentro da caixa de seleção
      const selectedNodes = nodes.filter(node => {
        const minX = Math.min(selectionBox.start.x, selectionBox.end.x);
        const maxX = Math.max(selectionBox.start.x, selectionBox.end.x);
        const minY = Math.min(selectionBox.start.y, selectionBox.end.y);
        const maxY = Math.max(selectionBox.start.y, selectionBox.end.y);
        
        return (
          node.position.x >= minX &&
          node.position.x <= maxX &&
          node.position.y >= minY &&
          node.position.y <= maxY
        );
      });
      
      setSelectedNodeIds(selectedNodes.map(node => node.id));
      setSelectionBox(null);
    }
  };

  const handleNodeSelect = (nodeId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      // Adicionar ou remover da seleção múltipla
      setSelectedNodeIds(prev => 
        prev.includes(nodeId)
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId]
      );
    } else {
      // Selecionar apenas este node
      setSelectedNodeIds([nodeId]);
      setSelectedConnectionIds([]);
    }
  };

  const handleNodeDrag = (nodeId: string, position: { x: number; y: number }) => {
    setNodes(prev => 
      prev.map(node => 
        node.id === nodeId
          ? { ...node, position }
          : node
      )
    );
  };

  const handlePortStartConnect = (nodeId: string, portId: string, type: "input" | "output") => {
    setConnectingPort({ nodeId, portId, type });
  };

  const handlePortEndConnect = (nodeId: string, portId: string, type: "input" | "output") => {
    if (connectingPort && connectingPort.type !== type) {
      // Criar nova conexão
      const newConnection: Connection = {
        id: `connection-${Date.now()}`,
        sourceNodeId: type === "input" ? nodeId : connectingPort.nodeId,
        sourcePortId: type === "input" ? portId : connectingPort.portId,
        targetNodeId: type === "input" ? connectingPort.nodeId : nodeId,
        targetPortId: type === "input" ? connectingPort.portId : portId
      };
      
      setConnections(prev => [...prev, newConnection]);
    }
    
    setConnectingPort(null);
  };

  const handleConnectionSelect = (connectionId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      // Adicionar ou remover da seleção múltipla
      setSelectedConnectionIds(prev => 
        prev.includes(connectionId)
          ? prev.filter(id => id !== connectionId)
          : [...prev, connectionId]
      );
    } else {
      // Selecionar apenas esta conexão
      setSelectedConnectionIds([connectionId]);
      setSelectedNodeIds([]);
    }
  };

  const handleZoom = (delta: number) => {
    setScale(prev => {
      const newScale = Math.max(0.1, Math.min(2, prev + delta * 0.1));
      return newScale;
    });
  };

  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Renderização do canvas
  return (
    <div 
      ref={canvasRef}
      className="relative h-full w-full overflow-hidden bg-background"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
      onWheel={(e) => handleZoom(e.deltaY > 0 ? -1 : 1)}
    >
      {/* Grid de fundo */}
      <CanvasGrid scale={scale} position={position} />
      
      {/* Container transformável para nodes e conexões */}
      <motion.div
        className="absolute h-full w-full"
        style={{
          transformOrigin: "0 0",
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
        }}
      >
        {/* Conexões */}
        {connections.map(connection => {
          const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
          const targetNode = nodes.find(n => n.id === connection.targetNodeId);
          
          if (!sourceNode || !targetNode) return null;
          
          // Calcular posições das portas
          const sourcePortPosition = {
            x: sourceNode.position.x + 150, // Ajustar conforme layout do node
            y: sourceNode.position.y + 50
          };
          
          const targetPortPosition = {
            x: targetNode.position.x,
            y: targetNode.position.y + 50
          };
          
          return (
            <ConnectionLine
              key={connection.id}
              id={connection.id}
              source={sourcePortPosition}
              target={targetPortPosition}
              isSelected={selectedConnectionIds.includes(connection.id)}
              onSelect={(isMultiSelect) => handleConnectionSelect(connection.id, isMultiSelect)}
            />
          );
        })}
        
        {/* Conexão em progresso */}
        {connectingPort && (
          <ConnectionLine
            id="connecting"
            source={(() => {
              const node = nodes.find(n => n.id === connectingPort.nodeId);
              if (!node) return { x: 0, y: 0 };
              
              if (connectingPort.type === "output") {
                return {
                  x: node.position.x + 150,
                  y: node.position.y + 50
                };
              } else {
                return {
                  x: node.position.x,
                  y: node.position.y + 50
                };
              }
            })()}
            target={connectingPort.type === "output" ? mousePosition : undefined}
            source={connectingPort.type === "input" ? mousePosition : undefined}
            isConnecting={true}
          />
        )}
        
        {/* Nodes */}
        {nodes.map(node => (
          <CanvasNode
            key={node.id}
            node={node}
            isSelected={selectedNodeIds.includes(node.id)}
            onSelect={(isMultiSelect) => handleNodeSelect(node.id, isMultiSelect)}
            onDrag={(position) => handleNodeDrag(node.id, position)}
            onPortStartConnect={(portId, type) => handlePortStartConnect(node.id, portId, type)}
            onPortEndConnect={(portId, type) => handlePortEndConnect(node.id, portId, type)}
          />
        ))}
        
        {/* Caixa de seleção */}
        {selectionBox && (
          <SelectionBox
            start={selectionBox.start}
            end={selectionBox.end}
          />
        )}
      </motion.div>
      
      {/* Controles de navegação - Ajustados para corresponder ao design original */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white rounded-full shadow-md px-3 py-1.5 z-10">
        <button 
          className="p-1.5 rounded-full hover:bg-gray-100"
          onClick={() => {}}
        >
          <Instagram className="h-4 w-4" />
        </button>
        <button 
          className="p-1.5 rounded-full hover:bg-gray-100"
          onClick={() => handleZoom(-1)}
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="px-2 text-sm">{Math.round(scale * 100)}%</div>
        <button 
          className="p-1.5 rounded-full hover:bg-gray-100"
          onClick={() => handleZoom(1)}
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button 
          className="p-1.5 rounded-full hover:bg-gray-100"
          onClick={handleResetView}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button 
          className="p-1.5 rounded-full hover:bg-gray-100"
          onClick={() => setPosition({ x: 0, y: 0 })}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      
      {/* Indicador de cores - Ajustado para corresponder ao design original */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-md shadow-md px-3 py-2 z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5C00]"></div>
          <span className="text-xs">Trigger</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#6E6E6E]"></div>
          <span className="text-xs">Process</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#7B68EE]"></div>
          <span className="text-xs">AI Task</span>
        </div>
      </div>
      
      {/* Controles laterais direitos - Ajustados para corresponder ao design original */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col gap-2 z-10">
        <button className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
        <button className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18"></path>
            <path d="M3 12h18"></path>
          </svg>
        </button>
        <button className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
