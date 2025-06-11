"use client"
/**
 * Biblioteca de Prompts Otimizados
 * 
 * Este componente implementa uma biblioteca de prompts pré-configurados
 * para diferentes casos de uso, otimizados para diversos modelos de IA.
 */

import { useState, useCallback } from "react"
import { 
  Sparkles, 
  Code, 
  FileText, 
  Image, 
  Search, 
  Database, 
  Calculator, 
  Star, 
  Plus,
  ChevronDown,
  Copy,
  Check
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AIModel } from "@/types/chat"

// Tipo de categoria de prompt
export type PromptCategory = 
  | "creative" 
  | "coding" 
  | "writing" 
  | "image" 
  | "research" 
  | "data" 
  | "math" 
  | "favorite" 
  | "custom"

// Interface para um prompt otimizado
export interface OptimizedPrompt {
  id: string
  title: string
  content: string
  category: PromptCategory
  tags: string[]
  modelCompatibility: string[] // IDs dos modelos compatíveis
  isFavorite?: boolean
  isCustom?: boolean
  createdAt?: number
  updatedAt?: number
}

// Biblioteca de prompts pré-configurados
const PROMPT_LIBRARY: OptimizedPrompt[] = [
  {
    id: "creative_story",
    title: "História Criativa",
    content: "Crie uma história curta e envolvente sobre {tema}. A história deve ter aproximadamente {tamanho} parágrafos, com personagens bem desenvolvidos e um arco narrativo claro com início, meio e fim. Use linguagem descritiva e diálogos para enriquecer a narrativa.",
    category: "creative",
    tags: ["história", "criatividade", "narrativa"],
    modelCompatibility: ["gpt-4o", "claude-3-opus", "gemini-pro"],
  },
  {
    id: "code_review",
    title: "Revisão de Código",
    content: "Revise o seguinte código {linguagem} e sugira melhorias:\n\n```{linguagem}\n{código}\n```\n\nConsidere os seguintes aspectos:\n1. Legibilidade e estilo de código\n2. Potenciais bugs ou problemas de segurança\n3. Otimizações de performance\n4. Aderência a boas práticas\n5. Sugestões de refatoração",
    category: "coding",
    tags: ["código", "revisão", "programação"],
    modelCompatibility: ["gpt-4o", "claude-3-opus", "mistral-large"],
  },
  {
    id: "blog_post",
    title: "Artigo de Blog",
    content: "Escreva um artigo de blog informativo e envolvente sobre {tema}. O artigo deve ter aproximadamente {tamanho} palavras, incluir uma introdução cativante, seções bem definidas com subtítulos, e uma conclusão que resuma os pontos principais. Use um tom {tom} e inclua exemplos práticos ou dados relevantes para enriquecer o conteúdo.",
    category: "writing",
    tags: ["blog", "artigo", "escrita"],
    modelCompatibility: ["gpt-4o", "claude-3-opus", "gemini-pro", "mistral-large"],
  },
  {
    id: "image_prompt",
    title: "Prompt para Geração de Imagem",
    content: "Crie um prompt detalhado para gerar uma imagem de {tema}. Inclua descrições específicas sobre:\n\n- Elementos principais e composição\n- Estilo artístico (ex: fotorrealista, pintura a óleo, pixel art)\n- Iluminação e atmosfera\n- Paleta de cores\n- Perspectiva e enquadramento\n- Detalhes importantes para destacar\n\nO prompt deve ser detalhado o suficiente para gerar uma imagem coerente e visualmente interessante.",
    category: "image",
    tags: ["imagem", "arte", "design"],
    modelCompatibility: ["gpt-4o", "claude-3-opus"],
  },
  {
    id: "research_summary",
    title: "Resumo de Pesquisa",
    content: "Faça um resumo abrangente e objetivo sobre {tema}, baseado nas informações mais recentes disponíveis. O resumo deve:\n\n1. Apresentar uma visão geral do tema\n2. Destacar os principais fatos e descobertas\n3. Mencionar diferentes perspectivas ou debates relevantes\n4. Citar fontes confiáveis quando possível\n5. Identificar lacunas de conhecimento ou áreas para pesquisa adicional\n\nMantenha um tom neutro e baseado em evidências.",
    category: "research",
    tags: ["pesquisa", "resumo", "análise"],
    modelCompatibility: ["gpt-4o", "claude-3-opus", "gemini-pro", "mistral-large"],
  },
  {
    id: "data_analysis",
    title: "Análise de Dados",
    content: "Analise os seguintes dados e forneça insights significativos:\n\n{dados}\n\nSua análise deve incluir:\n1. Padrões ou tendências principais identificados\n2. Anomalias ou outliers relevantes\n3. Possíveis correlações entre variáveis\n4. Visualizações recomendadas para representar os dados\n5. Sugestões para análises adicionais\n\nSe possível, inclua cálculos estatísticos básicos relevantes para o contexto.",
    category: "data",
    tags: ["dados", "análise", "estatística"],
    modelCompatibility: ["gpt-4o", "claude-3-opus"],
  },
  {
    id: "math_problem",
    title: "Resolução de Problema Matemático",
    content: "Resolva o seguinte problema matemático passo a passo:\n\n{problema}\n\nMostre todo o seu raciocínio, incluindo:\n1. Identificação das variáveis e incógnitas\n2. Equações ou fórmulas relevantes\n3. Cada etapa do processo de resolução\n4. Verificação da resposta\n\nExplique cada passo de forma clara para que alguém com conhecimento básico de matemática possa entender.",
    category: "math",
    tags: ["matemática", "problema", "resolução"],
    modelCompatibility: ["gpt-4o", "claude-3-opus", "gemini-pro"],
  },
  {
    id: "api_documentation",
    title: "Documentação de API",
    content: "Crie uma documentação completa para a seguinte API {nome_api}:\n\n```\n{especificação_api}\n```\n\nA documentação deve incluir:\n1. Visão geral da API e seu propósito\n2. Detalhes de autenticação\n3. Endpoints disponíveis com métodos HTTP\n4. Parâmetros de requisição e formatos de resposta\n5. Exemplos de código em {linguagem}\n6. Tratamento de erros e códigos de status\n7. Limitações e boas práticas\n\nUse um formato claro e organizado, adequado para desenvolvedores.",
    category: "coding",
    tags: ["api", "documentação", "desenvolvimento"],
    modelCompatibility: ["gpt-4o", "claude-3-opus", "mistral-large"],
  },
]

