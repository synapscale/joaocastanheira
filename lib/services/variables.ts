/**
 * Serviço de variáveis do usuário
 * Gerencia todas as operações de user-variables com o backend
 */

import { apiService } from '../api/service'
import { config } from '../config'

/**
 * Interfaces baseadas na API do backend
 */
export interface UserVariable {
  id: string
  key: string
  value?: string
  description?: string
  is_encrypted: boolean
  is_active: boolean
  category?: string
  created_at: string
  updated_at: string
}

export interface UserVariableCreate {
  key: string
  value: string
  description?: string
  is_encrypted?: boolean
  is_active?: boolean
  category?: string
}

export interface UserVariableUpdate {
  value?: string
  description?: string
  is_encrypted?: boolean
  is_active?: boolean
  category?: string
}

export interface UserVariableList {
  variables: UserVariable[]
  total: number
  categories?: string[]
}

export interface UserVariableBulkCreate {
  variables: UserVariableCreate[]
  overwrite?: boolean
}

export interface UserVariableBulkUpdate {
  updates: Array<{
    id: string
    data: UserVariableUpdate
  }>
}

export interface UserVariableStats {
  total: number
  by_category: Record<string, number>
  by_status: Record<string, number>
  encrypted_count: number
  active_count: number
}

export interface UserVariableExport {
  format: 'json' | 'env'
  include_encrypted?: boolean
  categories?: string[]
}

export interface UserVariableImport {
  variables: Record<string, string>
  category?: string
  overwrite?: boolean
}

export interface UserVariableValidation {
  key: string
  is_valid: boolean
  errors?: string[]
}

/**
 * Classe principal do serviço de user variables
 */
