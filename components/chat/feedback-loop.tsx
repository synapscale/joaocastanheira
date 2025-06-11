"use client"

import React from 'react'
import { useFeedback } from './feedback-context'
import { ThumbsUp, ThumbsDown, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface FeedbackLoopProps {
  messageId: string
  className?: string
}

const feedbackReasons = {
  positive: [
    { id: 'accurate', label: 'Resposta precisa' },
    { id: 'helpful', label: 'Útil para minha tarefa' },
    { id: 'clear', label: 'Clara e bem explicada' },
    { id: 'creative', label: 'Criativa e inovadora' },
    { id: 'efficient', label: 'Eficiente e direta' },
  ],
  negative: [
    { id: 'inaccurate', label: 'Informação incorreta' },
    { id: 'incomplete', label: 'Resposta incompleta' },
    { id: 'confusing', label: 'Confusa ou mal explicada' },
    { id: 'irrelevant', label: 'Irrelevante para minha pergunta' },
    { id: 'harmful', label: 'Potencialmente prejudicial' },
  ]
}

export function FeedbackLoop({ messageId, className = '' }: FeedbackLoopProps) {
  const { addFeedback, getFeedback } = useFeedback()
  const [isOpen, setIsOpen] = React.useState(false)
  const [feedbackType, setFeedbackType] = React.useState<'positive' | 'negative' | null>(null)
  const [reason, setReason] = React.useState<string>('')
  const [additionalInfo, setAdditionalInfo] = React.useState<string>('')
  
  const existingFeedback = getFeedback(messageId)
  const hasProvidedFeedback = !!existingFeedback
  
  // Resetar estado quando o popover é fechado
  React.useEffect(() => {
    if (!isOpen) {
      setFeedbackType(null)
      setReason('')
      setAdditionalInfo('')
    }
  }, [isOpen])
  
  // Preencher estado com feedback existente
  React.useEffect(() => {
    if (existingFeedback) {
      setFeedbackType(existingFeedback.helpful ? 'positive' : 'negative')
      setReason(existingFeedback.reason || '')
      setAdditionalInfo(existingFeedback.additionalInfo || '')
    }
  }, [existingFeedback])
  
  // Enviar feedback positivo/negativo simples
  const handleQuickFeedback = (helpful: boolean) => {
    addFeedback(messageId, {
      helpful,
      timestamp: Date.now()
    })
  }
  
  // Enviar feedback detalhado
  const handleDetailedFeedback = () => {
    if (!feedbackType) return
    
    addFeedback(messageId, {
      helpful: feedbackType === 'positive',
      reason,
      additionalInfo,
      timestamp: Date.now()
    })
    
    setIsOpen(false)
  }
  
  // Se já forneceu feedback, mostrar estado
  if (hasProvidedFeedback) {
    return (
      <div className={`flex items-center gap-1 text-xs text-gray-500 ${className}`}>
        {existingFeedback.helpful ? (
          <ThumbsUp className="h-3 w-3 text-green-500" />
        ) : (
          <ThumbsDown className="h-3 w-3 text-red-500" />
        )}
        <span>Feedback enviado</span>
      </div>
    )
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="text-xs text-gray-500">Esta resposta foi útil?</div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full"
        onClick={() => handleQuickFeedback(true)}
      >
        <ThumbsUp className="h-3 w-3" />
        <span className="sr-only">Útil</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full"
        onClick={() => handleQuickFeedback(false)}
      >
        <ThumbsDown className="h-3 w-3" />
        <span className="sr-only">Não útil</span>
      </Button>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            Detalhar
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Feedback detalhado</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Fechar</span>
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={feedbackType === 'positive' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setFeedbackType('positive')}
              >
                <ThumbsUp className="h-3 w-3 mr-1" /> Útil
              </Button>
              <Button
                variant={feedbackType === 'negative' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setFeedbackType('negative')}
              >
                <ThumbsDown className="h-3 w-3 mr-1" /> Não útil
              </Button>
            </div>
            
            {feedbackType && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Por que você achou {feedbackType === 'positive' ? 'útil' : 'não útil'}?</Label>
                  <RadioGroup value={reason} onValueChange={setReason}>
                    {feedbackReasons[feedbackType].map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={item.id} id={item.id} />
                        <Label htmlFor={item.id} className="text-xs">{item.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Comentários adicionais (opcional)</Label>
                  <Textarea
                    placeholder="Compartilhe mais detalhes sobre sua experiência..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="h-20 text-xs"
                  />
                </div>
                
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleDetailedFeedback}
                >
                  <Send className="h-3 w-3 mr-1" /> Enviar feedback
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default FeedbackLoop
