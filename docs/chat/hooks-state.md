# Hooks e Gerenciamento de Estado - Sistema de Chat

## Visão Geral

O sistema de chat utiliza uma arquitetura baseada em hooks customizados para gerenciar estado complexo de forma eficiente e reutilizável. O estado é distribuído em múltiplas camadas com responsabilidades bem definidas.

## Arquitetura de Estado

```
┌─────────────────────────────────────────────┐
│              GLOBAL CONTEXT                 │
│  - AppContext (configurações globais)      │
│  - AuthContext (autenticação)              │
│  - ChatContext (estado de chat)            │
└─────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────┐
│              CUSTOM HOOKS                   │
│  - useConversations (principal)             │
│  - useChat (básico)                         │
│  - useMessages (mensagens)                  │
└─────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────┐
│            LOCAL COMPONENT STATE            │
│  - useState (estado temporário)             │
│  - useReducer (estado complexo)             │
│  - useRef (referências DOM)                 │
└─────────────────────────────────────────────┘
```

## Hook Principal: useConversations

### Interface e Tipos

```typescript
// hooks/use-conversations.ts

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  status?: 'sending' | 'sent' | 'error'
  model?: string
  metadata?: {
    provider?: string
    tokens_used?: number
    processing_time_ms?: number
    temperature?: number
    max_tokens?: number
    error_message?: string
    rating?: number
    feedback?: string
  }
  attachments?: File[]
}

interface Conversation {
  id: string
  title: string
  agent_id?: string
  workspace_id?: string
  created_at: string
  updated_at: string
  context?: Record<string, any>
  settings?: {
    model: string
    provider: string
    personality: string
    tool: string
  }
  metadata?: {
    message_count?: number
    total_tokens_used?: number
    last_message_at?: string
  }
}

interface ConversationCreateData {
  title?: string
  agent_id?: string
  workspace_id?: string
  context?: Record<string, any>
  settings?: Record<string, any>
}

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
  sendMessage: (content: string, attachments?: File[]) => Promise<{
    userMessage: Message
    assistantMessage: Message
  }>
  getMessages: (conversationId: string) => Promise<Message[]>
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  loadConversations: () => Promise<void>
  refreshCurrentConversation: () => Promise<void>
}
```

### Implementação Completa

