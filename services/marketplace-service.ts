import type {
  MarketplaceTemplate,
  TemplateReview,
  MarketplaceUser,
  MarketplaceStats,
  MarketplaceFilters,
} from "@/types/marketplace-template"
import type { NodeTemplate } from "@/types/node-template"
import { getApiUrl } from '../lib/config'

/**
 * Serviço para interação com a API do marketplace.
 * Fornece métodos para buscar, publicar e interagir com templates.
 * 
 * IMPORTANTE: Este serviço usa APENAS APIs reais - sem dados mocados.
 */
export class MarketplaceService {
  /**
   * Obtém templates com filtros opcionais.
   * @param filters - Critérios de filtragem e ordenação
   * @returns Promise com a lista de templates filtrados
   */
  static async getTemplates(filters: Partial<MarketplaceFilters> = {}): Promise<MarketplaceTemplate[]> {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.categories && filters.categories.length > 0) params.append('categories', filters.categories.join(','))
    if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','))
    if (filters.sortBy) params.append('sortBy', filters.sortBy)

    const apiUrl = getApiUrl(`/api/v1/templates?${params.toString()}`)
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Erro ao buscar templates do marketplace')
    const data = await res.json()
    return data.items || []
  }

  /**
   * Obtém um template específico pelo ID.
   * @param id - ID do template a ser buscado
   * @returns Promise com o template encontrado ou null
   */
  static async getTemplate(id: string): Promise<MarketplaceTemplate | null> {
    const apiUrl = getApiUrl(`/api/v1/templates/${id}`)
    const res = await fetch(apiUrl)
    if (!res.ok) return null
    const data = await res.json()
    return data || null
  }

  /**
   * Obtém avaliações de um template específico.
   * @param templateId - ID do template
   * @returns Promise com a lista de avaliações
   */
  static async getTemplateReviews(templateId: string): Promise<TemplateReview[]> {
    const apiUrl = getApiUrl(`/api/v1/templates/${templateId}/reviews`)
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Erro ao buscar avaliações do template')
    const data = await res.json()
    return data.items || []
  }

  /**
   * Obtém informações de um usuário pelo ID.
   * @param userId - ID do usuário
   * @returns Promise com as informações do usuário ou null
   */
  static async getUser(userId: string): Promise<MarketplaceUser | null> {
    const apiUrl = getApiUrl(`/api/v1/users/${userId}`)
    const res = await fetch(apiUrl)
    if (!res.ok) return null
    const data = await res.json()
    return data || null
  }

  /**
   * Obtém templates publicados por um usuário específico.
   * @param userId - ID do usuário
   * @returns Promise com a lista de templates do usuário
   */
  static async getUserTemplates(userId: string): Promise<MarketplaceTemplate[]> {
    const apiUrl = getApiUrl(`/api/v1/templates?author_id=${userId}`)
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Erro ao buscar templates do usuário')
    const data = await res.json()
    return data.items || []
  }

  /**
   * Obtém estatísticas gerais do marketplace.
   * @returns Promise com as estatísticas do marketplace
   */
  static async getMarketplaceStats(): Promise<MarketplaceStats> {
    const apiUrl = getApiUrl('/api/v1/templates/marketplace')
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Erro ao buscar estatísticas do marketplace')
    const data = await res.json()
    return data
  }

  /**
   * Publica um template no marketplace.
   * @param template - Template a ser publicado
   * @param userId - ID do usuário que está publicando
   * @returns Promise com o template publicado
   */
  static async publishTemplate(template: NodeTemplate, userId: string): Promise<MarketplaceTemplate> {
    const apiUrl = getApiUrl('/api/v1/templates')
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...template, userId })
    })
    if (!res.ok) throw new Error('Erro ao publicar template')
    const data = await res.json()
    return data
  }

  /**
   * Atualiza um template publicado.
   * @param templateId - ID do template a ser atualizado
   * @param updates - Campos a serem atualizados
   * @returns Promise com o template atualizado
   */
  static async updateTemplate(templateId: string, updates: Partial<MarketplaceTemplate>): Promise<MarketplaceTemplate> {
    const apiUrl = getApiUrl(`/api/v1/templates/${templateId}`)
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!res.ok) throw new Error('Erro ao atualizar template')
    const data = await res.json()
    return data
  }

  /**
   * Remove um template publicado.
   * @param templateId - ID do template a ser removido
   * @returns Promise com o resultado da operação
   */
  static async deleteTemplate(templateId: string): Promise<boolean> {
    const apiUrl = getApiUrl(`/api/v1/templates/${templateId}`)
    const res = await fetch(apiUrl, { method: 'DELETE' })
    if (!res.ok) throw new Error('Erro ao deletar template')
    return true
  }

  /**
   * Adiciona uma avaliação a um template.
   * @param templateId - ID do template a ser avaliado
   * @param userId - ID do usuário que está avaliando
   * @param rating - Classificação (1-5)
   * @param comment - Comentário da avaliação
   * @returns Promise com a avaliação criada
   */
  static async addReview(templateId: string, userId: string, rating: number, comment: string): Promise<TemplateReview> {
    const apiUrl = getApiUrl(`/api/v1/templates/${templateId}/reviews`)
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment })
    })
    if (!res.ok) throw new Error('Erro ao criar avaliação')
    const data = await res.json()
    return data
  }

  /**
   * Marca uma avaliação como útil.
   * @param reviewId - ID da avaliação
   * @param templateId - ID do template
   * @returns Promise com o resultado da operação
   */
  static async markReviewHelpful(reviewId: string, templateId: string): Promise<boolean> {
    const apiUrl = getApiUrl(`/api/v1/templates/reviews/${reviewId}/helpful`)
    const res = await fetch(apiUrl, { method: 'POST' })
    if (!res.ok) throw new Error('Erro ao marcar avaliação como útil')
    return true
  }

  /**
   * Instala um template do marketplace.
   * @param templateId - ID do template a ser instalado
   * @returns Promise com o template instalado
   */
  static async installTemplate(templateId: string): Promise<NodeTemplate> {
    const apiUrl = getApiUrl(`/api/v1/templates/install`)
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId })
    })
    if (!res.ok) throw new Error('Erro ao instalar template')
    const data = await res.json()
    return data
  }
}
