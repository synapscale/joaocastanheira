"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Download, ArrowRight } from "lucide-react"
import { fetchMarketplaceNodes } from "@/lib/marketplace-api"
import type { MarketplaceNode } from "@/types/marketplace"

export function PopularMarketplaceNodes() {
  const router = useRouter()
  const [popularNodes, setPopularNodes] = useState<MarketplaceNode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPopularNodes = async () => {
      try {
        setIsLoading(true)
        const nodes = await fetchMarketplaceNodes()
        // Ordenar por downloads e pegar os 4 mais populares
        const popular = nodes.sort((a, b) => b.downloads - a.downloads).slice(0, 4)
        setPopularNodes(popular)
        setIsLoading(false)
      } catch (err) {
        console.error("Falha ao carregar nós populares", err)
        setIsLoading(false)
      }
    }

    loadPopularNodes()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nós Populares do Marketplace</CardTitle>
          <CardDescription>Descubra os nós mais utilizados pela comunidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Nós Populares do Marketplace</CardTitle>
          <CardDescription>Descubra os nós mais utilizados pela comunidade</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/marketplace")} className="gap-1">
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularNodes.map((node) => (
            <div
              key={node.id}
              className="flex gap-3 group cursor-pointer"
              onClick={() => router.push(`/marketplace?node=${node.id}`)}
            >
              <div
                className="h-10 w-10 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: node.color || "#e2e8f0" }}
              >
                <span className="text-white">{node.icon || node.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">{node.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span>{node.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{node.downloads.toLocaleString()}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {node.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
