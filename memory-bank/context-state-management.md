# SynapScale Frontend - Gerenciamento de Estado e Contextos

## 📋 Visão Geral

O SynapScale Frontend utiliza o Context API do React como principal estratégia de gerenciamento de estado global, organizando diferentes contextos por funcionalidade específica para manter a aplicação modular e performática.

## 🗂️ Contextos Disponíveis

### 🔐 Autenticação e Usuário
- **`auth-context.tsx`** - Gerenciamento de autenticação, login, logout e estado do usuário
- **`user-variable-context.tsx`** - Variáveis específicas do usuário logado

### 🏢 Workspace e Organização
- **`workspace-context.tsx`** - Gerenciamento de workspaces e ambientes de trabalho
- **`app-context.tsx`** - Estado global da aplicação e configurações gerais

### 🔄 Workflows e Automação
- **`workflow-context.tsx`** - Estado dos workflows, execuções e configurações
- **`plan-context.tsx`** - Gerenciamento de planos e estratégias de automação

### 🎨 Canvas e Editor
- **`node-definition-context.tsx`** - Definições de tipos de nós disponíveis
- **`node-template-context.tsx`** - Templates de nós pré-configurados
- **`template-context.tsx`** - Templates gerais de workflows
- **`code-template-context.tsx`** - Templates de código para automações

### 🛒 Marketplace e Recursos
- **`marketplace-context.tsx`** - Estado do marketplace, busca e filtros
- **`custom-category-context.tsx`** - Categorias personalizadas de componentes

### 💬 Comunicação
- **`chat-context.tsx`** - Estado do chat, mensagens e conversas em tempo real

### 🎛️ Interface e Navegação
- **`sidebar-context.tsx`** - Estado da barra lateral, navegação e menus
- **`variable-context.tsx`** - Variáveis globais do sistema

### 📁 Subdiretórios
- **`node-creator/`** - Contextos específicos para criação de nós

### 📄 Organização
- **`index.ts`** - Arquivo de índice para exports centralizados

## 🏗️ Arquitetura de Contextos

### Padrão de Organização
```typescript
// Estrutura típica de um contexto
interface ContextState {
  // Estado do contexto
}

interface ContextActions {
  // Ações disponíveis
}

interface ContextValue extends ContextState, ContextActions {}

const Context = createContext<ContextValue | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lógica do provider
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useContext must be used within ContextProvider');
  }
  return context;
};
```

### Hierarquia de Providers
```typescript
// Organização hierárquica típica
<AppContextProvider>
  <AuthContextProvider>
    <WorkspaceContextProvider>
      <WorkflowContextProvider>
        <ChatContextProvider>
          {/* Componentes da aplicação */}
        </ChatContextProvider>
      </WorkflowContextProvider>
    </WorkspaceContextProvider>
  </AuthContextProvider>
</AppContextProvider>
```

## 🔄 Fluxo de Dados

### Estado Local vs Global
- **Estado Local**: useState, useReducer para componentes específicos
- **Estado Global**: Context API para dados compartilhados
- **Estado Derivado**: useMemo para computações baseadas em estado

### Comunicação entre Contextos
- **Composição**: Contextos aninhados acessam contextos pais
- **Eventos**: Custom events para comunicação entre contextos independentes
- **Callbacks**: Funções passadas via props para comunicação específica

## 📊 Contextos Detalhados

### 🔐 Auth Context
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

### 🏢 Workspace Context
```typescript
interface WorkspaceState {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  members: WorkspaceMember[];
  permissions: Permission[];
}

interface WorkspaceActions {
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (data: CreateWorkspaceData) => Promise<void>;
  inviteMember: (email: string, role: Role) => Promise<void>;
  updatePermissions: (memberId: string, permissions: Permission[]) => Promise<void>;
}
```

