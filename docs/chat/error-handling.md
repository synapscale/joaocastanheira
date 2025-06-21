# Tratamento de Erros - Sistema de Chat

## Visão Geral

O sistema de chat implementa uma estratégia robusta de tratamento de erros com múltiplas camadas de proteção, fallbacks automáticos e recuperação graceful. O objetivo é garantir que o usuário sempre tenha uma experiência funcional, mesmo quando ocorrem falhas.

## Estratégia de Tratamento de Erros

### Pirâmide de Tratamento
```
┌─────────────────────────────────────┐
│           UI ERROR BOUNDARY         │  ← Captura erros React
├─────────────────────────────────────┤
│         COMPONENT LEVEL             │  ← Try/catch em componentes
├─────────────────────────────────────┤
│          HOOK LEVEL                 │  ← Tratamento em hooks
├─────────────────────────────────────┤
│         SERVICE LEVEL               │  ← Tratamento em serviços
├─────────────────────────────────────┤
│          API LEVEL                  │  ← Interceptação HTTP
├─────────────────────────────────────┤
│        NETWORK LEVEL                │  ← Retry e timeout
└─────────────────────────────────────┘
```

## Error Boundaries (React)

### 1. ChatErrorBoundary

```typescript
// components/chat/chat-error-boundary.tsx

interface ErrorInfo {
  componentStack: string
  errorBoundary?: string
  errorBoundaryStack?: string
}

interface ChatErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

class ChatErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  ChatErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ChatErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Chat Error Boundary:', error)
    console.error('📍 Error Info:', errorInfo)
    
    this.setState({ errorInfo })
    
    // Log para serviço de monitoramento
    this.logError(error, errorInfo)
    
    // Tentar recuperação automática
    this.attemptRecovery()
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // Enviar para serviço de logging (opcional)
    if (process.env.NODE_ENV === 'production') {
      // analytics.trackError(errorReport)
    }
    
    // Salvar localmente para debug
    const errors = JSON.parse(localStorage.getItem('chat-errors') || '[]')
    errors.push(errorReport)
    localStorage.setItem('chat-errors', JSON.stringify(errors.slice(-10))) // Manter últimos 10
  }

  private attemptRecovery = () => {
    // Tentar recuperação após 3 segundos
    setTimeout(() => {
      console.log('🔄 Tentando recuperação automática...')
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      })
    }, 3000)
  }

  private handleManualRecovery = () => {
    console.log('🔧 Recuperação manual iniciada...')
    
    // Limpar estado local
    localStorage.removeItem('chat-messages')
    localStorage.removeItem('chat-conversations')
    
    // Reset do estado
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
    
    // Recarregar página como último recurso
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ChatErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.attemptRecovery}
          onReset={this.handleManualRecovery}
        />
      )
    }

    return this.props.children
  }
}

export default ChatErrorBoundary
```

### 2. Componente de Fallback

```typescript
// components/chat/chat-error-fallback.tsx

interface ChatErrorFallbackProps {
  error: Error | null
  errorInfo: any
  errorId: string | null
  onRetry: () => void
  onReset: () => void
}

const ChatErrorFallback: React.FC<ChatErrorFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReset
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Delay visual
    onRetry()
    setIsRetrying(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-background">
      <div className="max-w-md text-center space-y-4">
        {/* Ícone de erro */}
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        
        {/* Título */}
        <h2 className="text-xl font-semibold text-foreground">
          Oops! Algo deu errado
        </h2>
        
        {/* Descrição */}
        <p className="text-muted-foreground">
          Ocorreu um erro inesperado no sistema de chat. Não se preocupe, 
          seus dados estão seguros e você pode tentar uma das opções abaixo.
        </p>
        
        {/* Ações */}
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Tentando novamente...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onReset}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar Chat
          </Button>
        </div>
        
        {/* Detalhes técnicos */}
        <div className="mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ocultar' : 'Mostrar'} detalhes técnicos
          </Button>
          
          {showDetails && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-left">
              <div className="space-y-2 text-sm font-mono">
                <div>
                  <strong>ID do Erro:</strong> {errorId}
                </div>
                <div>
                  <strong>Mensagem:</strong> {error?.message}
                </div>
                <div>
                  <strong>Timestamp:</strong> {new Date().toISOString()}
                </div>
                {error?.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Stack Trace</summary>
                    <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Informações de suporte */}
        <div className="mt-6 text-xs text-muted-foreground">
          Se o problema persistir, entre em contato com o suporte 
          informando o ID do erro: <code className="bg-muted px-1 rounded">{errorId}</code>
        </div>
      </div>
    </div>
  )
}

export default ChatErrorFallback
```

