/**
 * Utilitários para teste de conectividade com o backend
 * Verifica se a comunicação entre frontend e backend está funcionando
 */

import { apiService } from '../api'
import { config } from '../config'
import type { HealthResponse } from '../types/api'

export interface ConnectivityTestResult {
  success: boolean
  message: string
  details?: any
  timestamp: string
  duration: number
}

export interface ConnectivityReport {
  overall: 'success' | 'partial' | 'failure'
  tests: {
    healthCheck: ConnectivityTestResult
    corsCheck: ConnectivityTestResult
    apiConnection: ConnectivityTestResult
    endpointsCheck: ConnectivityTestResult
  }
  summary: {
    total: number
    passed: number
    failed: number
  }
}

/**
 * Testa conectividade básica com o backend
 */
export async function testBasicConnectivity(): Promise<ConnectivityTestResult> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(config.apiBaseUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    })

    const duration = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'Conectividade básica estabelecida com sucesso',
        details: {
          status: response.status,
          statusText: response.statusText,
          data,
        },
        timestamp: new Date().toISOString(),
        duration,
      }
    } else {
      return {
        success: false,
        message: `Erro na conectividade: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
        },
        timestamp: new Date().toISOString(),
        duration,
      }
    }
  } catch (error) {
    const duration = Date.now() - startTime
    return {
      success: false,
      message: `Falha na conectividade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: { error: error instanceof Error ? error.message : error },
      timestamp: new Date().toISOString(),
      duration,
    }
  }
}

/**
 * Testa o endpoint de health check
 */
export async function testHealthCheck(): Promise<ConnectivityTestResult> {
  const startTime = Date.now()
  
  try {
    const health = await apiService.get<HealthResponse>('/health')
    const duration = Date.now() - startTime

    return {
      success: health.status === 'healthy',
      message: health.status === 'healthy' 
        ? 'Health check passou com sucesso' 
        : `Health check falhou: ${health.status}`,
      details: health,
      timestamp: new Date().toISOString(),
      duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    return {
      success: false,
      message: `Health check falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: { error: error instanceof Error ? error.message : error },
      timestamp: new Date().toISOString(),
      duration,
    }
  }
}

/**
 * Testa configuração CORS
 */
export async function testCorsConfiguration(): Promise<ConnectivityTestResult> {
  const startTime = Date.now()
  
  try {
    // Faz uma requisição OPTIONS para testar CORS
    const response = await fetch(`${config.apiBaseUrl}/health`, {
      method: 'OPTIONS',
      mode: 'cors',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    })

    const duration = Date.now() - startTime

    if (response.ok) {
      const corsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
        'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
      }

      return {
        success: true,
        message: 'CORS configurado corretamente',
        details: {
          status: response.status,
          corsHeaders,
        },
        timestamp: new Date().toISOString(),
        duration,
      }
    } else {
      return {
        success: false,
        message: `CORS não configurado corretamente: ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
        },
        timestamp: new Date().toISOString(),
        duration,
      }
    }
  } catch (error) {
    const duration = Date.now() - startTime
    return {
      success: false,
      message: `Erro ao testar CORS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: { error: error instanceof Error ? error.message : error },
      timestamp: new Date().toISOString(),
      duration,
    }
  }
}

/**
 * Testa endpoints principais da API
 */
export async function testApiEndpoints(): Promise<ConnectivityTestResult> {
  const startTime = Date.now()
  const endpoints = [
    '/health',
    '/api/v1',
    '/docs',
  ]

  const results: Array<{ endpoint: string; success: boolean; status?: number; error?: string }> = []

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      })

      results.push({
        endpoint,
        success: response.ok,
        status: response.status,
      })
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }
  }

  const duration = Date.now() - startTime
  const successCount = results.filter(r => r.success).length
  const totalCount = results.length

  return {
    success: successCount === totalCount,
    message: `${successCount}/${totalCount} endpoints responderam corretamente`,
    details: { results, successRate: (successCount / totalCount) * 100 },
    timestamp: new Date().toISOString(),
    duration,
  }
}

/**
 * Executa todos os testes de conectividade
 */
export async function runConnectivityTests(): Promise<ConnectivityReport> {
  console.log('🔍 Iniciando testes de conectividade...')

  const tests = {
    healthCheck: await testHealthCheck(),
    corsCheck: await testCorsConfiguration(),
    apiConnection: await testBasicConnectivity(),
    endpointsCheck: await testApiEndpoints(),
  }

  const passed = Object.values(tests).filter(test => test.success).length
  const total = Object.keys(tests).length
  const failed = total - passed

  let overall: 'success' | 'partial' | 'failure'
  if (passed === total) {
    overall = 'success'
  } else if (passed > 0) {
    overall = 'partial'
  } else {
    overall = 'failure'
  }

  const report: ConnectivityReport = {
    overall,
    tests,
    summary: {
      total,
      passed,
      failed,
    },
  }

  // Log dos resultados
  console.log('📊 Relatório de Conectividade:')
  console.log(`   Status Geral: ${overall.toUpperCase()}`)
  console.log(`   Testes Passaram: ${passed}/${total}`)
  
  Object.entries(tests).forEach(([testName, result]) => {
    const icon = result.success ? '✅' : '❌'
    console.log(`   ${icon} ${testName}: ${result.message}`)
    if (!result.success && result.details) {
      console.log(`      Detalhes:`, result.details)
    }
  })

  return report
}

/**
 * Monitora conectividade continuamente
 */
export function startConnectivityMonitoring(intervalMs = 30000): () => void {
  console.log('🔄 Iniciando monitoramento de conectividade...')
  
  const interval = setInterval(async () => {
    try {
      const isHealthy = await apiService.healthCheck()
      if (!isHealthy) {
        console.warn('⚠️ Backend não está respondendo ao health check')
      }
    } catch (error) {
      console.error('❌ Erro no monitoramento de conectividade:', error)
    }
  }, intervalMs)

  // Retorna função para parar o monitoramento
  return () => {
    clearInterval(interval)
    console.log('⏹️ Monitoramento de conectividade parado')
  }
}

/**
 * Valida configuração do ambiente
 */
export function validateEnvironmentConfig(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Validar URLs obrigatórias
  if (!config.apiBaseUrl) {
    errors.push('NEXT_PUBLIC_API_BASE_URL não está configurada')
  } else {
    try {
      new URL(config.apiBaseUrl)
    } catch {
      errors.push('NEXT_PUBLIC_API_BASE_URL não é uma URL válida')
    }
  }

  if (!config.wsUrl) {
    errors.push('NEXT_PUBLIC_WS_URL não está configurada')
  }

  // Validar ambiente
  if (!config.environment) {
    warnings.push('NEXT_PUBLIC_APP_ENV não está configurada, usando "development"')
  }

  // Verificar se está em desenvolvimento
  if (config.isDevelopment) {
    warnings.push('Aplicação está em modo de desenvolvimento')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export default {
  testBasicConnectivity,
  testHealthCheck,
  testCorsConfiguration,
  testApiEndpoints,
  runConnectivityTests,
  startConnectivityMonitoring,
  validateEnvironmentConfig,
}

