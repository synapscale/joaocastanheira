"use client"

import { 
  Home, 
  Layers, 
  Bot, 
  FileCode, 
  MessagesSquare, 
  UserRound, 
  Cog,
  Puzzle,
  Store
} from "lucide-react"

// Tipos para os itens de navegação
export type NavItemChild = {
  name: string;
  href: string;
}

export type NavItem = {
  name: string;
  href: string;
  iconName: string;
  children?: NavItemChild[];
}

// Configuração original de navegação
export const originalNavItems: NavItem[] = [
  {
    name: "Editor de Workflow",
    href: "/",
    iconName: "Home",
  },
  {
    name: "Canvas",
    href: "/canvas",
    iconName: "Layers",
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
    name: "Equipe",
    href: "/team",
    iconName: "UserRound",
  },
  {
    name: "Configurações",
    href: "/settings",
    iconName: "Cog",
  },
]

// Novas entradas a serem adicionadas
export const newNavItems: NavItem[] = [
  {
    name: "Criação de Nodes",
    href: "/node-creator",
    iconName: "Puzzle",
    children: [
      {
        name: "Canvas de Criação",
        href: "/node-creator/canvas",
      },
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
]

// Função para integrar as novas entradas na posição correta
export function getIntegratedNavItems(): NavItem[] {
  // Inserir as novas entradas após "Canvas" e antes de "Agentes De IA"
  const insertIndex = originalNavItems.findIndex(item => item.name === "Canvas") + 1;
  
  const integratedItems = [
    ...originalNavItems.slice(0, insertIndex),
    ...newNavItems,
    ...originalNavItems.slice(insertIndex)
  ];
  
  return integratedItems;
}

// Função para renderizar o ícone com base no nome
export function renderIcon(iconName: string, className: string = "h-5 w-5") {
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
    case "PuzzlePiece":
      return <PuzzlePiece className={className} />;
    case "Store":
      return <Store className={className} />;
    default:
      return <Home className={className} />;
  }
}

// Exportar os itens de navegação integrados como padrão
export default getIntegratedNavItems();
