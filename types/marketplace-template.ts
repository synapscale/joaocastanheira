/**
 * Representa um usuário no marketplace de templates.
 * Contém informações sobre o perfil do usuário e suas estatísticas.
 */
export interface MarketplaceUser {
  /** Identificador único do usuário */
  id: string
  /** Nome de usuário (usado para login e URLs) */
  username: string
  /** Nome de exibição do usuário (mostrado na interface) */
  displayName: string
  /** URL opcional para o avatar do usuário */
  avatarUrl?: string
  /** Biografia ou descrição do usuário */
  bio?: string
  /** Data de criação da conta do usuário */
  createdAt: string
  /** Número de templates publicados pelo usuário */
  templates: number
  /** Número de seguidores do usuário */
  followers: number
}

import type { NodeTemplate } from "@/types/node-template"

/**
 * Representa um template publicado no marketplace.
 * Estende o tipo NodeTemplate com informações adicionais específicas do marketplace.
 */
export interface MarketplaceTemplate extends Omit<NodeTemplate, "id" | "author"> {
  /** Identificador único do template no marketplace */
  id: string
  /** Identificador de publicação (pode ser diferente do ID interno) */
  publishedId?: string
  /** Informações sobre o autor do template (objeto, não string) */
  author: {
    /** Identificador único do autor */
    id: string
    /** Nome de usuário do autor */
    username: string
    /** Nome de exibição do autor */
    displayName: string
    /** URL opcional para o avatar do autor */
    avatarUrl?: string
  }
  /** Data de publicação do template no marketplace */
  publishedAt: string
  /** Data da última atualização do template */
  updatedAt: string
  /** Número de downloads do template */
  downloads: number
  /** Classificação média do template (1-5) */
  rating: number
  /** Número de avaliações recebidas */
  ratingCount: number
  /** Indica se o template foi verificado pelos administradores */
  verified: boolean
  /** Indica se o template é destacado no marketplace */
  featured: boolean
  /** Informações de preço do template (se aplicável) */
  pricing?: {
    /** Tipo de preço: gratuito, pago ou assinatura */
    type: "free" | "paid" | "subscription"
    /** Valor do preço (para templates pagos) */
    price?: number
    /** Moeda do preço (para templates pagos) */
    currency?: string
  }
  /** Versão do template */
  version: string
  /** Versões do sistema com as quais o template é compatível */
  compatibility: string[]
  /** Tipo de licença do template */
  license: string
}

/**
 * Representa uma avaliação de um template no marketplace.
 * Contém informações sobre a avaliação, o avaliador e possíveis respostas.
 */
export interface TemplateReview {
  /** Identificador único da avaliação */
  id: string
  /** Identificador do template avaliado */
  templateId: string
  /** Identificador do usuário que fez a avaliação */
  userId: string
  /** Nome de usuário do avaliador */
  username: string
  /** Nome de exibição do avaliador */
  displayName: string
  /** URL opcional para o avatar do avaliador */
  avatarUrl?: string
  /** Classificação dada (1-5) */
  rating: number
  /** Comentário da avaliação */
  comment: string
  /** Data de criação da avaliação */
  createdAt: string
  /** Data da última atualização da avaliação */
  updatedAt: string
  /** Número de usuários que acharam a avaliação útil */
  helpful: number
  /** Resposta opcional do autor do template */
  reply?: {
    /** Identificador do usuário que respondeu */
    userId: string
    /** Nome de usuário de quem respondeu */
    username: string
    /** Nome de exibição de quem respondeu */
    displayName: string
    /** Comentário da resposta */
    comment: string
    /** Data de criação da resposta */
    createdAt: string
  }
}

/**
 * Representa estatísticas gerais do marketplace.
 * Contém informações agregadas sobre templates, downloads, usuários e categorias.
 */
export interface MarketplaceStats {
  /** Número total de templates no marketplace */
  totalTemplates: number
  /** Número total de downloads de todos os templates */
  totalDownloads: number
  /** Número total de usuários registrados */
  totalUsers: number
  /** Lista das categorias mais populares */
  popularCategories: Array<{
    /** Identificador da categoria */
    id: string
    /** Nome da categoria */
    name: string
    /** Número de templates na categoria */
    count: number
  }>
  /** Lista das tags mais populares */
  popularTags: Array<{
    /** Nome da tag */
    name: string
    /** Número de templates com esta tag */
    count: number
  }>
}

/**
 * Representa os filtros aplicáveis na busca de templates.
 * Define os critérios de filtragem e ordenação.
 */
export interface MarketplaceFilters {
  /** Termo de busca para filtrar templates */
  search: string
  /** Lista de categorias para filtrar */
  categories: string[]
  /** Lista de tags para filtrar */
  tags: string[]
  /** Classificação mínima para filtrar (null = qualquer) */
  rating: number | null
  /** Tipos de preço para filtrar */
  pricing: ("free" | "paid" | "subscription")[]
  /** Critério de ordenação dos resultados */
  sortBy: "popular" | "recent" | "rating" | "downloads"
  /** Filtrar por autor específico (opcional) */
  author?: string
  /** Filtrar apenas templates destacados (opcional) */
  featured?: boolean
  /** Filtrar apenas templates verificados (opcional) */
  verified?: boolean
}
