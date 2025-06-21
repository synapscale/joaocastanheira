# Arquitetura Técnica - Sistema de Chat

## Visão Geral da Arquitetura

O sistema de chat segue uma arquitetura em camadas com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                │
├─────────────────────────────────────────────────────────────┤
│  UI Components  │  Hooks & State  │  Context Providers      │
│  - ChatInterface│  - useConversations │  - ChatContext      │
│  - ChatInput    │  - useChat      │  - AppContext           │
│  - MessagesArea │  - Custom Hooks │  - AuthContext          │
├─────────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                            │
│  - ChatService  │  - AI Utils     │  - API Service          │
│  - Model Mapper │  - JSON Utils   │  - Performance Monitor  │
├─────────────────────────────────────────────────────────────┤
│                    BACKEND APIs                             │
│  - Conversations API  │  - Messages API  │  - LLM Chat API  │
│  - Authentication    │  - Workspaces    │  - User Variables │
└─────────────────────────────────────────────────────────────┘
```

## Camada de Interface (UI Layer)

### Componentes Principais

#### 1. ChatInterface (`components/chat/chat-interface.tsx`)
```typescript
interface ChatInterfaceProps {
  conversationId?: string;
  agentId?: string;
  onConversationChange?: (id: string) => void;
}

// Responsabilidades:
// - Orquestração geral do chat
// - Gerenciamento de estado de UI
// - Integração entre componentes
// - Tratamento de eventos de usuário
```

#### 2. ChatInput (`components/chat/chat-input.tsx`)
```typescript
interface ChatInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Responsabilidades:
// - Captura de entrada do usuário
// - Validação de mensagens
// - Suporte a anexos
// - Shortcuts de teclado
```

#### 3. MessagesArea (`components/chat/messages-area.tsx`)
```typescript
interface MessagesAreaProps {
  messages: Message[];
  isLoading?: boolean;
  onMessageAction?: (action: string, messageId: string) => void;
}

// Responsabilidades:
// - Renderização de mensagens
// - Auto-scroll para nova mensagem
// - Indicadores visuais (typing, loading)
// - Ações de mensagem (copiar, regenerar)
```

### Componentes de Suporte

#### 1. ChatProcessingStatus
```typescript
// Status minimalista de processamento
// - "Enviando..." 
// - "Processando..."
// - "Erro ao enviar"
```

#### 2. TypingIndicator
```typescript
// Animação de 3 pontos para resposta do LLM
// Aparece do lado esquerdo (onde ficam respostas do assistente)
```

## Camada de Estado (State Layer)

### Hook Principal: useConversations

```typescript
// hooks/use-conversations.ts
interface UseConversationsReturn {
  // Estado
  conversations: Conversation[]
  currentConversationId: string | null
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  
  // Ações
  createConversation: (data?: ConversationCreateData) => Promise<Conversation>
  setCurrentConversation: (id: string) => Promise<void>
  addMessageToConversation: (message: Message) => void
  sendMessage: (content: string, attachments?: File[]) => Promise<{userMessage: Message, assistantMessage: Message}>
  getMessages: (conversationId: string) => Promise<Message[]>
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  loadConversations: () => Promise<void>
  refreshCurrentConversation: () => Promise<void>
}
```

### Fluxo de Estado - Envio de Mensagem

```typescript
// 1. Criação imediata da mensagem do usuário
const userMessage: Message = {
  id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role: 'user',
  content: content,
  timestamp: Date.now(),
  status: 'sending', // Estado inicial
}

// 2. Adição imediata à interface
setMessages(prev => [...prev, userMessage])

// 3. Chamada para API
const result = await chatService.sendChatMessage({
  message: content,
  conversationId: activeConversationId,
})

// 4. Atualização com dados reais da API
const updatedUserMessage: Message = {
  ...userMessage,
  id: result.userMessage.id, // ID real da API
  timestamp: new Date(result.userMessage.created_at).getTime(),
  status: 'sent', // Confirmação de envio
}

// 5. Substituição da mensagem temporária + adição da resposta
setMessages(prev => {
  const withoutTemp = prev.filter(msg => msg.id !== userMessage.id)
  return [...withoutTemp, updatedUserMessage, assistantMessage]
})
```

### Contextos de Estado

#### 1. ChatContext
```typescript
// context/chat-context.tsx
interface ChatContextType {
  // Estado global do chat
  isTyping: boolean
  currentModel: string
  systemPrompt: string
  
