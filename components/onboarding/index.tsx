/**
 * Sistema de Onboarding Contextual
 * 
 * Este componente implementa um sistema de dicas contextuais para guiar
 * novos usuários através das funcionalidades do sistema.
 */
"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { X, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/contexts/app-context"

// Tipos de dicas
export type TipPlacement = "top" | "right" | "bottom" | "left" | "center"
export type TipSize = "small" | "medium" | "large"

// Interface para uma dica
export interface Tip {
  id: string
  title: string
  content: string
  targetSelector: string
  placement: TipPlacement
  size?: TipSize
  order: number
  section: "global" | "canvas" | "chat" | "settings"
  condition?: () => boolean
}

// Interface para o contexto de onboarding
interface OnboardingContextType {
  showTip: (tipId: string) => void
  hideTip: () => void
  startTour: (section?: string) => void
  endTour: () => void
  resetOnboarding: () => void
  isFirstVisit: boolean
  currentTip: Tip | null
  isTourActive: boolean
}

// Dicas para o tour de onboarding
const ONBOARDING_TIPS: Tip[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao AI Agents",
    content: "Este tour rápido vai mostrar as principais funcionalidades do sistema. Você pode pular a qualquer momento.",
    targetSelector: "body",
    placement: "center",
    size: "large",
    order: 0,
    section: "global",
  },
  {
    id: "sidebar",
    title: "Navegação Principal",
    content: "Use a barra lateral para navegar entre as diferentes seções do sistema: Canvas, Chat e Configurações.",
    targetSelector: ".sidebar",
    placement: "right",
    order: 1,
    section: "global",
  },
  {
    id: "canvas",
    title: "Editor de Workflow",
    content: "O Canvas permite criar fluxos de trabalho visuais arrastando e conectando nós.",
    targetSelector: ".canvas-container",
    placement: "bottom",
    order: 2,
    section: "canvas",
    condition: () => window.location.pathname.includes("/canvas"),
  },
  {
    id: "chat",
    title: "Chat Interativo",
    content: "O Chat permite conversar com assistentes de IA e executar workflows.",
    targetSelector: ".chat-container",
    placement: "bottom",
    order: 3,
    section: "chat",
    condition: () => window.location.pathname.includes("/chat"),
  },
  {
    id: "model-selector",
    title: "Seleção de Modelo",
    content: "Escolha entre diferentes modelos de IA para suas conversas.",
    targetSelector: ".model-selector",
    placement: "bottom",
    order: 4,
    section: "chat",
    condition: () => window.location.pathname.includes("/chat"),
  },
  {
    id: "settings",
    title: "Configurações",
    content: "Personalize sua experiência e gerencie suas preferências.",
    targetSelector: ".settings-container",
    placement: "bottom",
    order: 5,
    section: "settings",
    condition: () => window.location.pathname.includes("/settings"),
  },
  {
    id: "help",
    title: "Precisa de Ajuda?",
    content: "Clique no ícone de ajuda a qualquer momento para ver dicas contextuais.",
    targetSelector: ".help-button",
    placement: "left",
    order: 6,
    section: "global",
  },
  {
    id: "finish",
    title: "Pronto para Começar!",
    content: "Agora você conhece as principais funcionalidades. Explore e crie seus próprios workflows e conversas!",
    targetSelector: "body",
    placement: "center",
    size: "large",
    order: 7,
    section: "global",
  },
]

/**
 * Componente de dica contextual
 */
