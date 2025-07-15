/**
 * Serviço de variáveis do usuário
 * Gerencia todas as operações de user-variables com o backend
 */

import { 
  apiService,
  UserVariableSchema,
  UserVariableCreateSchema,
  UserVariableUpdateSchema,
  UserVariableListResponseSchema
} from '@/lib/api/service'
import { config } from '../config'

/**
 * Interfaces baseadas na API do backend
 */
export interface UserVariable {
  id: string
  key: string
  value: string
  user_id: string
  is_secret: boolean
  is_encrypted: boolean
  is_active: boolean
  category?: string | null
  description?: string | null
  tenant_id?: string | null
  created_at: string
  updated_at: string
}

export interface UserVariableStats {
  total_variables: number
  active_variables: number
  inactive_variables: number
  sensitive_variables: number
  categories_count: Record<string, number>
  last_updated: string | null
}

export interface UserVariableListResponse {
  items: UserVariable[]
  total: number
  page: number
  pages: number
  size: number
}

export interface UserVariableCreate {
  key: string
  value: string
  is_encrypted?: boolean
  category?: string
  description?: string
}

export interface UserVariableUpdate {
  value?: string
  is_active?: boolean
  category?: string
  description?: string
}

export interface UserVariableFilters {
  is_secret?: boolean
  is_active?: boolean
  category?: string
  search?: string
  page?: number
  size?: number
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
   * Lista todas as variáveis do usuário com filtros e paginação
   */
  async listVariables(filters: UserVariableFilters = {}): Promise<UserVariableListResponse> {
    try {
      // Mapear filtros para parâmetros da API oficial
      const params = {
        category: filters.category,
        search: filters.search,
        is_active: filters.is_active,
        page: filters.page,
        size: filters.size
      }
      
      const response = await apiService.getUserVariables(params)
      
      // Se a API retornar um array diretamente, adaptamos para o formato esperado
      if (Array.isArray(response)) {
        return {
          items: response,
          total: response.length,
          page: filters.page || 1,
          pages: 1,
          size: filters.size || response.length
        }
      }
      
      return response || { items: [], total: 0, page: 1, pages: 0, size: 20 }
    } catch (error) {
      console.error('Erro ao listar variáveis:', error)
      throw error
    }
  }

  /**
   * Obtém uma variável específica por ID
   */
  async getVariable(id: string): Promise<UserVariable> {
    try {
      return await apiService.getUserVariable(id)
    } catch (error) {
      console.error('Erro ao obter variável:', error)
      throw error
    }
  }

  /**
   * Cria uma nova variável
   */
  async createVariable(data: UserVariableCreate): Promise<UserVariable> {
    try {
      return await apiService.createUserVariable(data)
    } catch (error) {
      console.error('Erro ao criar variável:', error)
      throw error
    }
  }

  /**
   * Atualiza uma variável existente
   */
  async updateVariable(id: string, data: UserVariableUpdate): Promise<UserVariable> {
    try {
      return await apiService.updateUserVariable(id, data)
    } catch (error) {
      console.error('Erro ao atualizar variável:', error)
      throw error
    }
  }

  /**
   * Remove uma variável
   */
  async deleteVariable(id: string): Promise<void> {
    try {
      await apiService.deleteUserVariable(id)
    } catch (error) {
      console.error('Erro ao deletar variável:', error)
      throw error
    }
  }

  /**
   * Obtém estatísticas das variáveis do usuário
   */
  async getVariableStats(): Promise<UserVariableStats> {
    try {
      return await apiService.getUserVariableStats()
    } catch (error) {
      console.error('Erro ao obter estatísticas das variáveis:', error)
      throw error
    }
  }

  /**
   * Obtém variável por chave
   */
  async getVariableByKey(key: string): Promise<UserVariable> {
    try {
      return await apiService.getUserVariableByKey(key)
    } catch (error) {
      console.error('Erro ao obter variável por chave:', error)
      throw error
    }
  }

  /**
   * Operação em lote para criação de múltiplas variáveis (via sequencial)
   */
  async bulkCreate(variables: UserVariableCreate[]): Promise<{ created: number; errors: any[] }> {
    const results = { created: 0, errors: [] as any[] };
    
    for (const variable of variables) {
      try {
        await this.createVariable(variable);
        results.created++;
      } catch (error) {
        results.errors.push({ variable, error });
      }
    }
    
    return results;
  }

  /**
   * Operação em lote para atualização de múltiplas variáveis (via sequencial)
   */
  async bulkUpdate(variables: Array<{
    id?: string
    key: string
    value: string
    description?: string
    category?: string
    is_secret?: boolean
    is_active?: boolean
  }>): Promise<{ updated: number; errors: any[] }> {
    const results = { updated: 0, errors: [] as any[] };
    
    for (const variable of variables) {
      try {
        if (variable.id) {
          await this.updateVariable(variable.id, variable);
          results.updated++;
        }
      } catch (error) {
        results.errors.push({ variable, error });
      }
    }
    
    return results;
  }

  /**
   * Operação em lote para deleção de múltiplas variáveis (via sequencial)
   */
  async bulkDelete(variableIds: string[]): Promise<{ deleted: number; errors: any[] }> {
    const results = { deleted: 0, errors: [] as any[] };
    
    for (const id of variableIds) {
      try {
        await this.deleteVariable(id);
        results.deleted++;
      } catch (error) {
        results.errors.push({ id, error });
      }
    }
    
    return results;
  }