interface PromptLibraryProps {
  onSelectPrompt: (prompt: OptimizedPrompt) => void
  selectedModelId?: string
}

/**
 * Componente de biblioteca de prompts
 */
export default function PromptLibrary({
  onSelectPrompt,
  selectedModelId = "gpt-4o",
}: PromptLibraryProps) {
  // Estados
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<PromptCategory | "all">("all")
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)
  const [customPrompts, setCustomPrompts] = useState<OptimizedPrompt[]>([])
  const [favoritePrompts, setFavoritePrompts] = useState<string[]>([])

  // Efeito para carregar prompts personalizados e favoritos do localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return

    // Carrega prompts personalizados
    const savedCustomPrompts = localStorage.getItem("custom-prompts")
    if (savedCustomPrompts) {
      try {
        setCustomPrompts(JSON.parse(savedCustomPrompts))
      } catch (error) {
        console.error("Erro ao carregar prompts personalizados:", error)
      }
    }

    // Carrega prompts favoritos
    const savedFavorites = localStorage.getItem("favorite-prompts")
    if (savedFavorites) {
      try {
        setFavoritePrompts(JSON.parse(savedFavorites))
      } catch (error) {
        console.error("Erro ao carregar prompts favoritos:", error)
      }
    }
  }, [])

  /**
   * Filtra os prompts com base na pesquisa e categoria
   */
  const filteredPrompts = React.useMemo(() => {
    // Combina prompts da biblioteca e personalizados
    const allPrompts = [...PROMPT_LIBRARY, ...customPrompts].map(prompt => ({
      ...prompt,
      isFavorite: favoritePrompts.includes(prompt.id)
    }))

    // Filtra por modelo selecionado
    const modelCompatiblePrompts = selectedModelId
      ? allPrompts.filter(prompt => 
          prompt.modelCompatibility.includes(selectedModelId) || 
          prompt.isCustom
        )
      : allPrompts

    // Filtra por pesquisa
    const searchFilteredPrompts = searchQuery
      ? modelCompatiblePrompts.filter(prompt =>
          prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : modelCompatiblePrompts

    // Filtra por categoria
    return activeCategory === "all"
      ? searchFilteredPrompts
      : activeCategory === "favorite"
        ? searchFilteredPrompts.filter(prompt => prompt.isFavorite)
        : searchFilteredPrompts.filter(prompt => prompt.category === activeCategory)
  }, [PROMPT_LIBRARY, customPrompts, favoritePrompts, searchQuery, activeCategory, selectedModelId])

  /**
   * Manipula a seleção de um prompt
   */
  const handleSelectPrompt = useCallback(
    (prompt: OptimizedPrompt) => {
      onSelectPrompt(prompt)
    },
    [onSelectPrompt]
  )

  /**
   * Manipula a cópia de um prompt
   */
  const handleCopyPrompt = useCallback((promptId: string, promptContent: string) => {
    navigator.clipboard.writeText(promptContent)
    setCopiedPromptId(promptId)
    setTimeout(() => setCopiedPromptId(null), 2000)
  }, [])

  /**
   * Manipula a adição/remoção de um prompt aos favoritos
   */
  const handleToggleFavorite = useCallback((promptId: string) => {
    setFavoritePrompts(prev => {
      const newFavorites = prev.includes(promptId)
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
      
      // Salva no localStorage
      localStorage.setItem("favorite-prompts", JSON.stringify(newFavorites))
      
      return newFavorites
    })
  }, [])

  /**
   * Renderiza um ícone com base na categoria
   */
  const renderCategoryIcon = (category: PromptCategory) => {
    switch (category) {
      case "creative":
        return <Sparkles className="h-4 w-4" />
      case "coding":
        return <Code className="h-4 w-4" />
      case "writing":
        return <FileText className="h-4 w-4" />
      case "image":
        return <Image className="h-4 w-4" />
      case "research":
        return <Search className="h-4 w-4" />
      case "data":
        return <Database className="h-4 w-4" />
      case "math":
        return <Calculator className="h-4 w-4" />
      case "favorite":
        return <Star className="h-4 w-4" />
      case "custom":
        return <Plus className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>Prompts</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="font-medium mb-2">Biblioteca de Prompts</h3>
          <Input
            placeholder="Pesquisar prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="categories" className="flex-1">Categorias</TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1">Favoritos</TabsTrigger>
            </TabsList>
            <TabsContent value="categories" className="mt-2">
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant={activeCategory === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory("all")}
                >
                  Todos
                </Badge>
                <Badge
                  variant={activeCategory === "creative" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory("creative")}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Criativo
                </Badge>
                <Badge
                  variant={activeCategory === "coding" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory("coding")}
                >
                  <Code className="h-3 w-3 mr-1" />
                  Código
                </Badge>
                <Badge
                  variant={activeCategory === "writing" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory("writing")}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Escrita
                </Badge>
                <Badge
                  variant={activeCategory === "image" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory("image")}
                >
                  <Image className="h-3 w-3 mr-1" />
                  Imagem
                </Badge>
                <Badge
                  variant={activeCategory === "research" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory("research")}
                >
                  <Search className="h-3 w-3 mr-1" />
                  Pesquisa
                </Badge>
                <Badge
                  variant={activeCategory === "data" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory("data")}
                >
                  <Database className="h-3 w-3 mr-1" />
                  Dados
                </Badge>
                <Badge
                  variant={activeCategory === "math" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory("math")}
                >
                  <Calculator className="h-3 w-3 mr-1" />
                  Matemática
                </Badge>
              </div>
            </TabsContent>
            <TabsContent value="favorites" className="mt-2">
              <div className="text-sm text-muted-foreground">
                {favoritePrompts.length === 0 ? (
                  "Nenhum prompt favorito ainda. Clique na estrela para adicionar."
                ) : (
                  `${favoritePrompts.length} prompts favoritos`
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {filteredPrompts.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhum prompt encontrado para esta pesquisa ou categoria.
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredPrompts.map((prompt) => (
                  <AccordionItem key={prompt.id} value={prompt.id}>
                    <AccordionTrigger className="py-2 px-3 hover:bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2 text-left">
                        {renderCategoryIcon(prompt.category)}
                        <span className="text-sm font-medium">{prompt.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <div className="text-xs text-muted-foreground mb-2 line-clamp-3">
                        {prompt.content}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {prompt.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleSelectPrompt(prompt)}
                        >
                          Usar Prompt
                        </Button>
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleCopyPrompt(prompt.id, prompt.content)}
                                >
                                  {copiedPromptId === prompt.id ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Copiar prompt</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleToggleFavorite(prompt.id)}
                                >
                                  <Star
                                    className={`h-3.5 w-3.5 ${
                                      prompt.isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                                    }`}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>{prompt.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

// Importação necessária para o useEffect
import React from "react";
