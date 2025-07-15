/**
 * Setup global para Jest
 * Executa antes de todos os testes
 */

module.exports = async () => {
  // Configurar variáveis de ambiente para testes
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'
  process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:8000'
  
  // Configurar timezone para testes consistentes
  process.env.TZ = 'UTC'
  
  // Configurar localStorage mock
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  
  // Configurar sessionStorage mock
  global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  
  // Configurar fetch mock global
  global.fetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
  
  // Configurar console para testes (mantém funcionalidade)
  global.console = {
    ...console,
    log: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {}
  }
  
  console.log('🚀 Jest global setup complete')
} 