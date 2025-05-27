"use client"

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
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * Navigation configuration for centralized management
 * Organized by logical sections for better maintainability
 */
const NAVIGATION_CONFIG = {
  application: {
    title: "Application",
    description: "Core application features and tools",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Main application dashboard",
      },
      {
        href: "/canvas",
        label: "Canvas",
        icon: Palette,
        description: "Visual workflow designer",
      },
      {
        href: "/skills",
        label: "Skills",
        icon: Zap,
        description: "Skill management and development",
      },
      {
        href: "/marketplace",
        label: "Marketplace",
        icon: ShoppingBag,
        description: "Browse and install marketplace items",
      },
    ],
  },
  tasks: {
    title: "Tasks",
    description: "Task management and workflow coordination",
    items: [
      {
        href: "/tasks",
        label: "Tasks",
        icon: ListChecks,
        description: "View and manage all tasks",
      },
      {
        href: "/tasks/create",
        label: "Create Task",
        icon: Plus,
        description: "Create new tasks and assignments",
      },
    ],
  },
  admin: {
    title: "Admin",
    description: "Administrative functions and user management",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Administrative overview and system metrics",
      },
      {
        href: "/admin/users",
        label: "Users",
        icon: User,
        description: "User management and permissions",
      },
      {
        href: "/admin/users/create",
        label: "Create User",
        icon: UserPlus,
        description: "Add new users to the system",
      },
    ],
  },
  settings: {
    title: "Settings",
    description: "Application configuration and preferences",
    items: [
      {
        href: "/settings",
        label: "Settings",
        icon: Settings,
        description: "Application settings and preferences",
      },
    ],
  },
} as const

/**
 * Development tools configuration
 * Separated for conditional rendering in development environment
 */
const DEVELOPMENT_CONFIG = {
  title: "Development",
  description: "Development tools and testing utilities",
  items: [
    {
      href: "/test/integration",
      label: "Integration Tests",
      icon: TestTube,
      description: "Run integration tests and diagnostics",
    },
  ],
} as const

/**
 * UnifiedSidebar Component
 *
 * Provides consistent navigation across the application with hierarchical structure.
 * Implements AI-friendly patterns with clear naming and semantic organization.
 *
 * Features:
 * - Hierarchical navigation with logical grouping
 * - Active route highlighting with precise matching
 * - Development tools (conditionally rendered)
 * - Semantic HTML structure for accessibility
 * - Responsive design with consistent styling
 *
 * @returns JSX.Element - The rendered sidebar navigation
 */

interface UnifiedSidebarProps {
  itemVariant?: "default" | "compact" | "minimal"
  showDevelopmentTools?: boolean
  showBadges?: boolean
  showTooltips?: boolean
  className?: string
}

export function UnifiedSidebar({
  itemVariant = "default",
  showDevelopmentTools,
  showBadges = true,
  showTooltips = true,
  className,
}: UnifiedSidebarProps = {}) {
  const currentPathname = usePathname()

  /**
   * Determines if a navigation item should be highlighted as active
   * Uses precise matching logic for accurate state representation
   */
  const isNavigationItemActive = (itemHref: string): boolean => {
    if (itemHref === "/") {
      return currentPathname === "/"
    }
    return currentPathname?.startsWith(itemHref) ?? false
  }

  /**
   * Renders a complete navigation section with header and items
   * Encapsulates section rendering logic for consistency
   */
  const renderNavigationSection = (
    sectionKey: string,
    sectionConfig: (typeof NAVIGATION_CONFIG)[keyof typeof NAVIGATION_CONFIG],
  ) => (
    <section key={sectionKey} className="space-y-2">
      <header className="px-3 py-2">
        <h2
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          title={sectionConfig.description}
        >
          {sectionConfig.title}
        </h2>
      </header>

      <nav className="flex flex-col space-y-1 px-2" role="navigation" aria-label={`${sectionConfig.title} navigation`}>
        {sectionConfig.items.map((navigationItem) => {
          const IconComponent = navigationItem.icon
          const isCurrentlyActive = isNavigationItemActive(navigationItem.href)

          return (
            <Link
              key={navigationItem.href}
              href={navigationItem.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                isCurrentlyActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
              aria-current={isCurrentlyActive ? "page" : undefined}
              title={showTooltips ? navigationItem.description : undefined}
            >
              <IconComponent className="h-4 w-4" aria-hidden="true" />
              <span>{navigationItem.label}</span>
            </Link>
          )
        })}
      </nav>
    </section>
  )

  /**
   * Renders development tools section with environment check
   * Only visible in development environment for debugging
   */
  const renderDevelopmentToolsSection = () => {
    const shouldShow = showDevelopmentTools ?? process.env.NODE_ENV === "development"

    if (!shouldShow) {
      return null
    }

    return (
      <section className="mt-auto pt-4 border-t border-border">
        <header className="px-3 py-2">
          <h3
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            title={DEVELOPMENT_CONFIG.description}
          >
            {DEVELOPMENT_CONFIG.title}
          </h3>
        </header>

        <nav className="space-y-1 px-2" role="navigation" aria-label={`${DEVELOPMENT_CONFIG.title} navigation`}>
          {DEVELOPMENT_CONFIG.items.map((developmentItem) => {
            const IconComponent = developmentItem.icon
            const isCurrentlyActive = isNavigationItemActive(developmentItem.href)

            return (
              <Link
                key={developmentItem.href}
                href={developmentItem.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  isCurrentlyActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
                aria-current={isCurrentlyActive ? "page" : undefined}
                title={showTooltips ? developmentItem.description : undefined}
              >
                <IconComponent className="h-4 w-4" aria-hidden="true" />
                <span>{developmentItem.label}</span>
              </Link>
            )
          })}
        </nav>
      </section>
    )
  }

  return (
    <aside
      className={cn("flex flex-col h-full w-full space-y-4 p-4", className)}
      role="complementary"
      aria-label="Main application navigation"
    >
      {/* Logo/Brand */}
      <div className="px-3 py-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CA</span>
          </div>
          <span className="font-semibold text-lg">Canva & Agentes</span>
        </Link>
      </div>

      {/* Primary navigation sections */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {Object.entries(NAVIGATION_CONFIG).map(([sectionKey, sectionConfig]) =>
          renderNavigationSection(sectionKey, sectionConfig),
        )}
      </div>

      {/* Development tools section (conditional) */}
      {renderDevelopmentToolsSection()}
    </aside>
  )
}