function Tip({
  tip,
  onNext,
  onPrevious,
  onClose,
  totalTips,
  currentIndex,
}: {
  tip: Tip
  onNext: () => void
  onPrevious: () => void
  onClose: () => void
  totalTips: number
  currentIndex: number
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isMounted, setIsMounted] = useState(false)

  // Calcula a posição da dica com base no elemento alvo
  useEffect(() => {
    if (typeof window === "undefined") return

    const calculatePosition = () => {
      if (tip.targetSelector === "body" && tip.placement === "center") {
        setPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
        })
        return
      }

      const targetElement = document.querySelector(tip.targetSelector)
      if (!targetElement) return

      const rect = targetElement.getBoundingClientRect()
      const tipWidth = tip.size === "large" ? 400 : tip.size === "medium" ? 300 : 200
      const tipHeight = 150

      let top = 0
      let left = 0

      switch (tip.placement) {
        case "top":
          top = rect.top - tipHeight - 10
          left = rect.left + rect.width / 2 - tipWidth / 2
          break
        case "right":
          top = rect.top + rect.height / 2 - tipHeight / 2
          left = rect.right + 10
          break
        case "bottom":
          top = rect.bottom + 10
          left = rect.left + rect.width / 2 - tipWidth / 2
          break
        case "left":
          top = rect.top + rect.height / 2 - tipHeight / 2
          left = rect.left - tipWidth - 10
          break
      }

      // Ajusta para não sair da tela
      if (left < 10) left = 10
      if (left + tipWidth > window.innerWidth - 10) left = window.innerWidth - tipWidth - 10
      if (top < 10) top = 10
      if (top + tipHeight > window.innerHeight - 10) top = window.innerHeight - tipHeight - 10

      setPosition({ top, left })
    }

    calculatePosition()
    setIsMounted(true)

    window.addEventListener("resize", calculatePosition)
    return () => window.removeEventListener("resize", calculatePosition)
  }, [tip])

  if (!isMounted) return null

  // Estilo para a dica
  const tipStyle = {
    position: "fixed",
    top: `${position.top}px`,
    left: `${position.left}px`,
    transform: tip.placement === "center" ? "translate(-50%, -50%)" : "none",
    width: tip.size === "large" ? "400px" : tip.size === "medium" ? "300px" : "200px",
    zIndex: 1000,
  }

  // Animação para a dica
  const variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }

  return (
    <motion.div
      className="bg-card border rounded-lg shadow-lg p-4"
      style={tipStyle as any}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-lg">{tip.title}</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">{tip.content}</p>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} de {totalTips}
        </div>
        <div className="flex gap-2">
          {currentIndex > 0 && (
            <Button variant="outline" size="sm" onClick={onPrevious}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
          )}
          {currentIndex < totalTips - 1 ? (
            <Button variant="default" size="sm" onClick={onNext}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={onClose}>
              Concluir
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Componente de botão de ajuda flutuante
 */
function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-4 right-4 z-50 rounded-full shadow-md help-button"
      onClick={onClick}
    >
      <HelpCircle className="h-5 w-5" />
    </Button>
  )
}

/**
 * Componente principal de onboarding
 */
