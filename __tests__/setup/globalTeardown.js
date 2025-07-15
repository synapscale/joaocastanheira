/**
 * Teardown global para Jest
 * Executa depois de todos os testes
 */

module.exports = async () => {
  // Limpar mocks globais
  if (global.fetch && global.fetch.mockRestore) {
    global.fetch.mockRestore()
  }
  
  // Limpar variáveis de ambiente de teste
  delete process.env.NODE_ENV
  delete process.env.NEXT_PUBLIC_API_URL
  delete process.env.NEXT_PUBLIC_WS_URL
  delete process.env.TZ
  
  // Limpar storage mocks
  delete global.localStorage
  delete global.sessionStorage
  
  console.log('🧹 Jest global teardown complete')
} 