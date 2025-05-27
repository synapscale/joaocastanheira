"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { CollectionDetails } from "@/components/marketplace/collection-details"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Share, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [collection, setCollection] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    // Simulate loading collection data
    const loadCollection = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCollection({
        id: params.id,
        name: "Coleção de IA Avançada",
        description: "Uma coleção completa de componentes e skills para inteligência artificial",
        author: "João Silva",
        items: 12,
        likes: 45,
        tags: ["IA", "Machine Learning", "NLP"],
        createdAt: "2024-01-15",
        updatedAt: "2024-01-20",
      })
      setIsLoading(false)
    }

    if (params.id) {
      loadCollection()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{collection?.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">{collection?.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Por {collection?.author}</span>
          <span>•</span>
          <span>{collection?.items} itens</span>
          <span>•</span>
          <span>{collection?.likes} curtidas</span>
          <span>•</span>
          <span>Atualizado em {collection?.updatedAt}</span>
        </div>

        <div className="flex gap-2 mt-4">
          {collection?.tags?.map((tag: string) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <CollectionDetails collectionId={params.id as string} />
      </div>
    </div>
  )
}
