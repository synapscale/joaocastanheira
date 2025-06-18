import type { AIModel } from "@/types/chat"

// Sistema inteligente de badges baseado em datas reais de lançamento
const getCurrentDate = () => new Date()
const getDaysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000)

// Datas de lançamento reais dos modelos (aproximadas)
const MODEL_RELEASE_DATES: Record<string, Date> = {
  // Modelos lançados recentemente (últimos 30 dias) = "Novo"
  "deepseek-r1": new Date("2025-01-20"), // Lançado em Janeiro 2025
  "deepseek-r1-small": new Date("2025-01-20"),
  "o3": new Date("2024-12-20"), // Lançado em Dezembro 2024
  "o3-mini": new Date("2024-12-20"),
  "o4-mini": new Date("2025-01-15"), // Fictício - futuro
  "o4-mini-high": new Date("2025-01-15"),
  "chatgpt-4.1": new Date("2025-01-10"), // Fictício - futuro
  "chatgpt-4.1-mini": new Date("2025-01-10"),
  "chatgpt-4.1-nano": new Date("2025-01-10"),
  
  // Modelos atualizados recentemente (últimos 60 dias) = "Atualizado"
  "deepseek-v3.1": new Date("2024-12-01"), // Atualização da V3
  "gemini-2.0-flash": new Date("2024-12-11"), // Lançado em Dezembro 2024
  "claude-3.5-haiku": new Date("2024-11-01"), // Lançado em Novembro 2024
  
  // Modelos estáveis (mais antigos)
  "chatgpt-4o": new Date("2024-05-13"), // Lançado em Maio 2024
  "chatgpt-4o-mini": new Date("2024-07-18"), // Lançado em Julho 2024
  "claude-3-opus": new Date("2024-03-04"), // Lançado em Março 2024
  "gemini-1.5-flash": new Date("2024-05-14"), // Lançado em Maio 2024
  "grok-2": new Date("2024-08-13"), // Lançado em Agosto 2024
  "llama-3.2-11b": new Date("2024-09-25"), // Lançado em Setembro 2024
}

// Modelos que são gratuitos/ilimitados (símbolo infinito)
const FREE_UNLIMITED_MODELS = [
  "chatgpt-4.1-nano", // Nano = versão gratuita
  "chatgpt-4o-mini", // Mini = versão gratuita
  "chatgpt-4o", // Modelo gratuito do OpenAI
  "chatgpt-4o-latest",
  "o4-mini-high", "o4-mini", // Mini = gratuito
  "o3-mini", "o3-mini-high", // Mini = gratuito
  "deepseek-r1-small", // Small = gratuito
  "qwen-2.5-32b", "qwen-2.5-coder-32b", "qwen-qwq-32b", // Qwen é open source
  "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash-thinking", 
  "gemini-2.5-pro", "gemini-1.5-flash", // Google oferece uso gratuito
  "claude-3.5-haiku", // Haiku = versão mais barata/gratuita
  "llama-3.3-70b", "llama-3.2-11b", // Llama é open source
]

// Modelos em Beta
const BETA_MODELS = [
  "gemini-2.5-flash", // Ainda em preview
  "gemini-2.0-flash-lite", // Versão experimental
  "gemini-2.0-flash-thinking", // Recurso experimental
  "gemini-2.5-pro", // Preview
]

// Função para determinar badges dinamicamente
const getModelBadges = (modelId: string) => {
  const releaseDate = MODEL_RELEASE_DATES[modelId]
  const currentDate = getCurrentDate()
  const thirtyDaysAgo = getDaysAgo(30)
  const sixtyDaysAgo = getDaysAgo(60)
  
  const badges = {
    isNew: false,
    isUpdated: false,
    isBeta: false,
    isInfinite: false,
  }
  
  // Determinar se é "Novo" (últimos 30 dias)
  if (releaseDate && releaseDate >= thirtyDaysAgo) {
    badges.isNew = true
  }
  // Determinar se é "Atualizado" (últimos 60 dias, mas não "novo")
  else if (releaseDate && releaseDate >= sixtyDaysAgo) {
    badges.isUpdated = true
  }
  
  // Determinar se é Beta
  badges.isBeta = BETA_MODELS.includes(modelId)
  
  // Determinar se é gratuito/ilimitado
  badges.isInfinite = FREE_UNLIMITED_MODELS.includes(modelId)
  
  return badges
}

