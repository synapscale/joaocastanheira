"use client"
/**
 * Personalização Adaptativa
 * 
 * Este componente implementa um sistema de personalização adaptativa
 * que ajusta a interface com base no comportamento do usuário.
 */

import { useState, useEffect, useCallback } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showNotification } from "@/components/ui/notification"

// Tipos de eventos de usuário
export type UserEventType = 
  | "page_view" 
  | "feature_use" 
  | "button_click" 
  | "time_spent" 
  | "error" 
  | "search" 
  | "preference_change"

// Interface para um evento de usuário
export interface UserEvent {
  type: UserEventType
  target: string
  timestamp: number
  metadata?: Record<string, any>
}

// Interface para um perfil de usuário
export interface UserProfile {
  id: string
  events: UserEvent[]
  preferences: Record<string, any>
  features: {
    usage: Record<string, number>
    favorites: string[]
    lastUsed: Record<string, number>
  }
  recommendations: {
    features: string[]
    settings: Record<string, any>
    lastUpdated: number
  }
  createdAt: number
  updatedAt: number
}

// Interface para uma recomendação
export interface Recommendation {
  id: string
  type: "feature" | "setting" | "content"
  title: string
  description: string
  target: string
  priority: number
  condition?: (profile: UserProfile) => boolean
}

// Lista de recomendações disponíveis
const AVAILABLE_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "dark-mode",
    type: "setting",
    title: "Modo Escuro",
    description: "Ative o modo escuro para reduzir o cansaço visual em ambientes com pouca luz.",
    target: "theme",
    priority: 80,
    condition: (profile) => {
      // Recomenda modo escuro se o usuário usa o sistema à noite
      const now = new Date()
      const hour = now.getHours()
      return hour >= 19 || hour <= 6
    }
  },
  {
    id: "keyboard-shortcuts",
    type: "feature",
    title: "Atalhos de Teclado",
    description: "Você está usando o sistema com frequência. Ative os atalhos de teclado para aumentar sua produtividade.",
    target: "keyboard-shortcuts",
    priority: 70,
    condition: (profile) => {
      // Recomenda atalhos se o usuário tem mais de 20 eventos
      return profile.events.length > 20
    }
  },
  {
    id: "chat-templates",
    type: "feature",
    title: "Templates de Chat",
    description: "Crie templates para suas conversas mais frequentes e economize tempo.",
    target: "chat-templates",
    priority: 60,
    condition: (profile) => {
      // Recomenda templates se o usuário usa muito o chat
      const chatEvents = profile.events.filter(e => 
        e.type === "feature_use" && e.target.startsWith("chat")
      )
      return chatEvents.length > 10
    }
  },
  {
    id: "canvas-tutorial",
    type: "content",
    title: "Tutorial de Canvas",
    description: "Aprenda a usar todos os recursos do editor de workflow com este tutorial rápido.",
    target: "canvas-tutorial",
    priority: 90,
    condition: (profile) => {
      // Recomenda tutorial se o usuário teve erros no canvas
      const canvasErrors = profile.events.filter(e => 
        e.type === "error" && e.target.startsWith("canvas")
      )
      return canvasErrors.length > 0
    }
  },
  {
    id: "data-backup",
    type: "setting",
    title: "Backup Automático",
    description: "Configure backups automáticos para seus projetos importantes.",
    target: "backup-settings",
    priority: 85,
    condition: (profile) => {
      // Recomenda backup se o usuário tem muitos projetos
      return profile.features.usage["create_project"] > 3
    }
  },
  {
    id: "prompt-library",
    type: "feature",
    title: "Biblioteca de Prompts",
    description: "Explore nossa biblioteca de prompts otimizados para diferentes casos de uso.",
    target: "prompt-library",
    priority: 75,
    condition: (profile) => {
      // Recomenda biblioteca se o usuário usa muito o chat
      const chatEvents = profile.events.filter(e => 
        e.type === "feature_use" && e.target === "chat_send_message"
      )
      return chatEvents.length > 5
    }
  },
]

/**
 * Hook para usar personalização adaptativa
 */
