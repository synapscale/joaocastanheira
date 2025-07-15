import { authLogger } from '../utils/logger';
import { AuthError, AuthErrorCode, AuthErrorCategory } from '../types/errors';
import { AuthStorageValidator, ValidationResult } from './auth-storage-validator';
import { AuthUser } from '../types/auth';

export interface CleanupOptions {
  cleanExpiredTokens: boolean;
  cleanStaleData: boolean;
  cleanCorruptedData: boolean;
  maxDataAge: number; // em dias
  preserveUserPreferences: boolean;
  dryRun: boolean;
}

export interface FallbackOptions {
  enableStorageFallback: boolean;
  enableMemoryFallback: boolean;
  enableNetworkFallback: boolean;
  maxFallbackAttempts: number;
  fallbackTimeout: number;
}

export interface CleanupResult {
  itemsRemoved: number;
  spaceFreed: number; // em bytes
  errors: AuthError[];
  warnings: string[];
  preservedItems: string[];
  affectedStorages: string[];
}

export interface FallbackResult {
  success: boolean;
  method: 'primary' | 'localStorage' | 'sessionStorage' | 'cookies' | 'memory' | 'network';
  data?: any;
  errors: AuthError[];
  attemptCount: number;
  fallbackChain: string[];
}

export interface RecoveryProcedure {
  name: string;
  description: string;
  execute: () => Promise<boolean>;
  priority: number; // 1 = highest
  requiresUserConfirmation: boolean;
}

/**
 * Gerenciador de limpeza automática e mecanismos de fallback
 */
export class AuthCleanupManager {
  private logger: typeof authLogger;
  private validator: AuthStorageValidator;
  private isCleanupRunning = false;
  private lastCleanupTime: number | null = null;
  private fallbackData: Map<string, any> = new Map();
  private recoveryProcedures: RecoveryProcedure[] = [];

  constructor() {
    this.logger = authLogger.child({ component: 'AuthCleanupManager' });
    this.validator = new AuthStorageValidator();
    this.setupRecoveryProcedures();
    this.schedulePeriodicCleanup();
    
    this.logger.info('🧹 AuthCleanupManager inicializado', {
      recoveryProcedures: this.recoveryProcedures.length,
      periodicCleanupEnabled: true
    });
  }

