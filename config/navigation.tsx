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
  Settings
} from "lucide-react"

// Função para renderizar ícones dinamicamente a partir do nome
export function renderIcon(iconName: string, className: string = "h-5 w-5") {
  // Garantir que iconName não seja undefined
  if (!iconName) {
    return <div className={className} />;
  }
  
  switch (iconName) {
    case "Home":
      return <Home className={className} />;
    case "Layers":
      return <Layers className={className} />;
    case "Bot":
      return <Bot className={className} />;
    case "FileCode":
      return <FileCode className={className} />;
    case "MessagesSquare":
      return <MessagesSquare className={className} />;
    case "UserRound":
      return <UserRound className={className} />;
    case "Cog":
      return <Cog className={className} />;
    case "Puzzle":
      return <Puzzle className={className} />;
    case "Store":
      return <Store className={className} />;
    case "Key":
      return <Key className={className} />;
    case "LayoutGrid":
      return <LayoutGrid className={className} />;
    case "BookOpen":
      return <BookOpen className={className} />;
    case "Box":
      return <Box className={className} />;
    case "BookTemplate":
      return <BookTemplate className={className} />;
    case "Variable":
      return <Variable className={className} />;
    case "History":
      return <History className={className} />;
    case "Settings":
      return <Settings className={className} />;
    default:
      // Fallback para ícones não encontrados
      console.warn(`Ícone não encontrado: ${iconName}`);
      return <div className={className}>{iconName.charAt(0)}</div>;
  }
}

// Configuração unificada de navegação
const navItems = [
  {
    name: "Editor de Workflow",
    href: "/",
    iconName: "LayoutGrid",
  },
  {
    name: "Workflows",
    href: "/workflows",
    iconName: "Layers",
  },
  {
    name: "Criação de Nodes",
    href: "/node-creator",
    iconName: "Puzzle",
    children: [
      {
        name: "Biblioteca de Nodes",
        href: "/node-creator/library",
      },
      {
        name: "Publicar Node",
        href: "/node-creator/publish",
      },
    ],
  },
  {
    name: "Marketplace",
    href: "/marketplace",
    iconName: "Store",
  },
  {
    name: "Variáveis do Usuário",
    href: "/user-variables",
    iconName: "Key",
  },
  {
    name: "Agentes De IA",
    href: "/agentes",
    iconName: "Bot",
  },
  {
    name: "Documentação",
    href: "/docs",
    iconName: "FileCode",
  },
  {
    name: "Chat Interativo",
    href: "/chat",
    iconName: "MessagesSquare",
  },
  {
    name: "Recursos",
    href: "#recursos",
    iconName: "BookTemplate",
    children: [
      {
        name: "Templates",
        href: "/templates",
      },
      {
        name: "Templates de Código",
        href: "/templates/code-templates",
      },
      {
        name: "Variáveis",
        href: "/variables",
      },
    ],
  },
  {
    name: "Desenvolvimento",
    href: "#desenvolvimento",
    iconName: "FileCode",
    children: [
      {
        name: "Execuções",
        href: "/executions",
      },
      {
        name: "Templates de Nós",
        href: "/node-definitions",
      },
      {
        name: "Componentes",
        href: "/components",
      },
    ],
  },
  {
    name: "Equipe",
    href: "/team",
    iconName: "UserRound",
  },
  {
    name: "Configurações",
    href: "/settings",
    iconName: "Cog",
  },
];

export default navItems;