export function useAdaptivePersonalization() {
  // Estados
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>(
    "user-profile",
    null
  )
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Inicializa o perfil do usuário
  useEffect(() => {
    if (!userProfile) {
      const newProfile: UserProfile = {
        id: `user-${Date.now()}`,
        events: [],
        preferences: {},
        features: {
          usage: {},
          favorites: [],
          lastUsed: {},
        },
        recommendations: {
          features: [],
          settings: {},
          lastUpdated: Date.now(),
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      
      setUserProfile(newProfile)
    }
    
    setIsInitialized(true)
  }, [userProfile, setUserProfile])
  
  // Atualiza as recomendações com base no perfil
  useEffect(() => {
    if (!userProfile) return
    
    // Filtra recomendações com base nas condições
    const filteredRecommendations = AVAILABLE_RECOMMENDATIONS
      .filter(rec => !rec.condition || rec.condition(userProfile))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3) // Limita a 3 recomendações
    
    setRecommendations(filteredRecommendations)
  }, [userProfile])
  
  /**
   * Registra um evento de usuário
   */
  const trackEvent = useCallback((
    type: UserEventType,
    target: string,
    metadata?: Record<string, any>
  ) => {
    if (!userProfile) return
    
    const event: UserEvent = {
      type,
      target,
      timestamp: Date.now(),
      metadata,
    }
    
    setUserProfile(prev => {
      if (!prev) return null
      
      // Atualiza contagem de uso de features
      const updatedFeatures = { ...prev.features }
      if (type === "feature_use") {
        updatedFeatures.usage[target] = (updatedFeatures.usage[target] || 0) + 1
        updatedFeatures.lastUsed[target] = Date.now()
      }
      
      return {
        ...prev,
        events: [...prev.events, event],
        features: updatedFeatures,
        updatedAt: Date.now(),
      }
    })
  }, [userProfile, setUserProfile])
  
  /**
   * Atualiza uma preferência do usuário
   */
  const updatePreference = useCallback((key: string, value: any) => {
    if (!userProfile) return
    
    setUserProfile(prev => {
      if (!prev) return null
      
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: value,
        },
        updatedAt: Date.now(),
      }
    })
    
    // Registra o evento de mudança de preferência
    trackEvent("preference_change", key, { value })
  }, [userProfile, setUserProfile, trackEvent])
  
  /**
   * Adiciona uma feature aos favoritos
   */
  const addFavoriteFeature = useCallback((featureId: string) => {
    if (!userProfile) return
    
    setUserProfile(prev => {
      if (!prev) return null
      
      // Evita duplicatas
      if (prev.features.favorites.includes(featureId)) {
        return prev
      }
      
      return {
        ...prev,
        features: {
          ...prev.features,
          favorites: [...prev.features.favorites, featureId],
        },
        updatedAt: Date.now(),
      }
    })
  }, [userProfile, setUserProfile])
  
  /**
   * Remove uma feature dos favoritos
   */
  const removeFavoriteFeature = useCallback((featureId: string) => {
    if (!userProfile) return
    
    setUserProfile(prev => {
      if (!prev) return null
      
      return {
        ...prev,
        features: {
          ...prev.features,
          favorites: prev.features.favorites.filter(id => id !== featureId),
        },
        updatedAt: Date.now(),
      }
    })
  }, [userProfile, setUserProfile])
  
  /**
   * Aplica uma recomendação
   */
  const applyRecommendation = useCallback((recommendationId: string) => {
    const recommendation = recommendations.find(r => r.id === recommendationId)
    if (!recommendation || !userProfile) return
    
    // Implementa a ação com base no tipo de recomendação
    switch (recommendation.type) {
      case "setting":
        // Aplica configuração recomendada
        if (recommendation.id === "dark-mode") {
          updatePreference("theme", "dark")
          document.documentElement.classList.add("dark")
        } else if (recommendation.id === "data-backup") {
          updatePreference("auto_backup", true)
        }
        break
        
      case "feature":
        // Ativa ou destaca feature recomendada
        if (recommendation.id === "keyboard-shortcuts") {
          updatePreference("keyboard_shortcuts_enabled", true)
        } else if (recommendation.id === "chat-templates") {
          // Navega para a página de templates
          // window.location.href = "/chat/templates"
        } else if (recommendation.id === "prompt-library") {
          // Abre a biblioteca de prompts
          // promptLibraryRef.current?.open()
        }
        break
        
      case "content":
        // Mostra conteúdo recomendado
        if (recommendation.id === "canvas-tutorial") {
          // Abre o tutorial
          // window.location.href = "/tutorials/canvas"
        }
        break
    }
    
    // Registra o evento
    trackEvent("feature_use", `recommendation_${recommendation.id}`)
    
    // Remove a recomendação aplicada
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId))
    
    // Notifica o usuário
    showNotification({
      type: "success",
      message: `${recommendation.title} aplicado com sucesso!`,
    })
  }, [recommendations, userProfile, updatePreference, trackEvent])
  
  /**
   * Descarta uma recomendação
   */
  const dismissRecommendation = useCallback((recommendationId: string) => {
    // Remove a recomendação
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId))
    
    // Registra o evento
    trackEvent("feature_use", `dismiss_recommendation_${recommendationId}`)
  }, [trackEvent])
  
  /**
   * Reseta o perfil do usuário
   */
  const resetProfile = useCallback(() => {
    setUserProfile(null)
    
    // Notifica o usuário
    showNotification({
      type: "info",
      message: "Perfil de usuário resetado com sucesso.",
    })
  }, [setUserProfile])
  
  return {
    userProfile,
    recommendations,
    isInitialized,
    trackEvent,
    updatePreference,
    addFavoriteFeature,
    removeFavoriteFeature,
    applyRecommendation,
    dismissRecommendation,
    resetProfile,
  }
}

/**
 * Componente de recomendações adaptativas
 */
export function AdaptiveRecommendations() {
  const {
    recommendations,
    applyRecommendation,
    dismissRecommendation,
  } = useAdaptivePersonalization()
  
  if (recommendations.length === 0) {
    return null
  }
  
  return (
    <div className="space-y-2">
      {recommendations.map(recommendation => (
        <div
          key={recommendation.id}
          className="border rounded-lg p-3 bg-muted/30 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{recommendation.title}</h3>
              <p className="text-sm text-muted-foreground">{recommendation.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                onClick={() => applyRecommendation(recommendation.id)}
              >
                Aplicar
              </button>
              <button
                className="text-sm px-2 py-1 text-muted-foreground hover:text-foreground"
                onClick={() => dismissRecommendation(recommendation.id)}
              >
                Ignorar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Hook para armazenamento local
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  
  // Inicializa o valor do localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error("Error reading localStorage:", error)
    }
  }, [key])
  
  // Função para atualizar o valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite função como argumento
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      
      // Salva no estado
      setStoredValue(valueToStore)
      
      // Salva no localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error("Error setting localStorage:", error)
    }
  }
  
  return [storedValue, setValue]
}