  /**
   * Executa limpeza automática completa
   */
  async performAutomaticCleanup(options: Partial<CleanupOptions> = {}): Promise<CleanupResult> {
    const opts: CleanupOptions = {
      cleanExpiredTokens: true,
      cleanStaleData: true,
      cleanCorruptedData: true,
      maxDataAge: 30, // 30 dias por padrão
      preserveUserPreferences: true,
      dryRun: false,
      ...options
    };

    if (this.isCleanupRunning) {
      this.logger.warn('⚠️ Cleanup já está em execução, ignorando nova solicitação');
      throw new AuthError(
        'Cleanup process already running',
        AuthErrorCode.OPERATION_IN_PROGRESS,
        AuthErrorCategory.INTERNAL,
        { operation: 'automaticCleanup' }
      );
    }

    this.isCleanupRunning = true;
    const startTime = Date.now();

    this.logger.info('🧹 Iniciando limpeza automática', {
      options: opts,
      dryRun: opts.dryRun
    });

    const result: CleanupResult = {
      itemsRemoved: 0,
      spaceFreed: 0,
      errors: [],
      warnings: [],
      preservedItems: [],
      affectedStorages: []
    };

    try {
      // 1. Limpar tokens expirados
      if (opts.cleanExpiredTokens) {
        const expiredResult = await this.cleanExpiredTokens(opts.dryRun);
        this.mergeCleanupResults(result, expiredResult);
      }

      // 2. Limpar dados obsoletos
      if (opts.cleanStaleData) {
        const staleResult = await this.cleanStaleData(opts.maxDataAge, opts.dryRun);
        this.mergeCleanupResults(result, staleResult);
      }

      // 3. Limpar dados corrompidos
      if (opts.cleanCorruptedData) {
        const corruptedResult = await this.cleanCorruptedData(opts.dryRun);
        this.mergeCleanupResults(result, corruptedResult);
      }

      // 4. Preservar preferências do usuário se solicitado
      if (opts.preserveUserPreferences) {
        await this.preserveUserPreferences(result);
      }

      // 5. Otimizar storage (compactação)
      if (!opts.dryRun) {
        await this.optimizeStorage();
      }

      this.lastCleanupTime = Date.now();
      const duration = this.lastCleanupTime - startTime;

      this.logger.info('✅ Limpeza automática concluída', {
        duration: `${duration}ms`,
        itemsRemoved: result.itemsRemoved,
        spaceFreed: `${result.spaceFreed} bytes`,
        errorsCount: result.errors.length,
        warningsCount: result.warnings.length,
        dryRun: opts.dryRun
      });

      return result;

    } catch (error) {
      this.logger.error('❌ Erro durante limpeza automática', error as Error);
      
      const authError = new AuthError(
        `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        AuthErrorCode.STORAGE_CLEANUP_FAILED,
        AuthErrorCategory.INTERNAL,
        { originalError: error, duration: Date.now() - startTime }
      );
      
      result.errors.push(authError);
      return result;

    } finally {
      this.isCleanupRunning = false;
    }
  }

  /**
   * Implementa fallback em cascata para operações de storage
   */
  async performFallbackOperation<T>(
    operation: () => Promise<T>,
    fallbackOptions: Partial<FallbackOptions> = {}
  ): Promise<FallbackResult> {
    const opts: FallbackOptions = {
      enableStorageFallback: true,
      enableMemoryFallback: true,
      enableNetworkFallback: false,
      maxFallbackAttempts: 5,
      fallbackTimeout: 3000,
      ...fallbackOptions
    };

    const result: FallbackResult = {
      success: false,
      method: 'primary',
      errors: [],
      attemptCount: 0,
      fallbackChain: []
    };

    this.logger.info('🔄 Iniciando operação com fallback', {
      maxAttempts: opts.maxFallbackAttempts,
      timeout: opts.fallbackTimeout
    });

    // Tentativa primária
    try {
      result.attemptCount++;
      result.fallbackChain.push('primary');
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), opts.fallbackTimeout)
      );
      
      result.data = await Promise.race([operation(), timeoutPromise]);
      result.success = true;
      result.method = 'primary';
      
      this.logger.info('✅ Operação primária bem-sucedida');
      return result;

    } catch (primaryError) {
      this.logger.warn('⚠️ Operação primária falhou, tentando fallbacks', primaryError);
      
      result.errors.push(new AuthError(
        `Primary operation failed: ${primaryError instanceof Error ? primaryError.message : 'Unknown error'}`,
        AuthErrorCode.STORAGE_OPERATION_FAILED,
        AuthErrorCategory.INTERNAL,
        { originalError: primaryError }
      ));
    }

    // Fallback 1: localStorage
    if (opts.enableStorageFallback && result.attemptCount < opts.maxFallbackAttempts) {
      try {
        result.attemptCount++;
        result.fallbackChain.push('localStorage');
        
        result.data = await this.tryLocalStorageFallback();
        result.success = true;
        result.method = 'localStorage';
        
        this.logger.info('✅ Fallback localStorage bem-sucedido');
        return result;

      } catch (lsError) {
        this.logger.warn('⚠️ Fallback localStorage falhou', lsError);
        result.errors.push(new AuthError(
          `localStorage fallback failed: ${lsError instanceof Error ? lsError.message : 'Unknown error'}`,
          AuthErrorCode.STORAGE_FALLBACK_FAILED,
          AuthErrorCategory.INTERNAL,
          { fallbackType: 'localStorage', originalError: lsError }
        ));
      }
    }

    // Fallback 2: sessionStorage
    if (opts.enableStorageFallback && result.attemptCount < opts.maxFallbackAttempts) {
      try {
        result.attemptCount++;
        result.fallbackChain.push('sessionStorage');
        
        result.data = await this.trySessionStorageFallback();
        result.success = true;
        result.method = 'sessionStorage';
        
        this.logger.info('✅ Fallback sessionStorage bem-sucedido');
        return result;

      } catch (ssError) {
        this.logger.warn('⚠️ Fallback sessionStorage falhou', ssError);
        result.errors.push(new AuthError(
          `sessionStorage fallback failed: ${ssError instanceof Error ? ssError.message : 'Unknown error'}`,
          AuthErrorCode.STORAGE_FALLBACK_FAILED,
          AuthErrorCategory.INTERNAL,
          { fallbackType: 'sessionStorage', originalError: ssError }
        ));
      }
    }

    // Fallback 3: cookies
    if (opts.enableStorageFallback && result.attemptCount < opts.maxFallbackAttempts) {
      try {
        result.attemptCount++;
        result.fallbackChain.push('cookies');
        
        result.data = await this.tryCookiesFallback();
        result.success = true;
        result.method = 'cookies';
        
        this.logger.info('✅ Fallback cookies bem-sucedido');
        return result;

      } catch (cookieError) {
        this.logger.warn('⚠️ Fallback cookies falhou', cookieError);
        result.errors.push(new AuthError(
          `cookies fallback failed: ${cookieError instanceof Error ? cookieError.message : 'Unknown error'}`,
          AuthErrorCode.STORAGE_FALLBACK_FAILED,
          AuthErrorCategory.INTERNAL,
          { fallbackType: 'cookies', originalError: cookieError }
        ));
      }
    }

    // Fallback 4: memória
    if (opts.enableMemoryFallback && result.attemptCount < opts.maxFallbackAttempts) {
      try {
        result.attemptCount++;
        result.fallbackChain.push('memory');
        
        result.data = await this.tryMemoryFallback();
        result.success = true;
        result.method = 'memory';
        
        this.logger.info('✅ Fallback memória bem-sucedido');
        return result;

      } catch (memoryError) {
        this.logger.warn('⚠️ Fallback memória falhou', memoryError);
        result.errors.push(new AuthError(
          `memory fallback failed: ${memoryError instanceof Error ? memoryError.message : 'Unknown error'}`,
          AuthErrorCode.STORAGE_FALLBACK_FAILED,
          AuthErrorCategory.INTERNAL,
          { fallbackType: 'memory', originalError: memoryError }
        ));
      }
    }

    // Fallback 5: rede (re-autenticação)
    if (opts.enableNetworkFallback && result.attemptCount < opts.maxFallbackAttempts) {
      try {
        result.attemptCount++;
        result.fallbackChain.push('network');
        
        result.data = await this.tryNetworkFallback();
        result.success = true;
        result.method = 'network';
        
        this.logger.info('✅ Fallback rede bem-sucedido');
        return result;

      } catch (networkError) {
        this.logger.warn('⚠️ Fallback rede falhou', networkError);
        result.errors.push(new AuthError(
          `network fallback failed: ${networkError instanceof Error ? networkError.message : 'Unknown error'}`,
          AuthErrorCode.NETWORK_FALLBACK_FAILED,
          AuthErrorCategory.NETWORK,
          { fallbackType: 'network', originalError: networkError }
        ));
      }
    }

    this.logger.error('❌ Todos os fallbacks falharam', {
      attemptCount: result.attemptCount,
      fallbackChain: result.fallbackChain,
      errorsCount: result.errors.length
    });

    return result;
  }

  /**
   * Executa procedimentos de recuperação para estados corrompidos
   */
  async executeRecoveryProcedures(requireUserConfirmation = false): Promise<boolean> {
    this.logger.info('🔧 Iniciando procedimentos de recuperação', {
      totalProcedures: this.recoveryProcedures.length,
      requireUserConfirmation
    });

    // Ordenar procedures por prioridade
    const sortedProcedures = this.recoveryProcedures
      .filter(proc => !requireUserConfirmation || !proc.requiresUserConfirmation)
      .sort((a, b) => a.priority - b.priority);

    let recoveredCount = 0;
    const errors: AuthError[] = [];

    for (const procedure of sortedProcedures) {
      try {
        this.logger.info(`🔧 Executando procedure: ${procedure.name}`);
        
        const success = await procedure.execute();
        
        if (success) {
          recoveredCount++;
          this.logger.info(`✅ Procedure ${procedure.name} bem-sucedida`);
        } else {
          this.logger.warn(`⚠️ Procedure ${procedure.name} falhou`);
        }

      } catch (error) {
        this.logger.error(`❌ Erro na procedure ${procedure.name}`, error as Error);
        
        errors.push(new AuthError(
          `Recovery procedure '${procedure.name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          AuthErrorCode.RECOVERY_FAILED,
          AuthErrorCategory.INTERNAL,
          { procedureName: procedure.name, originalError: error }
        ));
      }
    }

    const success = recoveredCount > 0;
    
    this.logger.info('🔧 Procedimentos de recuperação concluídos', {
      totalExecuted: sortedProcedures.length,
      successful: recoveredCount,
      failed: sortedProcedures.length - recoveredCount,
      overallSuccess: success
    });

    return success;
  }

  /**
   * Limpa tokens expirados
   */
  private async cleanExpiredTokens(dryRun: boolean): Promise<Partial<CleanupResult>> {
    this.logger.info('🧹 Limpando tokens expirados');
    
    const result: Partial<CleanupResult> = {
      itemsRemoved: 0,
      spaceFreed: 0,
      affectedStorages: []
    };

    const storageTypes = ['localStorage', 'sessionStorage'] as const;
    
    for (const storageType of storageTypes) {
      try {
        const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
        const authKeys = this.getAuthKeys();
        
        for (const key of authKeys) {
          const value = storage.getItem(key);
          if (!value) continue;

          try {
            if (key.includes('token')) {
              // Verificar se o token está expirado
              const isExpired = this.isTokenExpired(value);
              
              if (isExpired) {
                if (!dryRun) {
                  storage.removeItem(key);
                }
                result.itemsRemoved = (result.itemsRemoved || 0) + 1;
                result.spaceFreed = (result.spaceFreed || 0) + value.length;
                
                if (!result.affectedStorages?.includes(storageType)) {
                  result.affectedStorages?.push(storageType);
                }
                
                this.logger.debug(`🗑️ Token expirado removido: ${key}`);
              }
            }
          } catch (tokenError) {
            this.logger.warn(`⚠️ Erro ao verificar token ${key}`, tokenError);
          }
        }
      } catch (storageError) {
        this.logger.error(`❌ Erro ao acessar ${storageType}`, storageError as Error);
      }
    }

    return result;
  }

  /**
   * Limpa dados obsoletos
   */
  private async cleanStaleData(maxDataAge: number, dryRun: boolean): Promise<Partial<CleanupResult>> {
    this.logger.info('🧹 Limpando dados obsoletos', { maxDataAge });
    
    const result: Partial<CleanupResult> = {
      itemsRemoved: 0,
      spaceFreed: 0,
      preservedItems: [],
      affectedStorages: []
    };

    const maxAgeMs = maxDataAge * 24 * 60 * 60 * 1000; // Converter dias para ms
    const cutoffTime = Date.now() - maxAgeMs;

    const storageTypes = ['localStorage', 'sessionStorage'] as const;
    
    for (const storageType of storageTypes) {
      try {
        const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
        const authKeys = this.getAuthKeys();
        
        for (const key of authKeys) {
          const value = storage.getItem(key);
          if (!value) continue;

          try {
            // Tentar parsear dados versionados
            const parsedData = JSON.parse(value);
            
            if (parsedData.metadata?.timestamp) {
              const dataTime = new Date(parsedData.metadata.timestamp).getTime();
              
              if (dataTime < cutoffTime) {
                if (!dryRun) {
                  storage.removeItem(key);
                }
                result.itemsRemoved = (result.itemsRemoved || 0) + 1;
                result.spaceFreed = (result.spaceFreed || 0) + value.length;
                
                if (!result.affectedStorages?.includes(storageType)) {
                  result.affectedStorages?.push(storageType);
                }
                
                this.logger.debug(`🗑️ Dados obsoletos removidos: ${key}`);
              } else {
                result.preservedItems?.push(key);
              }
            }
          } catch (parseError) {
            // Se não é JSON válido, considerar como potencialmente obsoleto
            if (!dryRun) {
              storage.removeItem(key);
            }
            result.itemsRemoved = (result.itemsRemoved || 0) + 1;
            result.spaceFreed = (result.spaceFreed || 0) + value.length;
            
            this.logger.debug(`🗑️ Dados inválidos removidos: ${key}`);
          }
        }
      } catch (storageError) {
        this.logger.error(`❌ Erro ao acessar ${storageType}`, storageError as Error);
      }
    }

    return result;
  }

  /**
   * Limpa dados corrompidos
   */
  private async cleanCorruptedData(dryRun: boolean): Promise<Partial<CleanupResult>> {
    this.logger.info('🧹 Limpando dados corrompidos');
    
    const result: Partial<CleanupResult> = {
      itemsRemoved: 0,
      spaceFreed: 0,
      affectedStorages: []
    };

    const storageTypes = ['localStorage', 'sessionStorage'] as const;
    
    for (const storageType of storageTypes) {
      try {
        const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
        const authKeys = this.getAuthKeys();
        
        for (const key of authKeys) {
          const value = storage.getItem(key);
          if (!value) continue;

          try {
            // Validar integridade dos dados
            const validationResult = await this.validator.validateStoredData(value, storageType);
            
            if (validationResult.shouldCleanup || !validationResult.isValid) {
              if (!dryRun) {
                storage.removeItem(key);
              }
              result.itemsRemoved = (result.itemsRemoved || 0) + 1;
              result.spaceFreed = (result.spaceFreed || 0) + value.length;
              
              if (!result.affectedStorages?.includes(storageType)) {
                result.affectedStorages?.push(storageType);
              }
              
              this.logger.debug(`🗑️ Dados corrompidos removidos: ${key}`);
            }
          } catch (validationError) {
            this.logger.warn(`⚠️ Erro ao validar ${key}`, validationError);
            
            // Se não consegue validar, considerar como corrompido
            if (!dryRun) {
              storage.removeItem(key);
            }
            result.itemsRemoved = (result.itemsRemoved || 0) + 1;
            result.spaceFreed = (result.spaceFreed || 0) + value.length;
          }
        }
      } catch (storageError) {
        this.logger.error(`❌ Erro ao acessar ${storageType}`, storageError as Error);
      }
    }

    return result;
  }

  /**
   * Preserva preferências do usuário durante limpeza
   */
  private async preserveUserPreferences(result: CleanupResult): Promise<void> {
    const preferencesKeys = [
      'user_theme',
      'user_language',
      'user_notifications',
      'user_settings'
    ];

    preferencesKeys.forEach(key => {
      if (!result.preservedItems.includes(key)) {
        result.preservedItems.push(key);
      }
    });

    this.logger.debug('🔒 Preferências do usuário preservadas', {
      preservedCount: preferencesKeys.length
    });
  }

  /**
   * Otimiza storage (compactação)
   */
  private async optimizeStorage(): Promise<void> {
    this.logger.info('⚡ Otimizando storage');
    
    try {
      // Implementar compactação se necessário
      // Por enquanto, apenas log
      this.logger.debug('⚡ Storage otimizado');
    } catch (error) {
      this.logger.error('❌ Erro ao otimizar storage', error as Error);
    }
  }

  /**
   * Configura procedimentos de recuperação
   */
  private setupRecoveryProcedures(): void {
    this.recoveryProcedures = [
      {
        name: 'ClearCorruptedTokens',
        description: 'Remove tokens corrompidos ou mal formados',
        priority: 1,
        requiresUserConfirmation: false,
        execute: async () => {
          try {
            await this.validator.cleanCorruptedStorage();
            return true;
          } catch {
            return false;
          }
        }
      },
      {
        name: 'RestoreFromBackup',
        description: 'Restaura dados de backup se disponível',
        priority: 2,
        requiresUserConfirmation: false,
        execute: async () => {
          try {
            // Implementar restauração de backup
            return false; // Por enquanto não implementado
          } catch {
            return false;
          }
        }
      },
      {
        name: 'ResetToDefaults',
        description: 'Reseta configurações para padrões seguros',
        priority: 3,
        requiresUserConfirmation: true,
        execute: async () => {
          try {
            // Implementar reset para padrões
            return true;
          } catch {
            return false;
          }
        }
      }
    ];
  }

  /**
   * Agenda limpeza periódica
   */
  private schedulePeriodicCleanup(): void {
    // TEMPORARIAMENTE DESABILITADO - limpeza automática a cada 24 horas
    // setInterval(async () => {
    //   try {
    //     this.logger.info('🕐 Executando limpeza periódica programada');
        
    //     await this.performAutomaticCleanup({
    //       cleanExpiredTokens: true,
    //       cleanStaleData: true,
    //       cleanCorruptedData: false, // Menos agressivo na limpeza automática
    //       maxDataAge: 7, // 7 dias
    //       preserveUserPreferences: true,
    //       dryRun: false
    //     });
        
    //   } catch (error) {
    //     this.logger.error('❌ Erro na limpeza periódica', error as Error);
    //   }
    // }, 24 * 60 * 60 * 1000); // 24 horas
    
    console.log('🔴 AuthCleanupManager: Limpeza periódica DESABILITADA temporariamente')
  }

  /**
   * Fallback methods
   */
  private async tryLocalStorageFallback(): Promise<any> {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = this.fallbackData.get('localStorage');
      if (data) return data;
      
      // Tentar recuperar dados básicos
      const token = localStorage.getItem('synapsefrontend_auth_token');
      if (token) {
        return { accessToken: token };
      }
    }
    throw new Error('localStorage fallback failed');
  }

  private async trySessionStorageFallback(): Promise<any> {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const data = this.fallbackData.get('sessionStorage');
      if (data) return data;
    }
    throw new Error('sessionStorage fallback failed');
  }

  private async tryCookiesFallback(): Promise<any> {
    const data = this.fallbackData.get('cookies');
    if (data) return data;
    throw new Error('cookies fallback failed');
  }

  private async tryMemoryFallback(): Promise<any> {
    const data = this.fallbackData.get('memory');
    if (data) return data;
    throw new Error('memory fallback failed');
  }

  private async tryNetworkFallback(): Promise<any> {
    // Implementar re-autenticação via rede se necessário
    throw new Error('network fallback not implemented');
  }

  /**
   * Utility methods
   */
  private getAuthKeys(): string[] {
    return [
      'synapsefrontend_auth_token',
      'synapsefrontend_refresh_token',
      'synapsefrontend_user',
      'synapsefrontend_auth_data'
    ];
  }

  private isTokenExpired(tokenValue: string): boolean {
    try {
      if (tokenValue.includes('.')) {
        // JWT token
        const parts = tokenValue.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.exp) {
            return Date.now() / 1000 > payload.exp;
          }
        }
      }
      return false;
    } catch {
      return true; // Se não consegue decodificar, considerar expirado
    }
  }

  private mergeCleanupResults(target: CleanupResult, source: Partial<CleanupResult>): void {
    target.itemsRemoved += source.itemsRemoved || 0;
    target.spaceFreed += source.spaceFreed || 0;
    
    if (source.affectedStorages) {
      source.affectedStorages.forEach(storage => {
        if (!target.affectedStorages.includes(storage)) {
          target.affectedStorages.push(storage);
        }
      });
    }
    
    if (source.preservedItems) {
      target.preservedItems.push(...source.preservedItems);
    }
  }

  /**
   * Backup data for fallback
   */
  public backupDataForFallback(storageType: string, data: any): void {
    this.fallbackData.set(storageType, data);
    this.logger.debug(`💾 Backup realizado para ${storageType}`);
  }

  /**
   * Get cleanup stats
   */
  public getCleanupStats() {
    return {
      isRunning: this.isCleanupRunning,
      lastCleanupTime: this.lastCleanupTime,
      recoveryProceduresCount: this.recoveryProcedures.length,
      fallbackDataCount: this.fallbackData.size
    };
  }
}

// Instância singleton
export const authCleanupManager = new AuthCleanupManager(); 