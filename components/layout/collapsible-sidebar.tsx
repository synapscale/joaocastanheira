"use client"

import { memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebarState } from "@/hooks/use-sidebar-state"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings,
  User,
  UserPlus,
  TestTube,
  Palette,
  ShoppingBag,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

/**
 * Configuração de navegação
 */
const NAVIGATION_CONFIG = {
  application: {
    title: "Application",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/canvas", label: "Canvas", icon: Palette },
      { href: "/skills", label: "Skills", icon: Zap },
      { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    ],
  },
  tasks: {
    title: "Tasks",
    items: [
      { href: "/tasks", label: "Tasks", icon: ListChecks },
      { href: "/tasks/create", label: "Create Task", icon: Plus },
    ],
  },
  admin: {
    title: "Admin",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users", icon: User },
      { href: "/admin/users/create", label: "Create User", icon: UserPlus },
    ],
  },
  settings: {
    title: "Settings",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
} as const

const DEVELOPMENT_CONFIG = {
  title: "Development",
  items: [{ href: "/test/integration", label: "Integration Tests", icon: TestTube }],
} as const

interface CollapsibleSidebarProps {
  showDevelopmentTools?: boolean
  className?: string
}

export const CollapsibleSidebar = memo(function CollapsibleSidebar({
  showDevelopmentTools,
  className,
}: CollapsibleSidebarProps) {
  const pathname = usePathname()
  const sidebarState = useSidebarState()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href) ?? false
  }

  const renderNavItem = (item: any, sectionKey: string) => {
    const IconComponent = item.icon
    const active = isActive(item.href)

    const navItem = (
      <Link
        key={`${sectionKey}-${item.href}`}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
          active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          sidebarState.isCollapsed && "justify-center px-2",
        )}
        aria-current={active ? "page" : undefined}
      >
        <IconComponent className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        {!sidebarState.isCollapsed && <span className="truncate">{item.label}</span>}
      </Link>
    )

    if (sidebarState.isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip key={`${sectionKey}-${item.href}`}>
            <TooltipTrigger asChild>{navItem}</TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return navItem
  }

  const renderSection = (sectionKey: string, sectionConfig: any) => (
    <section key={sectionKey} className="space-y-2">
      {!sidebarState.isCollapsed && (
        <header className="px-3 py-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {sectionConfig.title}
          </h2>
        </header>
      )}
      <nav className="flex flex-col space-y-1 px-2">
        {sectionConfig.items.map((item: any) => renderNavItem(item, sectionKey))}
      </nav>
    </section>
  )

  const renderDevelopmentSection = () => {
    const shouldShow = showDevelopmentTools ?? process.env.NODE_ENV === "development"
    if (!shouldShow) return null

    return (
      <section className="mt-auto pt-4 border-t border-border">
        {!sidebarState.isCollapsed && (
          <header className="px-3 py-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {DEVELOPMENT_CONFIG.title}
            </h3>
          </header>
        )}
        <nav className="space-y-1 px-2">
          {DEVELOPMENT_CONFIG.items.map((item) => renderNavItem(item, "development"))}
        </nav>
      </section>
    )
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out",
        sidebarState.isCollapsed ? "w-16" : "w-64",
        className,
      )}
      style={{ width: sidebarState.isCollapsed ? "64px" : "256px" }}
    >
      {/* Header com Logo e Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!sidebarState.isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CA</span>
            </div>
            <span className="font-semibold text-lg truncate">Canva & Agentes</span>
          </Link>
        )}

        {sidebarState.isCollapsed && (
          <Link href="/" className="flex items-center justify-center w-full">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CA</span>
            </div>
          </Link>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={sidebarState.toggle}
          className={cn("h-8 w-8 p-0", sidebarState.isCollapsed && "ml-0")}
          aria-label={sidebarState.isCollapsed ? "Expandir sidebar" : "Minimizar sidebar"}
        >
          {sidebarState.isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-6 p-4 overflow-y-auto">
        {Object.entries(NAVIGATION_CONFIG).map(([sectionKey, sectionConfig]) =>
          renderSection(sectionKey, sectionConfig),
        )}
      </div>

      {/* Development Tools */}
      {renderDevelopmentSection()}
    </aside>
  )
})
