/**
 * Admin Service Layer - Integração com Backend Real
 * 
 * ENDPOINTS DO BACKEND:
 * - GET /api/v1/analytics/admin/stats - Estatísticas administrativas
 * - GET /api/v1/marketplace/admin/reports/revenue - Relatório de receitas
 * - GET /api/v1/marketplace/admin/reports/downloads - Relatório de downloads
 * - GET /api/v1/workspaces/ - Dados reais de clientes (workspaces)
 */

import { ApiService } from './service'
import type { 
  AdminStats, 
  RevenueReport, 
  DownloadsReport, 
  RealCustomer,
  RevenueReportParams,
  DownloadsReportParams,
  CustomersListParams
} from '@/types/admin-types'

// Instância do ApiService
const apiService = new ApiService()

// ===== ADMIN SERVICE CLASS =====

class AdminService {
  
  /**
   * Obter estatísticas administrativas do sistema
   */
  async getAdminStats(): Promise<AdminStats> {
    try {
      console.log('🔄 [Admin Service] Requesting admin stats from backend...')
      
      const response = await apiService.get<AdminStats>('/api/v1/analytics/admin/stats')
      
      console.log('✅ [Admin Service] Admin stats received:', response)
      return response
      
    } catch (error) {
      console.error('❌ [Admin Service] Failed to fetch admin stats:', error)
      throw new Error('Não foi possível conectar ao servidor para obter estatísticas administrativas')
    }
  }

  /**
   * Obter relatório de receitas
   */
  async getRevenueReport(params: RevenueReportParams): Promise<RevenueReport> {
    try {
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
      console.error('❌ [Admin Service] Failed to fetch revenue report:', error)
      throw new Error('Não foi possível conectar ao servidor para obter relatório de receitas')
    }
  }

  /**
   * Obter relatório de downloads  
   */
  async getDownloadsReport(params: DownloadsReportParams): Promise<DownloadsReport> {
    try {
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
      console.error('❌ [Admin Service] Failed to fetch downloads report:', error)
      throw new Error('Não foi possível conectar ao servidor para obter relatório de downloads')
    }
  }

  /**
   * Obter lista de clientes/workspaces reais
   */
  async getCustomers(params: CustomersListParams = {}): Promise<RealCustomer[]> {
    try {
      console.log('🔄 [Admin Service] Requesting customers list from backend...', params)
      
      const queryParams = new URLSearchParams()
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.status) queryParams.append('status', params.status)
      if (params.plan) queryParams.append('plan', params.plan)
      
      const endpoint = `/api/v1/workspaces?${queryParams.toString()}`
      
      const response = await apiService.get<RealCustomer[]>(endpoint)
      
      console.log('✅ [Admin Service] Customers list received:', response)
      return response
      
    } catch (error) {
      console.error('❌ [Admin Service] Failed to fetch customers:', error)
      throw new Error('Não foi possível conectar ao servidor para obter lista de clientes')
    }
  }
}

// ===== SINGLETON EXPORT =====

export const adminService = new AdminService() 