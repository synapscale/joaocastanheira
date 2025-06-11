// Arquivo: components/canvas/canvas-grid.tsx

/**
 * Componente CanvasGrid
 * 
 * Este componente renderiza o grid de fundo do canvas,
 * com padrão de bolinhas para orientação visual conforme o design original.
 */

"use client";

import React from "react";

interface CanvasGridProps {
  scale?: number;
  position?: { x: number; y: number };
}

export function CanvasGrid({ scale = 1, position = { x: 0, y: 0 } }: CanvasGridProps) {
  // Tamanho da célula do grid - ajustado para corresponder ao design original
  const gridSize = 40; // Aumentado o espaçamento entre as bolinhas conforme solicitado
  
  // Calcular offset do grid com base na posição do canvas
  const offsetX = position.x % (gridSize * scale);
  const offsetY = position.y % (gridSize * scale);
  
  // Estilo para o grid de bolinhas - conforme design original
  const dotSize = 1; // Tamanho das bolinhas em pixels
  const dotColor = "rgba(0, 0, 0, 0.05)"; // Cor das bolinhas - cinza bem suave, quase invisível
  
  const gridStyle = {
    backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`,
    backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
    backgroundPosition: `${offsetX}px ${offsetY}px`,
    backgroundColor: "#F9FAFB", // Cor exata do fundo conforme especificação
    width: "200vw", // Usar 200vw para garantir cobertura em qualquer zoom
    height: "200vh", // Usar 200vh para garantir cobertura em qualquer zoom
    position: "absolute",
    top: "-50vh",
    left: "-50vw",
  };
  
  return (
    <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: "#F9FAFB" }}>
      {/* Grid de bolinhas */}
      <div className="absolute inset-0 w-full h-full" style={gridStyle} />
    </div>
  );
}
