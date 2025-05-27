// Arquivo: components/canvas/canvas-mini-map.tsx

/**
 * Componente CanvasMiniMap
 * 
 * Este componente renderiza um mini mapa do canvas,
 * mostrando a posição atual da viewport e permitindo navegação rápida.
 */

"use client";

import React from "react";

interface CanvasMiniMapProps {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
  }>;
  connections: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
  }>;
  viewportPosition: { x: number; y: number };
  viewportScale: number;
  onViewportChange: (position: { x: number; y: number }) => void;
}

export function CanvasMiniMap({
  nodes,
  connections,
  viewportPosition,
  viewportScale,
  onViewportChange
}: CanvasMiniMapProps) {
  // Dimensões do mini mapa
  const mapWidth = 150;
  const mapHeight = 100;
  
  // Calcular limites do canvas com base nos nodes
  const bounds = React.useMemo(() => {
    if (nodes.length === 0) {
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
  bounds.minX -= margin;
  bounds.minY -= margin;
  bounds.maxX += margin;
  bounds.maxY += margin;
  
  // Calcular escala para o mini mapa
  const scaleX = mapWidth / (bounds.maxX - bounds.minX);
  const scaleY = mapHeight / (bounds.maxY - bounds.minY);
  const scale = Math.min(scaleX, scaleY);
  
  // Calcular viewport no mini mapa
  const viewportWidth = window.innerWidth / viewportScale;
  const viewportHeight = window.innerHeight / viewportScale;
  
  const viewportRect = {
    x: (-viewportPosition.x / viewportScale - bounds.minX) * scale,
    y: (-viewportPosition.y / viewportScale - bounds.minY) * scale,
    width: viewportWidth * scale,
    height: viewportHeight * scale,
  };
  
  // Manipulador de clique no mini mapa
  const handleMapClick = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Converter coordenadas do clique para posição no canvas
    const canvasX = bounds.minX + x / scale;
    const canvasY = bounds.minY + y / scale;
    
    // Centralizar viewport na posição clicada
    onViewportChange({
      x: -canvasX * viewportScale + window.innerWidth / 2,
      y: -canvasY * viewportScale + window.innerHeight / 2,
    });
  };
  
  return (
    <div className="rounded-md bg-background/80 p-1 shadow-md backdrop-blur-sm">
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
        {connections.map((connection) => {
          const sourceNode = nodes.find((n) => n.id === connection.sourceNodeId);
          const targetNode = nodes.find((n) => n.id === connection.targetNodeId);
          
          if (!sourceNode || !targetNode) return null;
          
          const sourceX = (sourceNode.position.x - bounds.minX) * scale + 5;
          const sourceY = (sourceNode.position.y - bounds.minY) * scale + 5;
          const targetX = (targetNode.position.x - bounds.minX) * scale + 5;
          const targetY = (targetNode.position.y - bounds.minY) * scale + 5;
          
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
        {nodes.map((node) => {
          const x = (node.position.x - bounds.minX) * scale;
          const y = (node.position.y - bounds.minY) * scale;
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
