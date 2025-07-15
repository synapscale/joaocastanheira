/**
 * Serviço de Marketplace - Gerencia componentes do marketplace
 * Integração completa com a API real de marketplace
 */

import { apiService } from '../api/service'
import type {
  MarketplaceComponent,
  MarketplaceFilters,
  MarketplacePurchase,
  MarketplaceReview,
  MarketplaceReviewCreate,
  MarketplaceFavorite
} from '../api/openapi-types'

export interface MarketplaceResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
  filters_applied: MarketplaceFilters
}

export interface ComponentStats {
  total_components: number
  total_downloads: number
  total_purchases: number
  average_rating: number
  categories: Array<{
    category: string
    count: number
  }>
  popular_tags: Array<{
    tag: string
    count: number
  }>
  recent_components: MarketplaceComponent[]
}

export interface PurchaseHistory {
  id: string
  component_id: string
  component_name: string
  purchase_date: string
  price_paid: number
  currency: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  download_count: number
  last_downloaded?: string
}

/**
 * Classe principal do serviço de marketplace
 */
export class MarketplaceService {
  /**
   * Buscar componentes do marketplace
   */
  async getComponents(filters?: MarketplaceFilters): Promise<MarketplaceResponse<MarketplaceComponent>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters?.category) queryParams.append('category', filters.category)
      if (filters?.type) queryParams.append('type', filters.type)
      if (filters?.tags) filters.tags.forEach(tag => queryParams.append('tags', tag))
      if (filters?.is_free !== undefined) queryParams.append('is_free', filters.is_free.toString())
      if (filters?.min_rating) queryParams.append('min_rating', filters.min_rating.toString())
      if (filters?.search) queryParams.append('search', filters.search)
      if (filters?.sort_by) queryParams.append('sort_by', filters.sort_by)
      if (filters?.sort_order) queryParams.append('sort_order', filters.sort_order)
      if (filters?.page) queryParams.append('page', filters.page.toString())
      if (filters?.size) queryParams.append('size', filters.size.toString())

      const queryString = queryParams.toString()
      const endpoint = queryString ? `/marketplace/components?${queryString}` : '/marketplace/components'

      return await apiService.get<MarketplaceResponse<MarketplaceComponent>>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar componentes do marketplace')
    }
  }

  /**
   * Obter um componente específico
   */
  async getComponent(componentId: string): Promise<MarketplaceComponent> {
    try {
      return await apiService.get<MarketplaceComponent>(`/marketplace/components/${componentId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar componente')
    }
  }

  /**
   * Comprar/Baixar um componente
   */
  async purchaseComponent(purchase: MarketplacePurchase): Promise<{
    purchase_id: string
    component_id: string
    download_url?: string
    install_instructions?: string
    status: 'completed' | 'pending'
    expires_at?: string
  }> {
    try {
      return await apiService.post(`/marketplace/components/${purchase.component_id}/purchase`, purchase)
    } catch (error) {
      throw this.handleError(error, 'Erro ao adquirir componente')
    }
  }

  /**
   * Adicionar componente aos favoritos
   */
  async addToFavorites(componentId: string): Promise<void> {
    try {
      await apiService.post(`/marketplace/components/${componentId}/favorite`, {
        component_id: componentId
      })
    } catch (error) {
      throw this.handleError(error, 'Erro ao adicionar aos favoritos')
    }
  }

  /**
   * Remover componente dos favoritos
   */
  async removeFromFavorites(componentId: string): Promise<void> {
    try {
      await apiService.delete(`/marketplace/components/${componentId}/favorite`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao remover dos favoritos')
    }
  }

  /**
   * Obter favoritos do usuário
   */
  async getFavorites(params?: {
    page?: number
    size?: number
  }): Promise<MarketplaceResponse<MarketplaceComponent>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.size) queryParams.append('size', params.size.toString())

      const queryString = queryParams.toString()
      const endpoint = `/marketplace/favorites${queryString ? '?' + queryString : ''}`

      return await apiService.get<MarketplaceResponse<MarketplaceComponent>>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar favoritos')
    }
  }

  /**
   * Verificar se componente está nos favoritos
   */
  async isFavorite(componentId: string): Promise<boolean> {
    try {
      const response = await apiService.get(`/marketplace/components/${componentId}/favorite`)
      return response.is_favorite || false
    } catch (error) {
      if (error?.status === 404) return false
      throw this.handleError(error, 'Erro ao verificar favorito')
    }
  }

  /**
   * Obter reviews de um componente
   */
  async getComponentReviews(componentId: string, params?: {
    page?: number
    size?: number
    sort_by?: 'rating' | 'date' | 'helpful'
    sort_order?: 'asc' | 'desc'
  }): Promise<MarketplaceResponse<MarketplaceReview>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.size) queryParams.append('size', params.size.toString())
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order)

      const queryString = queryParams.toString()
      const endpoint = `/marketplace/components/${componentId}/reviews${queryString ? '?' + queryString : ''}`

      return await apiService.get<MarketplaceResponse<MarketplaceReview>>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar avaliações')
    }
  }

  /**
   * Adicionar review a um componente
   */
  async addReview(componentId: string, review: MarketplaceReviewCreate): Promise<MarketplaceReview> {
    try {
      return await apiService.post<MarketplaceReview>(`/marketplace/components/${componentId}/reviews`, review)
    } catch (error) {
      throw this.handleError(error, 'Erro ao adicionar avaliação')
    }
  }

  /**
   * Atualizar review
   */
  async updateReview(componentId: string, reviewId: string, review: MarketplaceReviewCreate): Promise<MarketplaceReview> {
    try {
      return await apiService.put<MarketplaceReview>(`/marketplace/components/${componentId}/reviews/${reviewId}`, review)
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar avaliação')
    }
  }

  /**
   * Remover review
   */
  async deleteReview(componentId: string, reviewId: string): Promise<void> {
    try {
      await apiService.delete(`/marketplace/components/${componentId}/reviews/${reviewId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao remover avaliação')
    }
  }

  /**
   * Marcar review como útil
   */
  async markReviewHelpful(componentId: string, reviewId: string): Promise<void> {
    try {
      await apiService.post(`/marketplace/components/${componentId}/reviews/${reviewId}/helpful`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao marcar review como útil')
    }
  }

  /**
   * Obter categorias disponíveis
   */
  async getCategories(): Promise<Array<{
    id: string
    name: string
    description?: string
    component_count: number
    icon?: string
  }>> {
    try {
      return await apiService.get('/marketplace/categories')
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar categorias')
    }
  }

  /**
   * Obter componentes em destaque
   */
  async getFeaturedComponents(params?: {
    category?: string
    type?: string
    limit?: number
  }): Promise<MarketplaceComponent[]> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.category) queryParams.append('category', params.category)
      if (params?.type) queryParams.append('type', params.type)
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const queryString = queryParams.toString()
      const endpoint = `/marketplace/featured${queryString ? '?' + queryString : ''}`

      return await apiService.get<MarketplaceComponent[]>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar componentes em destaque')
    }
  }

  /**
   * Buscar componentes
   */
  async searchComponents(query: string, filters?: Partial<MarketplaceFilters>): Promise<MarketplaceResponse<MarketplaceComponent>> {
    try {
      const searchFilters: MarketplaceFilters = {
        search: query,
        ...filters
      }
      
      return await this.getComponents(searchFilters)
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar componentes')
    }
  }

  /**
   * Obter componentes similares
   */
  async getSimilarComponents(componentId: string, limit: number = 5): Promise<MarketplaceComponent[]> {
    try {
      return await apiService.get(`/marketplace/components/${componentId}/similar?limit=${limit}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar componentes similares')
    }
  }

  /**
   * Obter estatísticas do marketplace
   */
  async getMarketplaceStats(): Promise<ComponentStats> {
    try {
      return await apiService.get<ComponentStats>('/marketplace/stats')
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar estatísticas do marketplace')
    }
  }

  /**
   * Obter histórico de compras do usuário
   */
  async getPurchaseHistory(params?: {
    page?: number
    size?: number
    status?: string
  }): Promise<MarketplaceResponse<PurchaseHistory>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.size) queryParams.append('size', params.size.toString())
      if (params?.status) queryParams.append('status', params.status)

      const queryString = queryParams.toString()
      const endpoint = `/marketplace/purchases${queryString ? '?' + queryString : ''}`

      return await apiService.get<MarketplaceResponse<PurchaseHistory>>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar histórico de compras')
    }
  }

  /**
   * Baixar componente comprado
   */
  async downloadComponent(componentId: string): Promise<{
    download_url: string
    expires_at: string
    file_size: number
    filename: string
  }> {
    try {
      return await apiService.post(`/marketplace/components/${componentId}/download`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao gerar link de download')
    }
  }

  /**
   * Obter componentes mais populares
   */
  async getPopularComponents(params?: {
    period?: 'day' | 'week' | 'month' | 'year'
    category?: string
    type?: string
    limit?: number
  }): Promise<MarketplaceComponent[]> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.period) queryParams.append('period', params.period)
      if (params?.category) queryParams.append('category', params.category)
      if (params?.type) queryParams.append('type', params.type)
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const queryString = queryParams.toString()
      const endpoint = `/marketplace/popular${queryString ? '?' + queryString : ''}`

      return await apiService.get<MarketplaceComponent[]>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar componentes populares')
    }
  }

  /**
   * Obter componentes recentes
   */
  async getRecentComponents(params?: {
    category?: string
    type?: string
    limit?: number
  }): Promise<MarketplaceComponent[]> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.category) queryParams.append('category', params.category)
      if (params?.type) queryParams.append('type', params.type)
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const queryString = queryParams.toString()
      const endpoint = `/marketplace/recent${queryString ? '?' + queryString : ''}`

      return await apiService.get<MarketplaceComponent[]>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar componentes recentes')
    }
  }

  /**
   * Obter componentes gratuitos
   */
  async getFreeComponents(params?: {
    category?: string
    type?: string
    page?: number
    size?: number
  }): Promise<MarketplaceResponse<MarketplaceComponent>> {
    try {
      return await this.getComponents({
        is_free: true,
        ...params
      })
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar componentes gratuitos')
    }
  }

  /**
   * Verificar se usuário comprou componente
   */
  async hasPurchased(componentId: string): Promise<{
    has_purchased: boolean
    purchase_date?: string
    download_count?: number
    last_downloaded?: string
  }> {
    try {
      return await apiService.get(`/marketplace/components/${componentId}/purchase-status`)
    } catch (error) {
      if (error?.status === 404) {
        return { has_purchased: false }
      }
      throw this.handleError(error, 'Erro ao verificar status de compra')
    }
  }

  /**
   * Obter tags populares
   */
  async getPopularTags(limit: number = 20): Promise<Array<{
    tag: string
    count: number
    category?: string
  }>> {
    try {
      return await apiService.get(`/marketplace/tags/popular?limit=${limit}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar tags populares')
    }
  }

  /**
   * Obter sugestões de busca
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<Array<{
    suggestion: string
    type: 'component' | 'category' | 'tag' | 'author'
    count: number
  }>> {
    try {
      return await apiService.get(`/marketplace/search/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar sugestões de busca')
    }
  }

  /**
   * Reportar componente
   */
  async reportComponent(componentId: string, report: {
    reason: 'inappropriate' | 'copyright' | 'malicious' | 'broken' | 'other'
    description: string
    evidence?: string[]
  }): Promise<{
    report_id: string
    status: 'submitted'
    message: string
  }> {
    try {
      return await apiService.post(`/marketplace/components/${componentId}/report`, report)
    } catch (error) {
      throw this.handleError(error, 'Erro ao reportar componente')
    }
  }

  /**
   * [ADMIN] Moderar componente
   */
  async moderateComponent(componentId: string, action: {
    action: 'approve' | 'reject' | 'remove' | 'feature' | 'unfeature'
    reason?: string
    notify_author?: boolean
  }): Promise<{ message: string; status: string }> {
    try {
      return await apiService.post(`/marketplace/admin/components/${componentId}/moderate`, action)
    } catch (error) {
      throw this.handleError(error, 'Erro ao moderar componente')
    }
  }

  /**
   * Tratar erros de API com mensagens mais específicas
   */
  private handleError(error: any, defaultMessage: string): Error {
    console.error('MarketplaceService error:', error)
    
    // Erro de autenticação
    if (error?.status === 401) {
      return new Error('Você precisa estar logado para acessar o marketplace.')
    }
    
    // Erro de autorização
    if (error?.status === 403) {
      return new Error('Você não tem permissão para realizar esta ação.')
    }
    
    // Erro de recurso não encontrado
    if (error?.status === 404) {
      return new Error('Componente não encontrado.')
    }
    
    // Erro de validação
    if (error?.status === 422) {
      const details = error?.data?.detail || error?.message || ''
      return new Error(`Dados inválidos: ${details}`)
    }
    
    // Erro de pagamento
    if (error?.status === 402) {
      return new Error('Erro no pagamento. Verifique suas informações de cobrança.')
    }
    
    // Erro de servidor
    if (error?.status >= 500) {
      return new Error('Erro interno do servidor. Tente novamente em alguns minutos.')
    }
    
    // Erro de rede
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('conectar ao servidor')) {
      return new Error('Não foi possível conectar ao servidor. Verifique sua conexão de internet.')
    }
    
    // Erro genérico
    const message = error?.message || defaultMessage
    return new Error(message)
  }
}

// Instância singleton do serviço
export const marketplaceService = new MarketplaceService()
export default marketplaceService 