### 🔄 Workflow Context
```typescript
interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  executions: Execution[];
  isExecuting: boolean;
}

interface WorkflowActions {
  createWorkflow: (data: CreateWorkflowData) => Promise<void>;
  updateWorkflow: (id: string, data: UpdateWorkflowData) => Promise<void>;
  executeWorkflow: (id: string) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
}
```

### 💬 Chat Context
```typescript
interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isConnected: boolean;
  typingUsers: string[];
}

interface ChatActions {
  sendMessage: (content: string) => void;
  createConversation: (participants: string[]) => Promise<void>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
}
```

### 🛒 Marketplace Context
```typescript
interface MarketplaceState {
  templates: Template[];
  categories: Category[];
  searchQuery: string;
  filters: Filter[];
  selectedTemplate: Template | null;
}

interface MarketplaceActions {
  searchTemplates: (query: string) => void;
  filterByCategory: (categoryId: string) => void;
  installTemplate: (templateId: string) => Promise<void>;
  rateTemplate: (templateId: string, rating: number) => Promise<void>;
}
```

## 🎯 Hooks Customizados

### Hooks de Contexto
Cada contexto possui seu hook customizado:
```typescript
// Exemplo de hook customizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Hooks Compostos
```typescript
// Hook que combina múltiplos contextos
export const useWorkflowWithAuth = () => {
  const auth = useAuth();
  const workflow = useWorkflow();
  
  return {
    ...workflow,
    canEdit: auth.user?.permissions.includes('workflow:edit'),
    canExecute: auth.user?.permissions.includes('workflow:execute'),
  };
};
```

## 🚀 Performance e Otimização

### Estratégias de Otimização
1. **Context Splitting**: Separação de contextos por funcionalidade
2. **Memoização**: useMemo e useCallback para evitar re-renders
3. **Lazy Loading**: Carregamento sob demanda de dados pesados
4. **Selective Updates**: Atualizações seletivas de estado

### Padrões de Performance
```typescript
// Memoização de valores computados
const contextValue = useMemo(() => ({
  ...state,
  ...actions,
}), [state, actions]);

// Callbacks memoizados
const handleAction = useCallback((data: ActionData) => {
  // Lógica da ação
}, [dependencies]);
```

## 🔄 Sincronização com Backend

### Estratégias de Sincronização
- **Real-time**: WebSocket para atualizações em tempo real
- **Polling**: Verificação periódica para dados críticos
- **Cache**: Armazenamento local com invalidação inteligente
- **Optimistic Updates**: Atualizações otimistas com rollback

### Gerenciamento de Estado Assíncrono
```typescript
// Padrão para operações assíncronas
const [state, setState] = useState({
  data: null,
  loading: false,
  error: null,
});

const fetchData = async () => {
  setState(prev => ({ ...prev, loading: true, error: null }));
  try {
    const data = await api.getData();
    setState(prev => ({ ...prev, data, loading: false }));
  } catch (error) {
    setState(prev => ({ ...prev, error, loading: false }));
  }
};
```

## 🧪 Testes de Contextos

### Estratégia de Testes
```typescript
// Wrapper para testes de contextos
const renderWithContext = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <WorkspaceProvider>
        {component}
      </WorkspaceProvider>
    </AuthProvider>
  );
};

// Teste de hook de contexto
test('useAuth returns correct user data', () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: AuthProvider,
  });
  
  expect(result.current.user).toBeDefined();
});
```

## 📝 Boas Práticas

### Organização de Contextos
1. **Um contexto por funcionalidade** - Evitar contextos muito grandes
2. **Interfaces claras** - Separar estado de ações
3. **Error boundaries** - Tratamento de erros em providers
4. **TypeScript** - Tipagem forte para todos os contextos

### Padrões de Uso
1. **Hooks customizados** - Sempre criar hooks para acessar contextos
2. **Validação de contexto** - Verificar se o contexto está disponível
3. **Memoização** - Otimizar re-renders desnecessários
4. **Cleanup** - Limpar recursos em useEffect

---

**Última atualização**: 24/06/2025
**Versão do documento**: 1.0.0