  /**
   * Importa variáveis (implementação client-side)
   */
  async importVariables(importData: {
    variables: UserVariableCreate[]
    overwrite_existing?: boolean
    merge_strategy?: string
  }): Promise<{ imported: number; skipped: number; errors: any[] }> {
    try {
      const results = { imported: 0, skipped: 0, errors: [] as any[] };
      
      for (const variable of importData.variables) {
        try {
          // Check if variable already exists
          const existingVariables = await this.listVariables({ search: variable.key });
          const exists = Array.isArray(existingVariables) 
            ? existingVariables.some(v => v.key === variable.key)
            : existingVariables.items.some(v => v.key === variable.key);
          
          if (exists && !importData.overwrite_existing) {
            results.skipped++;
            continue;
          }
          
          await this.createVariable(variable);
          results.imported++;
        } catch (error) {
          results.errors.push({ variable, error });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Erro ao importar variáveis:', error)
      throw error
    }
  }

  /**
   * Exporta variáveis (implementação client-side)
   */
  async exportVariables(exportOptions: {
    format?: string
    include_secrets?: boolean
    categories?: string[]
  }): Promise<{ data: any; format: string }> {
    try {
      const variables = await this.listVariables({ size: 1000 });
      const variableList = Array.isArray(variables) ? variables : variables.items;
      
      let filteredVariables = variableList;
      
      // Filter by categories if specified
      if (exportOptions.categories && exportOptions.categories.length > 0) {
        filteredVariables = variableList.filter(v => 
          v.category && exportOptions.categories!.includes(v.category)
        );
      }
      
      // Filter out secrets if not requested
      if (!exportOptions.include_secrets) {
        filteredVariables = filteredVariables.filter(v => !v.is_secret);
      }
      
      const format = exportOptions.format || 'json';
      let data: any;
      
      if (format === 'env') {
        data = filteredVariables
          .map(v => `${v.key}=${v.value}`)
          .join('\n');
      } else {
        data = filteredVariables;
      }
      
      return { data, format };
    } catch (error) {
      console.error('Erro ao exportar variáveis:', error)
      throw error
    }
  }

  /**
   * Valida chave de variável (implementação client-side)
   */
  async validateKey(key: string): Promise<{ is_valid: boolean; message?: string; suggestions?: string[] }> {
    try {
      // Validate according to the pattern from OpenAPI spec: ^[A-Z][A-Z0-9_]*$
      const isValid = /^[A-Z][A-Z0-9_]*$/.test(key);
      let message = '';
      const suggestions: string[] = [];
      
      if (!isValid) {
        if (key.length === 0) {
          message = 'A chave não pode estar vazia';
        } else if (!/^[A-Z]/.test(key)) {
          message = 'A chave deve começar com uma letra maiúscula';
          suggestions.push(key.charAt(0).toUpperCase() + key.slice(1));
        } else if (!/^[A-Z0-9_]*$/.test(key)) {
          message = 'A chave pode conter apenas letras maiúsculas, números e underscores';
          suggestions.push(key.toUpperCase().replace(/[^A-Z0-9_]/g, '_'));
        }
      }
      
      return { is_valid: isValid, message, suggestions };
    } catch (error) {
      console.error('Erro ao validar chave:', error)
      throw error
    }
  }

  /**
   * Busca variáveis por categoria
   */
  async getVariablesByCategory(category: string): Promise<UserVariable[]> {
    try {
      const response = await this.listVariables({ category, size: 100 })
      return response.items
    } catch (error) {
      console.error('Erro ao buscar variáveis por categoria:', error)
      throw error
    }
  }

  /**
   * Lista todas as categorias disponíveis
   */
  async getCategories(): Promise<string[]> {
    try {
      const stats = await this.getVariableStats()
      return Object.keys(stats.categories_count)
    } catch (error) {
      console.error('Erro ao obter categorias:', error)
      return []
    }
  }

  /**
   * Busca variáveis por palavra-chave
   */
  async searchVariables(search: string): Promise<UserVariable[]> {
    try {
      const response = await this.listVariables({ search, size: 100 })
      return response.items
    } catch (error) {
      console.error('Erro ao buscar variáveis:', error)
      throw error
    }
  }

  /**
   * Obtém variáveis ativas apenas
   */
  async getActiveVariables(): Promise<UserVariable[]> {
    try {
      const response = await this.listVariables({ is_active: true, size: 100 })
      return response.items
    } catch (error) {
      console.error('Erro ao obter variáveis ativas:', error)
      throw error
    }
  }

  /**
   * Obtém variáveis secretas apenas
   */
  async getSecretVariables(): Promise<UserVariable[]> {
    try {
      const response = await this.listVariables({ is_secret: true, size: 100 })
      return response.items
    } catch (error) {
      console.error('Erro ao obter variáveis secretas:', error)
      throw error
    }
  }

  /**
   * Obtém variáveis como dicionário
   */
  async getVariablesAsDict(): Promise<Record<string, string>> {
    try {
      return await apiService.getUserVariablesAsDict()
    } catch (error) {
      console.error('Erro ao obter variáveis como dicionário:', error)
      throw error
    }
  }

  /**
   * Obtém variáveis como string .env
   */
  async getVariablesAsEnvString(): Promise<string> {
    try {
      return await apiService.getUserVariablesAsEnvString()
    } catch (error) {
      console.error('Erro ao obter variáveis como string .env:', error)
      throw error
    }
  }
}

// Instância singleton do serviço
export const variableService = new VariableService()

// Interfaces para compatibilidade com código legado
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


