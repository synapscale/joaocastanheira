// Configuração unificada de navegação para o projeto SynapScale

import React from 'react';
import { 
  Home, 
  Layers, 
  Bot, 
  FileCode, 
  MessagesSquare, 
  UserRound, 
  Cog,
  Puzzle,
  Store,
  Key,
  LayoutGrid,
  BookOpen,
  Box,
  BookTemplate,
  Variable,
  History,
  Settings,
  BarChart3,
  Activity,
  Shield,
  CreditCard,
  Users,
  Monitor,
  Workflow,
  Building,
  FileText,
  MessageSquare,
  Crown,
  ChevronDown,
  ChevronRight,
  Upload
} from "lucide-react"

// Tipo para itens de navegação
export interface NavItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children?: NavItem[];
  collapsed?: boolean;
  adminOnly?: boolean;
  // Compatibilidade com estrutura antiga
  name?: string;
}

// Função para renderizar ícones dinamicamente a partir do nome
export function renderIcon(iconName: string, className: string = "h-5 w-5") {
  // Garantir que iconName não seja undefined
  if (!iconName) {
    return React.createElement("div", { className });
  }
  
  switch (iconName) {
    case "Home":
      return React.createElement(Home, { className });
    case "Layers":
      return React.createElement(Layers, { className });
    case "Bot":
      return React.createElement(Bot, { className });
    case "FileCode":
      return React.createElement(FileCode, { className });
    case "MessagesSquare":
      return React.createElement(MessagesSquare, { className });
    case "UserRound":
      return React.createElement(UserRound, { className });
    case "Cog":
      return React.createElement(Cog, { className });
    case "Puzzle":
      return React.createElement(Puzzle, { className });
    case "Store":
      return React.createElement(Store, { className });
    case "Key":
      return React.createElement(Key, { className });
    case "LayoutGrid":
      return React.createElement(LayoutGrid, { className });
    case "BookOpen":
      return React.createElement(BookOpen, { className });
    case "Box":
      return React.createElement(Box, { className });
    case "BookTemplate":
      return React.createElement(BookTemplate, { className });
    case "Variable":
      return React.createElement(Variable, { className });
    case "History":
      return React.createElement(History, { className });
    case "Settings":
      return React.createElement(Settings, { className });
    case "BarChart3":
      return React.createElement(BarChart3, { className });
    case "Activity":
      return React.createElement(Activity, { className });
    case "Shield":
      return React.createElement(Shield, { className });
    case "CreditCard":
      return React.createElement(CreditCard, { className });
    case "Users":
      return React.createElement(Users, { className });
    case "Monitor":
      return React.createElement(Monitor, { className });
    case "Workflow":
      return React.createElement(Workflow, { className });
    case "Building":
      return React.createElement(Building, { className });
    case "FileText":
      return React.createElement(FileText, { className });
    case "MessageSquare":
      return React.createElement(MessageSquare, { className });
    case "Crown":
      return React.createElement(Crown, { className });
    case "ChevronDown":
      return React.createElement(ChevronDown, { className });
    case "ChevronRight":
      return React.createElement(ChevronRight, { className });
    default:
      // Fallback para ícones não encontrados
      console.warn(`Ícone não encontrado: ${iconName}`);
      return React.createElement("div", { className }, iconName.charAt(0));
  }
}

// Configuração unificada de navegação
const navItems: NavItem[] = [
  {
    title: "Workflows",
    href: "/workflows",
    icon: Layers,
  },
  {
    title: "Criação de Nodes",
    href: "/node-creator",
    icon: Puzzle,
    children: [
      {
        title: "Biblioteca de Nodes",
        href: "/node-creator/library",
        icon: Box,
      },
      {
        title: "Publicar Node",
        href: "/node-creator/publish",
        icon: Upload,
      },
    ],
  },
  {
    title: "Marketplace",
    href: "/marketplace",
    icon: Store,
  },
  {
    title: "Agentes De IA",
    href: "/agentes",
    icon: Bot,
  },
  {
    title: "Chat Interativo",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    children: [
      {
        title: "Equipe",
        href: "/team",
        icon: Users,
      },
      {
        title: "Variáveis do Usuário",
        href: "/user-variables",
        icon: Variable,
      }
    ]
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Shield,
    badge: "Admin",
    badgeVariant: "secondary",
    adminOnly: true,
    children: [
      {
        title: "Planos",
        href: "/admin/plans",
        icon: Crown,
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        title: "Monitoramento",
        href: "/monitoring",
        icon: Monitor,
      },
      {
        title: "Documentação",
        href: "/docs",
        icon: FileText,
      },
    ],
  },
];

export default navItems; 