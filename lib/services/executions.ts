/**
 * Serviço de Executions - Gerencia execuções de workflows
 * Integração completa com a API real de executions
 */

import { apiService } from '../api/service'
import type {
  Execution,
  ExecutionCreate,
  ExecutionLog,
  ExecutionStats
} from '../api/openapi-types'

export interface ExecutionFilters {
  workflow_id?: string
  status?: string[]
  user_id?: string
  workspace_id?: string
  start_date?: string
  end_date?: string
  page?: number
  size?: number
  sort_by?: 'created_at' | 'started_at' | 'completed_at' | 'execution_time_ms'
  sort_order?: 'asc' | 'desc'
}

export interface ExecutionControl {
  action: 'pause' | 'resume' | 'cancel' | 'retry'
  reason?: string
}

export interface ExecutionMetrics {
  execution_id: string
  metrics: {
    cpu_usage: number
    memory_usage: number
    steps_completed: number
    total_steps: number
    processing_time_ms: number
    errors_count: number
  }
  timestamp: string
}

/**
 * Classe principal do serviço de executions
 */
export class ExecutionsService {
  /**
   * Criar uma nova execução de workflow
   */
  async createExecution(executionData: ExecutionCreate): Promise<Execution> {
    try {
      return await apiService.post<Execution>('/executions/', executionData)
    } catch (error) {
      throw this.handleError(error, 'Erro ao criar execução')
    }
  }

  /**
   * Listar execuções do usuário
   */
  async getExecutions(filters?: ExecutionFilters): Promise<{
    items: Execution[]
    total: number
    page: number
    size: number
    pages: number
  }> {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters?.workflow_id) queryParams.append('workflow_id', filters.workflow_id)
      if (filters?.status) filters.status.forEach(s => queryParams.append('status', s))
      if (filters?.user_id) queryParams.append('user_id', filters.user_id)
      if (filters?.workspace_id) queryParams.append('workspace_id', filters.workspace_id)
      if (filters?.start_date) queryParams.append('start_date', filters.start_date)
      if (filters?.end_date) queryParams.append('end_date', filters.end_date)
      if (filters?.page) queryParams.append('page', filters.page.toString())
      if (filters?.size) queryParams.append('size', filters.size.toString())
      if (filters?.sort_by) queryParams.append('sort_by', filters.sort_by)
      if (filters?.sort_order) queryParams.append('sort_order', filters.sort_order)

      const queryString = queryParams.toString()
      const endpoint = queryString ? `/executions/?${queryString}` : '/executions/'

