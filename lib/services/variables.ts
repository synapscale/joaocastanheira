/**
 * Serviço de variáveis
 * Gerencia todas as operações de variáveis com o backend
 */

import { apiService } from '../api'
import { config } from '../config'
import type { Variable, VariableScope, VariableUsage } from '../../types/variable'

/**
 * Interface para criação de variável
 */
export interface CreateVariableData {
  name: string
  key: string
  type: Variable['type']
  value: any
  scope: VariableScope
  description?: string
  isSecret?: boolean
  tags?: string[]
}

/**
 * Interface para atualização de variável
 */
export interface UpdateVariableData {
  name?: string
  value?: any
  description?: string
  isSecret?: boolean
  tags?: string[]
}

/**
 * Interface para resposta de variáveis
 */
export interface VariablesResponse {
  variables: Variable[]
  total: number
  page: number
  limit: number
}

/**
 * Interface para filtros de variáveis
 */
export interface VariableFilters {
  scope?: VariableScope
  type?: Variable['type']
  search?: string
  tags?: string[]
  isSecret?: boolean
  page?: number
  limit?: number
}

/**
 * Interface para importação de variáveis
 */
export interface ImportVariablesData {
  variables: CreateVariableData[]
  overwrite?: boolean
}

/**
 * Interface para exportação de variáveis
 */
export interface ExportVariablesOptions {
  scope?: VariableScope
  includeSecrets?: boolean
  format?: 'json' | 'csv' | 'env'
}

/**
 * Classe principal do serviço de variáveis
 */
