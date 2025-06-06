"use client"

import React from "react"
import { SharedNodesProvider } from "@/contexts/node-creator/shared-nodes-context"
import { NodeCreatorProvider } from "@/contexts/node-creator/node-creator-context"
import { NodeDefinitionProvider } from "@/context/node-definition-context"

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NodeDefinitionProvider>
      <SharedNodesProvider>
        <NodeCreatorProvider>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">
              {children}
            </div>
          </div>
        </NodeCreatorProvider>
      </SharedNodesProvider>
    </NodeDefinitionProvider>
  );
}