  // Ações globais
  setIsTyping: (typing: boolean) => void
  updateModel: (model: string) => void
  updateSystemPrompt: (prompt: string) => void
}
```

#### 2. AppContext
```typescript
// context/app-context.tsx
interface AppContextType {
  // Configurações globais
  selectedModel: string
  selectedTool: string
  selectedPersonality: string
  
  // Estado da aplicação
  user: User | null
  workspace: Workspace | null
  
  // Ações
  updateSelectedModel: (model: string) => void
  // ... outras ações
}
```

## Camada de Serviços (Service Layer)

### ChatService (`lib/services/chat.ts`)

```typescript
export class ChatService {
  private apiService: APIService
  
  constructor() {
    this.apiService = new APIService()
  }
  
  // Método principal - fluxo completo de chat
  async sendChatMessage(params: {
    message: string;
    conversationId: string;
  }): Promise<{
    userMessage: MessageResponse;
    assistantMessage: MessageResponse;
  }> {
    // 1. Salvar mensagem do usuário via API
    const userMessage = await this.addMessage(
      params.conversationId,
      params.message
    )
    
    // 2. Processar com LLM
    const llmResponse = await this.processWithLLM({
      message: params.message,
      model: mapToApiModelName('gpt-4o'),
      provider: 'openai'
    })
    
    // 3. Salvar resposta do assistente (localStorage como fallback)
    const assistantMessage = await this.saveAssistantMessage({
      conversationId: params.conversationId,
      content: llmResponse.content,
      model: llmResponse.model,
      provider: llmResponse.provider,
      tokens_used: llmResponse.tokens_used,
      processing_time_ms: llmResponse.processing_time_ms
    })
    
    return { userMessage, assistantMessage }
  }
  
  // Outros métodos...
  async getConversations(page = 1, pageSize = 50): Promise<ConversationsResponse>
  async createConversation(data: ConversationCreateData): Promise<ConversationResponse>
  async getMessages(conversationId: string, page = 1, pageSize = 100): Promise<MessagesResponse>
  async addMessage(conversationId: string, content: string): Promise<MessageResponse>
  async updateConversationTitle(conversationId: string, title: string): Promise<void>
  async deleteConversation(conversationId: string): Promise<void>
}
```

### Model Mapper (`lib/utils/model-mapper.ts`)

```typescript
// Mapeamento automático de modelos frontend → API
const modelMappings: Record<string, string> = {
  // OpenAI
  'chatgpt-4o': 'gpt-4o',
  'chatgpt-4o-mini': 'gpt-4o-mini',
  'chatgpt-4-turbo': 'gpt-4-turbo',
  'chatgpt-3.5-turbo': 'gpt-3.5-turbo',
  
  // Anthropic
  'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
  'claude-3-opus': 'claude-3-opus-20240229',
  'claude-3-haiku': 'claude-3-haiku-20240307',
  
  // Google
  'gemini-pro': 'gemini-1.5-pro',
  'gemini-flash': 'gemini-1.5-flash',
  
  // Meta
  'llama-3.1-405b': 'meta-llama/Meta-Llama-3.1-405B-Instruct',
  'llama-3.1-70b': 'meta-llama/Meta-Llama-3.1-70B-Instruct',
}

export function mapToApiModelName(frontendModelName: string): string {
  return modelMappings[frontendModelName] || frontendModelName
}
```

### AI Utils (`lib/ai-utils.ts`)

```typescript
// Utilitários para processamento de IA
export async function processAIRequest(params: {
  message: string;
  model: string;
  provider: string;
  context?: Message[];
  systemPrompt?: string;
}): Promise<AIResponse> {
  
  // 1. Mapear modelo para nome da API
  const apiModel = mapToApiModelName(params.model)
  
  // 2. Preparar contexto
  const messages = [
    ...(params.context || []),
    { role: 'user', content: params.message }
  ]
  
  // 3. Chamar API
  const response = await apiService.post('/llm/chat', {
    message: params.message,
    model: apiModel,
    provider: params.provider,
    context: messages,
    system_prompt: params.systemPrompt,
    temperature: 0.7,
    max_tokens: 4000
  })
  
  return response.data
}
```

## Padrões de Arquitetura

### 1. Command Pattern (Envio de Mensagens)
```typescript
// Cada ação de mensagem é encapsulada como comando
interface MessageCommand {
  execute(): Promise<void>
  undo?(): Promise<void>
}

class SendMessageCommand implements MessageCommand {
  constructor(
    private message: string,
    private conversationId: string,
    private chatService: ChatService
  ) {}
  
