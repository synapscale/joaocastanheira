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

// Configuração original de navegação
export const originalNavItems = [
  {
    name: "Editor de Workflow",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    name: "Canvas",
    href: "/canvas",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    name: "Agentes De IA",
    href: "/agentes",
    icon: <Bot className="h-5 w-5" />,
  },
  {
    name: "Documentação",
    href: "/docs",
    icon: <FileCode className="h-5 w-5" />,
  },
  {
    name: "Chat Interativo",
    href: "/chat",
    icon: <MessagesSquare className="h-5 w-5" />,
  },
  {
    name: "Equipe",
    href: "/team",
    icon: <UserRound className="h-5 w-5" />,
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: <Cog className="h-5 w-5" />,
  },
]

// Novas entradas a serem adicionadas
export const newNavItems = [
  {
    name: "Criação de Nodes",
    href: "/node-creator",
    icon: <Puzzle className="h-5 w-5" />,
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
    icon: <Store className="h-5 w-5" />,
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
