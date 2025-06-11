// Arquivo: components/canvas/navigation-hints.tsx

/**
 * Componente NavigationHints
 * 
 * Este componente exibe dicas de navegação e atalhos de teclado
 * para ajudar o usuário a interagir com o canvas.
 */

"use client";

import React, { useState } from "react";

export function NavigationHints() {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="absolute top-4 right-4">
      <button
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
        onClick={() => setIsVisible(!isVisible)}
      >
        ?
      </button>
      
      {isVisible && (
        <div className="mt-2 w-64 rounded-md bg-background p-4 shadow-lg">
          <h3 className="mb-2 font-medium">Atalhos de Navegação</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Mover Canvas</span>
              <span className="text-muted-foreground">Arrastar com Mouse</span>
            </div>
            
            <div className="flex justify-between">
              <span>Zoom In/Out</span>
              <span className="text-muted-foreground">Scroll do Mouse</span>
            </div>
            
            <div className="flex justify-between">
              <span>Selecionar Node</span>
              <span className="text-muted-foreground">Clique</span>
            </div>
            
            <div className="flex justify-between">
              <span>Seleção Múltipla</span>
              <span className="text-muted-foreground">Ctrl + Clique</span>
            </div>
            
            <div className="flex justify-between">
              <span>Seleção por Área</span>
              <span className="text-muted-foreground">Ctrl + Arrastar</span>
            </div>
            
            <div className="flex justify-between">
              <span>Mover Node</span>
              <span className="text-muted-foreground">Arrastar Node</span>
            </div>
            
            <div className="flex justify-between">
              <span>Criar Conexão</span>
              <span className="text-muted-foreground">Arrastar de Porta a Porta</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
