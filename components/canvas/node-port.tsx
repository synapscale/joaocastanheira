// Arquivo: components/canvas/node-port.tsx

/**
 * Componente NodePort
 * 
 * Este componente representa uma porta de entrada ou saída em um node,
 * permitindo conexões entre nodes.
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NodePortProps {
  id: string;
  name: string;
  type: "input" | "output";
  dataType: string;
  onStartConnect: () => void;
  onEndConnect: () => void;
}

export function NodePort({
  id,
  name,
  type,
  dataType,
  onStartConnect,
  onEndConnect
}: NodePortProps) {
  // Determinar cor da porta com base no tipo de dados
  const getPortColor = (dataType: string) => {
    switch (dataType.toLowerCase()) {
      case "string":
        return "bg-green-500";
      case "number":
        return "bg-blue-500";
      case "boolean":
        return "bg-yellow-500";
      case "object":
        return "bg-purple-500";
      case "array":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <div
      className={cn(
        "flex items-center py-1",
        type === "input" ? "flex-row" : "flex-row-reverse"
      )}
    >
      {/* Ponto de conexão */}
      <div
        className={cn(
          "h-3 w-3 rounded-full border border-background",
          getPortColor(dataType),
          type === "input" ? "-ml-1.5" : "-mr-1.5"
        )}
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartConnect();
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onEndConnect();
        }}
      />
      
      {/* Nome da porta */}
      <div
        className={cn(
          "px-2 text-xs",
          type === "input" ? "ml-1" : "mr-1"
        )}
      >
        {name}
      </div>
    </div>
  );
}
