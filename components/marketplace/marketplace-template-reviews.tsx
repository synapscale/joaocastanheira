"use client"

import { useState } from "react"
import { useMarketplace } from "@/context/marketplace-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star, ThumbsUp } from "lucide-react"
import type { TemplateReview } from "@/types/marketplace-template"

/**
 * Props para o componente MarketplaceTemplateReviews.
 */
interface MarketplaceTemplateReviewsProps {
  /** Lista de avaliações do template */
  reviews: TemplateReview[]
  /** ID do template sendo avaliado */
  templateId: string
}

/**
 * Componente que exibe e gerencia avaliações de um template.
 * Permite visualizar avaliações existentes e adicionar novas avaliações.
 *
 * @param props - Propriedades do componente
 * @param props.reviews - Lista de avaliações do template
 * @param props.templateId - ID do template sendo avaliado
 */
export function MarketplaceTemplateReviews({ reviews, templateId }: MarketplaceTemplateReviewsProps) {
  const { addReview, markReviewHelpful } = useMarketplace()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Manipula o envio de uma nova avaliação.
   * Valida, envia e reseta o formulário após o envio.
   */
  const handleSubmitReview = async () => {
    if (!comment.trim()) return

    setIsSubmitting(true)
    try {
      // Em uma aplicação real, obteríamos o ID do usuário da autenticação
      const userId = "user-10"
      await addReview(templateId, userId, rating, comment)
      setComment("")
      setRating(5)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Marca uma avaliação como útil.
   * @param reviewId - ID da avaliação
   */
  const handleMarkHelpful = async (reviewId: string) => {
    await markReviewHelpful(reviewId, templateId)
  }

  /**
   * Formata uma data para exibição.
   * @param dateString - String de data ISO
   * @returns Data formatada para exibição
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4" id="write-review-heading">
          Escrever uma Avaliação
        </h3>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <div className="text-sm font-medium mb-2" id="rating-label">
                Classificação
              </div>
              <div
                className="flex items-center gap-1"
                role="radiogroup"
                aria-labelledby="rating-label"
                aria-required="true"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                    aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}`}
                    aria-checked={star === rating}
                    role="radio"
                  >
                    <Star
                      className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2" id="comment-label">
                Comentário
              </div>
              <Textarea
                placeholder="Compartilhe sua experiência com este template..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                aria-labelledby="comment-label"
                aria-required="true"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSubmitReview} disabled={!comment.trim() || isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4" id="reviews-heading">
          Avaliações ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" role="status">
            Nenhuma avaliação ainda. Seja o primeiro a avaliar este template!
          </div>
        ) : (
          <div className="space-y-4" aria-labelledby="reviews-heading">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.avatarUrl || "/placeholder.svg"} alt={review.displayName} />
                        <AvatarFallback>{review.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.displayName}</div>
                        <div className="text-xs text-muted-foreground">@{review.username}</div>
                      </div>
                    </div>

                    <div className="flex items-center" aria-label={`Classificação: ${review.rating} de 5 estrelas`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm">{review.comment}</p>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span title={`Avaliado em ${new Date(review.createdAt).toLocaleDateString()}`}>
                      {formatDate(review.createdAt)}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkHelpful(review.id)}
                      className="h-8 text-xs flex items-center gap-1"
                      aria-label={`Marcar como útil (${review.helpful} pessoas acharam útil)`}
                    >
                      <ThumbsUp className="h-3 w-3" aria-hidden="true" />
                      Útil ({review.helpful})
                    </Button>
                  </div>

                  {review.reply && (
                    <div
                      className="bg-muted p-3 rounded-md mt-2"
                      role="comment"
                      aria-label={`Resposta de ${review.reply.displayName}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{review.reply.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium">{review.reply.displayName}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(review.reply.createdAt)}</div>
                      </div>
                      <p className="text-sm">{review.reply.comment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
