import type { MarketplaceNode, NodeReview } from "@/types/marketplace"

// Função para buscar nós do marketplace
export async function fetchMarketplaceNodes(): Promise<MarketplaceNode[]> {
  // TODO: Implementar chamada real para a API do marketplace
  throw new Error('API do marketplace não implementada. Use apenas APIs reais.')
}

// Função para buscar avaliações de um nó
export async function fetchNodeReviews(nodeId: string): Promise<NodeReview[]> {
  // TODO: Implementar chamada real para a API de reviews
  throw new Error('API de reviews não implementada. Use apenas APIs reais.')
} 