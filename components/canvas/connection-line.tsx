"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ConnectionLineProps {
  id: string;
  source?: { x: number; y: number };
  target?: { x: number; y: number };
  isSelected?: boolean;
  isConnecting?: boolean;
  onSelect?: (isMultiSelect: boolean) => void;
}

export function ConnectionLine({
  id,
  source,
  target,
  isSelected = false,
  isConnecting = false,
  onSelect
}: ConnectionLineProps) {
  // Se não tiver source ou target, não renderiza
  if (!source && !target) return null;
  
  // Se estiver conectando e faltar um dos pontos, usa o outro como referência
  const start = source || target || { x: 0, y: 0 };
  const end = target || source || { x: 0, y: 0 };
  
  // Usar linha reta com traços em vez de curva Bezier para corresponder ao design original
  const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  
  // Calcular path para a área de detecção (mais larga para facilitar a seleção)
  const hitAreaPath = path;
  
  return (
    <g>
      {/* Linha de conexão - ajustada para corresponder exatamente ao design original */}
      <path
        d={path}
        fill="none"
        stroke="#999999"
        strokeWidth={2}
        strokeDasharray="4,4"
        className={cn(
          isSelected && "stroke-blue-400 stroke-[3px]",
          isConnecting && "stroke-blue-400"
        )}
      />
      
      {/* Área de detecção para interação */}
      {onSelect && (
        <path
          d={hitAreaPath}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(e.ctrlKey || e.shiftKey);
          }}
          className="cursor-pointer"
        />
      )}
    </g>
  );
}
