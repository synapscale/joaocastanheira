/**
 * CONFIGURAÇÃO DE NAVEGAÇÃO CENTRALIZADA
 *
 * Configuração unificada para toda a navegação da aplicação.
 * Separada da lógica de renderização para melhor manutenibilidade.
 */

import type { LucideIcon } from "lucide-react"
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
  Terminal,
} from "lucide-react"

/**
 * Tipo para item de navegação
 */
export interface NavigationItem {
  href: string
  label: string
  icon: LucideIcon
  description: string
  badge?: string | number
  disabled?: boolean
  external?: boolean
  /** Short label for minimized state */
  shortLabel?: string
  /** Priority for minimized state (higher = more likely to show) */
  priority?: number
}

/**
 * Tipo para seção de navegação
 */
export interface NavigationSection {
  title: string
  description: string
  items: NavigationItem[]
  collapsible?: boolean
  defaultExpanded?: boolean
  /** Short title for minimized state */
  shortTitle?: string
  /** Whether section should be visible in minimized state */
  showInMinimized?: boolean
}

/**
 * Configuração principal de navegação - Interface em Português
 */
export const NAVIGATION_CONFIG: Record<string, NavigationSection> = {
  admin: {
    title: "ADMIN",
    shortTitle: "ADM",
    description: "Funções administrativas e gerenciamento de usuários",
    showInMinimized: true,
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        shortLabel: "Dash",
        icon: LayoutDashboard,
        description: "Visão geral administrativa e métricas do sistema",
        priority: 10,
      },
      {
        href: "/admin/users",
        label: "Users",
        shortLabel: "Users",
        icon: User,
        description: "Gerenciamento de usuários e permissões",
        priority: 8,
      },
      {
        href: "/admin/users/create",
        label: "Create User",
        shortLabel: "Novo",
        icon: UserPlus,
        description: "Adicionar novos usuários ao sistema",
        priority: 5,
      },
    ],
  },
  tasks: {
    title: "TASKS",
    shortTitle: "TASK",
    description: "Gerenciamento de tarefas e coordenação de fluxo de trabalho",
    showInMinimized: true,
    items: [
      {
        href: "/tasks",
        label: "Tasks",
        shortLabel: "Tasks",
        icon: ListChecks,
        description: "Visualizar e gerenciar todas as tarefas",
        priority: 9,
      },
      {
        href: "/tasks/create",
        label: "Create Task",
        shortLabel: "Nova",
        icon: Plus,
        description: "Criar novas tarefas e atribuições",
        priority: 6,
      },
    ],
  },
  application: {
    title: "APPLICATION",
    shortTitle: "APP",
    description: "Recursos principais da aplicação e ferramentas",
    showInMinimized: true,
    items: [
      {
        href: "/",
        label: "Dashboard",
        shortLabel: "Home",
        icon: LayoutDashboard,
        description: "Dashboard principal da aplicação",
        priority: 10,
      },
      {
        href: "/skills",
        label: "Skills",
        shortLabel: "Skills",
        icon: Zap,
        description: "Gerenciamento e desenvolvimento de habilidades",
        priority: 9,
      },
      {
        href: "/canvas",
        label: "Canvas",
        shortLabel: "Canvas",
        icon: Palette,
        description: "Designer visual de fluxo de trabalho",
        priority: 8,
      },
      {
        href: "/marketplace",
        label: "Marketplace",
        shortLabel: "Market",
        icon: ShoppingBag,
        description: "Navegar e instalar itens do marketplace",
        priority: 7,
      },
    ],
  },
  settings: {
    title: "SETTINGS",
    shortTitle: "CONF",
    description: "Configuração da aplicação e preferências",
    showInMinimized: true,
    items: [
      {
        href: "/settings",
        label: "Settings",
        shortLabel: "Config",
        icon: Settings,
        description: "Configurações da aplicação e preferências",
        priority: 6,
      },
    ],
  },
} as const

/**
 * Item especial do Console (fora das seções principais)
 */
export const CONSOLE_ITEM: NavigationItem = {
  href: "/console",
  label: "Console",
  shortLabel: "CLI",
  icon: Terminal,
  description: "Console de desenvolvimento e debugging",
  priority: 4,
}

/**
 * Configuração de ferramentas de desenvolvimento
 */
export const DEVELOPMENT_CONFIG: NavigationSection = {
  title: "DEVELOPMENT",
  shortTitle: "DEV",
  description: "Ferramentas de desenvolvimento e utilitários de teste",
  showInMinimized: false,
  items: [
    {
      href: "/test/integration",
      label: "Integration Tests",
      shortLabel: "Tests",
      icon: TestTube,
      description: "Executar testes de integração e diagnósticos",
      priority: 3,
    },
  ],
} as const

/**
 * Utilitários para configuração de navegação
 */
export const NavigationUtils = {
  /**
   * Obtém todas as seções de navegação
   */
  getAllSections: () => Object.entries(NAVIGATION_CONFIG),

  /**
   * Obtém seção específica por chave
   */
  getSection: (key: string) => NAVIGATION_CONFIG[key],

  /**
   * Obtém item do console
   */
  getConsoleItem: () => CONSOLE_ITEM,

  /**
   * Obtém configuração de desenvolvimento
   */
  getDevelopmentConfig: () => DEVELOPMENT_CONFIG,

  /**
   * Verifica se deve mostrar ferramentas de desenvolvimento
   */
  shouldShowDevelopmentTools: () => process.env.NODE_ENV === "development",
} as const
