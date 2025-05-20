"use client"

import React from "react"
import { Metadata } from "next";

// Componente simplificado para resolver o problema de importação
const NodeSidebar = () => {
  return <div>Node Sidebar Component (Placeholder)</div>
}

export const metadata: Metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function WorkflowPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editor de Workflow</h1>
      <div className="bg-white rounded-lg shadow-md p-4">
        <NodeSidebar />
      </div>
    </div>
  )
}
