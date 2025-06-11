"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface TutorialStep {
  title: string
  description: string
  image?: string
  highlightElement?: string
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Bem-vindo ao Chat Interativo",
    description: "Este tutorial irá guiá-lo pelas principais funcionalidades do chat. Você pode pular ou retomar este tutorial a qualquer momento através do menu de ajuda.",
  },
  {
    title: "Enviando mensagens",
    description: "Digite sua mensagem na caixa de texto na parte inferior e pressione Enter ou clique no botão de envio para conversar com a IA.",
    highlightElement: ".chat-input-container"
  },
  {
    title: "Seleção de modelo",
    description: "Escolha entre diferentes modelos de IA clicando no seletor de modelo. Cada modelo tem capacidades diferentes.",
    highlightElement: ".model-selector"
  },
  {
    title: "Ferramentas disponíveis",
    description: "Ative diferentes ferramentas como pesquisa na web, análise de código e mais para expandir as capacidades da IA.",
    highlightElement: ".tool-selector"
  },
  {
    title: "Personalidades",
    description: "Escolha diferentes personalidades para ajustar o tom e estilo das respostas da IA.",
    highlightElement: ".personality-selector"
  },
  {
    title: "Presets",
    description: "Use presets para salvar e aplicar rapidamente combinações de modelo, ferramentas e personalidade. Você pode criar seus próprios presets personalizados.",
    highlightElement: ".preset-selector"
  },
  {
    title: "Upload de arquivos",
    description: "Envie arquivos para análise clicando no ícone de clipe ou arrastando e soltando arquivos na área de chat.",
    highlightElement: ".file-upload-button"
  },
  {
    title: "Ferramentas rápidas",
    description: "Use as ferramentas no cabeçalho para compartilhar, exportar, ativar o modo foco e mais.",
    highlightElement: ".chat-header"
  },
  {
    title: "Gerenciamento de conversas",
    description: "Crie novas conversas, edite títulos e organize seu histórico através da barra lateral.",
    highlightElement: ".sidebar"
  },
  {
    title: "Pronto para começar!",
    description: "Você concluiu o tutorial básico. Explore todas as funcionalidades e personalize sua experiência. Boa conversa!",
  }
]

interface TutorialModalProps {
  onClose?: () => void
}

export function TutorialModal({ onClose }: TutorialModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)
  const { toast } = useToast()
  
  // Verificar se o usuário já viu o tutorial
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tutorialSeen = localStorage.getItem('tutorialSeen')
      setHasSeenTutorial(!!tutorialSeen)
      
      // Abrir automaticamente para novos usuários
      if (!tutorialSeen) {
        setIsOpen(true)
      }
    }
  }, [])
  
  // Marcar tutorial como visto ao fechar
  const handleClose = () => {
    setIsOpen(false)
    
    if (!hasSeenTutorial) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tutorialSeen', 'true')
        setHasSeenTutorial(true)
      }
    }
    
    if (onClose) {
      onClose()
    }
  }
  
  // Abrir tutorial manualmente
  const openTutorial = () => {
    setCurrentStep(0)
    setIsOpen(true)
  }
  
  // Navegar para o próximo passo
  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      highlightElement(TUTORIAL_STEPS[currentStep + 1].highlightElement)
    } else {
      handleClose()
      
      // Feedback ao concluir o tutorial
      toast({
        title: "Tutorial concluído",
        description: "Você pode acessar o tutorial novamente a qualquer momento através do menu de ajuda.",
      })
    }
  }
  
  // Navegar para o passo anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      highlightElement(TUTORIAL_STEPS[currentStep - 1].highlightElement)
    }
  }
  
  // Pular o tutorial
  const skipTutorial = () => {
    handleClose()
    
    // Feedback ao pular o tutorial
    toast({
      title: "Tutorial pulado",
      description: "Você pode acessar o tutorial novamente a qualquer momento através do menu de ajuda.",
    })
  }
  
  // Destacar elemento na interface
  const highlightElement = (selector?: string) => {
    // Remover destaque anterior
    const previousHighlight = document.querySelector('.tutorial-highlight')
    if (previousHighlight) {
      previousHighlight.classList.remove('tutorial-highlight')
    }
    
    // Adicionar novo destaque
    if (selector) {
      setTimeout(() => {
        const element = document.querySelector(selector)
        if (element) {
          element.classList.add('tutorial-highlight')
          
          // Rolar para o elemento se necessário
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }
  
  // Aplicar destaque ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      highlightElement(TUTORIAL_STEPS[currentStep].highlightElement)
    }
  }, [isOpen, currentStep])
  
  // Remover destaque ao fechar o modal
  useEffect(() => {
    return () => {
      const highlightedElement = document.querySelector('.tutorial-highlight')
      if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-highlight')
      }
    }
  }, [])
  
  const currentTutorialStep = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1
  const isFirstStep = currentStep === 0
  
  return (
    <>
      {/* Botão de ajuda para abrir o tutorial */}
      <Button
        variant="ghost"
        size="sm"
        onClick={openTutorial}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
        <span>Ajuda</span>
      </Button>
      
      {/* Modal do tutorial */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{currentTutorialStep.title}</DialogTitle>
            <DialogDescription>
              {currentTutorialStep.description}
            </DialogDescription>
          </DialogHeader>
          
          {/* Imagem do tutorial (se houver) */}
          {currentTutorialStep.image && (
            <div className="my-4 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <img 
                src={currentTutorialStep.image} 
                alt={`Tutorial step ${currentStep + 1}`} 
                className="w-full h-auto"
              />
            </div>
          )}
          
          {/* Indicador de progresso */}
          <div className="flex justify-center my-4">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 mx-0.5 rounded-full ${
                  index === currentStep
                    ? "bg-blue-500"
                    : index < currentStep
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {!isFirstStep ? (
                <Button variant="outline" onClick={prevStep}>
                  Anterior
                </Button>
              ) : (
                <Button variant="outline" onClick={skipTutorial}>
                  Pular tutorial
                </Button>
              )}
            </div>
            <Button onClick={nextStep}>
              {isLastStep ? "Concluir" : "Próximo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Estilos para o destaque de elementos */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 60;
          animation: pulse 2s infinite;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </>
  )
}
