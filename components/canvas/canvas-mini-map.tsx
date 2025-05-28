"use client";

import React from "react";

interface CanvasMiniMapProps {
  nodes?: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
  }>;
  connections?: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
  }>;
  viewportPosition?: { x: number; y: number };
  viewportScale?: number;
  onViewportChange?: (position: { x: number; y: number }) => void;
}

export function CanvasMiniMap({
  nodes = [],
  connections = [],
  viewportPosition = { x: 0, y: 0 },
  viewportScale = 1,
  onViewportChange = () => {}
}: CanvasMiniMapProps) {
  // Dimensões do mini mapa
  const mapWidth = 150;
  const mapHeight = 100;
  
  // Calcular limites do canvas com base nos nodes
  const bounds = React.useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    }
    
    return nodes.reduce(
      (acc, node) => {
        return {
          minX: Math.min(acc.minX, node.position.x),
          minY: Math.min(acc.minY, node.position.y),
          maxX: Math.max(acc.maxX, node.position.x + 150), // Largura aproximada do node
          maxY: Math.max(acc.maxY, node.position.y + 100), // Altura aproximada do node
        };
      },
      {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
      }
    );
  }, [nodes]);
  
  // Adicionar margem aos limites
  const margin = 200;
  const boundsWithMargin = {
    minX: bounds.minX - margin,
    minY: bounds.minY - margin,
    maxX: bounds.maxX + margin,
    maxY: bounds.maxY + margin
  };
  
  // Calcular escala para o mini mapa
  const scaleX = mapWidth / (boundsWithMargin.maxX - boundsWithMargin.minX);
  const scaleY = mapHeight / (boundsWithMargin.maxY - boundsWithMargin.minY);
  const scale = Math.min(scaleX, scaleY);
  
  // Calcular viewport no mini mapa
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth / viewportScale : 1000;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight / viewportScale : 800;
  
  const viewportRect = {
    x: (-viewportPosition.x / viewportScale - boundsWithMargin.minX) * scale,
    y: (-viewportPosition.y / viewportScale - boundsWithMargin.minY) * scale,
    width: viewportWidth * scale,
    height: viewportHeight * scale,
  };
  
  // Manipulador de clique no mini mapa
  const handleMapClick = (e: React.MouseEvent<SVGRectElement>) => {
    if (!onViewportChange) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Converter coordenadas do clique para posição no canvas
    const canvasX = boundsWithMargin.minX + x / scale;
    const canvasY = boundsWithMargin.minY + y / scale;
    
    // Centralizar viewport na posição clicada
    onViewportChange({
      x: -canvasX * viewportScale + (typeof window !== 'undefined' ? window.innerWidth / 2 : 500),
      y: -canvasY * viewportScale + (typeof window !== 'undefined' ? window.innerHeight / 2 : 400),
    });
  };
  
  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden z-20">
      <svg
        width={mapWidth}
        height={mapHeight}
        className="overflow-visible"
        style={{ cursor: "pointer" }}
      >
        {/* Fundo do mini mapa */}
        <rect
          x={0}
          y={0}
          width={mapWidth}
          height={mapHeight}
          fill="rgba(0, 0, 0, 0.05)"
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth={1}
          onClick={handleMapClick}
        />
        
        {/* Conexões */}
        {connections && connections.map((connection) => {
          const sourceNode = nodes.find((n) => n.id === connection.sourceNodeId);
          const targetNode = nodes.find((n) => n.id === connection.targetNodeId);
          
          if (!sourceNode || !targetNode) return null;
          
          const sourceX = (sourceNode.position.x - boundsWithMargin.minX) * scale + 5;
          const sourceY = (sourceNode.position.y - boundsWithMargin.minY) * scale + 5;
          const targetX = (targetNode.position.x - boundsWithMargin.minX) * scale + 5;
          const targetY = (targetNode.position.y - boundsWithMargin.minY) * scale + 5;
          
          return (
            <line
              key={connection.id}
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke="rgba(0, 0, 0, 0.3)"
              strokeWidth={1}
            />
          );
        })}
        
        {/* Nodes */}
        {nodes && nodes.map((node) => {
          const x = (node.position.x - boundsWithMargin.minX) * scale;
          const y = (node.position.y - boundsWithMargin.minY) * scale;
          const nodeWidth = 10;
          const nodeHeight = 6;
          
          // Cor do node com base no tipo
          let fill = "rgba(0, 0, 0, 0.3)";
          if (node.type === "trigger") fill = "rgba(249, 115, 22, 0.5)";
          if (node.type === "process") fill = "rgba(168, 85, 247, 0.5)";
          if (node.type === "ai-task") fill = "rgba(59, 130, 246, 0.5)";
          
          return (
            <rect
              key={node.id}
              x={x}
              y={y}
              width={nodeWidth}
              height={nodeHeight}
              fill={fill}
              rx={1}
              ry={1}
            />
          );
        })}
        
        {/* Viewport */}
        <rect
          x={viewportRect.x}
          y={viewportRect.y}
          width={viewportRect.width}
          height={viewportRect.height}
          fill="none"
          stroke="rgba(0, 0, 0, 0.5)"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
      </svg>
    </div>
  );
}
