/**
 * Componente de Explicabilidade para IA
 * 
 * Este componente permite que o usuário solicite explicações sobre
 * como a IA chegou a determinadas conclusões ou respostas, aumentando
 * a transparência e confiança no sistema.
 */
"use client"

import { useState, useCallback } from "react"
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb,
  Code,
  List,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Tipos de explicação
export type ExplanationType = "reasoning" | "sources" | "confidence" | "limitations"

// Interface para uma explicação
export interface AIExplanation {
  messageId: string
  reasoning: {
    steps: string[]
    keyFactors: string[]
  }
  sources?: {
    citations: {
      text: string
      url?: string
      title?: string
    }[]
    searchQueries?: string[]
  }
  confidence: {
    overall: number // 0-100
    breakdown: {
      category: string
      score: number
      reason: string
    }[]
  }
  limitations: string[]
}

// Exemplo de explicação para demonstração
const EXAMPLE_EXPLANATION: AIExplanation = {
  messageId: "msg_example",
  reasoning: {
    steps: [
      "Identifiquei que a pergunta é sobre o funcionamento de redes neurais",
      "Determinei os componentes principais que precisam ser explicados: neurônios, camadas, pesos, funções de ativação",
      "Estruturei a explicação do mais básico ao mais complexo",
      "Adicionei uma analogia com o cérebro humano para facilitar a compreensão",
      "Incluí um exemplo prático de aplicação para contextualizar"
    ],
    keyFactors: [
      "Nível de conhecimento prévio inferido da pergunta",
      "Necessidade de explicação conceitual vs. técnica",
      "Importância de usar linguagem acessível",
      "Relevância de incluir exemplos práticos"
    ]
  },
  sources: {
    citations: [
      {
        text: "As redes neurais artificiais são inspiradas no funcionamento do cérebro humano",
        title: "Deep Learning",
        url: "https://example.com/deep-learning"
      },
      {
        text: "Um neurônio artificial combina entradas ponderadas e aplica uma função de ativação",
        title: "Neural Networks and Deep Learning",
        url: "https://example.com/neural-networks"
      }
    ],
    searchQueries: [
      "como funcionam redes neurais",
      "estrutura básica redes neurais artificiais",
      "função de ativação redes neurais"
    ]
  },
  confidence: {
    overall: 92,
    breakdown: [
      {
        category: "Conhecimento do domínio",
        score: 95,
        reason: "Informações sobre redes neurais são bem estabelecidas e documentadas"
      },
      {
        category: "Atualidade da informação",
        score: 90,
        reason: "Conceitos fundamentais são estáveis, mas há avanços recentes não cobertos"
      },
      {
        category: "Completude da resposta",
        score: 85,
        reason: "Abrange os conceitos básicos, mas poderia incluir mais detalhes sobre arquiteturas avançadas"
      },
      {
        category: "Clareza da explicação",
        score: 95,
        reason: "Uso de linguagem acessível e analogias facilita a compreensão"
      }
    ]
  },
  limitations: [
    "Esta explicação foca nos conceitos básicos e não cobre arquiteturas avançadas como transformers",
    "Não foram incluídos detalhes matemáticos das funções de ativação",
    "A explicação não aborda técnicas de treinamento como backpropagation em profundidade",
    "Exemplos específicos de implementação em código não foram fornecidos"
  ]
}

interface ExplainabilityProps {
  messageId: string
  onRequestExplanation?: (messageId: string, type: ExplanationType) => Promise<AIExplanation>
}

/**
 * Componente de explicabilidade para IA
 */