export default function Onboarding() {
  // Estados
  const [currentTip, setCurrentTip] = useState<Tip | null>(null)
  const [isTourActive, setIsTourActive] = useState(false)
  const [currentTourIndex, setCurrentTourIndex] = useState(0)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [showHelpButton, setShowHelpButton] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Contexto da aplicação
  const { theme } = useAppContext()

  // Efeito para verificar se é a primeira visita
  useEffect(() => {
    if (typeof window === "undefined") return

    const hasVisitedBefore = localStorage.getItem("onboarding-completed")
    if (!hasVisitedBefore) {
      setIsFirstVisit(true)
      startTour()
    }

    setIsMounted(true)
  }, [])

  /**
   * Inicia o tour de onboarding
   */
  const startTour = useCallback((section?: string) => {
    const filteredTips = ONBOARDING_TIPS.filter(
      (tip) => !section || tip.section === "global" || tip.section === section
    ).sort((a, b) => a.order - b.order)

    if (filteredTips.length === 0) return

    setIsTourActive(true)
    setCurrentTourIndex(0)
    setCurrentTip(filteredTips[0])
    setShowHelpButton(false)
  }, [])

  /**
   * Encerra o tour de onboarding
   */
  const endTour = useCallback(() => {
    setIsTourActive(false)
    setCurrentTip(null)
    setShowHelpButton(true)

    if (isFirstVisit) {
      localStorage.setItem("onboarding-completed", "true")
      setIsFirstVisit(false)
    }
  }, [isFirstVisit])

  /**
   * Avança para a próxima dica
   */
  const handleNext = useCallback(() => {
    if (!isTourActive) return

    const filteredTips = ONBOARDING_TIPS.filter(
      (tip) => tip.section === "global" || tip.section === currentTip?.section
    ).sort((a, b) => a.order - b.order)

    const nextIndex = currentTourIndex + 1
    if (nextIndex < filteredTips.length) {
      setCurrentTourIndex(nextIndex)
      setCurrentTip(filteredTips[nextIndex])
    } else {
      endTour()
    }
  }, [isTourActive, currentTip, currentTourIndex, endTour])

  /**
   * Volta para a dica anterior
   */
  const handlePrevious = useCallback(() => {
    if (!isTourActive || currentTourIndex <= 0) return

    const filteredTips = ONBOARDING_TIPS.filter(
      (tip) => tip.section === "global" || tip.section === currentTip?.section
    ).sort((a, b) => a.order - b.order)

    const prevIndex = currentTourIndex - 1
    setCurrentTourIndex(prevIndex)
    setCurrentTip(filteredTips[prevIndex])
  }, [isTourActive, currentTip, currentTourIndex])

  /**
   * Mostra uma dica específica
   */
  const showTip = useCallback((tipId: string) => {
    const tip = ONBOARDING_TIPS.find((t) => t.id === tipId)
    if (!tip) return

    setCurrentTip(tip)
    setIsTourActive(false)
    setShowHelpButton(true)
  }, [])

  /**
   * Esconde a dica atual
   */
  const hideTip = useCallback(() => {
    if (isTourActive) return
    setCurrentTip(null)
  }, [isTourActive])

  /**
   * Reseta o onboarding
   */
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem("onboarding-completed")
    setIsFirstVisit(true)
    startTour()
  }, [startTour])

  /**
   * Manipula o clique no botão de ajuda
   */
  const handleHelpClick = useCallback(() => {
    // Mostra dica contextual com base na página atual
    const path = window.location.pathname
    if (path.includes("/canvas")) {
      showTip("canvas")
    } else if (path.includes("/chat")) {
      showTip("chat")
    } else if (path.includes("/settings")) {
      showTip("settings")
    } else {
      startTour()
    }
  }, [showTip, startTour])

  if (!isMounted) return null

  // Filtra as dicas para o tour atual
  const filteredTips = ONBOARDING_TIPS.filter(
    (tip) => tip.section === "global" || tip.section === currentTip?.section
  ).sort((a, b) => a.order - b.order)

  return (
    <>
      <AnimatePresence>
        {currentTip && (
          <Tip
            tip={currentTip}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onClose={isTourActive ? endTour : hideTip}
            totalTips={isTourActive ? filteredTips.length : 1}
            currentIndex={isTourActive ? currentTourIndex : 0}
          />
        )}
      </AnimatePresence>

      {showHelpButton && <HelpButton onClick={handleHelpClick} />}
    </>
  )
}

/**
 * Hook para usar o contexto de onboarding
 */
export function useOnboarding(): OnboardingContextType {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null)
  const [isTourActive, setIsTourActive] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(false)

  // Efeito para verificar se é a primeira visita
  useEffect(() => {
    if (typeof window === "undefined") return

    const hasVisitedBefore = localStorage.getItem("onboarding-completed")
    setIsFirstVisit(!hasVisitedBefore)
  }, [])

  /**
   * Mostra uma dica específica
   */
  const showTip = useCallback((tipId: string) => {
    const tip = ONBOARDING_TIPS.find((t) => t.id === tipId)
    if (!tip) return

    setCurrentTip(tip)
    setIsTourActive(false)
  }, [])

  /**
   * Esconde a dica atual
   */
  const hideTip = useCallback(() => {
    if (isTourActive) return
    setCurrentTip(null)
  }, [isTourActive])

  /**
   * Inicia o tour de onboarding
   */
  const startTour = useCallback((section?: string) => {
    const filteredTips = ONBOARDING_TIPS.filter(
      (tip) => !section || tip.section === "global" || tip.section === section
    ).sort((a, b) => a.order - b.order)

    if (filteredTips.length === 0) return

    setIsTourActive(true)
    setCurrentTip(filteredTips[0])
  }, [])

  /**
   * Encerra o tour de onboarding
   */
  const endTour = useCallback(() => {
    setIsTourActive(false)
    setCurrentTip(null)

    if (isFirstVisit) {
      localStorage.setItem("onboarding-completed", "true")
      setIsFirstVisit(false)
    }
  }, [isFirstVisit])

  /**
   * Reseta o onboarding
   */
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem("onboarding-completed")
    setIsFirstVisit(true)
  }, [])

  return {
    showTip,
    hideTip,
    startTour,
    endTour,
    resetOnboarding,
    isFirstVisit,
    currentTip,
    isTourActive,
  }
}