  async execute(): Promise<void> {
    await this.chatService.sendChatMessage({
      message: this.message,
      conversationId: this.conversationId
    })
  }
}
```

### 2. Observer Pattern (Estado de Mensagens)
```typescript
// Componentes observam mudanças no estado das mensagens
useEffect(() => {
  // Observer para novas mensagens
  const unsubscribe = conversationsHook.onMessagesChange((messages) => {
    // Atualizar UI automaticamente
    updateMessagesDisplay(messages)
  })
  
  return unsubscribe
}, [])
```

### 3. Strategy Pattern (Provedores de LLM)
```typescript
interface LLMProvider {
  name: string
  processMessage(params: ProcessParams): Promise<LLMResponse>
}

class OpenAIProvider implements LLMProvider {
  name = 'openai'
  
  async processMessage(params: ProcessParams): Promise<LLMResponse> {
    // Implementação específica do OpenAI
  }
}

class AnthropicProvider implements LLMProvider {
  name = 'anthropic'
  
  async processMessage(params: ProcessParams): Promise<LLMResponse> {
    // Implementação específica do Anthropic
  }
}
```

### 4. Repository Pattern (Persistência)
```typescript
interface ConversationRepository {
  findAll(): Promise<Conversation[]>
  findById(id: string): Promise<Conversation | null>
  create(data: ConversationCreateData): Promise<Conversation>
  update(id: string, data: Partial<Conversation>): Promise<void>
  delete(id: string): Promise<void>
}

class APIConversationRepository implements ConversationRepository {
  // Implementação usando API REST
}

class LocalStorageConversationRepository implements ConversationRepository {
  // Implementação usando localStorage como fallback
}
```

## Fluxo de Dados

### 1. Fluxo de Envio de Mensagem
```
User Input → ChatInput → useConversations.sendMessage() → ChatService.sendChatMessage() → API Calls → State Update → UI Re-render
```

### 2. Fluxo de Carregamento de Conversas
```
Component Mount → useConversations.loadConversations() → ChatService.getConversations() → API Call → State Update → UI Render
```

### 3. Fluxo de Sincronização Offline/Online
```
API Call Failure → Fallback to localStorage → Background Sync → State Reconciliation → UI Update
```

## Otimizações de Performance

### 1. Lazy Loading de Mensagens
```typescript
// Carregamento paginado de mensagens
const loadMoreMessages = useCallback(async () => {
  if (!hasMoreMessages || isLoadingMore) return
  
  setIsLoadingMore(true)
  const olderMessages = await chatService.getMessages(
    currentConversationId,
    currentPage + 1
  )
  
  setMessages(prev => [...olderMessages, ...prev])
  setCurrentPage(prev => prev + 1)
  setIsLoadingMore(false)
}, [currentConversationId, currentPage, hasMoreMessages, isLoadingMore])
```

### 2. Debouncing de Typing Indicators
```typescript
// Evitar spam de indicadores de digitação
const debouncedSetTyping = useMemo(
  () => debounce((isTyping: boolean) => {
    setIsTyping(isTyping)
  }, 300),
  []
)
```

### 3. Memoização de Componentes
```typescript
// Evitar re-renders desnecessários
const MemoizedMessage = memo(({ message }: { message: Message }) => {
  return <MessageComponent message={message} />
}, (prevProps, nextProps) => {
  return prevProps.message.id === nextProps.message.id &&
         prevProps.message.status === nextProps.message.status
})
```

## Tratamento de Erros

### 1. Error Boundaries
```typescript
class ChatErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chat Error:', error, errorInfo)
    // Log para serviço de monitoramento
    // Fallback para modo offline
  }
  
  render() {
    if (this.state.hasError) {
      return <ChatFallbackUI />
    }
    return this.props.children
  }
}
```

### 2. Retry Logic
```typescript
// Retry automático para falhas de rede
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}
```

## Segurança

### 1. Sanitização de Input
```typescript
// Sanitização de mensagens antes do envio
const sanitizeMessage = (message: string): string => {
  return DOMPurify.sanitize(message, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}
```

### 2. Validação de API Keys
```typescript
// Validação de chaves de API
const validateApiKey = (provider: string, apiKey: string): boolean => {
  const patterns = {
    openai: /^sk-[a-zA-Z0-9]{48}$/,
    anthropic: /^sk-ant-[a-zA-Z0-9-]{95}$/,
    google: /^[a-zA-Z0-9-_]{39}$/
  }
  
  return patterns[provider]?.test(apiKey) || false
}
``` 