      return await apiService.get<{
        items: Execution[]
        total: number
        page: number
        size: number
        pages: number
      }>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar execuções')
    }
  }

  /**
   * Obter uma execução específica
   */
  async getExecution(executionId: string): Promise<Execution> {
    try {
      return await apiService.get<Execution>(`/executions/${executionId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar execução')
    }
  }

  /**
   * Controlar execução (pausar, continuar, cancelar, retry)
   */
  async controlExecution(executionId: string, control: ExecutionControl): Promise<void> {
    try {
      await apiService.post(`/executions/${executionId}/control`, control)
    } catch (error) {
      throw this.handleError(error, `Erro ao ${control.action} execução`)
    }
  }

  /**
   * Cancelar execução
   */
  async cancelExecution(executionId: string, reason?: string): Promise<void> {
    return this.controlExecution(executionId, { action: 'cancel', reason })
  }

  /**
   * Tentar novamente execução falhada
   */
  async retryExecution(executionId: string): Promise<Execution> {
    try {
      return await apiService.post<Execution>(`/executions/${executionId}/retry`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao tentar novamente execução')
    }
  }

  /**
   * Controle em lote de execuções
   */
  async batchControl(executionIds: string[], action: 'cancel' | 'retry', reason?: string): Promise<{
    successful: string[]
    failed: Array<{ execution_id: string; error: string }>
  }> {
    try {
      return await apiService.post('/executions/batch', {
        execution_ids: executionIds,
        action,
        reason
      })
    } catch (error) {
      throw this.handleError(error, `Erro ao executar ação em lote: ${action}`)
    }
  }

  /**
   * Obter nós da execução (detalhes de cada step)
   */
  async getExecutionNodes(executionId: string): Promise<Array<{
    node_id: string
    node_name: string
    status: string
    started_at?: string
    completed_at?: string
    output?: any
    error?: string
    execution_time_ms?: number
  }>> {
    try {
      return await apiService.get(`/executions/${executionId}/nodes`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar nós da execução')
    }
  }

  /**
   * Obter logs da execução
   */
  async getExecutionLogs(executionId: string, params?: {
    level?: 'debug' | 'info' | 'warning' | 'error'
    start_time?: string
    end_time?: string
    limit?: number
    offset?: number
  }): Promise<{
    logs: ExecutionLog[]
    total: number
    has_more: boolean
  }> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.level) queryParams.append('level', params.level)
      if (params?.start_time) queryParams.append('start_time', params.start_time)
      if (params?.end_time) queryParams.append('end_time', params.end_time)
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.offset) queryParams.append('offset', params.offset.toString())

      const queryString = queryParams.toString()
      const endpoint = `/executions/${executionId}/logs${queryString ? '?' + queryString : ''}`

      return await apiService.get(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar logs da execução')
    }
  }

  /**
   * Obter métricas da execução
   */
  async getExecutionMetrics(executionId: string): Promise<ExecutionMetrics> {
    try {
      return await apiService.get<ExecutionMetrics>(`/executions/${executionId}/metrics`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar métricas da execução')
    }
  }

  /**
   * Validar workflow antes da execução
   */
  async validateWorkflow(workflowData: any): Promise<{
    is_valid: boolean
    errors?: string[]
    warnings?: string[]
    estimated_execution_time?: number
    required_permissions?: string[]
  }> {
    try {
      return await apiService.post('/executions/validate-workflow', {
        workflow_definition: workflowData
      })
    } catch (error) {
      throw this.handleError(error, 'Erro ao validar workflow')
    }
  }

  /**
   * Obter estatísticas de execução
   */
  async getExecutionStats(params?: {
    workflow_id?: string
    workspace_id?: string
    start_date?: string
    end_date?: string
    group_by?: 'day' | 'week' | 'month'
  }): Promise<ExecutionStats> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.workflow_id) queryParams.append('workflow_id', params.workflow_id)
      if (params?.workspace_id) queryParams.append('workspace_id', params.workspace_id)
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)
      if (params?.group_by) queryParams.append('group_by', params.group_by)

      const queryString = queryParams.toString()
      const endpoint = `/executions/stats${queryString ? '?' + queryString : ''}`

      return await apiService.get<ExecutionStats>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar estatísticas de execução')
    }
  }

  /**
   * Obter status da fila de execução
   */
  async getQueueStatus(): Promise<{
    queue_size: number
    processing_count: number
    average_wait_time_ms: number
    estimated_completion_time?: string
    worker_status: Array<{
      worker_id: string
      status: 'idle' | 'busy' | 'offline'
      current_execution_id?: string
      last_activity: string
    }>
  }> {
    try {
      return await apiService.get('/executions/queue/status')
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar status da fila')
    }
  }

  /**
   * Obter execuções por workflow
   */
  async getWorkflowExecutions(workflowId: string, params?: {
    page?: number
    size?: number
    status?: string[]
    start_date?: string
    end_date?: string
  }): Promise<{
    items: Execution[]
    total: number
    page: number
    size: number
    pages: number
  }> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.size) queryParams.append('size', params.size.toString())
      if (params?.status) params.status.forEach(s => queryParams.append('status', s))
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)

      const queryString = queryParams.toString()
      const endpoint = `/workflows/${workflowId}/executions${queryString ? '?' + queryString : ''}`

      return await apiService.get(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar execuções do workflow')
    }
  }

  /**
   * [ADMIN] Obter status do engine de execução
   */
  async getEngineStatus(): Promise<{
    status: 'running' | 'stopped' | 'error'
    version: string
    uptime_seconds: number
    total_executions: number
    active_executions: number
    workers_count: number
    memory_usage: {
      used: number
      total: number
      percentage: number
    }
    cpu_usage: number
    last_health_check: string
  }> {
    try {
      return await apiService.get('/executions/admin/engine-status')
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar status do engine')
    }
  }

  /**
   * [ADMIN] Iniciar engine de execução
   */
  async startEngine(): Promise<{ message: string; status: string }> {
    try {
      return await apiService.post('/executions/admin/engine/start')
    } catch (error) {
      throw this.handleError(error, 'Erro ao iniciar engine de execução')
    }
  }

  /**
   * [ADMIN] Parar engine de execução
   */
  async stopEngine(): Promise<{ message: string; status: string }> {
    try {
      return await apiService.post('/executions/admin/engine/stop')
    } catch (error) {
      throw this.handleError(error, 'Erro ao parar engine de execução')
    }
  }

  /**
   * Obter execuções recentes do usuário
   */
  async getRecentExecutions(limit: number = 10): Promise<Execution[]> {
    try {
      const result = await this.getExecutions({
        page: 1,
        size: limit,
        sort_by: 'created_at',
        sort_order: 'desc'
      })
      return result.items
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar execuções recentes')
    }
  }

  /**
   * Obter execuções ativas (running, pending)
   */
  async getActiveExecutions(): Promise<Execution[]> {
    try {
      const result = await this.getExecutions({
        status: ['pending', 'running'],
        sort_by: 'created_at',
        sort_order: 'desc'
      })
      return result.items
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar execuções ativas')
    }
  }

  /**
   * Verificar se há execuções pendentes para um workflow
   */
  async hasPendingExecutions(workflowId: string): Promise<boolean> {
    try {
      const result = await this.getExecutions({
        workflow_id: workflowId,
        status: ['pending', 'running'],
        size: 1
      })
      return result.total > 0
    } catch (error) {
      console.warn('Erro ao verificar execuções pendentes:', error)
      return false
    }
  }

  /**
   * Tratar erros de API com mensagens mais específicas
   */
  private handleError(error: any, defaultMessage: string): Error {
    console.error('ExecutionsService error:', error)
    
    // Erro de autenticação
    if (error?.status === 401) {
      return new Error('Você precisa estar logado para acessar execuções.')
    }
    
    // Erro de autorização
    if (error?.status === 403) {
      return new Error('Você não tem permissão para realizar esta ação.')
    }
    
    // Erro de recurso não encontrado
    if (error?.status === 404) {
      return new Error('Execução não encontrada.')
    }
    
    // Erro de validação
    if (error?.status === 422) {
      const details = error?.data?.detail || error?.message || ''
      return new Error(`Dados inválidos: ${details}`)
    }
    
    // Erro de servidor
    if (error?.status >= 500) {
      return new Error('Erro interno do servidor. Tente novamente em alguns minutos.')
    }
    
    // Erro de rede
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('conectar ao servidor')) {
      return new Error('Não foi possível conectar ao servidor. Verifique sua conexão de internet.')
    }
    
    // Erro genérico
    const message = error?.message || defaultMessage
    return new Error(message)
  }
}

// Instância singleton do serviço
export const executionsService = new ExecutionsService()
export default executionsService 