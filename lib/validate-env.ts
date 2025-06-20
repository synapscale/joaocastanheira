/**
 * Validação das variáveis de ambiente
 * Garante que todas as configurações necessárias estão presentes
 */

interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Lista de variáveis obrigatórias
 */
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_WS_URL',
] as const;

/**
 * Lista de variáveis opcionais (com valores padrão)
 */
const OPTIONAL_ENV_VARS = [
  'NEXT_PUBLIC_APP_ENV',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_JWT_STORAGE_KEY',
  'NEXT_PUBLIC_REFRESH_TOKEN_KEY',
] as const;

/**
 * Valida se todas as variáveis de ambiente necessárias estão definidas
 */
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar variáveis obrigatórias
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    
    if (!value || value.trim() === '') {
      errors.push(`${envVar} é obrigatória e não está definida no arquivo .env`);
    } else {
      // Validar formato da URL
      if (envVar.includes('URL')) {
        try {
          new URL(value);
        } catch {
          errors.push(`${envVar} deve ser uma URL válida (atualmente: "${value}")`);
        }
      }
    }
  }

  // Verificar variáveis opcionais e dar avisos se não estiverem definidas
  for (const envVar of OPTIONAL_ENV_VARS) {
    const value = process.env[envVar];
    
    if (!value || value.trim() === '') {
      warnings.push(`${envVar} não está definida, usando valor padrão`);
    }
  }

  // Validações específicas
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    if (apiUrl.includes('0.0.0.0')) {
      errors.push('NEXT_PUBLIC_API_URL não deve usar 0.0.0.0, use localhost ou 127.0.0.1');
    }
    
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      errors.push('NEXT_PUBLIC_API_URL deve começar com http:// ou https://');
    }
  }

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (wsUrl) {
    if (wsUrl.includes('0.0.0.0')) {
      errors.push('NEXT_PUBLIC_WS_URL não deve usar 0.0.0.0, use localhost ou 127.0.0.1');
    }
    
    if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
      errors.push('NEXT_PUBLIC_WS_URL deve começar com ws:// ou wss://');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Imprime o resultado da validação no console
 */
export function printValidationResult(result: EnvValidationResult): void {
  if (result.isValid) {
    console.log('✅ Todas as variáveis de ambiente estão configuradas corretamente!');
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Avisos:');
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
  } else {
    console.error('❌ Problemas nas variáveis de ambiente encontrados:');
    result.errors.forEach(error => console.error(`   - ${error}`));
    
    console.error('\n📝 Para corrigir:');
    console.error('   1. Verifique o arquivo .env na raiz do projeto');
    console.error('   2. Configure todas as variáveis obrigatórias');
    console.error('   3. Reinicie o servidor de desenvolvimento');
  }
}

/**
 * Valida e imprime o resultado automaticamente
 */
export function validateAndPrint(): boolean {
  const result = validateEnvironment();
  printValidationResult(result);
  return result.isValid;
} 