export default function Explainability({
  messageId,
  onRequestExplanation,
}: ExplainabilityProps) {
  // Estados
  const [isLoading, setIsLoading] = useState(false)
  const [explanation, setExplanation] = useState<AIExplanation | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<ExplanationType>("reasoning")

  /**
   * Solicita uma explicação para a resposta da IA
   */
  const handleRequestExplanation = useCallback(async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      // Se tiver um callback, usa ele para obter a explicação
      if (onRequestExplanation) {
        const result = await onRequestExplanation(messageId, activeTab)
        setExplanation(result)
      } else {
        // Caso contrário, usa o exemplo para demonstração
        // Simula um delay para parecer que está processando
        await new Promise(resolve => setTimeout(resolve, 1000))
        setExplanation(EXAMPLE_EXPLANATION)
      }
    } catch (error) {
      console.error("Erro ao obter explicação:", error)
    } finally {
      setIsLoading(false)
      setIsExpanded(true)
    }
  }, [messageId, activeTab, isLoading, onRequestExplanation])

  /**
   * Alterna a expansão da explicação
   */
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  /**
   * Renderiza o conteúdo da explicação com base na aba ativa
   */
  const renderExplanationContent = useCallback(() => {
    if (!explanation) return null
    
    switch (activeTab) {
      case "reasoning":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Passos de raciocínio</h4>
              <ol className="space-y-2 pl-5 list-decimal">
                {explanation.reasoning.steps.map((step, index) => (
                  <li key={index} className="text-sm">{step}</li>
                ))}
              </ol>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Fatores-chave considerados</h4>
              <ul className="space-y-1 pl-5 list-disc">
                {explanation.reasoning.keyFactors.map((factor, index) => (
                  <li key={index} className="text-sm">{factor}</li>
                ))}
              </ul>
            </div>
          </div>
        )
        
      case "sources":
        return explanation.sources ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Citações</h4>
              {explanation.sources.citations.length > 0 ? (
                <div className="space-y-2">
                  {explanation.sources.citations.map((citation, index) => (
                    <div key={index} className="text-sm border-l-2 border-muted-foreground/20 pl-3 py-1">
                      <p className="italic mb-1">{citation.text}</p>
                      {citation.title && (
                        <p className="text-xs text-muted-foreground">
                          Fonte: {citation.url ? (
                            <a 
                              href={citation.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {citation.title}
                            </a>
                          ) : (
                            citation.title
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma citação específica utilizada.</p>
              )}
            </div>
            
            {explanation.sources.searchQueries && (
              <div>
                <h4 className="text-sm font-medium mb-2">Consultas de pesquisa</h4>
                <div className="space-y-1">
                  {explanation.sources.searchQueries.map((query, index) => (
                    <div key={index} className="text-sm bg-muted px-2 py-1 rounded-md inline-block mr-2 mb-2">
                      {query}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Informações de fontes não disponíveis para esta resposta.</p>
        )
        
      case "confidence":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Confiança geral</h4>
              <div className="flex items-center">
                <span className="text-sm font-bold mr-2">{explanation.confidence.overall}%</span>
                <div className="w-20 h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      explanation.confidence.overall >= 90 ? "bg-green-500" :
                      explanation.confidence.overall >= 70 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${explanation.confidence.overall}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Detalhamento</h4>
              <div className="space-y-3">
                {explanation.confidence.breakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{item.category}</span>
                      <span className="text-sm font-medium">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-1">
                      <div 
                        className={`h-full ${
                          item.score >= 90 ? "bg-green-500" :
                          item.score >= 70 ? "bg-yellow-500" :
                          "bg-red-500"
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
        
      case "limitations":
        return (
          <div>
            <h4 className="text-sm font-medium mb-2">Limitações da resposta</h4>
            {explanation.limitations.length > 0 ? (
              <ul className="space-y-1 pl-5 list-disc">
                {explanation.limitations.map((limitation, index) => (
                  <li key={index} className="text-sm">{limitation}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma limitação específica identificada.</p>
            )}
          </div>
        )
        
      default:
        return null
    }
  }, [activeTab, explanation])

  return (
    <div className="mt-2">
      {!explanation ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs flex items-center gap-1 h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={handleRequestExplanation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <HelpCircle className="h-3.5 w-3.5" />
                )}
                <span>Por que esta resposta?</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Entenda como a IA chegou a esta resposta</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="border rounded-md mt-2 bg-muted/30">
          <div 
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50"
            onClick={toggleExpanded}
          >
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium">Explicação da resposta</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          
          {isExpanded && (
            <div className="p-3 border-t">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ExplanationType)}>
                <TabsList className="w-full grid grid-cols-4 h-8">
                  <TabsTrigger value="reasoning" className="text-xs">
                    <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                    Raciocínio
                  </TabsTrigger>
                  <TabsTrigger value="sources" className="text-xs">
                    <Code className="h-3.5 w-3.5 mr-1.5" />
                    Fontes
                  </TabsTrigger>
                  <TabsTrigger value="confidence" className="text-xs">
                    <ChevronUp className="h-3.5 w-3.5 mr-1.5" />
                    Confiança
                  </TabsTrigger>
                  <TabsTrigger value="limitations" className="text-xs">
                    <List className="h-3.5 w-3.5 mr-1.5" />
                    Limitações
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab} className="mt-3">
                  <ScrollArea className="max-h-[300px]">
                    {renderExplanationContent()}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
