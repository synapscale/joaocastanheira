import crypto from 'crypto';
import { authLogger } from '../utils/logger';
import { AuthError, AuthErrorCode, AuthErrorCategory } from '../types/errors';

/**
 * Interface para dados de autenticação versionados
 */
export interface VersionedAuthData {
  version: string
  data: {
    accessToken?: string
    refreshToken?: string
    user?: AuthUser
    timestamp: number
    expiresAt: number
  }
  checksum: string
  metadata: {
    createdAt: number
    lastValidated: number
    rotationCount: number
    deviceId: string
  }
}

/**
 * Interface para resultado de validação
 */
export interface ValidationResult {
  isValid: boolean
  errors: AuthError[]
  warnings: string[]
  shouldCleanup: boolean
  needsRefresh: boolean
  needsRotation: boolean
  correctedData?: VersionedAuthData
}

/**
 * Interface para configuração do validador
 */
export interface StorageValidatorConfig {
  currentVersion: string
  supportedVersions: string[]
  maxDataAge: number // em millisegundos
  maxRotationCount: number
  enableAutoCleanup: boolean
  enableAutoCorrection: boolean
  checksumAlgorithm: 'simple' | 'crc32' | 'sha256'
  strictMode: boolean
}

/**
 * Interface para migração de dados
 */
interface DataMigration {
  fromVersion: string
  toVersion: string
  migrate: (oldData: any) => VersionedAuthData
}

/**
 * Interface para validação de armazenamento
 */
export interface StorageIntegrityResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  dataCorrupted: boolean
  requiresMigration: boolean
  autoRepaired: boolean
  validationDetails: {
    checksum: boolean
    schema: boolean
    tokenExpiration: boolean
    dataStructure: boolean
    ageValidation: boolean
  }
}

/**
 * Interface para configuração de validação
 */
export interface ValidationConfig {
  enableChecksumValidation: boolean
  enableSchemaValidation: boolean
  enableExpirationValidation: boolean
  enableStructureValidation: boolean
  maxDataAge: number // em dias
  autoRepair: boolean
  strictMode: boolean
}

/**
 * Interface para armazenamento de esquema
 */
export interface StorageSchema {
  version: string
  schemaHash: string
  migrationRequired: boolean
}

/**
 * Classe para validação de integridade de armazenamento
 */
export class AuthStorageValidator {
  private logger: typeof authLogger
  private config: ValidationConfig
  private currentSchemaVersion = '1.1.0'
  private migrations: Map<string, DataMigration> = new Map()
  private deviceId: string

  constructor(config: Partial<ValidationConfig> = {}) {
    this.logger = authLogger
    this.config = {
      enableChecksumValidation: true,
      enableSchemaValidation: true,
      enableExpirationValidation: true,
      enableStructureValidation: true,
      maxDataAge: 7, // 7 dias
      autoRepair: true,
      strictMode: false,
      ...config
    }

    this.deviceId = this.generateDeviceId()
    this.setupMigrations()

    this.logger.info('AuthStorageValidator inicializado', {
      version: this.currentSchemaVersion,
      deviceId: this.deviceId,
      config: this.config
    })
  }

