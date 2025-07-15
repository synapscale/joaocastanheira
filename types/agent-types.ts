import type React from "react"
// Common types used across the agent management interface

export interface BadgeItem {
  id: string
  label: string
}

// Base agent data interface
export interface Agent {
  id: string
  name: string
  type: string
  model: string
  prompt?: string
  description?: string
  status?: "active" | "draft" | "archived"
  maxTokens?: number
  temperature?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stopSequences?: string[]
  userDecision?: boolean
  urls?: Array<BadgeItem>
  agents?: Array<BadgeItem>
  createdAt: string
  updatedAt: string
}

// Full agent data with required fields for the form
export interface AgentFormData {
  id: string
  name: string
  type: string
  prompt: string
  model: string
  status: "active" | "draft" | "archived"
  description: string
  maxTokens: number
  temperature: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string[]
  userDecision: boolean
  urls: Array<BadgeItem>
  agents: Array<BadgeItem>
  createdAt: string
  updatedAt: string
}

// Validation errors for agent form
export type AgentFormErrors = Partial<Record<keyof AgentFormData, string>>

// Prompt tool interface
export interface PromptTool {
  id: string
  name: string
  iconId?: string
}

// Model options
export interface SelectOption {
  value: string
  label: string
}

/**
 * Utility to map API Agent (from apiService) to UI Agent type (for components)
 */
export function mapApiAgentToUiAgent(apiAgent: any): Agent {
  return {
    id: apiAgent.id,
    name: apiAgent.name,
    type: apiAgent.type || apiAgent.agent_type || "custom",
    model: apiAgent.model || apiAgent.model_name || "",
    prompt: apiAgent.prompt,
    description: apiAgent.description,
    status: apiAgent.status as Agent["status"],
    maxTokens: apiAgent.maxTokens || apiAgent.max_tokens,
    temperature: apiAgent.temperature,
    topP: apiAgent.topP,
    frequencyPenalty: apiAgent.frequencyPenalty,
    presencePenalty: apiAgent.presencePenalty,
    stopSequences: apiAgent.stopSequences,
    userDecision: apiAgent.userDecision,
    urls: apiAgent.urls,
    agents: apiAgent.agents,
    createdAt: apiAgent.createdAt || apiAgent.created_at || "",
    updatedAt: apiAgent.updatedAt || apiAgent.updated_at || "",
  };
}
