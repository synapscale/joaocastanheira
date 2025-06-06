import type {
  MarketplaceTemplate,
  TemplateReview,
  MarketplaceUser,
  MarketplaceStats,
  MarketplaceFilters,
} from "@/types/marketplace-template"
import type { NodeTemplate } from "@/types/node-template"

/**
 * Dados mockados para templates do marketplace.
 * Em um ambiente de produção, estes dados viriam de uma API real.
 */
const mockTemplates: MarketplaceTemplate[] = [
  {
    id: "template-marketplace-1",
    publishedId: "pub-1",
    name: "Advanced Data Processing Pipeline",
    description: "A comprehensive data processing workflow with filtering, transformation, and aggregation steps.",
    category: "data-processing",
    tags: ["data", "etl", "transformation", "filtering"],
    author: {
      id: "user-1",
      username: "data_wizard",
      displayName: "Data Wizard",
      avatarUrl: "/abstract-dw.png",
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    downloads: 1250,
    rating: 4.7,
    ratingCount: 48,
    verified: true,
    featured: true,
    pricing: {
      type: "free",
    },
    version: "1.2.0",
    compatibility: ["1.0.0", "1.1.0", "1.2.0"],
    license: "MIT",
    nodes: [
      {
        id: "node-1",
        type: "dataInput",
        name: "Data Input",
        description: "Receives data from an external source",
        position: { x: 100, y: 200 },
        inputs: [],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-2",
        type: "transform",
        name: "Transform",
        description: "Transforms data format",
        position: { x: 300, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-3",
        type: "filter",
        name: "Filter",
        description: "Filters data based on conditions",
        position: { x: 500, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-4",
        type: "aggregate",
        name: "Aggregate",
        description: "Aggregates data",
        position: { x: 700, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-5",
        type: "dataOutput",
        name: "Data Output",
        description: "Outputs processed data",
        position: { x: 900, y: 200 },
        inputs: ["input-1"],
        outputs: [],
        width: 70,
        height: 70,
      },
    ],
    connections: [
      {
        id: "conn-1",
        from: "node-1",
        to: "node-2",
        type: "bezier",
      },
      {
        id: "conn-2",
        from: "node-2",
        to: "node-3",
        type: "bezier",
      },
      {
        id: "conn-3",
        from: "node-3",
        to: "node-4",
        type: "bezier",
      },
      {
        id: "conn-4",
        from: "node-4",
        to: "node-5",
        type: "bezier",
      },
    ],
  },
  {
    id: "template-marketplace-2",
    publishedId: "pub-2",
    name: "API Integration Suite",
    description: "Connect to external APIs with authentication, data transformation, and error handling.",
    category: "api-integration",
    tags: ["api", "http", "integration", "webhook"],
    author: {
      id: "user-2",
      username: "api_master",
      displayName: "API Master",
      avatarUrl: "/abstract-am.png",
    },
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    downloads: 980,
    rating: 4.5,
    ratingCount: 32,
    verified: true,
    featured: false,
    pricing: {
      type: "free",
    },
    version: "1.0.0",
    compatibility: ["1.0.0", "1.1.0", "1.2.0"],
    license: "MIT",
    nodes: [
      {
        id: "node-1",
        type: "httpRequest",
        name: "HTTP Request",
        description: "Makes an HTTP request to an API",
        position: { x: 100, y: 200 },
        inputs: [],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-2",
        type: "jsonParse",
        name: "Parse JSON",
        description: "Parses JSON response",
        position: { x: 300, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-3",
        type: "errorHandler",
        name: "Error Handler",
        description: "Handles errors from the API",
        position: { x: 300, y: 350 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-4",
        type: "dataOutput",
        name: "Data Output",
        description: "Outputs processed data",
        position: { x: 500, y: 200 },
        inputs: ["input-1"],
        outputs: [],
        width: 70,
        height: 70,
      },
    ],
    connections: [
      {
        id: "conn-1",
        from: "node-1",
        to: "node-2",
        type: "bezier",
      },
      {
        id: "conn-2",
        from: "node-1",
        to: "node-3",
        type: "bezier",
      },
      {
        id: "conn-3",
        from: "node-2",
        to: "node-4",
        type: "bezier",
      },
    ],
  },
  {
    id: "template-marketplace-3",
    publishedId: "pub-3",
    name: "Email Marketing Automation",
    description: "Automate your email marketing campaigns with triggers, personalization, and analytics.",
    category: "automation",
    tags: ["email", "marketing", "automation", "analytics"],
    author: {
      id: "user-3",
      username: "marketing_pro",
      displayName: "Marketing Pro",
      avatarUrl: "/musical-performance.png",
    },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    downloads: 1560,
    rating: 4.8,
    ratingCount: 65,
    verified: true,
    featured: true,
    pricing: {
      type: "paid",
      price: 9.99,
      currency: "USD",
    },
    version: "2.1.0",
    compatibility: ["1.0.0", "1.1.0", "1.2.0"],
    license: "Commercial",
    nodes: [
      {
        id: "node-1",
        type: "trigger",
        name: "Trigger",
        description: "Triggers the workflow",
        position: { x: 100, y: 200 },
        inputs: [],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-2",
        type: "emailTemplate",
        name: "Email Template",
        description: "Creates an email template",
        position: { x: 300, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-3",
        type: "personalization",
        name: "Personalization",
        description: "Personalizes the email",
        position: { x: 500, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-4",
        type: "sendEmail",
        name: "Send Email",
        description: "Sends the email",
        position: { x: 700, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-5",
        type: "analytics",
        name: "Analytics",
        description: "Tracks email analytics",
        position: { x: 900, y: 200 },
        inputs: ["input-1"],
        outputs: [],
        width: 70,
        height: 70,
      },
    ],
    connections: [
      {
        id: "conn-1",
        from: "node-1",
        to: "node-2",
        type: "bezier",
      },
      {
        id: "conn-2",
        from: "node-2",
        to: "node-3",
        type: "bezier",
      },
      {
        id: "conn-3",
        from: "node-3",
        to: "node-4",
        type: "bezier",
      },
      {
        id: "conn-4",
        from: "node-4",
        to: "node-5",
        type: "bezier",
      },
    ],
  },
  {
    id: "template-marketplace-4",
    publishedId: "pub-4",
    name: "Social Media Scheduler",
    description: "Schedule and publish content across multiple social media platforms.",
    category: "automation",
    tags: ["social", "media", "scheduler", "content"],
    author: {
      id: "user-4",
      username: "social_guru",
      displayName: "Social Guru",
      avatarUrl: "/abstract-geometric-sg.png",
    },
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    downloads: 750,
    rating: 4.3,
    ratingCount: 28,
    verified: false,
    featured: false,
    pricing: {
      type: "free",
    },
    version: "1.0.0",
    compatibility: ["1.0.0", "1.1.0", "1.2.0"],
    license: "MIT",
    nodes: [
      {
        id: "node-1",
        type: "contentCreation",
        name: "Content Creation",
        description: "Creates social media content",
        position: { x: 100, y: 200 },
        inputs: [],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-2",
        type: "scheduler",
        name: "Scheduler",
        description: "Schedules content for publishing",
        position: { x: 300, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-3",
        type: "socialPublisher",
        name: "Social Publisher",
        description: "Publishes content to social media",
        position: { x: 500, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-4",
        type: "analytics",
        name: "Analytics",
        description: "Tracks social media analytics",
        position: { x: 700, y: 200 },
        inputs: ["input-1"],
        outputs: [],
        width: 70,
        height: 70,
      },
    ],
    connections: [
      {
        id: "conn-1",
        from: "node-1",
        to: "node-2",
        type: "bezier",
      },
      {
        id: "conn-2",
        from: "node-2",
        to: "node-3",
        type: "bezier",
      },
      {
        id: "conn-3",
        from: "node-3",
        to: "node-4",
        type: "bezier",
      },
    ],
  },
  {
    id: "template-marketplace-5",
    publishedId: "pub-5",
    name: "Customer Support Automation",
    description: "Automate customer support workflows with ticket routing, response templates, and analytics.",
    category: "automation",
    tags: ["support", "customer", "tickets", "automation"],
    author: {
      id: "user-5",
      username: "support_expert",
      displayName: "Support Expert",
      avatarUrl: "/stylized-letter-se.png",
    },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 88 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    downloads: 1200,
    rating: 4.6,
    ratingCount: 42,
    verified: true,
    featured: false,
    pricing: {
      type: "subscription",
      price: 19.99,
      currency: "USD",
    },
    version: "3.0.0",
    compatibility: ["1.0.0", "1.1.0", "1.2.0"],
    license: "Commercial",
    nodes: [
      {
        id: "node-1",
        type: "ticketCreation",
        name: "Ticket Creation",
        description: "Creates a support ticket",
        position: { x: 100, y: 200 },
        inputs: [],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-2",
        type: "ticketRouting",
        name: "Ticket Routing",
        description: "Routes tickets to the right department",
        position: { x: 300, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-3",
        type: "responseTemplate",
        name: "Response Template",
        description: "Creates a response template",
        position: { x: 500, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-4",
        type: "sendResponse",
        name: "Send Response",
        description: "Sends the response to the customer",
        position: { x: 700, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-5",
        type: "ticketResolution",
        name: "Ticket Resolution",
        description: "Resolves the ticket",
        position: { x: 900, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-6",
        type: "analytics",
        name: "Analytics",
        description: "Tracks support analytics",
        position: { x: 1100, y: 200 },
        inputs: ["input-1"],
        outputs: [],
        width: 70,
        height: 70,
      },
    ],
    connections: [
      {
        id: "conn-1",
        from: "node-1",
        to: "node-2",
        type: "bezier",
      },
      {
        id: "conn-2",
        from: "node-2",
        to: "node-3",
        type: "bezier",
      },
      {
        id: "conn-3",
        from: "node-3",
        to: "node-4",
        type: "bezier",
      },
      {
        id: "conn-4",
        from: "node-4",
        to: "node-5",
        type: "bezier",
      },
      {
        id: "conn-5",
        from: "node-5",
        to: "node-6",
        type: "bezier",
      },
    ],
  },
]

/**
 * Dados mockados para avaliações de templates.
 * Organizados por ID do template para facilitar a busca.
 */
const mockReviews: Record<string, TemplateReview[]> = {
  "template-marketplace-1": [
    {
      id: "review-1",
      templateId: "template-marketplace-1",
      userId: "user-10",
      username: "data_analyst",
      displayName: "Data Analyst",
      avatarUrl: "/abstract-geometric-da.png",
      rating: 5,
      comment:
        "This template saved me hours of work! The data processing pipeline is well-designed and easy to customize for my specific needs.",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      helpful: 12,
      reply: {
        userId: "user-1",
        username: "data_wizard",
        displayName: "Data Wizard",
        comment: "Thank you for your feedback! I'm glad it helped you save time.",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      id: "review-2",
      templateId: "template-marketplace-1",
      userId: "user-11",
      username: "etl_engineer",
      displayName: "ETL Engineer",
      avatarUrl: "/interconnected-electrical-elements.png",
      rating: 4,
      comment:
        "Great template overall. The transformation node could use some additional options, but it's a solid starting point.",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      helpful: 5,
    },
  ],
  "template-marketplace-2": [
    {
      id: "review-3",
      templateId: "template-marketplace-2",
      userId: "user-12",
      username: "integration_dev",
      displayName: "Integration Dev",
      avatarUrl: "/abstract-geometric-id.png",
      rating: 5,
      comment:
        "The error handling in this template is excellent. It's saved me from many potential issues in production.",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      helpful: 8,
      reply: {
        userId: "user-2",
        username: "api_master",
        displayName: "API Master",
        comment: "Error handling is indeed crucial for production systems. Glad it's working well for you!",
        createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  ],
}

/**
 * Dados mockados para usuários do marketplace.
 */
const mockUsers: MarketplaceUser[] = [
  {
    id: "user-1",
    username: "data_wizard",
    displayName: "Data Wizard",
    avatarUrl: "/abstract-dw.png",
    bio: "Data processing expert with 10+ years of experience in ETL and data pipelines.",
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    templates: 12,
    followers: 250,
  },
  {
    id: "user-2",
    username: "api_master",
    displayName: "API Master",
    avatarUrl: "/abstract-am.png",
    bio: "API integration specialist focusing on RESTful and GraphQL APIs.",
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    templates: 8,
    followers: 180,
  },
  {
    id: "user-3",
    username: "marketing_pro",
    displayName: "Marketing Pro",
    avatarUrl: "/musical-performance.png",
    bio: "Marketing automation expert helping businesses scale their marketing efforts.",
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    templates: 15,
    followers: 320,
  },
]

/**
 * Estatísticas mockadas do marketplace.
 */
const mockStats: MarketplaceStats = {
  totalTemplates: 250,
  totalDownloads: 25000,
  totalUsers: 1200,
  popularCategories: [
    { id: "automation", name: "Automation", count: 85 },
    { id: "data-processing", name: "Data Processing", count: 65 },
    { id: "api-integration", name: "API Integration", count: 50 },
  ],
  popularTags: [
    { name: "automation", count: 120 },
    { name: "data", count: 95 },
    { name: "api", count: 80 },
    { name: "integration", count: 75 },
    { name: "email", count: 60 },
  ],
}

/**
 * Simula um atraso de API para tornar o mock mais realista.
 * @param ms - Tempo de atraso em milissegundos
 * @returns Promise que resolve após o tempo especificado
 */
const simulateApiDelay = async (ms = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Filtra templates com base nos critérios especificados.
 * @param templates - Lista de templates a serem filtrados
 * @param filters - Critérios de filtragem a serem aplicados
 * @returns Lista de templates filtrados
 */
const filterTemplates = (templates: MarketplaceTemplate[], filters: MarketplaceFilters): MarketplaceTemplate[] => {
  return templates.filter((template) => {
    // Filtro por termo de busca
    const matchesSearch =
      !filters.search ||
      template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      template.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase())) ||
      template.author.displayName.toLowerCase().includes(filters.search.toLowerCase())

    // Filtro por categorias
    const matchesCategory = filters.categories.length === 0 || filters.categories.includes(template.category)

    // Filtro por tags
    const matchesTags = filters.tags.length === 0 || filters.tags.some((tag) => template.tags.includes(tag))

    // Filtro por classificação
    const matchesRating = filters.rating === null || template.rating >= filters.rating

    // Filtro por preço
    const matchesPricing = filters.pricing.length === 0 || filters.pricing.includes(template.pricing?.type || "free")

    // Filtro por autor
    const matchesAuthor = !filters.author || template.author.username === filters.author

    // Filtro por destaque
    const matchesFeatured = filters.featured === undefined || template.featured === filters.featured

    // Filtro por verificação
    const matchesVerified = filters.verified === undefined || template.verified === filters.verified

    return (
      matchesSearch &&
      matchesCategory &&
      matchesTags &&
      matchesRating &&
      matchesPricing &&
      matchesAuthor &&
      matchesFeatured &&
      matchesVerified
    )
  })
}

/**
 * Ordena templates com base no critério especificado.
 * @param templates - Lista de templates a serem ordenados
 * @param sortBy - Critério de ordenação
 * @returns Lista de templates ordenados
 */
const sortTemplates = (templates: MarketplaceTemplate[], sortBy: string): MarketplaceTemplate[] => {
  const sortedTemplates = [...templates]

  switch (sortBy) {
    case "popular":
      return sortedTemplates.sort((a, b) => b.downloads - a.downloads)
    case "recent":
      return sortedTemplates.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    case "rating":
      return sortedTemplates.sort((a, b) => b.rating - a.rating)
    case "downloads":
      return sortedTemplates.sort((a, b) => b.downloads - a.downloads)
    default:
      return sortedTemplates
  }
}

/**
 * Serviço para interação com a API do marketplace.
 * Fornece métodos para buscar, publicar e interagir com templates.
 */
export class MarketplaceService {
  /**
   * Obtém templates com filtros opcionais.
   * @param filters - Critérios de filtragem e ordenação
   * @returns Promise com a lista de templates filtrados
   */
  static async getTemplates(filters: Partial<MarketplaceFilters> = {}): Promise<MarketplaceTemplate[]> {
    await simulateApiDelay()

    const defaultFilters: MarketplaceFilters = {
      search: "",
      categories: [],
      tags: [],
      rating: null,
      pricing: [],
      sortBy: "popular",
    }

    const mergedFilters = { ...defaultFilters, ...filters }

    // Filtrar templates
    let filteredTemplates = filterTemplates(mockTemplates, mergedFilters)

    // Ordenar templates
    filteredTemplates = sortTemplates(filteredTemplates, mergedFilters.sortBy)

    return filteredTemplates
  }

  /**
   * Obtém um template específico pelo ID.
   * @param id - ID do template a ser buscado
   * @returns Promise com o template encontrado ou null
   */
  static async getTemplate(id: string): Promise<MarketplaceTemplate | null> {
    await simulateApiDelay()
    return mockTemplates.find((template) => template.id === id) || null
  }

  /**
   * Obtém avaliações de um template específico.
   * @param templateId - ID do template
   * @returns Promise com a lista de avaliações
   */
  static async getTemplateReviews(templateId: string): Promise<TemplateReview[]> {
    await simulateApiDelay()
    return mockReviews[templateId] || []
  }

  /**
   * Obtém informações de um usuário pelo ID.
   * @param userId - ID do usuário
   * @returns Promise com as informações do usuário ou null
   */
  static async getUser(userId: string): Promise<MarketplaceUser | null> {
    await simulateApiDelay()
    return mockUsers.find((user) => user.id === userId) || null
  }

  /**
   * Obtém templates publicados por um usuário específico.
   * @param userId - ID do usuário
   * @returns Promise com a lista de templates do usuário
   */
  static async getUserTemplates(userId: string): Promise<MarketplaceTemplate[]> {
    await simulateApiDelay()
    return mockTemplates.filter((template) => template.author.id === userId)
  }

  /**
   * Obtém estatísticas gerais do marketplace.
   * @returns Promise com as estatísticas do marketplace
   */
  static async getMarketplaceStats(): Promise<MarketplaceStats> {
    await simulateApiDelay()
    return mockStats
  }

  /**
   * Publica um template no marketplace.
   * @param template - Template a ser publicado
   * @param userId - ID do usuário que está publicando
   * @returns Promise com o template publicado
   * @throws Error se o usuário não for encontrado
   */
  static async publishTemplate(template: NodeTemplate, userId: string): Promise<MarketplaceTemplate> {
    await simulateApiDelay()

    // Encontrar o usuário
    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      throw new Error("Usuário não encontrado")
    }

    // Criar um novo template para o marketplace
    const marketplaceTemplate: MarketplaceTemplate = {
      ...template,
      id: `template-marketplace-${mockTemplates.length + 1}`,
      publishedId: `pub-${mockTemplates.length + 1}`,
      author: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      verified: false,
      featured: false,
      pricing: {
        type: "free",
      },
      version: "1.0.0",
      compatibility: ["1.0.0", "1.1.0", "1.2.0"],
      license: "MIT",
    }

    // Adicionar aos templates mockados
    mockTemplates.push(marketplaceTemplate)

    return marketplaceTemplate
  }

  /**
   * Atualiza um template publicado.
   * @param templateId - ID do template a ser atualizado
   * @param updates - Campos a serem atualizados
   * @returns Promise com o template atualizado
   * @throws Error se o template não for encontrado
   */
  static async updateTemplate(templateId: string, updates: Partial<MarketplaceTemplate>): Promise<MarketplaceTemplate> {
    await simulateApiDelay()

    const templateIndex = mockTemplates.findIndex((t) => t.id === templateId)
    if (templateIndex === -1) {
      throw new Error("Template não encontrado")
    }

    // Atualizar o template
    const updatedTemplate = {
      ...mockTemplates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    mockTemplates[templateIndex] = updatedTemplate

    return updatedTemplate
  }

  /**
   * Remove um template publicado.
   * @param templateId - ID do template a ser removido
   * @returns Promise com o resultado da operação
   * @throws Error se o template não for encontrado
   */
  static async deleteTemplate(templateId: string): Promise<boolean> {
    await simulateApiDelay()

    const templateIndex = mockTemplates.findIndex((t) => t.id === templateId)
    if (templateIndex === -1) {
      throw new Error("Template não encontrado")
    }

    // Remover o template
    mockTemplates.splice(templateIndex, 1)

    return true
  }

  /**
   * Adiciona uma avaliação a um template.
   * @param templateId - ID do template a ser avaliado
   * @param userId - ID do usuário que está avaliando
   * @param rating - Classificação (1-5)
   * @param comment - Comentário da avaliação
   * @returns Promise com a avaliação criada
   * @throws Error se o template ou usuário não for encontrado
   */
  static async addReview(templateId: string, userId: string, rating: number, comment: string): Promise<TemplateReview> {
    await simulateApiDelay()

    // Encontrar o template
    const template = mockTemplates.find((t) => t.id === templateId)
    if (!template) {
      throw new Error("Template não encontrado")
    }

    // Encontrar o usuário
    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      throw new Error("Usuário não encontrado")
    }

    // Criar uma nova avaliação
    const review: TemplateReview = {
      id: `review-${Date.now()}`,
      templateId,
      userId,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      helpful: 0,
    }

    // Adicionar às avaliações mockadas
    if (!mockReviews[templateId]) {
      mockReviews[templateId] = []
    }
    mockReviews[templateId].push(review)

    // Atualizar classificação do template
    const reviews = mockReviews[templateId]
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    template.rating = totalRating / reviews.length
    template.ratingCount = reviews.length

    return review
  }

  /**
   * Marca uma avaliação como útil.
   * @param reviewId - ID da avaliação
   * @param templateId - ID do template
   * @returns Promise com o resultado da operação
   * @throws Error se a avaliação não for encontrada
   */
  static async markReviewHelpful(reviewId: string, templateId: string): Promise<boolean> {
    await simulateApiDelay()

    // Encontrar a avaliação
    const reviews = mockReviews[templateId]
    if (!reviews) {
      throw new Error("Avaliações do template não encontradas")
    }

    const reviewIndex = reviews.findIndex((r) => r.id === reviewId)
    if (reviewIndex === -1) {
      throw new Error("Avaliação não encontrada")
    }

    // Incrementar contagem de útil
    reviews[reviewIndex].helpful += 1

    return true
  }

  /**
   * Instala um template do marketplace.
   * @param templateId - ID do template a ser instalado
   * @returns Promise com o template instalado
   * @throws Error se o template não for encontrado
   */
  static async installTemplate(templateId: string): Promise<NodeTemplate> {
    await simulateApiDelay()

    // Encontrar o template
    const template = mockTemplates.find((t) => t.id === templateId)
    if (!template) {
      throw new Error("Template não encontrado")
    }

    // Incrementar contagem de downloads
    template.downloads += 1

    // Converter para NodeTemplate
    const nodeTemplate: NodeTemplate = {
      id: `installed-${templateId}`,
      name: template.name,
      description: template.description,
      category: template.category,
      tags: template.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: template.nodes,
      connections: template.connections,
    }

    return nodeTemplate
  }
}
