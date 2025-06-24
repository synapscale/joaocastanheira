# SynapScale Frontend - Hooks Customizados

## 📋 Visão Geral

O SynapScale Frontend utiliza uma arquitetura baseada em hooks customizados para encapsular lógica reutilizável, gerenciar estado complexo e integrar funcionalidades específicas da aplicação.

## 🎣 Hooks Disponíveis

### 🔐 Autenticação e Usuário
- **`useAuth.ts`** - Hook principal para autenticação e gestão de usuário
- **`useVariables.ts`** - Gerenciamento de variáveis do usuário
- **`use-workspace-permissions.ts`** - Controle de permissões em workspaces

### 🎨 Canvas e Editor Visual
- **`use-canvas-pan-zoom.ts`** - Controle de pan e zoom do canvas
- **`use-canvas-transform.ts`** - Transformações e coordenadas do canvas
- **`use-node-drag.ts`** - Funcionalidade de arrastar nós
- **`use-workflow-nodes.ts`** - Gerenciamento de nós em workflows
- **`use-workflow-connections.ts`** - Gerenciamento de conexões entre nós
- **`use-custom-nodes.ts`** - Criação e customização de nós

### 🔧 Editor de Nós
- **`use-node-definition-integration.ts`** - Integração com definições de nós
- **`use-node-editor-dialog.ts`** - Controle de dialogs de edição
- **`use-node-execution.ts`** - Execução e monitoramento de nós
- **`use-node-management.ts`** - Gerenciamento geral de nós

### 💬 Chat e Comunicação
- **`useChat.ts`** - Hook principal para funcionalidades de chat
- **`use-chat.tsx`** - Hook específico para componentes de chat
- **`use-chat-message.tsx`** - Gerenciamento de mensagens individuais
- **`use-chat-analytics.ts`** - Analytics e métricas de chat
- **`use-conversations.ts`** - Gerenciamento de conversas
- **`use-websocket.ts`** - Conexão WebSocket para tempo real

### 🛠️ Utilitários e Interface
- **`use-disclosure.ts`** - Controle de estados de abertura/fechamento
- **`use-form.ts`** - Gerenciamento de formulários
- **`use-local-storage.ts`** - Persistência em localStorage
- **`use-media-query.ts`** - Queries de mídia responsivas
- **`use-mobile.tsx`** - Detecção e adaptação para mobile
- **`use-toast.ts`** - Sistema de notificações toast

### 🎛️ Interface e Layout
- **`use-panel-resize.ts`** - Redimensionamento de painéis
- **`use-textarea.ts`** - Funcionalidades avançadas para textarea
- **`use-render-tracker.ts`** - Rastreamento de renderizações para debug

### 💻 Desenvolvimento e Código
- **`use-code-formatter.ts`** - Formatação de código
- **`use-code-validator.ts`** - Validação de código

### 📁 Organização
- **`index.ts`** - Arquivo de índice para exports centralizados
- **`canvas/`** - Subdiretório com hooks específicos do canvas

## 🏗️ Arquitetura de Hooks

### Padrão de Estrutura
```typescript
// Estrutura típica de um hook customizado
interface HookOptions {
  // Opções de configuração
}

interface HookReturn {
  // Valores retornados
  // Funções disponíveis
}

export const useCustomHook = (options?: HookOptions): HookReturn => {
  // Estado interno
  const [state, setState] = useState(initialState);
  
  // Efeitos
  useEffect(() => {
    // Lógica de efeito
  }, [dependencies]);
  
  // Funções
  const handleAction = useCallback(() => {
    // Lógica da ação
  }, [dependencies]);
  
  // Retorno
  return {
    state,
    handleAction,
    // outros valores e funções
  };
};
```

## 🎯 Hooks Detalhados

### 🔐 useAuth
```typescript
interface AuthHook {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuth = (): AuthHook => {
  // Implementação do hook de autenticação
};
```

### 🎨 useCanvasPanZoom
```typescript
interface CanvasPanZoomOptions {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  panBounds?: Bounds;
}

interface CanvasPanZoomReturn {
  zoom: number;
  pan: { x: number; y: number };
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  fitToScreen: () => void;
}

export const useCanvasPanZoom = (options?: CanvasPanZoomOptions): CanvasPanZoomReturn => {
  // Implementação do controle de pan e zoom
};
```

