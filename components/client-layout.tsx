"use client"

import React from "react"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/context/sidebar-context"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Navegação lateral */}
      <div className="fixed top-0 left-0 h-full z-30">
        <Sidebar />
      </div>
      
      {/* Área de conteúdo principal sem espaço em branco */}
      <main 
        className="flex-1 w-full transition-all duration-300"
        style={{ 
          marginLeft: isCollapsed ? '4.5rem' : '16rem',
          width: 'calc(100% - ' + (isCollapsed ? '4.5rem' : '16rem') + ')'
        }}
        role="main"
      >
        {children}
      </main>
    </div>
  )
}
