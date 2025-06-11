/**
 * Tipos TypeScript para o sistema de chat
 * Define interfaces para mensagens, sessões e WebSocket
 */

// Tipos básicos de mensagem
export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'error'

// Interface principal para mensagens de chat
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  status?: MessageStatus
  metadata?: {
    model?: string
    personality?: string
    tools?: string[]
    tokens?: number
    processingTime?: number
    error?: string
  }
  attachments?: ChatAttachment[]
}

// Anexos de mensagem
export interface ChatAttachment {
  id: string
  type: 'image' | 'file' | 'audio' | 'video'
  name: string
  url: string
  size: number
  mimeType: string
}

// Sessão de chat
export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  userId: string
  messages: ChatMessage[]
  metadata?: {
    model?: string
    personality?: string
    tools?: string[]
    totalMessages?: number
    totalTokens?: number
  }
  isActive?: boolean
}

// Configurações de chat
export interface ChatConfig {
  model: string
  personality: string
  tools: string[]
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

// Tipos para WebSocket
export interface WebSocketMessage {
  type: 'chat_message' | 'typing' | 'ping' | 'pong' | 'session_update' | 'error'
  data: any
}

export interface WebSocketEvent {
  type: 'chat_message' | 'typing' | 'session_update' | 'error' | 'pong'
  data: any
}

// Estado do chat
export interface ChatState {
  currentSession: ChatSession | null
  sessions: ChatSession[]
  isLoading: boolean
  isTyping: boolean
  error: string | null
  config: ChatConfig
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting'
}

// Ações do chat
export type ChatAction =
  | { type: 'SET_CURRENT_SESSION'; payload: ChatSession }
  | { type: 'ADD_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_SESSION'; payload: ChatSession }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: ChatMessage } }
  | { type: 'UPDATE_MESSAGE'; payload: { sessionId: string; messageId: string; updates: Partial<ChatMessage> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONFIG'; payload: Partial<ChatConfig> }
  | { type: 'SET_CONNECTION_STATUS'; payload: ChatState['connectionStatus'] }
  | { type: 'CLEAR_SESSIONS' }

// Contexto do chat
export interface ChatContextType {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  
  // Ações de sessão
  createSession: (title?: string) => Promise<ChatSession>
  loadSessions: () => Promise<void>
  switchSession: (sessionId: string) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>
  
  // Ações de mensagem
  sendMessage: (message: string, attachments?: File[]) => Promise<void>
  resendMessage: (messageId: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  
  // Configurações
  updateConfig: (config: Partial<ChatConfig>) => void
  
  // WebSocket
  connect: () => Promise<void>
  disconnect: () => void
  sendTyping: (isTyping: boolean) => void
}

// Tipos para API
export interface SendMessageRequest {
  message: string
  sessionId?: string
  config?: Partial<ChatConfig>
  attachments?: File[]
}

export interface SendMessageResponse {
  message: ChatMessage
  session: ChatSession
}

export interface GetSessionsResponse {
  sessions: ChatSession[]
  total: number
}

export interface CreateSessionRequest {
  title?: string
  config?: Partial<ChatConfig>
}

export interface CreateSessionResponse {
  session: ChatSession
}

// Tipos para hooks
export interface UseChatOptions {
  autoConnect?: boolean
  sessionId?: string
}

export interface UseChatReturn {
  // Estado
  currentSession: ChatSession | null
  sessions: ChatSession[]
  isLoading: boolean
  isTyping: boolean
  error: string | null
  isConnected: boolean
  connectionStatus: ChatState['connectionStatus']
  
  // Ações
  sendMessage: (message: string, attachments?: File[]) => Promise<void>
  createSession: (title?: string) => Promise<ChatSession>
  switchSession: (sessionId: string) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  updateConfig: (config: Partial<ChatConfig>) => void
  connect: () => Promise<void>
  disconnect: () => void
  sendTyping: (isTyping: boolean) => void
}

// Tipos para componentes
export interface ChatMessageProps {
  message: ChatMessage
  onResend?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  isLast?: boolean
}

export interface ChatInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void
  isLoading?: boolean
  isConnected?: boolean
  placeholder?: string
  maxLength?: number
}

export interface ChatSessionListProps {
  sessions: ChatSession[]
  currentSessionId?: string
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onCreateSession: () => void
}

// Tipos para configurações avançadas
export interface ChatPersonality {
  id: string
  name: string
  description: string
  systemPrompt: string
  avatar?: string
}

export interface ChatModel {
  id: string
  name: string
  description: string
  maxTokens: number
  supportedFeatures: string[]
}

export interface ChatTool {
  id: string
  name: string
  description: string
  enabled: boolean
  config?: Record<string, any>
}

// Tipos para estatísticas
export interface ChatStats {
  totalSessions: number
  totalMessages: number
  totalTokens: number
  averageResponseTime: number
  mostUsedModel: string
  mostUsedPersonality: string
}

export default ChatMessage