### 💬 useChat
```typescript
interface ChatHookOptions {
  conversationId?: string;
  autoConnect?: boolean;
}

interface ChatHookReturn {
  messages: Message[];
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isConnected: boolean;
  isTyping: boolean;
  sendMessage: (content: string) => void;
  joinConversation: (id: string) => void;
  leaveConversation: () => void;
  startTyping: () => void;
  stopTyping: () => void;
}

export const useChat = (options?: ChatHookOptions): ChatHookReturn => {
  // Implementação do hook de chat
};
```

### 🔧 useNodeManagement
```typescript
interface NodeManagementOptions {
  workflowId: string;
  autoSave?: boolean;
}

interface NodeManagementReturn {
  nodes: WorkflowNode[];
  selectedNodes: string[];
  addNode: (nodeData: NodeData) => void;
  updateNode: (nodeId: string, updates: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (nodeId: string) => void;
  deselectNode: (nodeId: string) => void;
  clearSelection: () => void;
  duplicateNode: (nodeId: string) => void;
}

export const useNodeManagement = (options: NodeManagementOptions): NodeManagementReturn => {
  // Implementação do gerenciamento de nós
};
```

### 🛠️ useForm
```typescript
interface FormOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

interface FormReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: () => void;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
}

export const useForm = <T>(options: FormOptions<T>): FormReturn<T> => {
  // Implementação do hook de formulário
};
```

## 🚀 Hooks de Performance

### Otimização de Renderização
```typescript
// Hook para rastreamento de renderizações
export const useRenderTracker = (componentName: string) => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });
  
  return renderCount.current;
};
```

### Debounce e Throttle
```typescript
// Hook de debounce
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};
```

## 🔄 Hooks de Integração

### WebSocket Integration
```typescript
interface WebSocketOptions {
  url: string;
  protocols?: string[];
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

export const useWebSocket = (options: WebSocketOptions) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Implementação da conexão WebSocket
  
  return {
    socket,
    isConnected,
    sendMessage: (data: any) => socket?.send(JSON.stringify(data)),
    disconnect: () => socket?.close(),
  };
};
```

### Local Storage Integration
```typescript
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  return [storedValue, setValue] as const;
};
```

## 🎨 Hooks de Interface

### Media Query Hook
```typescript
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
};
```

### Mobile Detection Hook
```typescript
export const useMobile = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: 'ontouchstart' in window,
  };
};
```

## 🧪 Testes de Hooks

### Estratégia de Testes
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from './use-custom-hook';

describe('useCustomHook', () => {
  test('should initialize with correct default values', () => {
    const { result } = renderHook(() => useCustomHook());
    
    expect(result.current.value).toBe(expectedValue);
  });
  
  test('should update value when action is called', () => {
    const { result } = renderHook(() => useCustomHook());
    
    act(() => {
      result.current.updateValue(newValue);
    });
    
    expect(result.current.value).toBe(newValue);
  });
});
```

## 📝 Boas Práticas

### Criação de Hooks
1. **Single Responsibility** - Cada hook deve ter uma responsabilidade específica
2. **Naming Convention** - Sempre começar com "use" seguido de descrição clara
3. **TypeScript** - Tipagem forte para parâmetros e retorno
4. **Error Handling** - Tratamento adequado de erros
5. **Cleanup** - Limpeza de recursos em useEffect

### Otimização
1. **useMemo** - Para computações custosas
2. **useCallback** - Para funções que são dependências
3. **Lazy Initialization** - Para valores iniciais custosos
4. **Debounce/Throttle** - Para operações frequentes

### Composição
1. **Hook Composition** - Combinar hooks menores em hooks maiores
2. **Conditional Hooks** - Evitar hooks condicionais
3. **Custom Hook Libraries** - Reutilização entre projetos
4. **Documentation** - Documentar APIs e exemplos de uso

---

**Última atualização**: 24/06/2025
**Versão do documento**: 1.0.0
