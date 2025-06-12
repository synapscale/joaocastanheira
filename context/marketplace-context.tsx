"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { MarketplaceService } from "@/services/marketplace-service"
import type {
  MarketplaceTemplate,
  TemplateReview,
  MarketplaceStats,
  MarketplaceFilters,
} from "@/types/marketplace-template"
import type { NodeTemplate } from "@/types/node-template"
import { useTemplates } from "@/context/template-context"

/**
 * Interface que define as funcionalidades disponíveis no contexto do marketplace.
 */
interface MarketplaceContextType {
  /** Lista de templates filtrados atualmente */
  templates: MarketplaceTemplate[]
  /** Lista de templates destacados */
  featuredTemplates: MarketplaceTemplate[]
  /** Lista de templates populares */
  popularTemplates: MarketplaceTemplate[]
  /** Lista de templates recentes */
  recentTemplates: MarketplaceTemplate[]
  /** Indica se alguma operação está em andamento */
  isLoading: boolean
  /** Mensagem de erro, se houver */
  error: string | null
  /** Filtros atualmente aplicados */
  filters: MarketplaceFilters
  /** Estatísticas do marketplace */
  stats: MarketplaceStats | null
  /** Template atualmente selecionado para visualização detalhada */
  currentTemplate: MarketplaceTemplate | null
  /** Avaliações do template atualmente selecionado */
  currentTemplateReviews: TemplateReview[]
  /** Atualiza os filtros aplicados */
  setFilters: (filters: Partial<MarketplaceFilters>) => void
  /** Busca templates com base nos filtros atuais */
  fetchTemplates: () => Promise<void>
  /** Busca um template específico pelo ID */
  fetchTemplate: (id: string) => Promise<void>
  /** Busca avaliações de um template específico */
  fetchTemplateReviews: (templateId: string) => Promise<void>
  /** Busca estatísticas do marketplace */
  fetchMarketplaceStats: () => Promise<void>
  /** Publica um template no marketplace */
  publishTemplate: (template: NodeTemplate, userId: string) => Promise<MarketplaceTemplate>
  /** Instala um template do marketplace */
  installTemplate: (templateId: string) => Promise<void>
  /** Adiciona uma avaliação a um template */
  addReview: (templateId: string, userId: string, rating: number, comment: string) => Promise<void>
  /** Marca uma avaliação como útil */
  markReviewHelpful: (reviewId: string, templateId: string) => Promise<void>
}

/**
 * Contexto que fornece acesso às funcionalidades do marketplace.
 */
const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

/**
 * Provedor que disponibiliza o contexto do marketplace para a aplicação.
 * @param props - Propriedades do componente
 * @param props.children - Componentes filhos
 */