## Tratamento em Hooks

### 1. useConversations - Tratamento Robusto

```typescript
// hooks/use-conversations.ts

export function useConversations(): UseConversationsReturn {
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const handleError = useCallback((error: any, operation: string) => {
    console.error(`❌ Erro em ${operation}:`, error)
    
    const errorMessage = error?.message || 'Erro desconhecido'
    setError(`${operation}: ${errorMessage}`)
    
    // Auto-clear error após 5 segundos
    setTimeout(() => setError(null), 5000)
    
    // Log para analytics
    if (process.env.NODE_ENV === 'production') {
      // analytics.trackError({ operation, error: errorMessage })
    }
  }, [])

  const withRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    let lastError: any
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        setRetryCount(0) // Reset on success
        return result
      } catch (error) {
        lastError = error
        console.warn(`⚠️ Tentativa ${attempt}/${maxRetries} falhou para ${operationName}:`, error)
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000 // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
          setRetryCount(attempt)
        }
      }
    }
    
    handleError(lastError, operationName)
    throw lastError
  }, [maxRetries, handleError])

  const sendMessage = useCallback(
    async (content: string, attachments?: File[]): Promise<{
      userMessage: Message
      assistantMessage: Message
    }> => {
      return withRetry(async () => {
        // Implementação com tratamento de erro robusto
        const userMessage: Message = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: 'user',
          content: content,
          timestamp: Date.now(),
          status: 'sending',
        }

        try {
          setIsLoading(true)
          setError(null)

          let activeConversationId = currentConversationId

          if (!activeConversationId) {
            try {
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
            } catch (conversationError) {
              console.error('❌ Erro ao criar conversa:', conversationError)
              // Continuar com conversa temporária
              activeConversationId = `temp-${Date.now()}`
            }
          }

          setMessages(prev => [...prev, userMessage])

          try {
            const result = await chatService.sendChatMessage({
              message: content,
              conversationId: activeConversationId,
            })

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
              },
            }

            setMessages(prev => {
              const withoutTemp = prev.filter(msg => msg.id !== userMessage.id)
              return [...withoutTemp, updatedUserMessage, assistantMessage]
            })

            return { userMessage: updatedUserMessage, assistantMessage }
          } catch (chatError) {
            console.error('❌ Erro no chat service:', chatError)
            
            // Fallback: criar resposta de erro
            const errorMessage: Message = {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: 'Desculpe, não foi possível processar sua mensagem no momento. Tente novamente.',
              timestamp: Date.now(),
              status: 'sent',
              metadata: {
                error: true,
                error_message: chatError.message
              }
            }

            setMessages(prev => {
              const withoutTemp = prev.filter(msg => msg.id !== userMessage.id)
              return [...withoutTemp, { ...userMessage, status: 'error' }, errorMessage]
            })

            throw chatError
          }
        } catch (error) {
          console.error("❌ Erro geral ao enviar mensagem:", error)
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === userMessage.id 
                ? { ...msg, status: 'error' as const }
                : msg
            )
          )
          
          throw error
        } finally {
          setIsLoading(false)
        }
      }, 'Enviar mensagem')
    },
    [currentConversationId, createConversation, chatService, withRetry]
  )

  // ... outros métodos com tratamento similar

  return {
    // ... outros retornos
    error,
    retryCount,
    clearError: () => setError(null),
    sendMessage,
    // ... outros métodos
  }
}
```

## Tratamento em Serviços

### 1. ChatService - Tratamento Robusto

