// Arquivo: components/canvas/canvas-grid.tsx

/**
 * Componente CanvasGrid
 * 
 * Este componente renderiza o grid de fundo do canvas,
 * com linhas para orientação visual conforme o design original.
 */

"use client";

import React from "react";

interface CanvasGridProps {
  scale?: number;
  position?: { x: number; y: number };
}

export function CanvasGrid({ scale = 1, position = { x: 0, y: 0 } }: CanvasGridProps) {
  // Tamanho da célula do grid - ajustado para corresponder ao design original
  const gridSize = 20;
  
  // Calcular offset do grid com base na posição do canvas
  const offsetX = position.x % (gridSize * scale);
  const offsetY = position.y % (gridSize * scale);
  
  // Estilo para o grid de linhas - ajustado para corresponder exatamente ao design original
  const gridStyle = {
    backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`,
    backgroundImage: `
      linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
    `,
    backgroundPosition: `${offsetX}px ${offsetY}px`
  };
  
  return (
    <div className="absolute inset-0 bg-white">
      {/* Grid de linhas */}
      <div className="absolute inset-0" style={gridStyle} />
    </div>
  );
}
