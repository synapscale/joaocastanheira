"use client"
/**
 * Sidebar Component
 *
 * Componente de barra lateral principal que fornece navegação para todas as áreas do aplicativo.
 * Inclui seções para funcionalidades principais, desenvolvimento, workflows recentes e configurações.
 */

import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  LayoutGrid,
  Menu,
  Settings,
  History,
  BookOpen,
  Box,
  ShoppingBag,
  BookTemplate,
  FileCode,
  Variable,
  MessageSquare,
  Workflow,
  Layers,
  PanelLeft,
} from "lucide-react"

/**
 * Componente de barra lateral principal.
 *
 * @returns Componente React
 */
export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Alterna o estado de abertura da barra lateral
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  // Fecha a barra lateral em dispositivos móveis quando o caminho muda
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Overlay para dispositivos móveis */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={toggle}
          aria-hidden="true"
        />
      )}

      {/* Barra lateral principal */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card transition-transform duration-300 ease-in-out lg:static lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Cabeçalho da barra lateral */}
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Workflow className="h-6 w-6" />
            <span>AI Agents JC</span>
          </Link>
        </div>

        {/* Conteúdo principal da barra lateral */}
        <div className="flex-1 overflow-auto">
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground" id="main-nav-heading">
              Principal
            </h3>
            <div className="space-y-1" role="navigation" aria-labelledby="main-nav-heading">
              <NavItem
                href="/canvas"
                icon={<LayoutGrid className="h-5 w-5" />}
                label="Editor de Workflow"
                pathname={pathname}
              />
              <NavItem
                href="/chat"
                icon={<MessageSquare className="h-5 w-5" />}
                label="Chat Interativo"
                pathname={pathname}
              />
              <NavItem
                href="/marketplace"
                icon={<ShoppingBag className="h-5 w-5" />}
                label="Marketplace"
                pathname={pathname}
              />
            </div>
          </div>
          
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground" id="resources-nav-heading">
              Recursos
            </h3>
            <div className="space-y-1" role="navigation" aria-labelledby="resources-nav-heading">
              <NavItem
                href="/templates"
                icon={<BookTemplate className="h-5 w-5" />}
                label="Templates"
                pathname={pathname}
              />
              <NavItem
                href="/templates/code-templates"
                icon={<FileCode className="h-5 w-5" />}
                label="Templates de Código"
                pathname={pathname}
              />
              <NavItem
                href="/variables"
                icon={<Variable className="h-5 w-5" />}
                label="Variáveis"
                pathname={pathname}
              />
            </div>
          </div>
          
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground" id="dev-nav-heading">
              Desenvolvimento
            </h3>
            <div className="space-y-1" role="navigation" aria-labelledby="dev-nav-heading">
              <NavItem
                href="/executions"
                icon={<History className="h-5 w-5" />}
                label="Execuções"
                pathname={pathname}
              />
              <NavItem 
                href="/docs" 
                icon={<BookOpen className="h-5 w-5" />} 
                label="Documentação" 
                pathname={pathname} 
              />
              <NavItem
                href="/node-definitions"
                icon={<Box className="h-5 w-5" />}
                label="Templates de Nós"
                pathname={pathname}
              />
              <NavItem
                href="/components"
                icon={<Layers className="h-5 w-5" />}
                label="Componentes"
                pathname={pathname}
              />
            </div>
          </div>
          
          <Separator />
          
          {/* Área rolável para lista de workflows */}
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground" id="recent-workflows-heading">
              Workflows Recentes
            </h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-1" role="list" aria-labelledby="recent-workflows-heading">
                {[
                  "Automação de Marketing",
                  "Processamento de Dados",
                  "Integração de API",
                  "Sequência de Email",
                  "Jornada do Cliente",
                ].map((workflow, index) => (
                  <div
                    key={index}
                    className="flex items-center rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                    role="listitem"
                  >
                    {workflow}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Rodapé da barra lateral */}
        <div className="mt-auto p-4">
          <Separator className="mb-4" />
          <NavItem 
            href="/settings" 
            icon={<Settings className="h-5 w-5" />} 
            label="Configurações" 
            pathname={pathname} 
          />
        </div>
      </div>
      
      {/* Botão de alternância móvel - fixo no canto inferior esquerdo */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggle}
        className="fixed bottom-4 left-4 z-40 rounded-full shadow-md lg:hidden"
        aria-label="Abrir menu de navegação"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Alternar barra lateral</span>
      </Button>
    </>
  )
}

/**
 * Componente de Item de Navegação
 *
 * Renderiza um único link de navegação com estilo de estado ativo.
 *
 * @param props - Propriedades do componente
 * @param props.href - O destino do link
 * @param props.icon - O ícone a ser exibido
 * @param props.label - O rótulo de texto
 * @param props.pathname - O caminho atual para comparação de estado ativo
 * @returns Um link de navegação estilizado
 */
interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  pathname: string
}

/**
 * Componente de item de navegação.
 *
 * @param props - Propriedades do componente
 * @param props.href - Destino do link
 * @param props.icon - Ícone a ser exibido
 * @param props.label - Texto do link
 * @param props.pathname - Caminho atual para determinar estado ativo
 */
function NavItem({ href, icon, label, pathname }: NavItemProps) {
  // Determina se este item de navegação está ativo com base no caminho atual
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
  
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {icon}
      {label}
    </Link>
  )
}
