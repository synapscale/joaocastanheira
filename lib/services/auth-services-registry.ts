import { AuthStorageValidator } from './auth-storage-validator'
import { AuthStorageSynchronizer } from './auth-storage-sync'
import { AuthTabSynchronizer } from './auth-tab-sync'
import { AuthHydrationService } from './auth-hydration'
import { authLogger } from '../utils/logger'

interface AuthServicesRegistry {
  storageValidator: AuthStorageValidator | null
  storageSynchronizer: AuthStorageSynchronizer | null
  tabSynchronizer: AuthTabSynchronizer | null
  hydrationService: AuthHydrationService | null
}

// Registry global para evitar múltiplas instâncias durante HMR
let globalAuthServices: AuthServicesRegistry = {
  storageValidator: null,
  storageSynchronizer: null,
  tabSynchronizer: null,
  hydrationService: null
}

/**
 * Obtém ou cria instância singleton do AuthStorageValidator
 */
export function getAuthStorageValidator(config?: any): AuthStorageValidator {
  if (!globalAuthServices.storageValidator) {
    console.log('🔧 AuthServicesRegistry: Criando nova instância de AuthStorageValidator')
    globalAuthServices.storageValidator = new AuthStorageValidator(config)
  } else {
    console.log('✅ AuthServicesRegistry: Reutilizando instância existente de AuthStorageValidator')
  }
  return globalAuthServices.storageValidator
}

/**
 * Obtém ou cria instância singleton do AuthStorageSynchronizer
 */
export function getAuthStorageSynchronizer(config?: any): AuthStorageSynchronizer {
  if (!globalAuthServices.storageSynchronizer) {
    console.log('🔧 AuthServicesRegistry: Criando nova instância de AuthStorageSynchronizer')
    globalAuthServices.storageSynchronizer = new AuthStorageSynchronizer(config)
  } else {
    console.log('✅ AuthServicesRegistry: Reutilizando instância existente de AuthStorageSynchronizer')
  }
  return globalAuthServices.storageSynchronizer
}

/**
 * Obtém ou cria instância singleton do AuthTabSynchronizer
 */
export function getAuthTabSynchronizer(config?: any): AuthTabSynchronizer {
  if (!globalAuthServices.tabSynchronizer) {
    console.log('🔧 AuthServicesRegistry: Criando nova instância de AuthTabSynchronizer')
    globalAuthServices.tabSynchronizer = new AuthTabSynchronizer(config)
  } else {
    console.log('✅ AuthServicesRegistry: Reutilizando instância existente de AuthTabSynchronizer')
  }
  return globalAuthServices.tabSynchronizer
}

/**
 * Obtém ou cria instância singleton do AuthHydrationService
 */
export function getAuthHydrationService(): AuthHydrationService {
  if (!globalAuthServices.hydrationService) {
    console.log('🔧 AuthServicesRegistry: Criando nova instância de AuthHydrationService')
    globalAuthServices.hydrationService = new AuthHydrationService()
  } else {
    console.log('✅ AuthServicesRegistry: Reutilizando instância existente de AuthHydrationService')
  }
  return globalAuthServices.hydrationService
}

/**
 * Limpa todas as instâncias dos serviços
 */
export function clearAuthServices(): void {
  console.log('🧹 AuthServicesRegistry: Limpando todas as instâncias dos serviços')
  
  try {
    // Cleanup do TabSynchronizer
    if (globalAuthServices.tabSynchronizer) {
      console.log('🧹 Destruindo AuthTabSynchronizer...')
      globalAuthServices.tabSynchronizer.destroy()
      globalAuthServices.tabSynchronizer = null
    }
    
    // Cleanup dos outros serviços
    if (globalAuthServices.storageSynchronizer) {
      console.log('🧹 Limpando AuthStorageSynchronizer...')
      globalAuthServices.storageSynchronizer = null
    }
    
    if (globalAuthServices.storageValidator) {
      console.log('🧹 Limpando AuthStorageValidator...')
      globalAuthServices.storageValidator = null
    }
    
    if (globalAuthServices.hydrationService) {
      console.log('🧹 Limpando AuthHydrationService...')
      globalAuthServices.hydrationService = null
    }
    
    console.log('✅ AuthServicesRegistry: Todas as instâncias foram limpas')
  } catch (error) {
    console.error('❌ AuthServicesRegistry: Erro durante limpeza dos serviços:', error)
  }
}

/**
 * Obtém informações sobre as instâncias ativas
 */
export function getAuthServicesStatus() {
  return {
    storageValidator: !!globalAuthServices.storageValidator,
    storageSynchronizer: !!globalAuthServices.storageSynchronizer,
    tabSynchronizer: !!globalAuthServices.tabSynchronizer,
    hydrationService: !!globalAuthServices.hydrationService
  }
}

// Limpeza automática quando a página é recarregada
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    clearAuthServices()
  })
} 