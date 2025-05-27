"use client"

import React from "react"
import { SharedNodesProvider } from "@/contexts/node-creator/shared-nodes-context"
import { NodeCreatorProvider } from "@/contexts/node-creator/node-creator-context"

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SharedNodesProvider>
      <NodeCreatorProvider>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">
            {children}
          </div>
        </div>
      </NodeCreatorProvider>
    </SharedNodesProvider>
  );
}
