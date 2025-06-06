import type { NodePort, NodeParameter } from "./node-definition"

// Usuário do marketplace
export interface MarketplaceUser {
  id: string
  name: string
  avatar: string | null
}

// Nó do marketplace
export interface MarketplaceNode {
  id: string
  name: string
  type: string
  category: string
  description: string
  version: string
  author: string
  icon?: string
  color?: string
  tags?: string[]
  rating: number
  downloads: number
  trending_score: number
  published_at: string
  updated_at?: string
  inputs?: NodePort[]
  outputs?: NodePort[]
  parameters?: NodeParameter[]
  code_template?: string
  documentation?: string
}

// Resposta a uma avaliação
export interface ReviewReply {
  user: MarketplaceUser
  comment: string
  created_at: string
}

// Avaliação de um nó
export interface NodeReview {
  id: string
  node_id: string
  user: MarketplaceUser
  rating: number
  comment: string
  created_at: string
  reply?: ReviewReply
}

// Estatísticas de um nó
export interface NodeStats {
  total_downloads: number
  average_rating: number
  total_reviews: number
  installations_last_month: number
}