  /**
   * Valida dados de autenticação armazenados
   */
  async validateStoredData(rawData: string | null, storageType: 'localStorage' | 'sessionStorage' | 'cookies'): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      shouldCleanup: false,
      needsRefresh: false,
      needsRotation: false
    }

    this.logger.debug('Validando dados armazenados', { storageType, hasData: !!rawData })

    try {
      // Verificar se há dados
      if (!rawData) {
        result.warnings.push('Nenhum dado encontrado no storage')
        return result
      }

      // Tentar parsear dados
      let parsedData: any
      try {
        parsedData = JSON.parse(rawData)
      } catch (error) {
        result.errors.push(new AuthError({
          category: AuthErrorCategory.VALIDATION,
          code: AuthErrorCode.INVALID_TOKEN_FORMAT,
          message: 'Dados corrompidos - JSON inválido',
          userMessage: 'Dados de autenticação corrompidos',
          recoverable: true,
          retryable: false,
          timestamp: new Date()
        }))
        result.shouldCleanup = true
        return result
      }

      // Verificar se é dados versionados
      if (!this.isVersionedData(parsedData)) {
        this.logger.info('Dados não versionados detectados, tentando migração')
        const migrated = await this.migrateFromLegacy(parsedData)
        if (migrated) {
          result.correctedData = migrated
          result.warnings.push('Dados migrados de versão legacy')
        } else {
          result.errors.push(new AuthError({
            category: AuthErrorCategory.VALIDATION,
            code: AuthErrorCode.INVALID_TOKEN_FORMAT,
            message: 'Dados em formato não reconhecido',
            userMessage: 'Formato de dados inválido',
            recoverable: false,
            retryable: false,
            timestamp: new Date()
          }))
          result.shouldCleanup = true
          return result
        }
      } else {
        result.correctedData = parsedData as VersionedAuthData
      }

      // Validar versão
      const versionValidation = this.validateVersion(result.correctedData!)
      if (!versionValidation.isValid) {
        result.errors.push(...versionValidation.errors)
        if (versionValidation.shouldCleanup) {
          result.shouldCleanup = true
          return result
        }
      }

      // Validar checksum
      const checksumValidation = await this.validateChecksum(result.correctedData!)
      if (!checksumValidation.isValid) {
        result.errors.push(...checksumValidation.errors)
        result.shouldCleanup = true
        return result
      }

      // Validar idade dos dados
      const ageValidation = this.validateDataAge(result.correctedData!)
      if (!ageValidation.isValid) {
        result.errors.push(...ageValidation.errors)
        result.warnings.push(...ageValidation.warnings)
        if (ageValidation.shouldCleanup) {
          result.shouldCleanup = true
          return result
        }
      }

      // Validar tokens
      const tokenValidation = await this.validateTokens(result.correctedData!)
      if (!tokenValidation.isValid) {
        result.errors.push(...tokenValidation.errors)
        result.warnings.push(...tokenValidation.warnings)
        result.needsRefresh = tokenValidation.needsRefresh
        result.needsRotation = tokenValidation.needsRotation
      }

      // Validar rotação
      const rotationValidation = this.validateRotation(result.correctedData!)
      if (!rotationValidation.isValid) {
        result.warnings.push(...rotationValidation.warnings)
        result.needsRotation = rotationValidation.needsRotation
      }

      // Se chegou até aqui e não há erros críticos, é válido
      result.isValid = result.errors.length === 0

      this.logger.debug('Validação concluída', {
        isValid: result.isValid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
        needsRefresh: result.needsRefresh,
        needsRotation: result.needsRotation
      })

      return result

    } catch (error) {
      this.logger.error('Erro crítico na validação', error)
      result.errors.push(new AuthError({
        category: AuthErrorCategory.INTERNAL,
        code: AuthErrorCode.INTERNAL_UNEXPECTED_ERROR,
        message: error instanceof Error ? error.message : 'Erro desconhecido na validação',
        userMessage: 'Erro interno na validação de dados',
        recoverable: true,
        retryable: true,
        timestamp: new Date()
      }))
      result.shouldCleanup = true
      return result
    }
  }

  /**
   * Cria dados versionados seguros
   */
  async createVersionedData(
    accessToken: string,
    refreshToken: string,
    user: AuthUser,
    expiresIn: number = 3600
  ): Promise<VersionedAuthData> {
    const now = Date.now()
    
    const data: VersionedAuthData = {
      version: this.currentSchemaVersion,
      data: {
        accessToken,
        refreshToken,
        user,
        timestamp: now,
        expiresAt: now + (expiresIn * 1000)
      },
      checksum: '', // Será calculado
      metadata: {
        createdAt: now,
        lastValidated: now,
        rotationCount: 0,
        deviceId: this.deviceId
      }
    }

    // Calcular checksum
    data.checksum = await this.calculateChecksum(data)

    this.logger.debug('Dados versionados criados', {
      version: data.version,
      expiresAt: new Date(data.data.expiresAt),
      deviceId: data.metadata.deviceId
    })

    return data
  }

  /**
   * Atualiza timestamp de validação
   */
  async updateValidationTimestamp(data: VersionedAuthData): Promise<VersionedAuthData> {
    const updatedData = {
      ...data,
      metadata: {
        ...data.metadata,
        lastValidated: Date.now()
      }
    }

    // Recalcular checksum
    updatedData.checksum = await this.calculateChecksum(updatedData)

    return updatedData
  }

  /**
   * Incrementa contador de rotação
   */
  async incrementRotationCount(data: VersionedAuthData): Promise<VersionedAuthData> {
    const updatedData = {
      ...data,
      metadata: {
        ...data.metadata,
        rotationCount: data.metadata.rotationCount + 1,
        lastValidated: Date.now()
      }
    }

    // Recalcular checksum
    updatedData.checksum = await this.calculateChecksum(updatedData)

    return updatedData
  }

  /**
   * Verifica se dados são versionados
   */
  private isVersionedData(data: any): data is VersionedAuthData {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.version === 'string' &&
      typeof data.data === 'object' &&
      typeof data.checksum === 'string' &&
      typeof data.metadata === 'object'
    )
  }

  /**
   * Valida versão dos dados
   */
  private validateVersion(data: VersionedAuthData): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      shouldCleanup: false,
      needsRefresh: false,
      needsRotation: false
    }

    if (!this.config.supportedVersions.includes(data.version)) {
      if (this.config.strictMode) {
        result.errors.push(new AuthError({
          category: AuthErrorCategory.VALIDATION,
          code: AuthErrorCode.INVALID_TOKEN_FORMAT,
          message: `Versão não suportada: ${data.version}`,
          userMessage: 'Versão de dados não suportada',
          recoverable: false,
          retryable: false,
          timestamp: new Date()
        }))
        result.shouldCleanup = true
      } else {
        result.warnings.push(`Versão antiga detectada: ${data.version}`)
        result.isValid = true
      }
    } else {
      result.isValid = true
    }

    return result
  }

  /**
   * Valida checksum dos dados
   */
  private async validateChecksum(data: VersionedAuthData): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      shouldCleanup: false,
      needsRefresh: false,
      needsRotation: false
    }

    try {
      const expectedChecksum = await this.calculateChecksum(data, data.checksum)
      
      if (expectedChecksum !== data.checksum) {
        result.errors.push(new AuthError({
          category: AuthErrorCategory.VALIDATION,
          code: AuthErrorCode.INVALID_TOKEN_FORMAT,
          message: 'Checksum inválido - dados podem estar corrompidos',
          userMessage: 'Dados corrompidos detectados',
          recoverable: false,
          retryable: false,
          timestamp: new Date()
        }))
        result.shouldCleanup = true
      } else {
        result.isValid = true
      }

    } catch (error) {
      result.errors.push(new AuthError({
        category: AuthErrorCategory.VALIDATION,
        code: AuthErrorCode.INTERNAL_UNEXPECTED_ERROR,
        message: 'Erro ao validar checksum',
        userMessage: 'Erro na validação de integridade',
        recoverable: true,
        retryable: true,
        timestamp: new Date()
      }))
    }

    return result
  }

  /**
   * Valida idade dos dados
   */
  private validateDataAge(data: VersionedAuthData): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      shouldCleanup: false,
      needsRefresh: false,
      needsRotation: false
    }

    const now = Date.now()
    const age = now - data.metadata.createdAt

    if (age > this.config.maxDataAge) {
      result.errors.push(new AuthError({
        category: AuthErrorCategory.VALIDATION,
        code: AuthErrorCode.TOKEN_EXPIRED,
        message: `Dados muito antigos: ${Math.floor(age / (24 * 60 * 60 * 1000))} dias`,
        userMessage: 'Dados de autenticação expirados',
        recoverable: true,
        retryable: false,
        timestamp: new Date()
      }))
      result.shouldCleanup = true
      result.isValid = false
    } else if (age > this.config.maxDataAge * 0.8) {
      result.warnings.push('Dados próximos da expiração por idade')
    }

    return result
  }

  /**
   * Valida tokens específicos
   */
  private async validateTokens(data: VersionedAuthData): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      shouldCleanup: false,
      needsRefresh: false,
      needsRotation: false
    }

    const now = Date.now()

    // Verificar expiração
    if (data.data.expiresAt && now >= data.data.expiresAt) {
      result.warnings.push('Token expirado')
      result.needsRefresh = true
    } else if (data.data.expiresAt && (data.data.expiresAt - now) < 5 * 60 * 1000) {
      result.warnings.push('Token próximo da expiração')
      result.needsRefresh = true
    }

    // Verificar formato dos tokens
    if (data.data.accessToken && !this.isValidTokenFormat(data.data.accessToken)) {
      result.errors.push(new AuthError({
        category: AuthErrorCategory.VALIDATION,
        code: AuthErrorCode.INVALID_TOKEN_FORMAT,
        message: 'Formato de access token inválido',
        userMessage: 'Token de acesso inválido',
        recoverable: true,
        retryable: false,
        timestamp: new Date()
      }))
      result.isValid = false
    }

    if (data.data.refreshToken && !this.isValidTokenFormat(data.data.refreshToken)) {
      result.errors.push(new AuthError({
        category: AuthErrorCategory.VALIDATION,
        code: AuthErrorCode.INVALID_TOKEN_FORMAT,
        message: 'Formato de refresh token inválido',
        userMessage: 'Token de refresh inválido',
        recoverable: true,
        retryable: false,
        timestamp: new Date()
      }))
      result.isValid = false
    }

    return result
  }

  /**
   * Valida rotação de tokens
   */
  private validateRotation(data: VersionedAuthData): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      shouldCleanup: false,
      needsRefresh: false,
      needsRotation: false
    }

    if (data.metadata.rotationCount >= this.config.maxRotationCount) {
      result.warnings.push(`Muitas rotações: ${data.metadata.rotationCount}`)
      result.needsRotation = true
    } else if (data.metadata.rotationCount >= this.config.maxRotationCount * 0.8) {
      result.warnings.push('Próximo do limite de rotações')
    }

    return result
  }

  /**
   * Verifica formato válido de token (JWT)
   */
  private isValidTokenFormat(token: string): boolean {
    // Verificação básica de formato JWT
    const parts = token.split('.')
    return parts.length === 3 && parts.every(part => part.length > 0)
  }

  /**
   * Calcula checksum dos dados
   */
  private async calculateChecksum(data: VersionedAuthData, excludeChecksum?: string): Promise<string> {
    // Criar cópia sem checksum para cálculo
    const dataForChecksum = {
      ...data,
      checksum: undefined
    }

    const content = JSON.stringify(dataForChecksum)

    switch (this.config.checksumAlgorithm) {
      case 'simple':
        return this.simpleChecksum(content)
      case 'crc32':
        return this.crc32Checksum(content)
      case 'sha256':
        return await this.sha256Checksum(content)
      default:
        return this.simpleChecksum(content)
    }
  }

  /**
   * Checksum simples
   */
  private simpleChecksum(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Checksum CRC32 (implementação simplificada)
   */
  private crc32Checksum(content: string): string {
    // Implementação simplificada do CRC32
    let crc = 0xFFFFFFFF
    for (let i = 0; i < content.length; i++) {
      crc = crc ^ content.charCodeAt(i)
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (0xEDB88320 & (-(crc & 1)))
      }
    }
    return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16)
  }

  /**
   * Checksum SHA256
   */
  private async sha256Checksum(content: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } else {
      // Fallback para ambientes sem crypto API
      return this.simpleChecksum(content)
    }
  }

  /**
   * Migra dados legacy para formato versionado
   */
  private async migrateFromLegacy(legacyData: any): Promise<VersionedAuthData | null> {
    try {
      // Tentar diferentes formatos legacy conhecidos
      
      // Formato 1: dados simples
      if (legacyData.accessToken && legacyData.user) {
        return await this.createVersionedData(
          legacyData.accessToken,
          legacyData.refreshToken || '',
          legacyData.user,
          3600 // 1 hora padrão
        )
      }

      // Formato 2: dados com tokens separados
      if (typeof legacyData === 'string' && legacyData.includes('.')) {
        // Pode ser um token JWT direto
        const user = { id: 'unknown', email: 'unknown@example.com', name: 'Unknown' }
        return await this.createVersionedData(legacyData, '', user, 3600)
      }

      return null

    } catch (error) {
      this.logger.error('Erro na migração de dados legacy', error)
      return null
    }
  }

  /**
   * Configura migrações de dados
   */
  private setupMigrations(): void {
    // Migração 1.0.0 -> 1.1.0
    this.migrations.set('1.0.0->1.1.0', {
      fromVersion: '1.0.0',
      toVersion: '1.1.0',
      migrate: (oldData: any) => {
        // Adicionar campo rotationCount
        return {
          ...oldData,
          version: '1.1.0',
          metadata: {
            ...oldData.metadata,
            rotationCount: 0
          }
        }
      }
    })

    // Migração 1.1.0 -> 2.0.0
    this.migrations.set('1.1.0->2.0.0', {
      fromVersion: '1.1.0',
      toVersion: '2.0.0',
      migrate: (oldData: any) => {
        // Reestruturar dados para nova versão
        return {
          version: '2.0.0',
          data: {
            accessToken: oldData.accessToken,
            refreshToken: oldData.refreshToken,
            user: oldData.user,
            timestamp: oldData.timestamp || Date.now(),
            expiresAt: oldData.expiresAt || (Date.now() + 3600000)
          },
          checksum: oldData.checksum || '',
          metadata: {
            createdAt: oldData.createdAt || Date.now(),
            lastValidated: Date.now(),
            rotationCount: oldData.metadata?.rotationCount || 0,
            deviceId: this.deviceId
          }
        }
      }
    })
  }

  /**
   * Gera ID único do dispositivo
   */
  private generateDeviceId(): string {
    // Tentar obter ID persistente do dispositivo
    try {
      let deviceId = localStorage.getItem('synapsefrontend_device_id')
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('synapsefrontend_device_id', deviceId)
      }
      return deviceId
    } catch (error) {
      // Fallback se localStorage não estiver disponível
      return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  /**
   * Limpa dados corrompidos do storage
   */
  async cleanupCorruptedData(storageType: 'localStorage' | 'sessionStorage' | 'cookies'): Promise<void> {
    if (!this.config.enableAutoCleanup) {
      return
    }

    try {
      this.logger.info('Limpando dados corrompidos', { storageType })

      switch (storageType) {
        case 'localStorage':
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('synapsefrontend_auth_token')
            localStorage.removeItem('synapsefrontend_refresh_token')
            localStorage.removeItem('synapsefrontend_user')
            localStorage.removeItem('synapsefrontend_timestamp')
          }
          break

        case 'sessionStorage':
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('synapsefrontend_auth_token')
            sessionStorage.removeItem('synapsefrontend_refresh_token')
            sessionStorage.removeItem('synapsefrontend_user')
          }
          break

        case 'cookies':
          if (typeof document !== 'undefined') {
            document.cookie = 'synapsefrontend_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
            document.cookie = 'synapsefrontend_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          }
          break
      }

      this.logger.info('Dados corrompidos limpos com sucesso', { storageType })

    } catch (error) {
      this.logger.error('Erro ao limpar dados corrompidos', error)
    }
  }

  /**
   * Obtém estatísticas do validador
   */
  public getStats() {
    return {
      currentVersion: this.currentSchemaVersion,
      supportedVersions: this.config.supportedVersions,
      deviceId: this.deviceId,
      migrationsAvailable: this.migrations.size,
      config: this.config
    }
  }

  /**
   * Valida complete storage integrity
   */
  async validateStorage(storageData: any): Promise<StorageIntegrityResult> {
    this.logger.logAuthEvent('storage_validation_start', {
      dataSize: JSON.stringify(storageData).length,
      configEnabled: this.config
    });

    const result: StorageIntegrityResult = {
      isValid: true,
      errors: [],
      warnings: [],
      dataCorrupted: false,
      requiresMigration: false,
      autoRepaired: false,
      validationDetails: {
        checksum: false,
        schema: false,
        tokenExpiration: false,
        dataStructure: false,
        ageValidation: false
      }
    };

    try {
      // 1. Structure validation
      if (this.config.enableStructureValidation) {
        const structureValid = await this.validateDataStructure(storageData);
        result.validationDetails.dataStructure = structureValid.isValid;
        if (!structureValid.isValid) {
          result.errors.push(...structureValid.errors);
          result.dataCorrupted = true;
        }
      }

      // 2. Schema validation
      if (this.config.enableSchemaValidation) {
        const schemaValid = await this.validateSchema(storageData);
        result.validationDetails.schema = schemaValid.isValid;
        if (!schemaValid.isValid) {
          result.errors.push(...schemaValid.errors);
          result.requiresMigration = schemaValid.requiresMigration;
        }
      }

      // 3. Checksum validation
      if (this.config.enableChecksumValidation) {
        const checksumValid = await this.validateChecksum(storageData);
        result.validationDetails.checksum = checksumValid.isValid;
        if (!checksumValid.isValid) {
          result.errors.push(...checksumValid.errors);
          result.dataCorrupted = true;
        }
      }

      // 4. Token expiration validation
      if (this.config.enableExpirationValidation) {
        const expirationValid = await this.validateTokenExpiration(storageData);
        result.validationDetails.tokenExpiration = expirationValid.isValid;
        if (!expirationValid.isValid) {
          result.warnings.push(...expirationValid.warnings);
        }
      }

      // 5. Age validation
      const ageValid = await this.validateDataAge(storageData);
      result.validationDetails.ageValidation = ageValid.isValid;
      if (!ageValid.isValid) {
        result.warnings.push(...ageValid.warnings);
      }

      // 6. Auto-repair if enabled
      if (this.config.autoRepair && (result.errors.length > 0 || result.warnings.length > 0)) {
        const repairResult = await this.attemptAutoRepair(storageData, result);
        result.autoRepaired = repairResult.repaired;
        if (repairResult.repaired) {
          result.warnings.push('Data auto-repaired successfully');
        }
      }

      // Final validation status
      result.isValid = result.errors.length === 0 && !result.dataCorrupted;

      this.logger.logAuthEvent('storage_validation_complete', {
        isValid: result.isValid,
        errorsCount: result.errors.length,
        warningsCount: result.warnings.length,
        autoRepaired: result.autoRepaired
      });

      return result;

    } catch (error) {
      this.logger.logError('Storage validation failed', error as Error, {
        operation: 'validateStorage'
      });

      result.isValid = false;
      result.dataCorrupted = true;
      result.errors.push(`Critical validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      return result;
    }
  }

  /**
   * Validates data structure integrity
   */
  private async validateDataStructure(data: any): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if data exists and is object
      if (!data || typeof data !== 'object') {
        errors.push('Storage data is not a valid object');
        return { isValid: false, errors };
      }

      // Required top-level properties
      const requiredProps = ['user', 'tokens', 'metadata'];
      for (const prop of requiredProps) {
        if (!(prop in data)) {
          errors.push(`Missing required property: ${prop}`);
        }
      }

      // Validate user object structure
      if (data.user && typeof data.user === 'object') {
        const requiredUserProps = ['id', 'email'];
        for (const prop of requiredUserProps) {
          if (!(prop in data.user)) {
            errors.push(`Missing required user property: ${prop}`);
          }
        }
      } else if (data.user) {
        errors.push('User data is not a valid object');
      }

      // Validate tokens object structure
      if (data.tokens && typeof data.tokens === 'object') {
        const requiredTokenProps = ['accessToken'];
        for (const prop of requiredTokenProps) {
          if (!(prop in data.tokens)) {
            errors.push(`Missing required token property: ${prop}`);
          }
        }
      } else if (data.tokens) {
        errors.push('Tokens data is not a valid object');
      }

      // Validate metadata structure
      if (data.metadata && typeof data.metadata === 'object') {
        const requiredMetadataProps = ['timestamp', 'version'];
        for (const prop of requiredMetadataProps) {
          if (!(prop in data.metadata)) {
            errors.push(`Missing required metadata property: ${prop}`);
          }
        }
      } else if (data.metadata) {
        errors.push('Metadata is not a valid object');
      }

      return { isValid: errors.length === 0, errors };

    } catch (error) {
      errors.push(`Structure validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors };
    }
  }

  /**
   * Validates schema version and compatibility
   */
  private async validateSchema(data: any): Promise<{ isValid: boolean; errors: string[]; requiresMigration: boolean }> {
    const errors: string[] = [];
    let requiresMigration = false;

    try {
      if (!data.metadata?.version) {
        errors.push('Missing schema version information');
        requiresMigration = true;
        return { isValid: false, errors, requiresMigration };
      }

      const dataVersion = data.metadata.version;
      const currentSchema = STORAGE_SCHEMAS[this.currentSchemaVersion as keyof typeof STORAGE_SCHEMAS];
      const dataSchema = STORAGE_SCHEMAS[dataVersion as keyof typeof STORAGE_SCHEMAS];

      if (!dataSchema) {
        errors.push(`Unknown schema version: ${dataVersion}`);
        requiresMigration = true;
        return { isValid: false, errors, requiresMigration };
      }

      // Check if migration is needed
      if (dataVersion !== this.currentSchemaVersion) {
        requiresMigration = true;
        if (!this.isVersionCompatible(dataVersion, this.currentSchemaVersion)) {
          errors.push(`Schema version ${dataVersion} is not compatible with current version ${this.currentSchemaVersion}`);
          return { isValid: false, errors, requiresMigration };
        }
      }

      // Validate schema compliance
      for (const [section, fields] of Object.entries(currentSchema)) {
        if (data[section]) {
          for (const field of fields) {
            if (this.config.strictMode && !(field in data[section])) {
              errors.push(`Missing field ${field} in ${section} section for schema ${this.currentSchemaVersion}`);
            }
          }
        }
      }

      return { isValid: errors.length === 0, errors, requiresMigration };

    } catch (error) {
      errors.push(`Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, requiresMigration: true };
    }
  }

  /**
   * Validates token expiration status
   */
  private async validateTokenExpiration(data: any): Promise<{ isValid: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    try {
      if (!data.tokens?.accessToken) {
        warnings.push('No access token found for expiration validation');
        return { isValid: false, warnings };
      }

      // Decode JWT to check expiration
      const token = data.tokens.accessToken;
      const decoded = this.decodeJWT(token);

      if (!decoded || !decoded.exp) {
        warnings.push('Unable to decode token expiration information');
        return { isValid: false, warnings };
      }

      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      if (timeUntilExpiration <= 0) {
        warnings.push('Access token has expired');
        return { isValid: false, warnings };
      }

      // Warn if token expires soon (within 5 minutes)
      if (timeUntilExpiration < 5 * 60 * 1000) {
        warnings.push(`Access token expires in ${Math.floor(timeUntilExpiration / 1000)} seconds`);
      }

      return { isValid: true, warnings };

    } catch (error) {
      warnings.push(`Token expiration validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, warnings };
    }
  }

  /**
   * Validates data age
   */
  private async validateDataAge(data: any): Promise<{ isValid: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    try {
      if (!data.metadata?.timestamp) {
        warnings.push('Missing timestamp for age validation');
        return { isValid: false, warnings };
      }

      const dataTimestamp = new Date(data.metadata.timestamp).getTime();
      const currentTime = Date.now();
      const dataAge = currentTime - dataTimestamp;
      const maxAge = this.config.maxDataAge * 24 * 60 * 60 * 1000; // Convert days to milliseconds

      if (dataAge > maxAge) {
        warnings.push(`Data is too old (${Math.floor(dataAge / (24 * 60 * 60 * 1000))} days) - maximum age is ${this.config.maxDataAge} days`);
        return { isValid: false, warnings };
      }

      return { isValid: true, warnings };

    } catch (error) {
      warnings.push(`Age validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, warnings };
    }
  }

  /**
   * Attempts to auto-repair corrupted data
   */
  private async attemptAutoRepair(data: any, validationResult: StorageIntegrityResult): Promise<{ repaired: boolean; repairedData?: any }> {
    try {
      let repairedData = { ...data };
      let repaired = false;

      // Repair missing metadata
      if (!repairedData.metadata) {
        repairedData.metadata = {
          timestamp: new Date().toISOString(),
          version: this.currentSchemaVersion
        };
        repaired = true;
      }

      // Update schema version if migration is needed
      if (validationResult.requiresMigration) {
        repairedData = await this.migrateSchema(repairedData);
        repaired = true;
      }

      // Recalculate checksum
      if (this.config.enableChecksumValidation) {
        repairedData.metadata.checksum = this.calculateChecksum(repairedData);
        repaired = true;
      }

      // Update timestamp
      repairedData.metadata.timestamp = new Date().toISOString();

      this.logger.logInfo('Auto-repair attempted', {
        repaired,
        originalErrors: validationResult.errors.length,
        originalWarnings: validationResult.warnings.length
      });

      return { repaired, repairedData };

    } catch (error) {
      this.logger.logError('Auto-repair failed', error as Error);
      return { repaired: false };
    }
  }

  /**
   * Migrates data schema to current version
   */
  private async migrateSchema(data: any): Promise<any> {
    const currentVersion = data.metadata?.version || '1.0.0';
    let migratedData = { ...data };

    // Migration from 1.0.0 to 1.1.0
    if (currentVersion === '1.0.0') {
      // Add new fields for 1.1.0
      if (migratedData.user) {
        migratedData.user.emailVerified = migratedData.user.emailVerified || false;
        migratedData.user.role = migratedData.user.role || 'user';
      }
      if (migratedData.tokens) {
        migratedData.tokens.scope = migratedData.tokens.scope || 'read';
      }
      if (migratedData.metadata) {
        migratedData.metadata.sessionId = migratedData.metadata.sessionId || crypto.randomUUID();
      }

      migratedData.metadata.version = '1.1.0';

      this.logger.logInfo('Schema migrated from 1.0.0 to 1.1.0');
    }

    return migratedData;
  }

  /**
   * Decodes JWT token safely
   */
  private decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Checks if two schema versions are compatible
   */
  private isVersionCompatible(fromVersion: string, toVersion: string): boolean {
    // For now, simple version compatibility check
    // In a real scenario, you might have more complex compatibility matrix
    const supportedMigrations = {
      '1.0.0': ['1.1.0'],
      '1.1.0': ['1.1.0']
    };

    return supportedMigrations[fromVersion as keyof typeof supportedMigrations]?.includes(toVersion) || false;
  }

  /**
   * Creates integrity validation report
   */
  async generateIntegrityReport(storageData: any): Promise<string> {
    const result = await this.validateStorage(storageData);
    
    let report = '=== STORAGE INTEGRITY VALIDATION REPORT ===\n\n';
    report += `Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}\n`;
    report += `Data Corrupted: ${result.dataCorrupted ? '⚠️ YES' : '✅ NO'}\n`;
    report += `Migration Required: ${result.requiresMigration ? '🔄 YES' : '✅ NO'}\n`;
    report += `Auto-Repaired: ${result.autoRepaired ? '🔧 YES' : '❌ NO'}\n\n`;

    report += '--- VALIDATION DETAILS ---\n';
    Object.entries(result.validationDetails).forEach(([key, value]) => {
      report += `${key}: ${value ? '✅' : '❌'}\n`;
    });

    if (result.errors.length > 0) {
      report += '\n--- ERRORS ---\n';
      result.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
    }

    if (result.warnings.length > 0) {
      report += '\n--- WARNINGS ---\n';
      result.warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning}\n`;
      });
    }

    report += `\n--- TIMESTAMP ---\n${new Date().toISOString()}\n`;

    return report;
  }

  /**
   * Utility method to clean corrupted storage
   */
  async cleanCorruptedStorage(): Promise<void> {
    try {
      // Clear localStorage auth data
      const authKeys = [
        'synapsefrontend_auth_token',
        'synapsefrontend_refresh_token',
        'synapsefrontend_user',
        'synapsefrontend_auth_data'
      ];

      authKeys.forEach(key => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage auth data
      authKeys.forEach(key => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.removeItem(key);
        }
      });

      this.logger.logInfo('Corrupted storage data cleaned successfully');

    } catch (error) {
      this.logger.logError('Failed to clean corrupted storage', error as Error);
      throw new AuthError(
        'Failed to clean corrupted storage data',
        AuthErrorCode.STORAGE_CLEANUP_FAILED,
        AuthErrorCategory.INTERNAL,
        { originalError: error }
      );
    }
  }
}

// Default validator instance
export const defaultAuthStorageValidator = new AuthStorageValidator();

// Utility functions
export const validateAuthStorage = (data: any, config?: Partial<ValidationConfig>) => {
  const validator = new AuthStorageValidator(config);
  return validator.validateStorage(data);
};

export const generateStorageReport = (data: any, config?: Partial<ValidationConfig>) => {
  const validator = new AuthStorageValidator(config);
  return validator.generateIntegrityReport(data);
};

export const cleanCorruptedAuthStorage = () => {
  const validator = new AuthStorageValidator();
  return validator.cleanCorruptedStorage();
}; 