// Lista centralizada de todos os modelos disponíveis
export const AVAILABLE_MODELS: AIModel[] = [
  // ChatGPT models
  { id: "chatgpt-4.1-nano", name: "ChatGPT 4.1 nano", provider: "openai", ...getModelBadges("chatgpt-4.1-nano") },
  { id: "chatgpt-4.1-mini", name: "ChatGPT 4.1 mini", provider: "openai", ...getModelBadges("chatgpt-4.1-mini") },
  { id: "chatgpt-4.1", name: "ChatGPT 4.1", provider: "openai", ...getModelBadges("chatgpt-4.1") },
  { id: "chatgpt-4o-mini", name: "ChatGPT 4o mini", provider: "openai", ...getModelBadges("chatgpt-4o-mini") },
  { id: "chatgpt-4o", name: "ChatGPT 4o", provider: "openai", ...getModelBadges("chatgpt-4o") },
  { id: "chatgpt-4o-latest", name: "ChatGPT 4o Latest", provider: "openai", ...getModelBadges("chatgpt-4o-latest") },

  // o models
  { id: "o4-mini-high", name: "o4 mini High", provider: "openai", ...getModelBadges("o4-mini-high") },
  { id: "o4-mini", name: "o4 mini", provider: "openai", ...getModelBadges("o4-mini") },
  { id: "o3", name: "o3", provider: "openai", ...getModelBadges("o3") },
  { id: "o3-mini", name: "o3 mini", provider: "openai", ...getModelBadges("o3-mini") },
  { id: "o3-mini-high", name: "o3 mini High", provider: "openai", ...getModelBadges("o3-mini-high") },
  { id: "o1", name: "o1", provider: "openai", ...getModelBadges("o1") },
  { id: "o1-mini", name: "o1 mini", provider: "openai", ...getModelBadges("o1-mini") },

  // DeepSeek models
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "deepseek", ...getModelBadges("deepseek-r1") },
  { id: "deepseek-r1-small", name: "DeepSeek R1 Small", provider: "deepseek", ...getModelBadges("deepseek-r1-small") },
  { id: "deepseek-v3.1", name: "DeepSeek V3.1", provider: "deepseek", ...getModelBadges("deepseek-v3.1") },

  // Qwen models
  { id: "qwen-2.5-32b", name: "Qwen 2.5 32B", provider: "qwen", ...getModelBadges("qwen-2.5-32b") },
  { id: "qwen-2.5-coder-32b", name: "Qwen 2.5 Coder 32B", provider: "qwen", ...getModelBadges("qwen-2.5-coder-32b") },
  { id: "qwen-qwq-32b", name: "Qwen QwQ 32B", provider: "qwen", ...getModelBadges("qwen-qwq-32b") },

  // Gemini models
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google", ...getModelBadges("gemini-2.5-flash") },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", ...getModelBadges("gemini-2.0-flash") },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", provider: "google", ...getModelBadges("gemini-2.0-flash-lite") },
  {
    id: "gemini-2.0-flash-thinking",
    name: "Gemini 2.0 Flash Thinking",
    provider: "google",
    ...getModelBadges("gemini-2.0-flash-thinking"),
  },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google", ...getModelBadges("gemini-2.5-pro") },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google", ...getModelBadges("gemini-1.5-flash") },

  // Claude models
  { id: "claude-3.5-haiku", name: "Claude 3.5 Haiku", provider: "anthropic", ...getModelBadges("claude-3.5-haiku") },
  { id: "claude-3.7-sonnet", name: "Claude 3.7 Sonnet", provider: "anthropic", ...getModelBadges("claude-3.7-sonnet") },
  { id: "claude-3.7-sonnet-thinking", name: "Claude 3.7 Sonnet Thinking", provider: "anthropic", ...getModelBadges("claude-3.7-sonnet-thinking") },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "anthropic", ...getModelBadges("claude-3-opus") },

  // Grok models
  { id: "grok-3-mini", name: "Grok 3 mini", provider: "xai", ...getModelBadges("grok-3-mini") },
  { id: "grok-3-mini-fast", name: "Grok 3 mini Fast", provider: "xai", ...getModelBadges("grok-3-mini-fast") },
  { id: "grok-3", name: "Grok 3", provider: "xai", ...getModelBadges("grok-3") },
  { id: "grok-3-fast", name: "Grok 3 Fast", provider: "xai", ...getModelBadges("grok-3-fast") },
  { id: "grok-2", name: "Grok 2", provider: "xai", ...getModelBadges("grok-2") },

  // Llama models
  { id: "llama-4-maverick", name: "Llama 4 Maverick", provider: "meta", ...getModelBadges("llama-4-maverick") },
  { id: "llama-4-scout", name: "Llama 4 Scout", provider: "meta", ...getModelBadges("llama-4-scout") },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "meta", ...getModelBadges("llama-3.3-70b") },
  { id: "llama-3.2-11b", name: "Llama 3.2 11B", provider: "meta", ...getModelBadges("llama-3.2-11b") },
]

// Função para converter AIModel para ModelItem (formato da sidebar)
export const convertToModelItem = (model: AIModel) => ({
  id: model.id,
  name: model.name,
  enabled: true,
  maxOnly: false // Pode ser ajustado conforme necessário
})

// Lista de modelos para a sidebar de configurações
export const SETTINGS_MODELS = AVAILABLE_MODELS.map(convertToModelItem) 