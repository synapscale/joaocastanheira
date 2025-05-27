import type React from "react"
/**
 * Tipos relacionados ao chat
 *
 * Este arquivo contém as definições de tipos para mensagens, modelos de IA,
 * conversas e outras estruturas de dados relacionadas ao chat.
 */

/**
 * Tipos de papel que uma mensagem pode ter
 */
export type MessageRole = "user" | "assistant" | "system"

/**
 * Status de processamento de uma mensagem
 */
export type MessageStatus = "sending" | "sent" | "error" | "pending" | "complete"

/**
 * Tipos de reação que uma mensagem pode receber
 */
export type MessageReaction = "like" | "dislike" | null

/**
 * Representa uma mensagem no chat
 */
export interface Message {
  /** ID único da mensagem - formato recomendado: `msg_${timestamp}` */
  id: string

  /** Papel do remetente da mensagem */
  role: MessageRole

  /** Conteúdo da mensagem - pode conter markdown e referências a componentes */
  content: string

  /** Modelo de IA usado para gerar a mensagem (apenas para mensagens do assistente) */
  model?: string

  /** Indica se a mensagem representa um erro */
  isError?: boolean

  /** Status de processamento da mensagem */
  status?: MessageStatus

  /** Timestamp de quando a mensagem foi criada (em milissegundos) */
  timestamp?: number

  /** Reação do usuário à mensagem */
  reaction?: MessageReaction

  /** Metadados adicionais da mensagem */
  metadata?: Record<string, any>
}

/**
 * Categorias de modelos de IA
 */
export type ModelCategory = "text" | "image" | "audio" | "video" | "multimodal"

/**
 * Capacidades de um modelo de IA
 */
export interface ModelCapabilities {
  /** Suporta geração de imagens */
  imageGeneration?: boolean

  /** Suporta análise de imagens */
  imageAnalysis?: boolean

  /** Suporta geração de áudio */
  audioGeneration?: boolean

  /** Suporta transcrição de áudio */
  audioTranscription?: boolean

  /** Suporta geração de vídeo */
  videoGeneration?: boolean

  /** Suporta análise de vídeo */
  videoAnalysis?: boolean

  /** Suporta chamadas de ferramentas/funções */
  toolCalling?: boolean

  /** Suporta contexto de longa duração */
  longContext?: boolean

  /** Suporta fine-tuning */
  fineTuning?: boolean

  /** Tamanho máximo do contexto (em tokens) */
  maxContextLength?: number
}

/**
 * Representa um modelo de IA disponível
 */
export interface AIModel {
  /** ID único do modelo - deve ser consistente com a API */
  id: string

  /** Nome de exibição do modelo */
  name: string

  /** Descrição do modelo e suas capacidades */
  description?: string

  /** Provedor do modelo (ex: "openai", "anthropic", "google", "mistral") */
  provider: string

  /** Categoria principal do modelo */
  category?: ModelCategory

  /** Capacidades específicas do modelo */
  capabilities?: ModelCapabilities

  /** Indica se o modelo é novo (adicionado recentemente) */
  isNew?: boolean

  /** Indica se o modelo tem contexto infinito */
  isInfinite?: boolean

  /** Indica se o modelo está em beta */
  isBeta?: boolean

  /** Indica se o modelo foi atualizado recentemente */
  isUpdated?: boolean

  /** URL do ícone do modelo (opcional) */
  iconUrl?: string

  /** Custo estimado por 1K tokens de entrada */
  costPerInputToken?: number

  /** Custo estimado por 1K tokens de saída */
  costPerOutputToken?: number

  /** Metadados adicionais específicos do modelo */
  metadata?: Record<string, any>
}

/**
 * Tipos de ferramentas disponíveis
 */
export type ToolType = "search" | "database" | "file" | "api" | "calculator" | "custom"

/**
 * Representa uma ferramenta que pode ser usada pelo assistente
 */
export interface Tool {
  /** ID único da ferramenta */
  id: string

  /** Nome de exibição da ferramenta */
  name: string

  /** Descrição da ferramenta e suas capacidades */
  description?: string

  /** Tipo da ferramenta */
  type: ToolType

  /** Ícone da ferramenta (componente React) */
  icon: React.ReactNode

  /** Categoria da ferramenta para agrupamento */
  category?: string

  /** Indica se a ferramenta é nova */
  isNew?: boolean

  /** Indica se a ferramenta é paga */
  isPaid?: boolean

  /** Indica se a ferramenta está em período de teste */
  isTrial?: boolean

  /** Parâmetros necessários para a ferramenta */
  parameters?: Record<string, any>

  /** Metadados adicionais da ferramenta */
  metadata?: Record<string, any>
}

/**
 * Representa uma personalidade que pode ser aplicada ao assistente
 */
export interface Personality {
  /** ID único da personalidade */
  id: string

  /** Nome de exibição da personalidade */
  name: string

  /** Descrição da personalidade */
  description: string

  /** Instrução de sistema que define a personalidade */
  systemPrompt?: string

  /** Ícone da personalidade (opcional) */
  icon?: React.ReactNode

  /** Metadados adicionais da personalidade */
  metadata?: Record<string, any>
}

/**
 * Representa uma conversa completa
 */
export interface Conversation {
  /** ID único da conversa - formato recomendado: `conv_${timestamp}` */
  id: string

  /** Título da conversa */
  title: string

  /** Lista de mensagens na conversa */
  messages: Message[]

  /** Timestamp de quando a conversa foi criada (em milissegundos) */
  createdAt: number

  /** Timestamp da última atualização da conversa (em milissegundos) */
  updatedAt: number

  /** Modelo de IA usado na conversa */
  model?: string

  /** Metadados adicionais da conversa */
  metadata?: {
    /** Modelo de IA usado */
    model?: string

    /** Ferramenta usada */
    tool?: string

    /** Personalidade do assistente */
    personality?: string

    /** Tags para categorização */
    tags?: string[]

    /** Indicador de favorito */
    isFavorite?: boolean

    /** Outros metadados */
    [key: string]: any
  }
}

/**
 * Representa um preset de configuração do chat
 */
export interface ChatPreset {
  /** ID único do preset */
  id: string
  /** Nome do preset */
  name: string
  /** Descrição do preset */
  description?: string
  /** Modelo de IA usado */
  model: string
  /** Ferramenta usada */
  tool: string
  /** Personalidade do assistente */
  personality: string
  /** Timestamp de quando o preset foi criado (em milissegundos) */
  createdAt: number
  /** Se o preset é um favorito */
  isFavorite: boolean
}

/**
 * Preferências do usuário
 */
export interface UserPreferences {
  /** Tema da interface (claro ou escuro) */
  theme: "light" | "dark" | "system"

  /** Modelos recentemente usados */
  recentModels: AIModel[]

  /** Ferramentas recentemente usadas */
  recentTools: string[]

  /** Personalidades recentemente usadas */
  recentPersonalities: string[]

  /** Modelos favoritos */
  favoriteModels: string[]

  /** Conversas favoritas */
  favoriteConversations: string[]

  /** Configurações de interface */
  interface: {
    /** Mostrar configurações por padrão */
    showConfigByDefault: boolean

    /** Tamanho da fonte */
    fontSize: "small" | "medium" | "large"

    /** Densidade da interface */
    density: "compact" | "comfortable" | "spacious"
  }

  /** Configurações de notificação */
  notifications: {
    /** Notificações sonoras */
    sound: boolean

    /** Notificações de desktop */
    desktop: boolean
  }

  /** Outras preferências */
  [key: string]: any
}
