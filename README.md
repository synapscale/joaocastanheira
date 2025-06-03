# João Castanheira - Frontend 🎨

Interface moderna e responsiva para plataforma de automação e IA com editor de workflows visual, chat com agentes e marketplace integrado.

## 🌟 Funcionalidades

### 🎨 Interface Moderna
- Design responsivo mobile-first
- Tema escuro/claro
- Componentes reutilizáveis
- Animações suaves

### 🔄 Editor de Workflows Visual
- Canvas drag-and-drop com React Flow
- Paleta de nodes categorizada
- Configuração visual de parâmetros
- Execução em tempo real
- Versionamento automático

### 🤖 Chat com Agentes
- Interface de chat moderna
- Suporte a múltiplos agentes
- Anexos e arquivos
- Histórico persistente
- Notificações em tempo real

### 🛒 Marketplace
- Navegação por categorias
- Sistema de busca avançado
- Avaliações e comentários
- Downloads com um clique
- Publicação simplificada

### 📊 Dashboard Inteligente
- Métricas em tempo real
- Gráficos interativos
- Atividades recentes
- Status do sistema

### 👥 Colaboração
- Workspaces compartilhados
- Permissões granulares
- Comentários e anotações
- Histórico de atividades

## 🛠️ Tecnologias

- **Next.js 15** - Framework React moderno
- **React 19** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Flow** - Editor de workflows visual
- **Zustand** - Gerenciamento de estado
- **React Query** - Cache e sincronização de dados

## 🚀 Instalação Rápida

### 1. Clonar e Instalar
```bash
# Extrair o repositório
unzip joaocastanheira-frontend.zip
cd joaocastanheira-frontend

# Instalar dependências
npm install
```

### 2. Configurar Ambiente
```bash
# Copiar arquivo de configuração
cp .env.example .env.local

# Editar configurações necessárias
nano .env.local
```

### 3. Executar
```bash
# Iniciar servidor de desenvolvimento
./start.sh

# Ou manualmente
npm run dev
```

### 4. Acessar
- **Frontend**: http://localhost:3000

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Aplicação
NEXT_PUBLIC_APP_NAME=João Castanheira
NEXT_PUBLIC_APP_VERSION=1.0.0

# Recursos opcionais
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_MARKETPLACE=true
```

## 📱 Páginas e Rotas

### Principais
- `/` - Dashboard principal
- `/workflows` - Editor de workflows
- `/agents` - Gerenciamento de agentes
- `/chat` - Interface de chat
- `/marketplace` - Marketplace de componentes
- `/files` - Gerenciamento de arquivos

### Autenticação
- `/auth/login` - Login
- `/auth/register` - Registro
- `/auth/forgot-password` - Recuperação de senha

### Configurações
- `/settings/profile` - Perfil do usuário
- `/settings/workspace` - Configurações do workspace
- `/settings/integrations` - Integrações

## 🧩 Componentes Principais

### Editor de Workflows
```typescript
// Componente principal do editor
<WorkflowCanvas 
  workflow={workflow}
  onSave={handleSave}
  onExecute={handleExecute}
/>

// Paleta de nodes
<NodePalette 
  categories={nodeCategories}
  onNodeDrag={handleNodeDrag}
/>
```

### Chat Interface
```typescript
// Interface de chat
<ChatInterface 
  agent={selectedAgent}
  conversation={conversation}
  onSendMessage={handleSendMessage}
/>

// Lista de conversações
<ConversationList 
  conversations={conversations}
  onSelect={handleSelectConversation}
/>
```

### Marketplace
```typescript
// Grid de componentes
<MarketplaceGrid 
  items={marketplaceItems}
  onDownload={handleDownload}
  onRate={handleRate}
/>

// Filtros e busca
<MarketplaceFilters 
  categories={categories}
  onFilter={handleFilter}
/>
```

## 🎨 Customização

### Temas
```typescript
// Configuração de tema
const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: '#0f172a',
    surface: '#1e293b'
  }
}
```

### Componentes
```typescript
// Componente customizado
export const CustomButton = ({ 
  variant = 'primary',
  size = 'md',
  children,
  ...props 
}) => {
  return (
    <button 
      className={cn(
        'rounded-lg font-medium transition-colors',
        variants[variant],
        sizes[size]
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

## 📊 Estado e Dados

### Stores (Zustand)
```typescript
// Store de workflows
const useWorkflowStore = create((set) => ({
  workflows: [],
  currentWorkflow: null,
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  addWorkflow: (workflow) => set((state) => ({ 
    workflows: [...state.workflows, workflow] 
  }))
}))

// Store de agentes
const useAgentStore = create((set) => ({
  agents: [],
  activeAgent: null,
  setActiveAgent: (agent) => set({ activeAgent: agent })
}))
```

### API Integration
```typescript
// Hook para workflows
const useWorkflows = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.workflows.list(),
    staleTime: 5 * 60 * 1000 // 5 minutos
  })
}

// Hook para chat
const useSendMessage = () => {
  return useMutation({
    mutationFn: (message) => api.chat.sendMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations'])
    }
  })
}
```

## 🔌 Integração com Backend

### API Service
```typescript
// Configuração da API
const api = {
  workflows: {
    list: () => fetch(`${API_URL}/workflows`),
    create: (data) => fetch(`${API_URL}/workflows`, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    execute: (id, inputs) => fetch(`${API_URL}/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify(inputs)
    })
  },
  agents: {
    list: () => fetch(`${API_URL}/agents`),
    create: (data) => fetch(`${API_URL}/agents`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}
```

### WebSocket
```typescript
// Conexão WebSocket
const useWebSocket = () => {
  const [socket, setSocket] = useState(null)
  
  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // Processar mensagens em tempo real
    }
    
    setSocket(ws)
    
    return () => ws.close()
  }, [])
  
  return socket
}
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com watch
npm run test:watch

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📱 Responsividade

- **Mobile First** - Design otimizado para mobile
- **Breakpoints** - sm, md, lg, xl, 2xl
- **Touch Support** - Gestos e interações touch
- **PWA Ready** - Suporte a Progressive Web App

## 🚀 Build e Deploy

### Desenvolvimento
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
npm run type-check   # Verificação de tipos
```

### Deploy
```bash
# Vercel (Recomendado)
vercel deploy

# Netlify
netlify deploy --prod

# Docker
docker build -t joaocastanheira-frontend .
docker run -p 3000:3000 joaocastanheira-frontend
```

## 🔒 Segurança

- **Autenticação JWT** integrada
- **Validação de formulários** com Zod
- **Sanitização** de dados
- **HTTPS** obrigatório em produção
- **CSP** configurado

## 📈 Performance

- **Code Splitting** automático
- **Lazy Loading** de componentes
- **Image Optimization** com Next.js
- **Bundle Size** < 500KB
- **Lighthouse Score** 90+

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

- **Documentação**: Acesse a documentação completa
- **Issues**: Reporte bugs e solicite features
- **Email**: suporte@joaocastanheira.com

---

**Desenvolvido com ❤️ pela equipe João Castanheira**