```typescript
export function useConversations(): UseConversationsReturn {
  // Estados principais
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Dependências
  const { toast } = useToast()
  const chatService = useMemo(() => new ChatService(), [])
  
  // Computed values
  const currentConversation = useMemo(
    () => conversations.find(conv => conv.id === currentConversationId) || null,
    [conversations, currentConversationId]
  )
  
  // Carregar conversas
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await chatService.getConversations()
      setConversations(response.conversations)
    } catch (error) {
      console.error("Erro ao carregar conversas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [chatService, toast])
  
  // Criar conversa
  const createConversation = useCallback(
    async (data: ConversationCreateData = {}): Promise<Conversation> => {
      try {
        const newConversation = await chatService.createConversation({
          title: data.title || "Nova conversa",
          agent_id: data.agent_id,
          workspace_id: data.workspace_id,
          context: data.context || {},
          settings: {
            model: 'gpt-4o',
            provider: 'openai',
            personality: 'natural',
            tool: 'tools',
            ...data.settings
          }
        })
        
        setConversations(prev => [newConversation, ...prev])
        return newConversation
      } catch (error) {
        console.error("Erro ao criar conversa:", error)
        toast({
          title: "Erro",
          description: "Não foi possível criar a conversa.",
          variant: "destructive",
        })
        throw error
      }
    },
    [chatService, toast]
  )
  
  // Definir conversa atual
  const setCurrentConversation = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        setCurrentConversationId(id)
        
        // Carregar mensagens da API
        let apiMessages: Message[] = []
        try {
          const messagesData = await chatService.getMessages(id)
          apiMessages = messagesData.messages.map(msg => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: new Date(msg.created_at || Date.now()).getTime(),
            status: 'sent',
            model: msg.model_used,
            metadata: {
              provider: msg.model_provider,
              tokens_used: msg.tokens_used,
              processing_time_ms: msg.processing_time_ms,
              temperature: msg.temperature,
              max_tokens: msg.max_tokens,
              error_message: msg.error_message,
              rating: msg.rating,
              feedback: msg.feedback,
            },
            attachments: msg.attachments,
          }))
        } catch (apiError) {
          console.warn("Erro ao carregar mensagens da API, usando apenas offline:", apiError)
        }
        
        // Carregar mensagens offline
        const offlineMessages = loadOfflineMessages(id)
        
        // Combinar mensagens (API + offline), removendo duplicatas
        const allMessages = [...apiMessages, ...offlineMessages]
        const uniqueMessages = allMessages.reduce((acc, message) => {
          const existing = acc.find(m => m.id === message.id)
          if (!existing) {
            acc.push(message)
          }
          return acc
        }, [] as Message[])
        
        // Ordenar por timestamp
        uniqueMessages.sort((a, b) => a.timestamp - b.timestamp)
        
        setMessages(uniqueMessages)
      } catch (error) {
        console.error("Erro ao definir conversa atual:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar a conversa.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [chatService, toast]
  )
  
  // Adicionar mensagem à conversa
  const addMessageToConversation = useCallback((message: Message) => {
    setMessages(prev => [...prev, message])
  }, [])
  
  // Enviar mensagem (método principal)
  const sendMessage = useCallback(
    async (content: string, attachments?: File[]): Promise<{
      userMessage: Message
      assistantMessage: Message
    }> => {
      // Criar mensagem do usuário imediatamente (fora do try para estar no escopo do catch)
      const userMessage: Message = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: content,
        timestamp: Date.now(),
        status: 'sending',
      }

      try {
        setIsLoading(true)

        let activeConversationId = currentConversationId

        // Se não há conversa ativa, criar uma nova automaticamente
        if (!activeConversationId) {
          console.log('🔄 Nenhuma conversa ativa, criando nova conversa automaticamente...')
          
          const conversationTitle = content.length > 50 ? content.substring(0, 50) + '...' : content
          
          const newConversation = await createConversation({
            title: conversationTitle,
            settings: {
              model: 'gpt-4o',
              tool: 'tools',
              personality: 'natural',
              provider: 'openai',
            }
          })

          activeConversationId = newConversation.id
          console.log('✅ Nova conversa criada:', activeConversationId)
        }

        // Adicionar mensagem do usuário IMEDIATAMENTE na interface
        setMessages(prev => [...prev, userMessage])

        // Enviar mensagem usando o novo serviço
        const result = await chatService.sendChatMessage({
          message: content,
          conversationId: activeConversationId,
        })

        // Atualizar mensagem do usuário com dados da API
        const updatedUserMessage: Message = {
          ...userMessage,
          id: result.userMessage.id,
          timestamp: new Date(result.userMessage.created_at || Date.now()).getTime(),
          status: 'sent',
        }

        const assistantMessage: Message = {
          id: result.assistantMessage.id,
          role: 'assistant',
          content: result.assistantMessage.content,
          timestamp: new Date(result.assistantMessage.created_at || Date.now()).getTime(),
          status: 'sent',
          model: result.assistantMessage.model_used,
          metadata: {
            provider: result.assistantMessage.model_provider,
            tokens_used: result.assistantMessage.tokens_used,
            processing_time_ms: result.assistantMessage.processing_time_ms,
            temperature: result.assistantMessage.temperature,
            max_tokens: result.assistantMessage.max_tokens,
          },
        }

        // Atualizar estado local - substituir mensagem temporária e adicionar resposta
        setMessages(prev => {
          const withoutTemp = prev.filter(msg => msg.id !== userMessage.id)
          return [...withoutTemp, updatedUserMessage, assistantMessage]
        })
        
        // Atualizar metadados da conversa
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  updatedAt: Date.now(),
                  metadata: {
                    ...conv.metadata,
                    message_count: (conv.metadata?.message_count || 0) + 2,
                    total_tokens_used: (conv.metadata?.total_tokens_used || 0) + result.assistantMessage.tokens_used,
                    last_message_at: new Date().toISOString(),
                  }
                }
              : conv
          )
        )

        return { userMessage: updatedUserMessage, assistantMessage }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error)
        
        // Atualizar status da mensagem do usuário para erro
        setMessages(prev => 
          prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, status: 'error' as const }
              : msg
          )
        )
        
        toast({
          title: "Erro",
          description: "Não foi possível enviar a mensagem.",
          variant: "destructive",
        })
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [currentConversationId, createConversation, toast, chatService]
  )
  
  // Outros métodos...
  const getMessages = useCallback(
    async (conversationId: string): Promise<Message[]> => {
      try {
        const messagesData = await chatService.getMessages(conversationId, 1, 100)
        
        return messagesData.messages.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: new Date(msg.created_at || Date.now()).getTime(),
          status: 'sent',
          model: msg.model_used,
          metadata: {
            provider: msg.model_provider,
            tokens_used: msg.tokens_used,
            processing_time_ms: msg.processing_time_ms,
            temperature: msg.temperature,
            max_tokens: msg.max_tokens,
            error_message: msg.error_message,
            rating: msg.rating,
            feedback: msg.feedback,
          },
          attachments: msg.attachments,
        }))
      } catch (error) {
        console.error("Erro ao obter mensagens:", error)
        return []
      }
    },
    [chatService]
  )
  
  // Carregar conversas na inicialização
  useEffect(() => {
    loadConversations()
  }, [loadConversations])
  
  return {
    conversations,
    currentConversationId,
    currentConversation,
    messages,
    isLoading,
    createConversation,
    setCurrentConversation,
    addMessageToConversation,
    sendMessage,
    getMessages,
    updateConversation,
    deleteConversation,
    loadConversations,
    refreshCurrentConversation,
  }
}
```

