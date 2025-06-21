/**
 * Model name mapping utility
 * Maps frontend model names to actual API model names
 */

export interface ModelMapping {
  /** Frontend model name */
  frontend: string
  /** Actual API model name */
  api: string
  /** Model provider */
  provider: string
}

/**
 * Model mappings from frontend to API names
 */
const MODEL_MAPPINGS: ModelMapping[] = [
  // OpenAI ChatGPT models
  { frontend: 'chatgpt-4o', api: 'gpt-4o', provider: 'openai' },
  { frontend: 'chatgpt-4o-mini', api: 'gpt-4o-mini', provider: 'openai' },
  { frontend: 'chatgpt-4o-latest', api: 'gpt-4o', provider: 'openai' },
  { frontend: 'chatgpt-4.1', api: 'gpt-4', provider: 'openai' },
  { frontend: 'chatgpt-4.1-mini', api: 'gpt-4', provider: 'openai' },
  { frontend: 'chatgpt-4.1-nano', api: 'gpt-4', provider: 'openai' },
  
  // OpenAI o-series models
  { frontend: 'o1', api: 'o1', provider: 'openai' },
  { frontend: 'o1-mini', api: 'o1-mini', provider: 'openai' },
  { frontend: 'o3', api: 'o3', provider: 'openai' },
  { frontend: 'o3-mini', api: 'o3-mini', provider: 'openai' },
  { frontend: 'o3-mini-high', api: 'o3-mini', provider: 'openai' },
  { frontend: 'o4-mini', api: 'o1-mini', provider: 'openai' }, // Fallback
  { frontend: 'o4-mini-high', api: 'o1-mini', provider: 'openai' }, // Fallback
  
  // Anthropic Claude models
  { frontend: 'claude-3.5-haiku', api: 'claude-3-5-haiku-20241022', provider: 'anthropic' },
  { frontend: 'claude-3.7-sonnet', api: 'claude-3-5-sonnet-20241022', provider: 'anthropic' },
  { frontend: 'claude-3.7-sonnet-thinking', api: 'claude-3-5-sonnet-20241022', provider: 'anthropic' },
  { frontend: 'claude-3-opus', api: 'claude-3-opus-20240229', provider: 'anthropic' },
  
  // Google Gemini models
  { frontend: 'gemini-1.5-flash', api: 'gemini-1.5-flash', provider: 'google' },
  { frontend: 'gemini-2.0-flash', api: 'gemini-2.0-flash-exp', provider: 'google' },
  { frontend: 'gemini-2.0-flash-lite', api: 'gemini-2.0-flash-thinking-exp', provider: 'google' },
  { frontend: 'gemini-2.0-flash-thinking', api: 'gemini-2.0-flash-thinking-exp', provider: 'google' },
  { frontend: 'gemini-2.5-flash', api: 'gemini-2.0-flash-exp', provider: 'google' }, // Fallback
  { frontend: 'gemini-2.5-pro', api: 'gemini-pro', provider: 'google' },
  
  // DeepSeek models
  { frontend: 'deepseek-r1', api: 'deepseek-r1', provider: 'deepseek' },
  { frontend: 'deepseek-r1-small', api: 'deepseek-r1-small', provider: 'deepseek' },
  { frontend: 'deepseek-v3.1', api: 'deepseek-v3.1', provider: 'deepseek' },
  
  // Qwen models
  { frontend: 'qwen-2.5-32b', api: 'qwen-2.5-32b', provider: 'qwen' },
  { frontend: 'qwen-2.5-coder-32b', api: 'qwen-2.5-coder-32b', provider: 'qwen' },
  { frontend: 'qwen-qwq-32b', api: 'qwen-qwq-32b', provider: 'qwen' },
  
  // xAI Grok models
  { frontend: 'grok-2', api: 'grok-2', provider: 'xai' },
  { frontend: 'grok-3', api: 'grok-3', provider: 'xai' },
  { frontend: 'grok-3-fast', api: 'grok-3-fast', provider: 'xai' },
  { frontend: 'grok-3-mini', api: 'grok-3-mini', provider: 'xai' },
  { frontend: 'grok-3-mini-fast', api: 'grok-3-mini-fast', provider: 'xai' },
  
  // Meta Llama models
  { frontend: 'llama-4-maverick', api: 'llama-4-maverick', provider: 'meta' },
]

/**
 * Create model mapping lookup tables
 */
const FRONTEND_TO_API = new Map(MODEL_MAPPINGS.map(m => [m.frontend, m.api]))
const FRONTEND_TO_PROVIDER = new Map(MODEL_MAPPINGS.map(m => [m.frontend, m.provider]))
const API_TO_FRONTEND = new Map(MODEL_MAPPINGS.map(m => [m.api, m.frontend]))

/**
 * Map frontend model name to API model name
 * @param frontendModelName The model name used in the frontend
 * @returns The actual API model name
 */
export function mapToApiModelName(frontendModelName: string): string {
  return FRONTEND_TO_API.get(frontendModelName) || frontendModelName
}

/**
 * Map API model name to frontend model name
 * @param apiModelName The actual API model name
 * @returns The frontend model name
 */
export function mapToFrontendModelName(apiModelName: string): string {
  return API_TO_FRONTEND.get(apiModelName) || apiModelName
}

/**
 * Get provider for a frontend model name
 * @param frontendModelName The model name used in the frontend
 * @returns The provider name
 */
export function getProviderFromModel(frontendModelName: string): string {
  return FRONTEND_TO_PROVIDER.get(frontendModelName) || 'openai'
}

/**
 * Check if a model name is a frontend model name
 * @param modelName The model name to check
 * @returns True if it's a frontend model name
 */
export function isFrontendModelName(modelName: string): boolean {
  return FRONTEND_TO_API.has(modelName)
}

/**
 * Check if a model name is an API model name
 * @param modelName The model name to check
 * @returns True if it's an API model name
 */
export function isApiModelName(modelName: string): boolean {
  return API_TO_FRONTEND.has(modelName)
}

/**
 * Get all available model mappings
 * @returns Array of all model mappings
 */
export function getAllModelMappings(): ModelMapping[] {
  return [...MODEL_MAPPINGS]
}

/**
 * Get all frontend model names
 * @returns Array of frontend model names
 */
export function getFrontendModelNames(): string[] {
  return MODEL_MAPPINGS.map(m => m.frontend)
}

/**
 * Get all API model names
 * @returns Array of API model names
 */
export function getApiModelNames(): string[] {
  return MODEL_MAPPINGS.map(m => m.api)
}

/**
 * Get models by provider
 * @param provider The provider name
 * @returns Array of model mappings for the provider
 */
export function getModelsByProvider(provider: string): ModelMapping[] {
  return MODEL_MAPPINGS.filter(m => m.provider === provider)
} 