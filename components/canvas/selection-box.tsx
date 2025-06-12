// Arquivo: components/canvas/selection-box.tsx

/**
 * Componente SelectionBox
 * 
 * Este componente renderiza uma caixa de seleção no canvas,
 * usada para selecionar múltiplos nodes.
 */

"use client";

import React from "react";

interface SelectionBoxProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export function SelectionBox({ start, end }: SelectionBoxProps) {
  // Calcular dimensões da caixa de seleção
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  
  return (
    <div
      className="absolute border border-primary bg-primary/10"
      style={{
        left,
        top,
        width,
        height
      }}
    />
  );
}
