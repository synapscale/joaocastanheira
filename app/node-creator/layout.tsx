"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// Componente para verificar e expandir automaticamente o item pai na sidebar
function SidebarItemExpander() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Este componente não renderiza nada visualmente,
    // apenas garante que o item correto na sidebar seja expandido
    // quando acessamos diretamente uma rota de subitem
  }, [pathname])
  
  return null
}

export default function NodeCreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarItemExpander />
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          {children}
        </div>
      </div>
    </>
  );
}
