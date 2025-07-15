/**
 * Validador de API para verificar se todos os endpoints estão funcionando
 * Baseado na especificação OpenAPI oficial do Synapscale
 */

import { config } from '../config'
import { apiService } from './service'
import type { HealthStatus } from './openapi-types'

export interface ApiValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  endpoints: EndpointValidation[]
  overall: {
    responseTime: number
    availability: number
    version?: string
  }
}

export interface EndpointValidation {
  name: string
  path: string
  status: 'success' | 'error' | 'warning'
  message?: string
  responseTime?: number
}

export class ApiValidator {
  constructor() {
    // Use the global singleton instance
  }

  /**
   * Validação completa de todos os endpoints críticos
   */
  async validateAll(): Promise<ApiValidationResult> {
    const startTime = Date.now()
    const endpoints: EndpointValidation[] = []
    const errors: string[] = []
    const warnings: string[] = []

    // Validar endpoints críticos
    const validations = [
      { name: 'Health Check', path: '/health', method: this.validateHealthEndpoint.bind(this) },
      { name: 'Auth Me', path: '/auth/me', method: this.validateAuthEndpoint.bind(this) },
      { name: 'User Variables', path: '/user-variables/', method: this.validateUserVariablesEndpoint.bind(this) },
      { name: 'Workspaces', path: '/workspaces/', method: this.validateWorkspacesEndpoint.bind(this) },
      { name: 'Analytics', path: '/analytics/overview', method: this.validateAnalyticsEndpoint.bind(this) },
      { name: 'Workflows', path: '/workflows/', method: this.validateWorkflowsEndpoint.bind(this) },
      { name: 'Agents', path: '/agents/', method: this.validateAgentsEndpoint.bind(this) },
      { name: 'Marketplace', path: '/marketplace/components', method: this.validateMarketplaceEndpoint.bind(this) }
    ]

    for (const validation of validations) {
      try {
        const result = await validation.method()
        endpoints.push({
          name: validation.name,
          path: validation.path,
          status: result.success ? 'success' : 'error',
          message: result.message,
          responseTime: result.responseTime
        })

        if (!result.success && result.message) {
          errors.push(`${validation.name}: ${result.message}`)
        }
      } catch (error) {
        endpoints.push({
          name: validation.name,
          path: validation.path,
          status: 'error',
          message: error instanceof Error ? error.message : 'Erro desconhecido'
        })
        errors.push(`${validation.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    const totalTime = Date.now() - startTime
    const successfulEndpoints = endpoints.filter(e => e.status === 'success').length
    const availability = (successfulEndpoints / endpoints.length) * 100

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      endpoints,
      overall: {
        responseTime: totalTime,
        availability,
        version: config.environment
      }
    }
  }

  private async validateHealthEndpoint(): Promise<{ success: boolean; message?: string; responseTime?: number }> {
    const startTime = Date.now()
    try {
      const health = await apiService.healthCheck()
      const responseTime = Date.now() - startTime
      
      return {
        success: true,
        message: `Health check passou (${responseTime}ms)`,
        responseTime
      }
    } catch (error) {
      return {
        success: false,
        message: `Health check falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        responseTime: Date.now() - startTime
      }
    }
  }

  private async validateAuthEndpoint(): Promise<{ success: boolean; message?: string; responseTime?: number }> {
    const startTime = Date.now()
    try {
      // Tentativa de acessar endpoint protegido - esperado falhar sem auth
      await apiService.getCurrentUser()
      return {
        success: true,
        message: 'Endpoint de autenticação acessível',
        responseTime: Date.now() - startTime
      }
    } catch (error) {
      // Esperado falhar com 401 - isso é sucesso
      if (error instanceof Error && error.message.includes('401')) {
        return {
          success: true,
          message: 'Endpoint de autenticação protegido corretamente',
          responseTime: Date.now() - startTime
        }
      }
      return {
        success: false,
        message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        responseTime: Date.now() - startTime
      }
    }
  }

  private async validateUserVariablesEndpoint(): Promise<{ success: boolean; message?: string; responseTime?: number }> {
    const startTime = Date.now()
    try {
              await apiService.get('/user-variables/')
      return {
        success: true,
        message: 'Endpoint de variáveis acessível',
        responseTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro no endpoint de variáveis: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        responseTime: Date.now() - startTime
      }
    }
  }

  private async validateWorkspacesEndpoint(): Promise<{ success: boolean; message?: string; responseTime?: number }> {
    const startTime = Date.now()
    try {
      await apiService.getWorkspaces()
      return {
        success: true,
        message: 'Endpoint de workspaces acessível',
        responseTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro no endpoint de workspaces: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        responseTime: Date.now() - startTime
      }
    }
  }

  private async validateAnalyticsEndpoint(): Promise<{ success: boolean; message?: string; responseTime?: number }> {
    const startTime = Date.now()
    try {
      await apiService.getAnalyticsOverview()
      return {
        success: true,
        message: 'Endpoint de analytics acessível',
        responseTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro no endpoint de analytics: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        responseTime: Date.now() - startTime
      }
    }
  }

  private async validateWorkflowsEndpoint(): Promise<{ success: boolean; message?: string; responseTime?: number }> {
    const startTime = Date.now()
    try {
      await apiService.getWorkflows()
      return {
        success: true,
        message: 'Endpoint de workflows acessível',
        responseTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro no endpoint de workflows: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        responseTime: Date.now() - startTime
      }
    }
  }

  private async validateAgentsEndpoint(): Promise<{ success: boolean; message?: string; responseTime?: number }> {
    const startTime = Date.now()
    try {
      await apiService.getAgents()
      return {
        success: true,
        message: 'Endpoint de agents acessível',
        responseTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro no endpoint de agents: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        responseTime: Date.now() - startTime
      }
    }
  }

  private async validateMarketplaceEndpoint(): Promise<{ success: boolean; message?: string; responseTime?: number }> {
    const startTime = Date.now()
    try {
              await apiService.get('/marketplace/components')
      return {
        success: true,
        message: 'Endpoint de marketplace acessível',
        responseTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro no endpoint de marketplace: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        responseTime: Date.now() - startTime
      }
    }
  }

  /**
   * Gera relatório detalhado da validação
   */
  generateReport(result: ApiValidationResult): string {
    let report = '\n🔍 RELATÓRIO DE VALIDAÇÃO DA API SYNAPSCALE\n'
    report += '='.repeat(50) + '\n\n'
    
    // Status geral
    report += `📊 STATUS GERAL: ${result.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}\n`
    report += `⏱️  Tempo total: ${result.overall.responseTime}ms\n`
    report += `📈 Disponibilidade: ${result.overall.availability.toFixed(1)}%\n\n`
    
    // Endpoints
    report += '🔗 ENDPOINTS TESTADOS:\n'
    result.endpoints.forEach(endpoint => {
      const icon = endpoint.status === 'success' ? '✅' : endpoint.status === 'warning' ? '⚠️' : '❌'
      report += `${icon} ${endpoint.name}: ${endpoint.message || endpoint.status}\n`
    })
    
    // Erros
    if (result.errors.length > 0) {
      report += '\n❌ ERROS ENCONTRADOS:\n'
      result.errors.forEach(error => {
        report += `• ${error}\n`
      })
    }
    
    // Warnings
    if (result.warnings.length > 0) {
      report += '\n⚠️ AVISOS:\n'
      result.warnings.forEach(warning => {
        report += `• ${warning}\n`
      })
    }
    
    return report
  }

  /**
   * Valida apenas a conectividade básica
   */
  async validateConnectivityOnly(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      const connectivityResult = await apiService.testConnectivity()
      if (!connectivityResult.success) {
        errors.push(...connectivityResult.errors)
      }
    } catch (error) {
      errors.push(`Erro de conectividade: ${error}`)
    }

    return {
      success: errors.length === 0,
      errors
    }
  }
}

// Instância global do validador
export const apiValidator = new ApiValidator()

// Função utilitária para validação rápida
export async function validateApiQuick(): Promise<boolean> {
  try {
    const result = await apiValidator.validateConnectivityOnly()
    return result.success
  } catch {
    return false
  }
} 