export class VariableService {
  /**
   * Obtém todas as variáveis do usuário
   */
  async getVariables(params?: {
    skip?: number
    limit?: number
    search?: string
    is_active?: boolean
    category?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    include_values?: boolean
  }): Promise<UserVariableList> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
      if (params?.category) queryParams.append('category', params.category)
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order)
      if (params?.include_values !== undefined) queryParams.append('include_values', params.include_values.toString())

      const queryString = queryParams.toString()
      const endpoint = queryString ? `/user-variables/?${queryString}` : '/user-variables/'

      return await apiService.get<UserVariableList>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar variáveis')
    }
  }

  /**
   * Obtém uma variável específica por ID
   */
  async getVariableById(id: string): Promise<UserVariable> {
    try {
      return await apiService.get<UserVariable>(`/user-variables/${id}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar variável')
    }
  }

  /**
   * Obtém uma variável por chave
   */
  async getVariableByKey(key: string): Promise<UserVariable> {
    try {
      return await apiService.get<UserVariable>(`/user-variables/key/${key}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar variável por chave')
    }
  }

  /**
   * Cria uma nova variável
   */
  async createVariable(data: UserVariableCreate): Promise<UserVariable> {
    try {
      return await apiService.post<UserVariable>('/user-variables/', data)
    } catch (error) {
      throw this.handleError(error, 'Erro ao criar variável')
    }
  }

  /**
   * Atualiza uma variável existente
   */
  async updateVariable(id: string, data: UserVariableUpdate): Promise<UserVariable> {
    try {
      return await apiService.put<UserVariable>(`/user-variables/${id}`, data)
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar variável')
    }
  }

  /**
   * Deleta uma variável
   */
  async deleteVariable(id: string): Promise<void> {
    try {
      await apiService.delete(`/user-variables/${id}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao deletar variável')
    }
  }

  /**
   * Cria múltiplas variáveis em lote
   */
  async createVariablesBulk(data: UserVariableBulkCreate): Promise<UserVariable[]> {
    try {
      return await apiService.post<UserVariable[]>('/user-variables/bulk', data)
    } catch (error) {
      throw this.handleError(error, 'Erro ao criar variáveis em lote')
    }
  }

  /**
   * Atualiza múltiplas variáveis em lote
   */
  async updateVariablesBulk(data: UserVariableBulkUpdate): Promise<UserVariable[]> {
    try {
      return await apiService.put<UserVariable[]>('/user-variables/bulk', data)
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar variáveis em lote')
    }
  }

  /**
   * Deleta múltiplas variáveis em lote
   */
  async deleteVariablesBulk(ids: string[]): Promise<void> {
    try {
      await apiService.delete('/user-variables/bulk', { 
        body: JSON.stringify({ ids }) 
      })
    } catch (error) {
      throw this.handleError(error, 'Erro ao deletar variáveis em lote')
    }
  }

  /**
   * Importa variáveis via JSON
   */
  async importVariables(data: UserVariableImport): Promise<{ imported: UserVariable[]; errors: string[] }> {
    try {
      return await apiService.post<{ imported: UserVariable[]; errors: string[] }>('/user-variables/import', data)
    } catch (error) {
      throw this.handleError(error, 'Erro ao importar variáveis')
    }
  }

  /**
   * Importa variáveis via arquivo .env
   */
  async importVariablesFromFile(file: File, category?: string, overwrite?: boolean): Promise<{ imported: UserVariable[]; errors: string[] }> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (category) formData.append('category', category)
      if (overwrite !== undefined) formData.append('overwrite', overwrite.toString())

      return await apiService.post<{ imported: UserVariable[]; errors: string[] }>('/user-variables/import/file', formData, {
        headers: {}  // Remove Content-Type para FormData
      })
    } catch (error) {
      throw this.handleError(error, 'Erro ao importar arquivo')
    }
  }

  /**
   * Exporta variáveis do usuário
   */
  async exportVariables(data: UserVariableExport): Promise<Blob> {
    try {
      return await apiService.post<Blob>('/user-variables/export', data, {
        headers: {
          'Accept': 'application/octet-stream'
        }
      })
    } catch (error) {
      throw this.handleError(error, 'Erro ao exportar variáveis')
    }
  }

  /**
   * Obtém estatísticas das variáveis
   */
  async getVariableStats(): Promise<UserVariableStats> {
    try {
      return await apiService.get<UserVariableStats>('/user-variables/stats/summary')
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar estatísticas')
    }
  }

  /**
   * Valida chave de variável
   */
  async validateVariable(key: string): Promise<UserVariableValidation> {
    try {
      return await apiService.post<UserVariableValidation>('/user-variables/validate', { key })
    } catch (error) {
      throw this.handleError(error, 'Erro ao validar variável')
    }
  }

  /**
   * Valida múltiplas chaves de variáveis
   */
  async validateVariablesBulk(keys: string[]): Promise<UserVariableValidation[]> {
    try {
      return await apiService.post<UserVariableValidation[]>('/user-variables/validate/bulk', { keys })
    } catch (error) {
      throw this.handleError(error, 'Erro ao validar variáveis')
    }
  }

  /**
   * Obtém variáveis como dicionário
   */
  async getVariablesAsDict(): Promise<Record<string, string>> {
    try {
      return await apiService.get<Record<string, string>>('/user-variables/env/dict')
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar variáveis como dicionário')
    }
  }

  /**
   * Obtém variáveis como string .env
   */
  async getVariablesAsEnvString(): Promise<string> {
    try {
      const response = await apiService.get<{ content: string }>('/user-variables/env/string')
      return response.content
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar variáveis como string .env')
    }
  }

  /**
   * Tratamento de erros personalizado
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.detail) {
      return new Error(error.response.data.detail)
    }
    
    if (error.message) {
      return new Error(error.message)
    }
    
    return new Error(defaultMessage)
  }
}

// Instância singleton do serviço
export const variableService = new VariableService()

// Backward compatibility with old types
export interface Variable extends UserVariable {
  name: string
  type: 'string' | 'secret' | 'number' | 'boolean' | 'json'
  scope: 'global' | 'workflow' | 'node'
  tags: string[]
  isSystem?: boolean
  isSecret?: boolean
  isActive?: boolean
}

export interface CreateVariableData extends UserVariableCreate {}
export interface UpdateVariableData extends UserVariableUpdate {
  name?: string
  tags?: string[]
}

export interface VariablesResponse {
  variables: Variable[]
  total: number
  page: number
  limit: number
}