```typescript
// lib/services/chat.ts

export class ChatService {
  private apiService: APIService
  private fallbackEnabled = true
  
  constructor() {
    this.apiService = new APIService()
  }

  async sendChatMessage(params: {
    message: string
    conversationId: string
  }): Promise<{
    userMessage: MessageResponse
    assistantMessage: MessageResponse
  }> {
    const operations = [
      () => this.primaryChatFlow(params),
      () => this.fallbackChatFlow(params),
      () => this.offlineChatFlow(params)
    ]

    return this.executeWithFallbacks(operations, 'sendChatMessage')
  }

  private async primaryChatFlow(params: any) {
    try {
      console.log('💬 Tentando fluxo principal...')
      
      const userMessage = await this.addMessage(params.conversationId, params.message)
      
      const llmResponse = await this.processWithLLM({
        message: params.message,
        model: mapToApiModelName('gpt-4o'),
        provider: 'openai'
      })
      
      const assistantMessage = await this.saveAssistantMessage({
        conversationId: params.conversationId,
        content: llmResponse.content,
        model: llmResponse.model,
        provider: llmResponse.provider,
        tokens_used: llmResponse.tokens_used,
        processing_time_ms: llmResponse.processing_time_ms
      })
      
      return { userMessage, assistantMessage }
    } catch (error) {
      console.error('❌ Falha no fluxo principal:', error)
      throw new Error(`Primary flow failed: ${error.message}`)
    }
  }

  private async fallbackChatFlow(params: any) {
    try {
      console.log('🔄 Tentando fluxo de fallback...')
      
      // Usar endpoint simples de chat
      const response = await this.apiService.post('/chat', {
        message: params.message,
        conversationId: params.conversationId
      })
      
      // Criar mensagens baseadas na resposta simples
      const userMessage: MessageResponse = {
        id: `user-${Date.now()}`,
        conversation_id: params.conversationId,
        role: 'user',
        content: params.message,
        created_at: new Date().toISOString(),
        tokens_used: 0,
        processing_time_ms: 0
      }
      
      const assistantMessage: MessageResponse = {
        id: `assistant-${Date.now()}`,
        conversation_id: params.conversationId,
        role: 'assistant',
        content: response.data.response || response.data.content || 'Resposta não disponível',
        created_at: new Date().toISOString(),
        model_used: 'fallback',
        model_provider: 'system',
        tokens_used: 0,
        processing_time_ms: 0
      }
      
      return { userMessage, assistantMessage }
    } catch (error) {
      console.error('❌ Falha no fluxo de fallback:', error)
      throw new Error(`Fallback flow failed: ${error.message}`)
    }
  }

  private async offlineChatFlow(params: any) {
    console.log('🔌 Usando fluxo offline...')
    
    // Criar mensagens offline
    const userMessage: MessageResponse = {
      id: `offline-user-${Date.now()}`,
      conversation_id: params.conversationId,
      role: 'user',
      content: params.message,
      created_at: new Date().toISOString(),
      tokens_used: 0,
      processing_time_ms: 0
    }
    
    const assistantMessage: MessageResponse = {
      id: `offline-assistant-${Date.now()}`,
      conversation_id: params.conversationId,
      role: 'assistant',
      content: 'Desculpe, estou temporariamente indisponível. Sua mensagem foi salva e será processada quando a conexão for restabelecida.',
      created_at: new Date().toISOString(),
      model_used: 'offline',
      model_provider: 'system',
      tokens_used: 0,
      processing_time_ms: 0
    }
    
    // Salvar para processamento posterior
    this.queueOfflineMessage(params)
    
    return { userMessage, assistantMessage }
  }

  private async executeWithFallbacks<T>(
    operations: (() => Promise<T>)[],
    operationName: string
  ): Promise<T> {
    let lastError: any
    
    for (let i = 0; i < operations.length; i++) {
      try {
        return await operations[i]()
      } catch (error) {
        lastError = error
        console.warn(`⚠️ Operação ${i + 1}/${operations.length} falhou em ${operationName}:`, error)
      }
    }
    
    console.error(`❌ Todas as operações falharam em ${operationName}:`, lastError)
    throw new Error(`All fallbacks failed for ${operationName}: ${lastError.message}`)
  }

  private queueOfflineMessage(params: any) {
    try {
      const queue = JSON.parse(localStorage.getItem('offline-message-queue') || '[]')
      queue.push({
        ...params,
        timestamp: Date.now(),
        retries: 0
      })
      localStorage.setItem('offline-message-queue', JSON.stringify(queue))
    } catch (error) {
      console.error('❌ Erro ao salvar mensagem offline:', error)
    }
  }

  // Processar fila offline quando conexão for restabelecida
  async processOfflineQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem('offline-message-queue') || '[]')
      
      for (const item of queue) {
        try {
          await this.primaryChatFlow(item)
          console.log('✅ Mensagem offline processada:', item.message)
        } catch (error) {
          console.error('❌ Erro ao processar mensagem offline:', error)
          item.retries = (item.retries || 0) + 1
          
          // Remover após 3 tentativas
          if (item.retries >= 3) {
            console.warn('⚠️ Removendo mensagem após 3 tentativas:', item.message)
          }
        }
      }
      
      // Atualizar fila (remover processadas e com muitas tentativas)
      const remainingQueue = queue.filter((item: any) => (item.retries || 0) < 3)
      localStorage.setItem('offline-message-queue', JSON.stringify(remainingQueue))
    } catch (error) {
      console.error('❌ Erro ao processar fila offline:', error)
    }
  }
}
```