## Contextos de Estado

### 1. ChatContext

```typescript
// context/chat-context.tsx

interface ChatContextType {
  // Estado de UI
  isTyping: boolean
  currentModel: string
  systemPrompt: string
  
  // Configurações
  temperature: number
  maxTokens: number
  
  // Ações
  setIsTyping: (typing: boolean) => void
  updateModel: (model: string) => void
  updateSystemPrompt: (prompt: string) => void
  updateTemperature: (temp: number) => void
  updateMaxTokens: (tokens: number) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTyping, setIsTyping] = useState(false)
  const [currentModel, setCurrentModel] = useState('gpt-4o')
  const [systemPrompt, setSystemPrompt] = useState('Você é um assistente útil.')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4000)
  
  const updateModel = useCallback((model: string) => {
    setCurrentModel(model)
    // Persistir no localStorage
    localStorage.setItem('chat-model', model)
  }, [])
  
  const updateSystemPrompt = useCallback((prompt: string) => {
    setSystemPrompt(prompt)
    localStorage.setItem('chat-system-prompt', prompt)
  }, [])
  
  const updateTemperature = useCallback((temp: number) => {
    setTemperature(temp)
    localStorage.setItem('chat-temperature', temp.toString())
  }, [])
  
  const updateMaxTokens = useCallback((tokens: number) => {
    setMaxTokens(tokens)
    localStorage.setItem('chat-max-tokens', tokens.toString())
  }, [])
  
  // Carregar configurações salvas
  useEffect(() => {
    const savedModel = localStorage.getItem('chat-model')
    const savedPrompt = localStorage.getItem('chat-system-prompt')
    const savedTemp = localStorage.getItem('chat-temperature')
    const savedTokens = localStorage.getItem('chat-max-tokens')
    
    if (savedModel) setCurrentModel(savedModel)
    if (savedPrompt) setSystemPrompt(savedPrompt)
    if (savedTemp) setTemperature(parseFloat(savedTemp))
    if (savedTokens) setMaxTokens(parseInt(savedTokens))
  }, [])
  
  const value: ChatContextType = {
    isTyping,
    currentModel,
    systemPrompt,
    temperature,
    maxTokens,
    setIsTyping,
    updateModel,
    updateSystemPrompt,
    updateTemperature,
    updateMaxTokens,
  }
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
```