export class VariableService {
  /**
   * Obtém todas as variáveis do usuário
   */
  async getVariables(filters?: VariableFilters): Promise<VariablesResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters?.scope) params.append('scope', filters.scope)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.tags?.length) params.append('tags', filters.tags.join(','))
      if (filters?.isSecret !== undefined) params.append('isSecret', filters.isSecret.toString())
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      const endpoint = queryString 
        ? `${config.endpoints.variables.base}?${queryString}`
        : config.endpoints.variables.base

      return await apiService.get<VariablesResponse>(endpoint)
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Obtém uma variável específica por ID
   */
  async getVariableById(id: string): Promise<Variable> {
    try {
      return await apiService.get<Variable>(`${config.endpoints.variables.base}/${id}`)
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Obtém uma variável por chave e escopo
   */
  async getVariableByKey(key: string, scope?: VariableScope): Promise<Variable | null> {
    try {
      const params = new URLSearchParams({ key })
      if (scope) params.append('scope', scope)

      const response = await apiService.get<{ variable: Variable | null }>(
        `${config.endpoints.variables.base}/by-key?${params.toString()}`
      )
      
      return response.variable
    } catch (error) {
      if (error?.status === 404) {
        return null
      }
      throw this.handleVariableError(error)
    }
  }

  /**
   * Cria uma nova variável
   */
  async createVariable(data: CreateVariableData): Promise<Variable> {
    try {
      return await apiService.post<Variable>(config.endpoints.variables.base, data)
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Atualiza uma variável existente
   */
  async updateVariable(id: string, data: UpdateVariableData): Promise<Variable> {
    try {
      return await apiService.put<Variable>(`${config.endpoints.variables.base}/${id}`, data)
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Deleta uma variável
   */
  async deleteVariable(id: string): Promise<void> {
    try {
      await apiService.delete(`${config.endpoints.variables.base}/${id}`)
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Cria múltiplas variáveis em lote
   */
  async createVariablesBulk(variables: CreateVariableData[]): Promise<Variable[]> {
    try {
      const response = await apiService.post<{ variables: Variable[] }>(
        config.endpoints.variables.bulk,
        { variables }
      )
      return response.variables
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Atualiza múltiplas variáveis em lote
   */
  async updateVariablesBulk(updates: Array<{ id: string; data: UpdateVariableData }>): Promise<Variable[]> {
    try {
      const response = await apiService.put<{ variables: Variable[] }>(
        config.endpoints.variables.bulk,
        { updates }
      )
      return response.variables
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Deleta múltiplas variáveis em lote
   */
  async deleteVariablesBulk(ids: string[]): Promise<void> {
    try {
      await apiService.delete(config.endpoints.variables.bulk, { ids })
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Importa variáveis de um arquivo ou dados
   */
  async importVariables(data: ImportVariablesData): Promise<{ imported: Variable[]; errors: string[] }> {
    try {
      return await apiService.post<{ imported: Variable[]; errors: string[] }>(
        config.endpoints.variables.import,
        data
      )
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Exporta variáveis
   */
  async exportVariables(options?: ExportVariablesOptions): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      
      if (options?.scope) params.append('scope', options.scope)
      if (options?.includeSecrets !== undefined) params.append('includeSecrets', options.includeSecrets.toString())
      if (options?.format) params.append('format', options.format)

      const queryString = params.toString()
      const endpoint = queryString 
        ? `${config.endpoints.variables.export}?${queryString}`
        : config.endpoints.variables.export

      return await apiService.getBlob(endpoint)
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Valida uma expressão de variável
   */
  async validateExpression(expression: string, context?: Record<string, any>): Promise<{ isValid: boolean; error?: string; result?: any }> {
    try {
      return await apiService.post<{ isValid: boolean; error?: string; result?: any }>(
        config.endpoints.variables.validate,
        { expression, context }
      )
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Resolve o valor de uma variável com contexto
   */
  async resolveVariableValue(variableId: string, context?: Record<string, any>): Promise<{ value: any; type: string }> {
    try {
      return await apiService.post<{ value: any; type: string }>(
        `${config.endpoints.variables.base}/${variableId}/resolve`,
        { context }
      )
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Obtém variáveis do sistema
   */
  async getSystemVariables(): Promise<Variable[]> {
    try {
      const response = await apiService.get<{ variables: Variable[] }>(
        `${config.endpoints.variables.base}/system`
      )
      return response.variables
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Obtém estatísticas de uso de variáveis
   */
  async getVariableStats(): Promise<{
    total: number
    byScope: Record<VariableScope, number>
    byType: Record<Variable['type'], number>
    mostUsed: Array<{ variable: Variable; usageCount: number }>
  }> {
    try {
      return await apiService.get<{
        total: number
        byScope: Record<VariableScope, number>
        byType: Record<Variable['type'], number>
        mostUsed: Array<{ variable: Variable; usageCount: number }>
      }>(`${config.endpoints.variables.base}/stats`)
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Sincroniza variáveis locais com o servidor
   */
  async syncVariables(localVariables: Variable[]): Promise<{
    synced: Variable[]
    conflicts: Array<{ local: Variable; remote: Variable }>
    errors: string[]
  }> {
    try {
      return await apiService.post<{
        synced: Variable[]
        conflicts: Array<{ local: Variable; remote: Variable }>
        errors: string[]
      }>(`${config.endpoints.variables.base}/sync`, { variables: localVariables })
    } catch (error) {
      throw this.handleVariableError(error)
    }
  }

  /**
   * Trata erros de variáveis
   */
  private handleVariableError(error: any): Error {
    if (error?.status === 400) {
      return new Error(error.data?.message || 'Dados da variável inválidos')
    }
    
    if (error?.status === 404) {
      return new Error('Variável não encontrada')
    }
    
    if (error?.status === 409) {
      return new Error('Conflito: Variável com esta chave já existe')
    }
    
    if (error?.status === 422) {
      return new Error(error.data?.message || 'Dados de variável inválidos')
    }
    
    if (error?.status === 429) {
      return new Error('Muitas requisições. Tente novamente mais tarde.')
    }
    
    if (error?.status >= 500) {
      return new Error('Erro interno do servidor. Tente novamente mais tarde.')
    }
    
    return new Error(error?.message || 'Erro ao processar variável')
  }
}

// Instância singleton do serviço de variáveis
export const variableService = new VariableService()

export default variableService

