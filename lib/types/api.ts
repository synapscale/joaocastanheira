/**
 * Tipos para comunicação com a API
 * Define interfaces e tipos para requests e responses
 */

// Tipos base para respostas da API
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface ApiError {
  message: string
  code?: string
  details?: any
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Tipos para configuração de requests
export interface RequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
  params?: Record<string, any>
}

export interface ApiRequestOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  skipAuth?: boolean
  skipErrorHandling?: boolean
}

// Tipos para autenticação
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Tipos para variáveis
export interface Variable {
  id: string
  name: string
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'expression'
  scope: 'global' | 'workflow' | 'user'
  category?: string
  description?: string
  isSystem: boolean
  isSensitive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateVariableRequest {
  name: string
  key: string
  value: any
  type: Variable['type']
  scope: Variable['scope']
  category?: string
  description?: string
  isSensitive?: boolean
}

export interface UpdateVariableRequest {
  name?: string
  value?: any
  type?: Variable['type']
  category?: string
  description?: string
  isSensitive?: boolean
}

export interface GetVariablesParams {
  skip?: number
  limit?: number
  search?: string
  category?: string
  scope?: Variable['scope']
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  includeValues?: boolean
}

export interface VariableList {
  variables: Variable[]
  total: number
  categories: string[]
}

export interface BulkCreateVariablesRequest {
  variables: CreateVariableRequest[]
}

export interface ImportVariablesRequest {
  envContent: string
  overwriteExisting?: boolean
  defaultCategory?: string
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
  variables: Variable[]
}

// Tipos para chat
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  model?: string
  metadata?: any
}

export interface SendMessageRequest {
  message: string
  model?: string
  personality?: string
  tools?: string[]
  context?: any
}

export interface ChatResponse {
  id: string
  role: 'assistant'
  content: string
  model: string
  timestamp: string
  metadata?: any
}

// Tipos para WebSocket
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'error' | 'connected' | 'disconnected'
  data: any
  timestamp: string
}

export interface WebSocketConfig {
  url: string
  protocols?: string[]
  reconnectAttempts?: number
  reconnectDelay?: number
  heartbeatInterval?: number
}

// Tipos para workflows
export interface Workflow {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  variables: Variable[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: any
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

// Tipos para health check
export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    database: 'up' | 'down'
    redis?: 'up' | 'down'
    [key: string]: 'up' | 'down' | undefined
  }
}

// Tipos para erros HTTP
export interface HttpError extends Error {
  status: number
  statusText: string
  data?: any
}

// Tipos para interceptadores
export interface RequestInterceptor {
  onRequest?: (config: RequestInit) => RequestInit | Promise<RequestInit>
  onRequestError?: (error: Error) => Error | Promise<Error>
}

export interface ResponseInterceptor {
  onResponse?: (response: Response) => Response | Promise<Response>
  onResponseError?: (error: HttpError) => HttpError | Promise<HttpError>
}

// Tipos para cache
export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiresAt: number
}

export interface CacheConfig {
  ttl?: number // Time to live em milissegundos
  maxSize?: number
  enabled?: boolean
}

// Tipos utilitários
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type ApiEndpoint = string

export type QueryParams = Record<string, string | number | boolean | undefined>

export type RequestBody = any

// Tipos para validação
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResponse {
  isValid: boolean
  errors: ValidationError[]
}

export default {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  RequestConfig,
  ApiRequestOptions,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Variable,
  CreateVariableRequest,
  UpdateVariableRequest,
  GetVariablesParams,
  VariableList,
  ChatMessage,
  SendMessageRequest,
  ChatResponse,
  WebSocketMessage,
  WebSocketConfig,
  Workflow,
  HealthResponse,
  HttpError,
}

