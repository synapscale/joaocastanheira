# Componentes Frontend - Sistema de Chat

## Visão Geral

O sistema de chat é composto por uma hierarquia de componentes React que trabalham em conjunto para fornecer uma experiência de chat completa e moderna.

## Hierarquia de Componentes

```
ChatInterface (Principal)
├── ChatHeader
├── MessagesArea
│   ├── MessageList
│   │   └── ChatMessage
│   │       ├── UserMessage
│   │       ├── AssistantMessage
│   │       └── MessageActions
│   ├── TypingIndicator
│   └── ChatProcessingStatus
└── ChatInput
    ├── InputField
    ├── AttachmentButton
    └── SendButton
```

## Componentes Principais

### 1. ChatInterface (`components/chat/chat-interface.tsx`)

**Responsabilidade:** Componente principal que orquestra todo o sistema de chat.

```typescript
interface ChatInterfaceProps {
  conversationId?: string;
  agentId?: string;
  onConversationChange?: (id: string) => void;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  agentId,
  onConversationChange,
  className
}) => {
  // Estado local
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  
  // Hooks
  const conversationsHook = useConversations()
  const { toast } = useToast()
  
  // Handlers
  const handleSendMessage = async (message: string, attachments?: File[]) => {
    // Lógica de envio de mensagem
  }
  
  const handleConversationSelect = (id: string) => {
    // Lógica de seleção de conversa
  }
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ChatHeader 
        conversation={conversationsHook.currentConversation}
        onConversationChange={handleConversationSelect}
      />
      
      <MessagesArea
        messages={safeMessages}
        isLoading={conversationsHook.isLoading}
        showTypingIndicator={showTypingIndicator}
        processingStatus={processingStatus}
      />
      
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={conversationsHook.isLoading}
        placeholder="Digite sua mensagem..."
      />
    </div>
  )
}
```

**Características:**
- Gerencia estado global do chat
- Coordena comunicação entre componentes filhos
- Implementa lógica de negócio principal
- Trata erros e estados de loading

### 2. ChatInput (`components/chat/chat-input.tsx`)

**Responsabilidade:** Campo de entrada de mensagens com funcionalidades avançadas.

```typescript
interface ChatInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Digite sua mensagem...",
  maxLength = 4000
}) => {
  // Estado
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isComposing, setIsComposing] = useState(false)
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || disabled) return
    
    onSendMessage(message.trim(), attachments)
    setMessage('')
    setAttachments([])
    textareaRef.current?.focus()
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit(e)
    }
  }
  
  const handleFileSelect = (files: FileList) => {
    // Lógica de seleção de arquivos
  }
  
  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="flex items-end gap-2 p-4 border-t">
        {/* Área de anexos */}
        {attachments.length > 0 && (
          <AttachmentPreview 
            attachments={attachments}
            onRemove={(index) => {
              setAttachments(prev => prev.filter((_, i) => i !== index))
            }}
          />
        )}
        
        {/* Campo de texto */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={1}
            className="w-full resize-none rounded-lg border p-3 pr-12"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          
          {/* Contador de caracteres */}
          <div className="absolute bottom-1 right-1 text-xs text-muted-foreground">
            {message.length}/{maxLength}
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button
            type="submit"
            size="sm"
            disabled={disabled || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>
    </form>
  )
}
```

**Características:**
- Auto-resize do textarea
- Suporte a anexos de arquivo
- Shortcuts de teclado (Enter para enviar, Shift+Enter para nova linha)
- Validação de entrada
- Contador de caracteres
- Estados de loading e disabled

### 3. MessagesArea (`components/chat/messages-area.tsx`)

**Responsabilidade:** Área de exibição de mensagens com scroll automático.

```typescript
interface MessagesAreaProps {
  messages: Message[];
  isLoading?: boolean;
  showTypingIndicator?: boolean;
  processingStatus?: string | null;
  onMessageAction?: (action: string, messageId: string) => void;
}

const MessagesArea: React.FC<MessagesAreaProps> = ({
  messages,
  isLoading = false,
  showTypingIndicator = false,
  processingStatus = null,
  onMessageAction
}) => {
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Estado
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [isNearBottom, setIsNearBottom] = useState(true)
  
  // Auto-scroll para nova mensagem
  useEffect(() => {
    if (shouldAutoScroll && isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [messages, shouldAutoScroll, isNearBottom])
  
  // Detectar posição do scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    const nearBottom = distanceFromBottom < 100
    
    setIsNearBottom(nearBottom)
    setShouldAutoScroll(nearBottom)
  }, [])
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      onScroll={handleScroll}
    >
      {/* Lista de mensagens */}
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
          onAction={onMessageAction}
        />
      ))}
      
      {/* Indicador de digitação */}
      {showTypingIndicator && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}
      
      {/* Status de processamento */}
      {processingStatus && (
        <ChatProcessingStatus status={processingStatus} />
      )}
      
      {/* Indicador de loading */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      
      {/* Âncora para scroll */}
      <div ref={messagesEndRef} />
      
      {/* Botão de scroll para baixo */}
      {!isNearBottom && (
        <Button
          variant="secondary"
          size="sm"
          className="fixed bottom-20 right-4 rounded-full shadow-lg"
          onClick={() => {
            setShouldAutoScroll(true)
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
```

