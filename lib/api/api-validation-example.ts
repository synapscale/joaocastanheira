/**
 * Exemplo de uso do validador de API
 * Demonstra como verificar se a integração com a API Synapscale está funcionando corretamente
 */

import { apiValidator, validateApiQuick } from './validator'

/**
 * Executa validação completa da API e exibe relatório
 */
export async function runFullApiValidation(): Promise<void> {
  console.log('🚀 Iniciando validação completa da API Synapscale...\n')

  try {
    // Executar validação completa
    const result = await apiValidator.validateAll()
    
    // Gerar e exibir relatório
    const report = apiValidator.generateReport(result)
    console.log(report)
    
    // Resultados adicionais
    if (result.isValid) {
      console.log('🎉 Configuração da API está perfeita!')
    } else {
      console.log('⚠️  Foram encontrados problemas que precisam ser corrigidos.')
      
      // Sugestões de correção
      if (result.errors.some(e => e.includes('conectividade'))) {
        console.log('\n💡 Sugestões:')
        console.log('• Verifique se a URL da API está correta no arquivo .env')
        console.log('• Confirme se o servidor da API está rodando')
        console.log('• Teste a conectividade de rede')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante a validação:', error)
  }
}

/**
 * Executa apenas teste de conectividade rápido
 */
export async function runQuickConnectivityTest(): Promise<boolean> {
  console.log('⚡ Testando conectividade básica...')
  
  try {
    const isConnected = await validateApiQuick()
    
    if (isConnected) {
      console.log('✅ Conectividade OK')
      return true
    } else {
      console.log('❌ Falha na conectividade')
      return false
    }
  } catch (error) {
    console.error('❌ Erro no teste de conectividade:', error)
    return false
  }
}

/**
 * Executa validação de endpoints específicos
 */
export async function validateSpecificEndpoints(endpoints: string[]): Promise<void> {
  console.log(`🔍 Validando endpoints específicos: ${endpoints.join(', ')}`)
  
  try {
    const result = await apiValidator.validateAll()
    
    // Filtrar apenas os endpoints solicitados
    const filteredEndpoints = result.endpoints.filter(endpoint => 
      endpoints.some(requested => endpoint.path.includes(requested))
    )
    
    console.log('\n📊 Resultados:')
    filteredEndpoints.forEach(endpoint => {
      const icon = endpoint.status === 'success' ? '✅' : '❌'
      console.log(`${icon} ${endpoint.name}: ${endpoint.message}`)
    })
    
  } catch (error) {
    console.error('❌ Erro na validação:', error)
  }
}

/**
 * Monitora a saúde da API em intervalos regulares
 */
export function startApiHealthMonitoring(intervalMs: number = 60000): () => void {
  console.log(`🔄 Iniciando monitoramento da API (intervalo: ${intervalMs}ms)`)
  
  const interval = setInterval(async () => {
    try {
      const isHealthy = await validateApiQuick()
      const timestamp = new Date().toISOString()
      
      if (isHealthy) {
        console.log(`✅ [${timestamp}] API saudável`)
      } else {
        console.log(`❌ [${timestamp}] API com problemas`)
      }
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Erro no monitoramento:`, error)
    }
  }, intervalMs)
  
  // Retorna função para parar o monitoramento
  return () => {
    clearInterval(interval)
    console.log('🛑 Monitoramento da API interrompido')
  }
}

/**
 * Exemplo de uso em desenvolvimento
 */
export async function developmentApiCheck(): Promise<void> {
  console.log('🧪 Executando verificação de desenvolvimento...\n')
  
  // 1. Teste rápido de conectividade
  const isConnected = await runQuickConnectivityTest()
  
  if (!isConnected) {
    console.log('❌ Conectividade falhou. Abortando testes adicionais.')
    return
  }
  
  console.log('')
  
  // 2. Validação completa
  await runFullApiValidation()
  
  console.log('')
  
  // 3. Teste de endpoints críticos
  await validateSpecificEndpoints(['auth', 'health', 'workspaces'])
}

/**
 * Exemplo de uso em produção
 */
export async function productionApiCheck(): Promise<boolean> {
  console.log('🏭 Executando verificação de produção...')
  
  try {
    const result = await apiValidator.validateAll()
    
    // Em produção, ser mais rigoroso
    const criticalEndpointsOk = result.endpoints
      .filter(e => ['Health Check', 'Auth Me', 'Workspaces'].includes(e.name))
      .every(e => e.status === 'success')
    
    const overallHealthy = result.overall.availability >= 90 // 90% de disponibilidade mínima
    
    const isProductionReady = criticalEndpointsOk && overallHealthy
    
    if (isProductionReady) {
      console.log('✅ API pronta para produção')
    } else {
      console.log('❌ API NÃO está pronta para produção')
      console.log(`• Disponibilidade: ${result.overall.availability.toFixed(1)}% (mínimo: 90%)`)
      console.log(`• Endpoints críticos: ${criticalEndpointsOk ? 'OK' : 'FALHA'}`)
    }
    
    return isProductionReady
    
  } catch (error) {
    console.error('❌ Erro na verificação de produção:', error)
    return false
  }
}

// Exportar funções para uso direto
export {
  apiValidator,
  validateApiQuick
} 