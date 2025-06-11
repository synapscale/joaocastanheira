"use client"

import React from 'react'
import { useOnboarding } from './onboarding-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lightbulb, ArrowRight, Check } from "lucide-react"

interface OnboardingTourProps {
  tourId: string
}

export function OnboardingTour({ tourId }: OnboardingTourProps) {
  const { showOnboarding, setShowOnboarding, completedSteps, markStepComplete, currentTour, setCurrentTour } = useOnboarding()
  const [currentStep, setCurrentStep] = React.useState(0)

  // Definição dos passos do tour baseado no tourId
  const steps = React.useMemo(() => {
    switch (tourId) {
      case 'chat-tour':
        return [
          {
            id: 'chat-intro',
            title: 'Bem-vindo ao Chat Interativo',
            description: 'Este é o novo chat interativo integrado ao editor de workflow. Aqui você pode conversar com diferentes modelos de IA e integrar com seus workflows.',
            target: '.chat-interface',
          },
          {
            id: 'model-selector',
            title: 'Seleção de Modelos',
            description: 'Escolha entre diversos modelos de IA de diferentes provedores para obter respostas otimizadas para seu caso de uso.',
            target: '[data-component="ModelSelector"]',
          },
          {
            id: 'chat-input',
            title: 'Entrada de Mensagens',
            description: 'Digite suas mensagens aqui. Você pode usar Shift+Enter para quebras de linha e Enter para enviar.',
            target: '.chat-input',
          },
          {
            id: 'tool-selector',
            title: 'Ferramentas Disponíveis',
            description: 'Ative diferentes ferramentas para que o assistente possa executar tarefas específicas durante a conversa.',
            target: '[data-component="ToolSelector"]',
          },
          {
            id: 'canvas-integration',
            title: 'Integração com Canvas',
            description: 'Você pode referenciar e interagir com seus workflows diretamente do chat, criando uma experiência integrada.',
            target: '[data-component="CanvasIntegration"]',
          },
        ]
      default:
        return []
    }
  }, [tourId])

  // Verificar se o tour já foi completado
  const isTourCompleted = React.useMemo(() => {
    return steps.every(step => completedSteps[step.id])
  }, [steps, completedSteps])

  // Controle de visibilidade do tour
  const isVisible = React.useMemo(() => {
    return showOnboarding && currentTour === tourId && !isTourCompleted && steps.length > 0
  }, [showOnboarding, currentTour, tourId, isTourCompleted, steps.length])

  // Iniciar o tour
  React.useEffect(() => {
    // Verificar se é a primeira visita à página e se o tour não foi completado
    const isFirstVisit = !localStorage.getItem(`tour-${tourId}-visited`)
    
    if (isFirstVisit && !isTourCompleted) {
      localStorage.setItem(`tour-${tourId}-visited`, 'true')
      setShowOnboarding(true)
      setCurrentTour(tourId)
    }
  }, [tourId, isTourCompleted, setShowOnboarding, setCurrentTour])

  // Avançar para o próximo passo
  const handleNext = React.useCallback(() => {
    const currentStepData = steps[currentStep]
    markStepComplete(currentStepData.id)
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Finalizar o tour
      setShowOnboarding(false)
      setCurrentTour(null)
      setCurrentStep(0)
    }
  }, [currentStep, steps, markStepComplete, setShowOnboarding, setCurrentTour])

  // Pular o tour
  const handleSkip = React.useCallback(() => {
    // Marcar todos os passos como completos
    steps.forEach(step => markStepComplete(step.id))
    setShowOnboarding(false)
    setCurrentTour(null)
    setCurrentStep(0)
  }, [steps, markStepComplete, setShowOnboarding, setCurrentTour])

  if (!isVisible) return null

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <Dialog open={isVisible} onOpenChange={setShowOnboarding}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription>
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`h-1.5 w-5 rounded-full ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : index < currentStep 
                      ? 'bg-primary/40' 
                      : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Pular tour
          </Button>
          <Button onClick={handleNext}>
            {isLastStep ? (
              <>
                Concluir <Check className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default OnboardingTour
