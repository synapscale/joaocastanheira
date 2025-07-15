/**
 * Componente de sincronização automática de variáveis
 * Gerencia a sincronização em background entre localStorage e backend
 */

'use client'

import { useEffect, useCallback, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { useVariables } from '@/context'
import { toast } from 'sonner'

/**
 * Interface para configurações de sincronização
 */
interface SyncConfig {
  enabled: boolean
  interval: number // em milissegundos
  onConflict: 'local' | 'remote' | 'prompt'
  retryAttempts: number
  retryDelay: number
}

/**
 * Configuração padrão de sincronização
 */
const defaultSyncConfig: SyncConfig = {
  enabled: true,
  interval: 5 * 60 * 1000, // 5 minutos
  onConflict: 'prompt',
  retryAttempts: 3,
  retryDelay: 2000, // 2 segundos
}

/**
 * Hook para sincronização automática
 */
export function useAutoSync(config: Partial<SyncConfig> = {}) {
  const { isAuthenticated } = useAuth()
  const { loadVariables, loading, error } = useVariables()
  const [syncConfig] = useState<SyncConfig>({ ...defaultSyncConfig, ...config })
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  /**
   * Executa sincronização com retry automático
   */
  const performSync = useCallback(async () => {
    // Verificar se não está em rota de auth
    const isAuthRoute = typeof window !== 'undefined' && 
      ['/login', '/register', '/forgot-password', '/reset-password'].some(route => 
        window.location.pathname.startsWith(route)
      )
    
    if (!isAuthenticated || loading || isAuthRoute) {
      if (isAuthRoute) {
        console.log('🚫 VariableAutoSync: Pulando sincronização - em rota de autenticação')
      }
      return
    }

    try {
      console.log('🔄 VariableAutoSync: Executando sincronização automática...')
      await loadVariables()
      setRetryCount(0)
      setLastSync(new Date())
      console.log('✅ VariableAutoSync: Variáveis sincronizadas automaticamente')
    } catch (error) {
      console.error('❌ VariableAutoSync: Erro na sincronização automática:', error)
      
      if (retryCount < syncConfig.retryAttempts) {
        setRetryCount(prev => prev + 1)
        
        setTimeout(() => {
          performSync()
        }, syncConfig.retryDelay * Math.pow(2, retryCount)) // Backoff exponencial
      } else {
        toast.error('Falha na sincronização automática após várias tentativas')
        setRetryCount(0)
      }
    }
  }, [isAuthenticated, loading, loadVariables, retryCount, syncConfig])

  /**
   * Configura intervalo de sincronização
   */
  useEffect(() => {
    if (!syncConfig.enabled || !isAuthenticated) return

    const interval = setInterval(performSync, syncConfig.interval)

    return () => clearInterval(interval)
  }, [syncConfig.enabled, syncConfig.interval, isAuthenticated, performSync])

  /**
   * Sincroniza quando o usuário fica online
   */
  useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated && syncConfig.enabled) {
        performSync()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [isAuthenticated, syncConfig.enabled, performSync])

  /**
   * Sincroniza quando a aba fica visível
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && syncConfig.enabled) {
        // Sincroniza se a última sync foi há mais de 1 minuto
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
        if (!lastSync || lastSync < oneMinuteAgo) {
          performSync()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isAuthenticated, syncConfig.enabled, lastSync, performSync])

  return {
    isEnabled: syncConfig.enabled,
    lastSync,
    syncing: loading,
    error,
    retryCount,
    manualSync: performSync,
  }
}

/**
 * Componente de sincronização automática
 */
export function VariableAutoSync(props: Partial<SyncConfig> = {}) {
  const { isAuthenticated, isInitialized } = useAuth()
  const autoSync = useAutoSync(props)

  // CORREÇÃO: Só sincroniza se estiver totalmente inicializado e autenticado
  // E não estiver em rota de autenticação
  useEffect(() => {
    // Verificar se não está em rota de auth
    const isAuthRoute = typeof window !== 'undefined' && 
      ['/login', '/register', '/forgot-password', '/reset-password'].some(route => 
        window.location.pathname.startsWith(route)
      )
    
    // Só sincronizar se estiver totalmente autenticado, inicializado e não em rota de auth
    if (isAuthenticated && isInitialized && !isAuthRoute && props.enabled !== false) {
      console.log('🔄 VariableAutoSync: Executando sincronização inicial - usuário autenticado e não em rota de auth')
      autoSync.manualSync()
    } else {
      console.log('🚫 VariableAutoSync: Pulando sincronização automática', {
        isAuthenticated,
        isInitialized, 
        isAuthRoute,
        enabled: props.enabled !== false
      })
    }
  }, [isAuthenticated, isInitialized, autoSync.manualSync, props.enabled])

  // Este componente não renderiza nada, apenas gerencia a sincronização
  return null
}

/**
 * Componente de indicador de status de sincronização
 */
export function SyncStatusIndicator() {
  const { loading, error } = useVariables()
  const { isAuthenticated } = useAuth()
  const { lastSync, syncing } = useAutoSync()

  if (!isAuthenticated) return null

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {syncing && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>Sincronizando...</span>
        </div>
      )}
      
      {!syncing && lastSync && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>
            Última sync: {lastSync.toLocaleTimeString()}
          </span>
        </div>
      )}
      
      {!syncing && error && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span>Erro na sincronização</span>
        </div>
      )}
      
      {!syncing && !lastSync && !error && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <span>Não sincronizado</span>
        </div>
      )}
    </div>
  )
}

/**
 * Hook para detectar mudanças offline
 */
export function useOfflineChanges() {
  const [hasOfflineChanges, setHasOfflineChanges] = useState(false)
  const { variables } = useVariables()
  const { lastSync } = useAutoSync()

  useEffect(() => {
    // Verifica se há variáveis modificadas após a última sincronização
    const hasChanges = variables.some(variable => {
      if (!lastSync) return true
      return new Date(variable.updatedAt) > lastSync
    })

    setHasOfflineChanges(hasChanges)
  }, [variables, lastSync])

  return hasOfflineChanges
}

/**
 * Componente de notificação de mudanças offline
 */
export function OfflineChangesNotification() {
  const { isAuthenticated } = useAuth()
  const { loadVariables, loading } = useVariables()
  const hasOfflineChanges = useOfflineChanges()
  const [dismissed, setDismissed] = useState(false)

  const handleSync = async () => {
    try {
      await loadVariables()
      setDismissed(true)
      toast.success('Mudanças sincronizadas com sucesso!')
    } catch (error) {
      toast.error('Erro na sincronização')
    }
  }

  if (!isAuthenticated || !hasOfflineChanges || dismissed) {
    return null
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span className="text-yellow-800 dark:text-yellow-200">
            Você tem mudanças não sincronizadas
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={loading}
            className="text-yellow-800 dark:text-yellow-200 underline hover:no-underline disabled:opacity-50"
          >
            {loading ? 'Sincronizando...' : 'Sincronizar agora'}
          </button>
          
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-600 hover:text-yellow-800 dark:hover:text-yellow-400"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default VariableAutoSync

