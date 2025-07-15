/**
 * Validação completa das variáveis de ambiente
 * Verifica se todas as configurações necessárias estão presentes e válidas
 */

interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Record<string, any>;
}

export function validateAndPrint(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config: Record<string, any> = {};

  // Variáveis obrigatórias
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_WS_URL'
  ];

  // Variáveis opcionais com valores padrão
  const optionalVars = [
    'NEXT_PUBLIC_APP_ENV',
    'NEXT_PUBLIC_JWT_STORAGE_KEY',
    'NEXT_PUBLIC_REFRESH_TOKEN_KEY',
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_COMPANY_NAME'
  ];

  console.log('\n🔍 === VALIDAÇÃO DE AMBIENTE ===');

  // Verificar variáveis obrigatórias
  for (const varName of requiredVars) {
    const value = process.env[varName];
    config[varName] = value;

    if (!value) {
      errors.push(`❌ ${varName} é obrigatório mas não foi encontrado`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
      
      // Validações específicas
      if (varName.includes('URL')) {
        try {
          new URL(value);
        } catch {
          errors.push(`❌ ${varName} não é uma URL válida: ${value}`);
        }
      }
    }
  }

  // Verificar variáveis opcionais
  for (const varName of optionalVars) {
    const value = process.env[varName];
    config[varName] = value;

    if (value) {
      console.log(`✅ ${varName}: ${value}`);
    } else {
      warnings.push(`⚠️ ${varName} não definido (usando padrão)`);
    }
  }

  // Validações específicas de URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    if (apiUrl.includes('/api/v1/v1')) {
      errors.push(`❌ NEXT_PUBLIC_API_URL contém /api/v1 duplicado: ${apiUrl}`);
      console.log('💡 Sugestão: Use apenas a URL base (ex: http://localhost:8000)');
    }
  }

  // Verificar consistência entre URLs
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (apiUrl && wsUrl) {
    try {
      const apiHost = new URL(apiUrl).host;
      const wsHost = new URL(wsUrl).host;
      
      if (apiHost !== wsHost) {
        warnings.push(`⚠️ API e WebSocket usam hosts diferentes: ${apiHost} vs ${wsHost}`);
      }
    } catch {
      // URLs inválidas já foram reportadas acima
    }
  }

  // Verificar ambiente
  const env = process.env.NEXT_PUBLIC_APP_ENV;
  if (env && !['development', 'staging', 'production'].includes(env)) {
    warnings.push(`⚠️ NEXT_PUBLIC_APP_ENV tem valor não padrão: ${env}`);
  }

  // Mostrar resumo
  console.log('\n📊 === RESUMO DA VALIDAÇÃO ===');
  console.log(`✅ Configurações válidas: ${requiredVars.length - errors.length}/${requiredVars.length}`);
  console.log(`⚠️ Avisos: ${warnings.length}`);
  console.log(`❌ Erros: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n❌ === ERROS ENCONTRADOS ===');
    errors.forEach(error => console.log(error));
    console.log('\n💡 Crie um arquivo .env baseado no .env.example');
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ === AVISOS ===');
    warnings.forEach(warning => console.log(warning));
  }

  console.log('\n🔍 === FIM DA VALIDAÇÃO ===\n');

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config
  };
}

/**
 * Validação rápida para uso em runtime
 */
export function quickValidate(): boolean {
  const required = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_WS_URL'];
  return required.every(varName => !!process.env[varName]);
}

/**
 * Obter informações de debug do ambiente
 */
export function getDebugInfo(): Record<string, any> {
  return {
    nodeEnv: process.env.NODE_ENV,
    appEnv: process.env.NEXT_PUBLIC_APP_ENV,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    isClient: typeof window !== 'undefined'
  };
} 