### 2. AppContext (Configurações Globais)

```typescript
// context/app-context.tsx

interface AppContextType {
  // Configurações de modelo
  selectedModel: string
  selectedTool: string
  selectedPersonality: string
  selectedProvider: string
  
  // Estado da aplicação
  user: User | null
  workspace: Workspace | null
  isAuthenticated: boolean
  
  // Ações
  updateSelectedModel: (model: string) => void
  updateSelectedTool: (tool: string) => void
  updateSelectedPersonality: (personality: string) => void
  updateSelectedProvider: (provider: string) => void
  setUser: (user: User | null) => void
  setWorkspace: (workspace: Workspace | null) => void
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados
  const [selectedModel, setSelectedModel] = useState('gpt-4o') // Corrigido de 'chatgpt-4o'
  const [selectedTool, setSelectedTool] = useState('tools')
  const [selectedPersonality, setSelectedPersonality] = useState('natural')
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [user, setUser] = useState<User | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  
  // Computed
  const isAuthenticated = user !== null
  
  // Ações
  const updateSelectedModel = useCallback((model: string) => {
    setSelectedModel(model)
    localStorage.setItem('selected-model', model)
  }, [])
  
  const updateSelectedTool = useCallback((tool: string) => {
    setSelectedTool(tool)
    localStorage.setItem('selected-tool', tool)
  }, [])
  
  const updateSelectedPersonality = useCallback((personality: string) => {
    setSelectedPersonality(personality)
    localStorage.setItem('selected-personality', personality)
  }, [])
  
  const updateSelectedProvider = useCallback((provider: string) => {
    setSelectedProvider(provider)
    localStorage.setItem('selected-provider', provider)
  }, [])
  
  // Carregar configurações salvas
  useEffect(() => {
    const savedModel = localStorage.getItem('selected-model')
    const savedTool = localStorage.getItem('selected-tool')
    const savedPersonality = localStorage.getItem('selected-personality')
    const savedProvider = localStorage.getItem('selected-provider')
    
    if (savedModel) setSelectedModel(savedModel)
    if (savedTool) setSelectedTool(savedTool)
    if (savedPersonality) setSelectedPersonality(savedPersonality)
    if (savedProvider) setSelectedProvider(savedProvider)
  }, [])
  
  const value: AppContextType = {
    selectedModel,
    selectedTool,
    selectedPersonality,
    selectedProvider,
    user,
    workspace,
    isAuthenticated,
    updateSelectedModel,
    updateSelectedTool,
    updateSelectedPersonality,
    updateSelectedProvider,
    setUser,
    setWorkspace,
  }
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
```

## Hooks Auxiliares

### 1. useLocalStorage

```typescript
// hooks/use-local-storage.ts

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Estado
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error)
      return initialValue
    }
  })
  
  // Função para definir valor
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Erro ao salvar no localStorage key "${key}":`, error)
    }
  }, [key, storedValue])
  
  return [storedValue, setValue]
}
```

### 2. useDebounce

```typescript
// hooks/use-debounce.ts

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Uso no chat para typing indicators
const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('')
  const debouncedMessage = useDebounce(message, 300)
  const { setIsTyping } = useChat()
  
  useEffect(() => {
    setIsTyping(message.length > 0 && message !== debouncedMessage)
  }, [message, debouncedMessage, setIsTyping])
  
  // ... resto do componente
}
```

### 3. useMessages (Hook especializado)

```typescript
// hooks/use-messages.ts

interface UseMessagesReturn {
  messages: Message[]
  addMessage: (message: Message) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  deleteMessage: (id: string) => void
  clearMessages: () => void
  getMessagesByRole: (role: Message['role']) => Message[]
  getLastMessage: () => Message | null
}

