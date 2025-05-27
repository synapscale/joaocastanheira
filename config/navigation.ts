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

// Configuração original de navegação usando strings para ícones
export const originalNavItems = [
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
export const newNavItems = [
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
export function getIntegratedNavItems() {
  // Inserir as novas entradas após "Canvas" e antes de "Agentes De IA"
  const insertIndex = originalNavItems.findIndex(item => item.name === "Canvas") + 1;
  
  const integratedItems = [
    ...originalNavItems.slice(0, insertIndex),
    ...newNavItems,
    ...originalNavItems.slice(insertIndex)
  ];
  
  return integratedItems;
}

// Exportar os itens de navegação integrados como padrão
export default getIntegratedNavItems();