**Características:**
- Auto-scroll inteligente
- Detecção de posição do scroll
- Botão de scroll para baixo
- Indicadores visuais (typing, loading)
- Performance otimizada para muitas mensagens

### 4. ChatMessage (`components/chat/chat-message/index.tsx`)

**Responsabilidade:** Componente individual de mensagem com diferentes tipos.

```typescript
interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  onAction?: (action: string, messageId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLast = false,
  onAction
}) => {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const isSystem = message.role === 'system'
  
  // Formatação de timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Classe CSS baseada no tipo
  const messageClass = cn(
    "flex gap-3 max-w-4xl",
    isUser && "ml-auto flex-row-reverse",
    isAssistant && "mr-auto",
    isSystem && "justify-center"
  )
  
  const bubbleClass = cn(
    "rounded-lg px-4 py-2 max-w-[80%] break-words",
    isUser && "bg-primary text-primary-foreground",
    isAssistant && "bg-muted",
    isSystem && "bg-secondary text-secondary-foreground text-sm"
  )
  
  return (
    <div className={messageClass}>
      {/* Avatar */}
      {!isSystem && (
        <div className="flex-shrink-0">
          {isUser ? (
            <UserAvatar size="sm" />
          ) : (
            <AssistantAvatar size="sm" />
          )}
        </div>
      )}
      
      {/* Conteúdo da mensagem */}
      <div className="flex flex-col gap-1 min-w-0">
        {/* Bolha da mensagem */}
        <div className={bubbleClass}>
          {isUser ? (
            <UserMessage message={message} />
          ) : isAssistant ? (
            <AssistantMessage message={message} />
          ) : (
            <SystemMessage message={message} />
          )}
        </div>
        
        {/* Metadados */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          isUser && "justify-end"
        )}>
          <span>{formatTime(message.timestamp)}</span>
          
          {/* Status da mensagem */}
          {message.status && (
            <MessageStatus status={message.status} />
          )}
          
          {/* Informações do modelo (apenas assistente) */}
          {isAssistant && message.model && (
            <span className="font-mono">
              {message.model}
            </span>
          )}
          
          {/* Tokens usados */}
          {message.metadata?.tokens_used && (
            <span>
              {message.metadata.tokens_used} tokens
            </span>
          )}
        </div>
        
        {/* Ações da mensagem */}
        {onAction && !isSystem && (
          <MessageActions
            message={message}
            onAction={onAction}
            isLast={isLast}
          />
        )}
      </div>
    </div>
  )
}
```

**Características:**
- Diferentes tipos de mensagem (user, assistant, system)
- Avatares personalizados
- Metadados informativos
- Ações contextuais
- Layout responsivo

## Componentes de Suporte

### 1. TypingIndicator (`components/chat/typing-indicator.tsx`)

```typescript
const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg max-w-fit">
      <AssistantAvatar size="xs" />
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
      </div>
    </div>
  )
}
```

### 2. ChatProcessingStatus (`components/chat/chat-processing-status.tsx`)

```typescript
interface ChatProcessingStatusProps {
  status: string;
}

const ChatProcessingStatus: React.FC<ChatProcessingStatusProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'sending':
        return { text: 'Enviando...', icon: Send, color: 'text-blue-600' }
      case 'processing':
        return { text: 'Processando...', icon: Loader2, color: 'text-orange-600' }
      case 'error':
        return { text: 'Erro ao enviar', icon: AlertCircle, color: 'text-red-600' }
      default:
        return { text: status, icon: Info, color: 'text-muted-foreground' }
    }
  }
  
  const { text, icon: Icon, color } = getStatusConfig(status)
  
  return (
    <div className="flex items-center justify-center gap-2 py-2 text-sm">
      <Icon className={cn("h-4 w-4", color)} />
      <span className={color}>{text}</span>
    </div>
  )
}
```

