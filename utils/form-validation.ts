import type { AgentFormData, AgentFormErrors } from "@/types/agent-types"

/**
 * Validates the agent form data
 * @param values The form values to validate
 * @returns An object containing validation errors, if any
 */
export const validateAgentForm = (values: AgentFormData): AgentFormErrors => {
  const errors: AgentFormErrors = {}

  // Name validation
  if (!values.name.trim()) {
    errors.name = "O nome do agente é obrigatório"
  } else if (values.name.length < 3) {
    errors.name = "O nome deve ter pelo menos 3 caracteres"
  } else if (values.name.length > 50) {
    errors.name = "O nome deve ter no máximo 50 caracteres"
  }

  // Prompt validation
  if (!values.prompt.trim()) {
    errors.prompt = "O prompt do agente é obrigatório"
  } else if (values.prompt.length < 50) {
    errors.prompt = "O prompt deve ser mais detalhado (mínimo 50 caracteres)"
  }

  // Max tokens validation
  if (values.maxTokens !== undefined) {
    if (isNaN(values.maxTokens) || values.maxTokens < 1) {
      errors.maxTokens = "O valor deve ser um número positivo"
    } else if (values.maxTokens > 32000) {
      errors.maxTokens = "O valor máximo é 32000"
    }
  }

  // Temperature validation
  if (values.temperature !== undefined) {
    if (isNaN(values.temperature) || values.temperature < 0) {
      errors.temperature = "O valor deve ser um número positivo"
    } else if (values.temperature > 2) {
      errors.temperature = "O valor máximo é 2"
    }
  }

  // Top P validation
  if (values.topP !== undefined) {
    if (isNaN(values.topP) || values.topP < 0 || values.topP > 1) {
      errors.topP = "O valor deve estar entre 0 e 1"
    }
  }

  // Frequency penalty validation
  if (values.frequencyPenalty !== undefined) {
    if (isNaN(values.frequencyPenalty) || values.frequencyPenalty < -2 || values.frequencyPenalty > 2) {
      errors.frequencyPenalty = "O valor deve estar entre -2 e 2"
    }
  }

  // Presence penalty validation
  if (values.presencePenalty !== undefined) {
    if (isNaN(values.presencePenalty) || values.presencePenalty < -2 || values.presencePenalty > 2) {
      errors.presencePenalty = "O valor deve estar entre -2 e 2"
    }
  }

  return errors
}
