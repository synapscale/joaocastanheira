"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star } from "lucide-react"
import { fetchNodeReviews } from "@/lib/marketplace-api"
import type { NodeReview } from "@/types/marketplace"

interface NodeReviewsProps {
  nodeId: string
}

export function NodeReviews({ nodeId }: NodeReviewsProps) {
  const [reviews, setReviews] = useState<NodeReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newReview, setNewReview] = useState("")
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)

  // Carregar avaliações
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true)
        const data = await fetchNodeReviews(nodeId)
        setReviews(data)
        setIsLoading(false)
      } catch (err) {
        setError("Falha ao carregar avaliações")
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [nodeId])

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  // Função para renderizar estrelas
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
    ))
  }

  // Função para enviar uma nova avaliação
  const handleSubmitReview = () => {
    if (newReview.trim() === "" || rating === 0) return

    // Em um app real, isso enviaria a avaliação para o servidor
    const newReviewObj: NodeReview = {
      id: `review-${Date.now()}`,
      node_id: nodeId,
      user: {
        id: "current-user",
        name: "Você",
        avatar: null,
      },
      rating,
      comment: newReview,
      created_at: new Date().toISOString(),
    }

    setReviews([newReviewObj, ...reviews])
    setNewReview("")
    setRating(0)
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline">Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Formulário de nova avaliação */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Deixe sua avaliação</h3>

        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-6 w-6 cursor-pointer ${
                i < (hoveredRating || rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              }`}
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoveredRating(i + 1)}
              onMouseLeave={() => setHoveredRating(0)}
            />
          ))}
        </div>

        <Textarea
          placeholder="Compartilhe sua experiência com este nó..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          className="min-h-[100px]"
        />

        <Button onClick={handleSubmitReview} disabled={newReview.trim() === "" || rating === 0}>
          Enviar Avaliação
        </Button>
      </div>

      <Separator />

      {/* Lista de avaliações */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Avaliações ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <p className="text-muted-foreground">Seja o primeiro a avaliar este nó!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="space-y-2">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.user.avatar || undefined} />
                    <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{review.user.name}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-2 text-sm">{review.comment}</p>
                  </div>
                </div>

                {review.reply && (
                  <div className="ml-14 p-3 bg-muted rounded-md">
                    <p className="text-xs font-medium mb-1">Resposta do autor</p>
                    <p className="text-sm">{review.reply.comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(review.reply.created_at)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