export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const { saveTemplate } = useTemplates()

  // Estado para armazenar templates e informações relacionadas
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([])
  const [featuredTemplates, setFeaturedTemplates] = useState<MarketplaceTemplate[]>([])
  const [popularTemplates, setPopularTemplates] = useState<MarketplaceTemplate[]>([])
  const [recentTemplates, setRecentTemplates] = useState<MarketplaceTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<MarketplaceStats | null>(null)
  const [currentTemplate, setCurrentTemplate] = useState<MarketplaceTemplate | null>(null)
  const [currentTemplateReviews, setCurrentTemplateReviews] = useState<TemplateReview[]>([])

  // Estado para armazenar filtros atuais
  const [filters, setFilters] = useState<MarketplaceFilters>({
    search: "",
    categories: [],
    tags: [],
    rating: null,
    pricing: [],
    sortBy: "popular",
  })

  /**
   * Busca templates com base nos filtros atuais.
   * Atualiza os estados de templates, templates destacados, populares e recentes.
   */
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Buscar templates com filtros atuais
      const templates = await MarketplaceService.getTemplates(filters)
      setTemplates(templates)

      // Buscar templates destacados, populares e recentes para a página inicial
      const featured = await MarketplaceService.getTemplates({ featured: true, sortBy: "popular" })
      setFeaturedTemplates(featured)

      const popular = await MarketplaceService.getTemplates({ sortBy: "downloads" })
      setPopularTemplates(popular.slice(0, 6))

      const recent = await MarketplaceService.getTemplates({ sortBy: "recent" })
      setRecentTemplates(recent.slice(0, 6))
    } catch (err) {
      const errorMessage = (err as Error).message || "Falha ao buscar templates"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters, toast])

  /**
   * Busca um template específico pelo ID.
   * @param id - ID do template a ser buscado
   */
  const fetchTemplate = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const template = await MarketplaceService.getTemplate(id)
        if (template) {
          setCurrentTemplate(template)
        } else {
          const errorMessage = "Template não encontrado"
          setError(errorMessage)
          toast({
            title: "Erro",
            description: errorMessage,
            variant: "destructive",
          })
        }
      } catch (err) {
        const errorMessage = (err as Error).message || "Falha ao buscar template"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  /**
   * Busca avaliações de um template específico.
   * @param templateId - ID do template
   */
  const fetchTemplateReviews = useCallback(
    async (templateId: string) => {
      setIsLoading(true)

      try {
        const reviews = await MarketplaceService.getTemplateReviews(templateId)
        setCurrentTemplateReviews(reviews)
      } catch (err) {
        toast({
          title: "Erro",
          description: (err as Error).message || "Falha ao buscar avaliações",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  /**
   * Busca estatísticas do marketplace.
   */
  const fetchMarketplaceStats = useCallback(async () => {
    setIsLoading(true)

    try {
      const stats = await MarketplaceService.getMarketplaceStats()
      setStats(stats)
    } catch (err) {
      toast({
        title: "Erro",
        description: (err as Error).message || "Falha ao buscar estatísticas do marketplace",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  /**
   * Publica um template no marketplace.
   * @param template - Template a ser publicado
   * @param userId - ID do usuário que está publicando
   * @returns Template publicado
   */
  const publishTemplate = useCallback(
    async (template: NodeTemplate, userId: string) => {
      setIsLoading(true)

      try {
        const publishedTemplate = await MarketplaceService.publishTemplate(template, userId)
        toast({
          title: "Sucesso",
          description: "Template publicado com sucesso",
        })

        // Atualizar templates
        fetchTemplates()

        return publishedTemplate
      } catch (err) {
        toast({
          title: "Erro",
          description: (err as Error).message || "Falha ao publicar template",
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [fetchTemplates, toast],
  )

  /**
   * Instala um template do marketplace.
   * @param templateId - ID do template a ser instalado
   */
  const installTemplate = useCallback(
    async (templateId: string) => {
      setIsLoading(true)

      try {
        const template = await MarketplaceService.installTemplate(templateId)

        // Salvar o template nos templates locais do usuário
        await saveTemplate(template.name, template.description, template.category, template.tags)

        toast({
          title: "Sucesso",
          description: "Template instalado com sucesso",
        })
      } catch (err) {
        toast({
          title: "Erro",
          description: (err as Error).message || "Falha ao instalar template",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [saveTemplate, toast],
  )

  /**
   * Adiciona uma avaliação a um template.
   * @param templateId - ID do template a ser avaliado
   * @param userId - ID do usuário que está avaliando
   * @param rating - Classificação (1-5)
   * @param comment - Comentário da avaliação
   */
  const addReview = useCallback(
    async (templateId: string, userId: string, rating: number, comment: string) => {
      setIsLoading(true)

      try {
        await MarketplaceService.addReview(templateId, userId, rating, comment)

        // Atualizar avaliações
        fetchTemplateReviews(templateId)

        // Atualizar template para atualizar classificação
        fetchTemplate(templateId)

        toast({
          title: "Sucesso",
          description: "Avaliação adicionada com sucesso",
        })
      } catch (err) {
        toast({
          title: "Erro",
          description: (err as Error).message || "Falha ao adicionar avaliação",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [fetchTemplate, fetchTemplateReviews, toast],
  )

  /**
   * Marca uma avaliação como útil.
   * @param reviewId - ID da avaliação
   * @param templateId - ID do template
   */
  const markReviewHelpful = useCallback(
    async (reviewId: string, templateId: string) => {
      try {
        await MarketplaceService.markReviewHelpful(reviewId, templateId)

        // Atualizar avaliações
        fetchTemplateReviews(templateId)
      } catch (err) {
        toast({
          title: "Erro",
          description: (err as Error).message || "Falha ao marcar avaliação como útil",
          variant: "destructive",
        })
      }
    },
    [fetchTemplateReviews, toast],
  )

  /**
   * Atualiza os filtros aplicados.
   * @param newFilters - Novos filtros a serem aplicados
   */
  const updateFilters = useCallback((newFilters: Partial<MarketplaceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Buscar templates quando os filtros mudarem
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Buscar estatísticas do marketplace na montagem
  useEffect(() => {
    fetchMarketplaceStats()
  }, [fetchMarketplaceStats])

  // Valor do contexto
  const value = {
    templates,
    featuredTemplates,
    popularTemplates,
    recentTemplates,
    isLoading,
    error,
    filters,
    stats,
    currentTemplate,
    currentTemplateReviews,
    setFilters: updateFilters,
    fetchTemplates,
    fetchTemplate,
    fetchTemplateReviews,
    fetchMarketplaceStats,
    publishTemplate,
    installTemplate,
    addReview,
    markReviewHelpful,
  }

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
}

/**
 * Hook para acessar o contexto do marketplace.
 * @returns Contexto do marketplace
 * @throws Error se usado fora de um MarketplaceProvider
 */
export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (context === undefined) {
    throw new Error("useMarketplace deve ser usado dentro de um MarketplaceProvider")
  }
  return context
}