## Tratamento de Erros de API

### 1. APIService - Interceptação e Retry

```typescript
// lib/api/service.ts

interface APIError extends Error {
  status?: number
  code?: string
  details?: any
}

class APIService {
  private retryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  }

  async post<T = any>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.requestWithRetry('POST', endpoint, data)
  }

  private async requestWithRetry<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<APIResponse<T>> {
    let lastError: APIError
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await this.makeRequest<T>(method, endpoint, data)
      } catch (error) {
        lastError = error as APIError
        
        // Verificar se deve tentar novamente
        if (!this.shouldRetry(error, attempt)) {
          throw this.enhanceError(error, endpoint, method)
        }
        
        // Delay antes da próxima tentativa
        const delay = this.retryConfig.retryDelay * Math.pow(2, attempt - 1)
        console.warn(`⚠️ Tentativa ${attempt}/${this.retryConfig.maxRetries} falhou, tentando novamente em ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw this.enhanceError(lastError!, endpoint, method)
  }

  private shouldRetry(error: any, attempt: number): boolean {
    if (attempt >= this.retryConfig.maxRetries) return false
    
    // Retry em erros de rede
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true
    }
    
    // Retry em status específicos
    if (error.status && this.retryConfig.retryableStatuses.includes(error.status)) {
      return true
    }
    
    return false
  }

  private enhanceError(error: any, endpoint: string, method: string): APIError {
    const enhancedError: APIError = new Error(error.message || 'API request failed')
    
    enhancedError.status = error.status
    enhancedError.code = error.code || this.getErrorCode(error.status)
    enhancedError.details = {
      endpoint,
      method,
      timestamp: new Date().toISOString(),
      originalError: error
    }
    
    return enhancedError
  }

  private getErrorCode(status?: number): string {
    switch (status) {
      case 400: return 'BAD_REQUEST'
      case 401: return 'UNAUTHORIZED'
      case 403: return 'FORBIDDEN'
      case 404: return 'NOT_FOUND'
      case 422: return 'VALIDATION_ERROR'
      case 429: return 'RATE_LIMITED'
      case 500: return 'INTERNAL_ERROR'
      case 502: return 'BAD_GATEWAY'
      case 503: return 'SERVICE_UNAVAILABLE'
      case 504: return 'GATEWAY_TIMEOUT'
      default: return 'UNKNOWN_ERROR'
    }
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<APIResponse<T>> {
    const url = this.buildURL(endpoint)
    const controller = new AbortController()
    const timeout = 30000 // 30 segundos
    
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        method,
        headers: this.defaultHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return await this.handleResponse<T>(response)
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      throw error
    }
  }

  private async handleResponse<T>(response: Response): Promise<APIResponse<T>> {
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })
    
    let data: T
    const contentType = response.headers.get('content-type')
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = (await response.text()) as unknown as T
      }
    } catch (parseError) {
      throw new Error(`Failed to parse response: ${parseError.message}`)
    }
    
    if (!response.ok) {
      const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`)
      error.status = response.status
      error.data = data
      throw error
    }
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers
    }
  }
}
```

## Sistema de Notificações de Erro

### 1. Toast de Erro Inteligente

```typescript
// lib/utils/error-toast.ts

interface ErrorToastOptions {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
}

export function showErrorToast(error: any, options: ErrorToastOptions = {}) {
  const { toast } = useToast()
  
  const errorInfo = parseError(error)
  
  toast({
    title: options.title || errorInfo.title,
    description: options.description || errorInfo.description,
    variant: "destructive",
    duration: options.persistent ? Infinity : 5000,
    action: options.action ? (
      <Button
        variant="outline"
        size="sm"
        onClick={options.action.onClick}
      >
        {options.action.label}
      </Button>
    ) : undefined
  })
}

function parseError(error: any): { title: string; description: string } {
  // Erro de rede
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      title: 'Erro de Conexão',
      description: 'Verifique sua conexão com a internet e tente novamente.'
    }
  }
  
  // Erros HTTP específicos
  switch (error.status) {
    case 401:
      return {
        title: 'Não Autorizado',
        description: 'Suas credenciais expiraram. Faça login novamente.'
      }
    
    case 403:
      return {
        title: 'Acesso Negado',
        description: 'Você não tem permissão para realizar esta ação.'
      }
    
    case 404:
      return {
        title: 'Não Encontrado',
        description: 'O recurso solicitado não foi encontrado.'
      }
    
    case 422:
      return {
        title: 'Dados Inválidos',
        description: 'Os dados enviados são inválidos. Verifique e tente novamente.'
      }
    
    case 429:
      return {
        title: 'Muitas Tentativas',
        description: 'Você fez muitas tentativas. Aguarde um momento e tente novamente.'
      }
    
    case 500:
      return {
        title: 'Erro do Servidor',
        description: 'Ocorreu um erro interno. Nossa equipe foi notificada.'
      }
    
    default:
      return {
        title: 'Erro Inesperado',
        description: error.message || 'Algo deu errado. Tente novamente.'
      }
  }
}
```

## Monitoramento de Erros

### 1. Sistema de Logging

```typescript
// lib/utils/error-logger.ts

interface ErrorLog {
  id: string
  timestamp: string
  level: 'error' | 'warn' | 'info'
  message: string
  stack?: string
  context?: Record<string, any>
  userAgent: string
  url: string
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = 100

  logError(error: Error, context?: Record<string, any>) {
    const log: ErrorLog = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    this.addLog(log)
    console.error('🚨 Error logged:', log)
    
    // Enviar para serviço externo se em produção
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(log)
    }
  }

  logWarning(message: string, context?: Record<string, any>) {
    const log: ErrorLog = {
      id: `warn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    this.addLog(log)
    console.warn('⚠️ Warning logged:', log)
  }

  private addLog(log: ErrorLog) {
    this.logs.unshift(log)
    
    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }
    
    // Persistir no localStorage
    try {
      localStorage.setItem('error-logs', JSON.stringify(this.logs.slice(0, 50)))
    } catch (error) {
      console.warn('Failed to persist error logs:', error)
    }
  }

  private async sendToExternalService(log: ErrorLog) {
    try {
      // Exemplo: enviar para Sentry, LogRocket, etc.
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      })
    } catch (error) {
      console.warn('Failed to send error to external service:', error)
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
    localStorage.removeItem('error-logs')
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

export const errorLogger = new ErrorLogger()
```

### 2. Hook de Monitoramento

```typescript
// hooks/use-error-monitoring.ts

export function useErrorMonitoring() {
  const [errorCount, setErrorCount] = useState(0)
  const [lastError, setLastError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message)
      setLastError(error)
      setErrorCount(prev => prev + 1)
      errorLogger.logError(error, { type: 'unhandled' })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(event.reason)
      setLastError(error)
      setErrorCount(prev => prev + 1)
      errorLogger.logError(error, { type: 'unhandled-promise' })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const reportError = useCallback((error: Error, context?: Record<string, any>) => {
    setLastError(error)
    setErrorCount(prev => prev + 1)
    errorLogger.logError(error, context)
  }, [])

  return {
    errorCount,
    lastError,
    reportError,
    clearErrors: () => {
      setErrorCount(0)
      setLastError(null)
    }
  }
}
``` 