function useMessages(conversationId?: string): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  
  // Carregar mensagens quando conversationId muda
  useEffect(() => {
    if (conversationId) {
      const savedMessages = loadOfflineMessages(conversationId)
      setMessages(savedMessages)
    } else {
      setMessages([])
    }
  }, [conversationId])
  
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const newMessages = [...prev, message]
      // Salvar offline
      if (conversationId) {
        saveOfflineMessage(conversationId, message)
      }
      return newMessages
    })
  }, [conversationId])
  
  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id 
          ? { ...msg, ...updates }
          : msg
      )
    )
  }, [])
  
  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])
  
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])
  
  const getMessagesByRole = useCallback((role: Message['role']) => {
    return messages.filter(msg => msg.role === role)
  }, [messages])
  
  const getLastMessage = useCallback(() => {
    return messages.length > 0 ? messages[messages.length - 1] : null
  }, [messages])
  
  return {
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    getMessagesByRole,
    getLastMessage,
  }
}
```

## Persistência e Sincronização

### LocalStorage Utils

```typescript
// lib/utils/storage.ts

const STORAGE_KEYS = {
  CONVERSATIONS: 'chat-conversations',
  MESSAGES: 'chat-messages',
  SETTINGS: 'chat-settings',
} as const

export function saveOfflineMessage(conversationId: string, message: Message): void {
  try {
    const key = `${STORAGE_KEYS.MESSAGES}-${conversationId}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const updated = [...existing, message]
    localStorage.setItem(key, JSON.stringify(updated))
  } catch (error) {
    console.error('Erro ao salvar mensagem offline:', error)
  }
}

export function loadOfflineMessages(conversationId: string): Message[] {
  try {
    const key = `${STORAGE_KEYS.MESSAGES}-${conversationId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Erro ao carregar mensagens offline:', error)
    return []
  }
}

export function saveOfflineConversation(conversation: Conversation): void {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || '[]')
    const updated = existing.filter((c: Conversation) => c.id !== conversation.id)
    updated.unshift(conversation)
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updated))
  } catch (error) {
    console.error('Erro ao salvar conversa offline:', error)
  }
}

export function loadOfflineConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Erro ao carregar conversas offline:', error)
    return []
  }
}
```

## Padrões de Estado

### 1. Estado Otimista (Optimistic Updates)

```typescript
// Atualizar UI imediatamente, reverter se API falhar
const sendMessageOptimistic = async (content: string) => {
  const tempMessage: Message = {
    id: `temp-${Date.now()}`,
    role: 'user',
    content,
    timestamp: Date.now(),
    status: 'sending'
  }
  
  // Adicionar imediatamente
  addMessage(tempMessage)
  
  try {
    const result = await api.sendMessage(content)
    // Substituir mensagem temporária
    updateMessage(tempMessage.id, {
      id: result.id,
      status: 'sent',
      timestamp: result.timestamp
    })
  } catch (error) {
    // Marcar como erro
    updateMessage(tempMessage.id, { status: 'error' })
  }
}
```

### 2. Estado Derivado (Derived State)

```typescript
// Calcular estado baseado em outros estados
const conversationStats = useMemo(() => {
  return {
    totalMessages: messages.length,
    userMessages: messages.filter(m => m.role === 'user').length,
    assistantMessages: messages.filter(m => m.role === 'assistant').length,
    totalTokens: messages.reduce((sum, m) => sum + (m.metadata?.tokens_used || 0), 0),
    averageResponseTime: messages
      .filter(m => m.role === 'assistant' && m.metadata?.processing_time_ms)
      .reduce((sum, m, _, arr) => sum + (m.metadata?.processing_time_ms || 0) / arr.length, 0)
  }
}, [messages])
```

### 3. Estado Compartilhado (Shared State)

```typescript
// Estado compartilhado entre múltiplos componentes
const useSharedChatState = () => {
  const conversationsHook = useConversations()
  const chatContext = useChat()
  const appContext = useApp()
  
  return {
    // Combinar estados de diferentes fontes
    currentModel: chatContext.currentModel || appContext.selectedModel,
    isReady: conversationsHook.conversations.length > 0 && !conversationsHook.isLoading,
    canSendMessage: !conversationsHook.isLoading && !chatContext.isTyping,
    
    // Ações combinadas
    sendMessage: conversationsHook.sendMessage,
    updateModel: (model: string) => {
      chatContext.updateModel(model)
      appContext.updateSelectedModel(model)
    }
  }
}
``` 