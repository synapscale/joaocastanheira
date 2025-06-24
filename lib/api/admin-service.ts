/**
 * Admin Service Layer - Integração com Backend Real
 * 
 * ENDPOINTS DO BACKEND:
 * - GET /api/v1/analytics/admin/stats - Estatísticas administrativas
 * - GET /api/v1/marketplace/admin/reports/revenue - Relatório de receitas
 * - GET /api/v1/marketplace/admin/reports/downloads - Relatório de downloads
 * - GET /api/v1/workspaces/ - Dados reais de clientes (workspaces)
 * 
 * ⚠️ TODOS OS ENDPOINTS REQUEREM AUTENTICAÇÃO
 */

import { apiService } from './service'
import type { 
  AdminStats, 
  RevenueReport, 
  DownloadsReport, 
  RealCustomer,
  RevenueReportParams,
  DownloadsReportParams,
  CustomersListParams
} from '@/types/admin-types'

// ===== HELPER FUNCTIONS =====

/**
 * Trata erros de API e retorna mensagens claras para o usuário
 */
function handleApiError(error: any, context: string): never {
  console.error(`❌ [Admin Service] ${context}:`, error)
  
  // Erro de autenticação
  if (error?.status === 401) {
    throw new Error('Você precisa estar logado como administrador para acessar estes dados.')
  }
  
  // Erro de autorização
  if (error?.status === 403) {
    throw new Error('Você não tem permissão para acessar estes dados administrativos.')
  }
  
  // Erro de servidor
  if (error?.status >= 500) {
    throw new Error('Erro interno do servidor. Tente novamente em alguns minutos.')
  }
  
  // Erro de rede
  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('conectar ao servidor')) {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão de internet.')
  }
  
  // Erro genérico
  const message = error?.message || 'Erro desconhecido ao acessar dados administrativos'
  throw new Error(message)
}

/**
 * Verifica se o usuário está autenticado antes de fazer requisições admin
 */
function ensureAuthenticated(): void {
  if (!apiService.isAuthenticated()) {
    throw new Error('Você precisa estar logado para acessar dados administrativos.')
  }
}

// ===== ADMIN SERVICE CLASS =====

class AdminService {
  
  /**
   * Obter estatísticas administrativas do sistema
   */
  async getAdminStats(): Promise<AdminStats> {
    try {
      ensureAuthenticated()
      
      console.log('🔄 [Admin Service] Requesting admin stats from backend...')
      
      const response = await apiService.get<AdminStats>('/api/v1/analytics/admin/stats')
      
      console.log('✅ [Admin Service] Admin stats received:', response)
      return response
      
    } catch (error) {
      handleApiError(error, 'Failed to fetch admin stats')
    }
  }

  /**
   * Obter relatório de receitas
   */
  async getRevenueReport(params: RevenueReportParams): Promise<RevenueReport> {
    try {
      ensureAuthenticated()
      
      console.log('🔄 [Admin Service] Requesting revenue report from backend...', params)
      
      const queryParams = new URLSearchParams()
      if (params.start_date) queryParams.append('start_date', params.start_date)
      if (params.end_date) queryParams.append('end_date', params.end_date)
      if (params.period) queryParams.append('period', params.period)
      
      const endpoint = `/api/v1/marketplace/admin/reports/revenue?${queryParams.toString()}`
      
      const response = await apiService.get<RevenueReport>(endpoint)
      
      console.log('✅ [Admin Service] Revenue report received:', response)
      return response
      
    } catch (error) {
      handleApiError(error, 'Failed to fetch revenue report')
    }
  }

  /**
   * Obter relatório de downloads  
   */
  async getDownloadsReport(params: DownloadsReportParams): Promise<DownloadsReport> {
    try {
      ensureAuthenticated()
      
      console.log('🔄 [Admin Service] Requesting downloads report from backend...', params)
      
      const queryParams = new URLSearchParams()
      if (params.start_date) queryParams.append('start_date', params.start_date)
      if (params.end_date) queryParams.append('end_date', params.end_date)
      if (params.category) queryParams.append('category', params.category)
      
      const endpoint = `/api/v1/marketplace/admin/reports/downloads?${queryParams.toString()}`
      
      const response = await apiService.get<DownloadsReport>(endpoint)
      
      console.log('✅ [Admin Service] Downloads report received:', response)
      return response
      
    } catch (error) {
      handleApiError(error, 'Failed to fetch downloads report')
    }
  }

  /**
   * Obter lista de clientes reais (workspaces)
   */
  async getCustomers(params: CustomersListParams = {}): Promise<RealCustomer[]> {
    try {
      ensureAuthenticated()
      
      console.log('🔄 [Admin Service] Requesting customers from backend...', params)
      
      const queryParams = new URLSearchParams()
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.plan) queryParams.append('plan', params.plan)
      
      const endpoint = params.limit || params.plan 
        ? `/api/v1/workspaces/?${queryParams.toString()}`
        : '/api/v1/workspaces/'
      
      const response = await apiService.get<RealCustomer[]>(endpoint)
      
      console.log('✅ [Admin Service] Customers received:', response)
      return response
      
    } catch (error) {
      handleApiError(error, 'Failed to fetch customers list')
    }
  }
}

// ===== EXPORT SINGLETON =====

export const adminService = new AdminService()
export default adminService 