### 3. MessageActions (`components/chat/chat-message/message-actions.tsx`)

```typescript
interface MessageActionsProps {
  message: Message;
  onAction: (action: string, messageId: string) => void;
  isLast?: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onAction,
  isLast = false
}) => {
  const [showActions, setShowActions] = useState(false)
  
  const actions = [
    { id: 'copy', label: 'Copiar', icon: Copy },
    { id: 'edit', label: 'Editar', icon: Edit, condition: message.role === 'user' },
    { id: 'regenerate', label: 'Regenerar', icon: RotateCcw, condition: message.role === 'assistant' && isLast },
    { id: 'delete', label: 'Deletar', icon: Trash2, variant: 'destructive' }
  ].filter(action => !action.condition || action.condition)
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showActions && (
        <div className="absolute top-0 left-0 flex gap-1 bg-background border rounded-md shadow-sm p-1">
          {actions.map(action => (
            <Button
              key={action.id}
              variant={action.variant || 'ghost'}
              size="sm"
              onClick={() => onAction(action.id, message.id)}
              title={action.label}
            >
              <action.icon className="h-3 w-3" />
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Componentes Especializados

### 1. UserMessage (`components/chat/chat-message/user-message.tsx`)

```typescript
interface UserMessageProps {
  message: Message;
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="space-y-2">
      {/* Conteúdo da mensagem */}
      <div className="whitespace-pre-wrap">
        {message.content}
      </div>
      
      {/* Anexos */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {message.attachments.map((attachment, index) => (
            <AttachmentPreview
              key={index}
              attachment={attachment}
              size="sm"
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### 2. AssistantMessage (`components/chat/chat-message/assistant-message.tsx`)

```typescript
interface AssistantMessageProps {
  message: Message;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message }) => {
  return (
    <div className="space-y-2">
      {/* Conteúdo da mensagem com Markdown */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          components={{
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <CodeBlock
                  language={match[1]}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
      
      {/* Informações de debug (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && message.metadata && (
        <details className="text-xs text-muted-foreground">
          <summary>Debug Info</summary>
          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
            {JSON.stringify(message.metadata, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
```

## Estilos e Temas

### CSS Classes Principais

```css
/* Chat Interface */
.chat-interface {
  @apply flex flex-col h-full bg-background;
}

.chat-header {
  @apply flex items-center justify-between p-4 border-b bg-card;
}

.chat-messages {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
}

.chat-input-form {
  @apply border-t bg-card;
}

/* Mensagens */
.message-user {
  @apply ml-auto flex-row-reverse;
}

.message-assistant {
  @apply mr-auto;
}

.message-bubble-user {
  @apply bg-primary text-primary-foreground rounded-lg px-4 py-2;
}

.message-bubble-assistant {
  @apply bg-muted rounded-lg px-4 py-2;
}

/* Animações */
.typing-dot {
  @apply w-2 h-2 bg-muted-foreground rounded-full animate-bounce;
}

.fade-in {
  @apply animate-in fade-in-0 duration-200;
}

.slide-up {
  @apply animate-in slide-in-from-bottom-2 duration-300;
}
```

### Temas Dark/Light

```typescript
// Suporte automático a temas via Tailwind CSS
const messageClass = cn(
  "rounded-lg px-4 py-2",
  isUser 
    ? "bg-primary text-primary-foreground" 
    : "bg-muted text-muted-foreground",
  "dark:bg-muted dark:text-muted-foreground"
)
```

## Performance e Otimizações

### 1. Memoização de Componentes

```typescript
// Evitar re-renders desnecessários
const MemoizedChatMessage = memo(ChatMessage, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.content === nextProps.message.content
  )
})
```

### 2. Virtualização de Lista (para muitas mensagens)

```typescript
import { FixedSizeList as List } from 'react-window'

const VirtualizedMessagesList: React.FC<{messages: Message[]}> = ({ messages }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ChatMessage message={messages[index]} />
    </div>
  )
  
  return (
    <List
      height={600}
      itemCount={messages.length}
      itemSize={100}
      itemData={messages}
    >
      {Row}
    </List>
  )
}
```

### 3. Lazy Loading de Componentes

```typescript
// Carregar componentes pesados apenas quando necessário
const CodeBlock = lazy(() => import('./CodeBlock'))
const AttachmentPreview = lazy(() => import('./AttachmentPreview'))

// Uso com Suspense
<Suspense fallback={<div>Carregando...</div>}>
  <CodeBlock language="typescript" value={code} />
</Suspense>
``` 