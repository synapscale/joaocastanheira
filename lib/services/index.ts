/**
 * Index dos serviços da aplicação
 * Re-exporta todos os serviços para facilitar imports
 */

// Serviços principais
export { authService } from './auth';
export { apiService, wsService, WebSocketService } from '../api/service';

// Novos serviços criados (apenas os que existem)
export { executionsService } from './executions';
export { marketplaceService } from './marketplace-service';
export { llmServicesService } from './llm-services';

// Re-exportar tipos relevantes do API service
export type {
  ApiService,
  User,
  Workflow,
  Node,
  Agent,
  Conversation,
  Message,
} from '../api/service';

// Re-exportar tipos de autenticação dos tipos globais
export type { 
  AuthTokens,
  AuthUser,
  LoginData,
  RegisterData,
  AuthResponse,
} from '../types/auth';

// Serviços especializados por categoria
export const services = {
  // Autenticação
  auth: () => import('./auth').then(m => m.authService),
  
  // API principal
  api: () => import('../api/service').then(m => m.apiService),
  websocket: () => import('../api/service').then(m => m.wsService),
  
  // Execuções
  executions: () => import('./executions').then(m => m.executionsService),
  
  // Marketplace
  marketplace: () => import('./marketplace-service').then(m => m.marketplaceService),
  
  // LLM Services
  llm: () => import('./llm-services').then(m => m.llmServicesService),
} as const;

/**
 * Função helper para carregar serviços essenciais
 */
export async function initializeEssentialServices() {
  const [auth, api] = await Promise.all([
    services.auth(),
    services.api(),
  ]);

  return { auth, api };
}

/**
 * Função helper para carregar todos os serviços disponíveis
 */
export async function loadAvailableServices() {
  const [auth, api, websocket, executions, marketplace, llm] = await Promise.all([
    services.auth(),
    services.api(),
    services.websocket(),
    services.executions(),
    services.marketplace(),
    services.llm(),
  ]);

  return {
    auth,
    api,
    websocket,
    executions,
    marketplace,
    llm,
  };
}

export default services; 