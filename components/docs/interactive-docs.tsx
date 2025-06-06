"use client"
/**
 * Documentação Interativa
 * 
 * Este componente implementa uma documentação interativa onde os usuários
 * podem experimentar componentes e APIs diretamente na interface.
 */

import { useState, useCallback } from "react"
import { 
  Book, 
  Code, 
  Copy, 
  Check, 
  Play,
  Layers,
  FileText,
  Search,
  ChevronRight,
  ChevronDown,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { showNotification } from "@/components/ui/notification"

// Interface para um exemplo de código
export interface CodeExample {
  id: string
  title: string
  description: string
  code: string
  language: string
  preview?: React.ReactNode
  tags?: string[]
}

// Interface para uma seção de documentação
export interface DocSection {
  id: string
  title: string
  content: string
  subsections?: DocSection[]
  examples?: CodeExample[]
}

// Interface para uma página de documentação
export interface DocPage {
  id: string
  title: string
  description: string
  sections: DocSection[]
}

// Exemplo de página de documentação
const EXAMPLE_DOC_PAGE: DocPage = {
  id: "chat-api",
  title: "API de Chat",
  description: "Documentação completa da API de Chat, incluindo endpoints, parâmetros e exemplos de uso.",
  sections: [
    {
      id: "introduction",
      title: "Introdução",
      content: `
A API de Chat permite integrar funcionalidades de conversação com modelos de IA em suas aplicações.
Você pode enviar mensagens, receber respostas e personalizar o comportamento dos modelos.

Esta API suporta diversos modelos de IA, incluindo GPT-4, Claude e Gemini.
      `,
      examples: [
        {
          id: "basic-example",
          title: "Exemplo Básico",
          description: "Um exemplo simples de como enviar uma mensagem e receber uma resposta.",
          code: `
// Exemplo de uso básico da API de Chat
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Olá, como você está?' }
    ],
    model: 'gpt-4o',
  }),
});

const data = await response.json();
console.log(data.message);
          `,
          language: "javascript",
          tags: ["básico", "iniciante"],
        }
      ]
    },
    {
      id: "endpoints",
      title: "Endpoints",
      content: "A API de Chat possui os seguintes endpoints:",
      subsections: [
        {
          id: "send-message",
          title: "POST /api/chat",
          content: `
Envia uma mensagem para o modelo de IA e recebe uma resposta.

**Parâmetros:**

- \`messages\`: Array de objetos de mensagem, cada um com \`role\` e \`content\`.
- \`model\`: ID do modelo a ser usado (opcional, padrão: gpt-4o).
- \`temperature\`: Controla a aleatoriedade das respostas (opcional, padrão: 0.7).
- \`max_tokens\`: Número máximo de tokens na resposta (opcional).
- \`tools\`: Array de ferramentas disponíveis para o modelo (opcional).
          `,
          examples: [
            {
              id: "send-message-example",
              title: "Enviar Mensagem",
              description: "Exemplo de como enviar uma mensagem com parâmetros personalizados.",
              code: `
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: 'Você é um assistente útil e conciso.' },
      { role: 'user', content: 'Explique o que é uma API RESTful.' }
    ],
    model: 'gpt-4o',
    temperature: 0.3,
    max_tokens: 500,
  }),
});

const data = await response.json();
console.log(data.message);
              `,
              language: "javascript",
              tags: ["avançado", "personalização"],
            }
          ]
        },
        {
          id: "stream-message",
          title: "POST /api/chat/stream",
          content: `
Envia uma mensagem e recebe a resposta em formato de stream, permitindo exibir a resposta gradualmente.

**Parâmetros:**

Os mesmos parâmetros de \`/api/chat\`, mas a resposta é enviada como um stream de eventos.
          `,
          examples: [
            {
              id: "stream-example",
              title: "Streaming de Resposta",
              description: "Exemplo de como receber respostas em formato de stream.",
              code: `
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Conte uma história curta sobre um robô.' }
    ],
    model: 'claude-3-opus',
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log(chunk); // Exibe cada pedaço da resposta
}
              `,
              language: "javascript",
              tags: ["streaming", "avançado"],
            }
          ]
        }
      ]
    },
    {
      id: "models",
      title: "Modelos Disponíveis",
      content: `
A API suporta os seguintes modelos:

- \`gpt-4o\`: Modelo mais recente da OpenAI, com bom equilíbrio entre qualidade e velocidade.
- \`gpt-4-turbo\`: Versão otimizada do GPT-4, com contexto expandido.
- \`claude-3-opus\`: Modelo mais avançado da Anthropic, excelente para tarefas complexas.
- \`claude-3-sonnet\`: Versão mais rápida do Claude 3, bom equilíbrio entre qualidade e velocidade.
- \`gemini-pro\`: Modelo da Google, com bom desempenho em tarefas gerais.
- \`mistral-large\`: Modelo da Mistral AI, eficiente e com boa qualidade.
      `,
      examples: [
        {
          id: "model-selection",
          title: "Seleção de Modelo",
          description: "Exemplo de como selecionar diferentes modelos.",
          code: `
// Usando GPT-4o
const responseGPT = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Resuma o livro Dom Casmurro.' }],
    model: 'gpt-4o',
  }),
});

// Usando Claude 3
const responseClaude = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Resuma o livro Dom Casmurro.' }],
    model: 'claude-3-opus',
  }),
});
          `,
          language: "javascript",
          tags: ["modelos", "comparação"],
        }
      ]
    },
    {
      id: "tools",
      title: "Ferramentas",
      content: `
A API permite fornecer ferramentas para o modelo usar durante a geração de respostas.

**Tipos de ferramentas:**

- \`function_calling\`: Permite que o modelo chame funções definidas pelo usuário.
- \`retrieval\`: Permite que o modelo busque informações em uma base de conhecimento.
- \`code_interpreter\`: Permite que o modelo execute código Python para resolver problemas.
      `,
      examples: [
        {
          id: "function-calling",
          title: "Function Calling",
          description: "Exemplo de como usar function calling com a API.",
          code: `
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Qual é a previsão do tempo para São Paulo amanhã?' }
    ],
    model: 'gpt-4o',
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'Obtém a previsão do tempo para uma localização',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'A cidade e estado, ex. São Paulo, SP'
              },
              date: {
                type: 'string',
                description: 'A data para a previsão, ex. 2023-06-15'
              }
            },
            required: ['location']
          }
        }
      }
    ]
  }),
});

const data = await response.json();

// Se o modelo chamou a função
if (data.tool_calls && data.tool_calls.length > 0) {
  const functionCall = data.tool_calls[0];
  
  // Aqui você implementaria a função get_weather
  const weatherData = await getWeather(
    JSON.parse(functionCall.function.arguments)
  );
  
  // Envie o resultado de volta para o modelo
  const finalResponse = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Qual é a previsão do tempo para São Paulo amanhã?' },
        { role: 'assistant', content: null, tool_calls: [functionCall] },
        { 
          role: 'tool', 
          content: JSON.stringify(weatherData),
          tool_call_id: functionCall.id
        }
      ],
      model: 'gpt-4o'
    }),
  });
  
  const finalData = await finalResponse.json();
  console.log(finalData.message);
}
          `,
          language: "javascript",
          tags: ["ferramentas", "function calling", "avançado"],
        }
      ]
    }
  ]
};

interface InteractiveDocsProps {
  page?: DocPage;
  onSearch?: (query: string) => void;
}

/**
 * Componente de documentação interativa
 */
export default function InteractiveDocs({
  page = EXAMPLE_DOC_PAGE,
  onSearch,
}: InteractiveDocsProps) {
  // Estados
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"docs" | "examples" | "api">("docs")
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [copiedExampleId, setCopiedExampleId] = useState<string | null>(null)
  
  /**
   * Manipula a cópia de um exemplo de código
   */
  const handleCopyCode = useCallback((code: string, exampleId: string) => {
    navigator.clipboard.writeText(code)
    setCopiedExampleId(exampleId)
    
    setTimeout(() => {
      setCopiedExampleId(null)
    }, 2000)
  }, [])
  
  /**
   * Manipula a execução de um exemplo de código
   */
  const handleRunExample = useCallback((code: string) => {
    // Aqui você implementaria a lógica para executar o código
    // Por exemplo, usando um sandbox ou enviando para um endpoint
    
    showNotification({
      type: "info",
      message: "Executando exemplo de código...",
    })
    
    // Simulação de execução
    setTimeout(() => {
      showNotification({
        type: "success",
        message: "Exemplo executado com sucesso!",
      })
    }, 1500)
  }, [])
  
  /**
   * Manipula a pesquisa na documentação
   */
  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      // Implementação padrão de pesquisa
      showNotification({
        type: "info",
        message: `Pesquisando por "${searchQuery}"...`,
      })
    }
  }, [searchQuery, onSearch])
  
  /**
   * Alterna a expansão de uma seção
   */
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId)
      } else {
        return [...prev, sectionId]
      }
    })
  }, [])
  
  /**
   * Renderiza uma seção de documentação
   */
  const renderSection = (section: DocSection, level = 0) => {
    const isExpanded = expandedSections.includes(section.id)
    
    return (
      <div key={section.id} className={`ml-${level * 4}`}>
        <div
          className="flex items-center py-2 cursor-pointer hover:bg-muted/50 rounded-md px-2"
          onClick={() => toggleSection(section.id)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          <h3 className={`font-medium ${level === 0 ? 'text-lg' : 'text-base'}`}>{section.title}</h3>
        </div>
        
        {isExpanded && (
          <div className="ml-6 mt-2 mb-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {section.content.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            
            {section.examples && section.examples.length > 0 && (
              <div className="mt-4 space-y-4">
                {section.examples.map(example => (
                  <div key={example.id} className="border rounded-md overflow-hidden">
                    <div className="bg-muted p-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{example.title}</h4>
                        <p className="text-sm text-muted-foreground">{example.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCode(example.code, example.id)}
                        >
                          {copiedExampleId === example.id ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          {copiedExampleId === example.id ? "Copiado" : "Copiar"}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleRunExample(example.code)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Executar
                        </Button>
                      </div>
                    </div>
                    <div className="bg-zinc-950 p-4 overflow-x-auto">
                      <pre className="text-sm text-zinc-100 font-mono">
                        <code>{example.code.trim()}</code>
                      </pre>
                    </div>
                    {example.tags && example.tags.length > 0 && (
                      <div className="bg-muted p-2 flex flex-wrap gap-1">
                        {example.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-muted-foreground/10 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {section.subsections && section.subsections.length > 0 && (
              <div className="mt-4 space-y-2">
                {section.subsections.map(subsection => renderSection(subsection, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
  
  /**
   * Coleta todos os exemplos de código da página
   */
  const getAllExamples = useCallback((sections: DocSection[]): CodeExample[] => {
    let examples: CodeExample[] = []
    
    sections.forEach(section => {
      if (section.examples) {
        examples = [...examples, ...section.examples]
      }
      
      if (section.subsections) {
        examples = [...examples, ...getAllExamples(section.subsections)]
      }
    })
    
    return examples
  }, [])
  
  // Todos os exemplos da página
  const allExamples = getAllExamples(page.sections)
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{page.title}</h1>
            <p className="text-muted-foreground">{page.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar na documentação..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="docs" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="docs" className="flex items-center gap-1">
              <Book className="h-4 w-4" />
              <span>Documentação</span>
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span>Exemplos</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              <span>Referência API</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <TabsContent value="docs" className="h-full">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {page.sections.map(section => renderSection(section))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="examples" className="h-full">
          <ScrollArea className="h-full">
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {allExamples.map(example => (
                <div key={example.id} className="border rounded-md overflow-hidden">
                  <div className="bg-muted p-3">
                    <h4 className="font-medium">{example.title}</h4>
                    <p className="text-sm text-muted-foreground">{example.description}</p>
                  </div>
                  <div className="bg-zinc-950 p-4 overflow-x-auto max-h-[300px]">
                    <pre className="text-sm text-zinc-100 font-mono">
                      <code>{example.code.trim()}</code>
                    </pre>
                  </div>
                  <div className="bg-muted p-2 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {example.tags && example.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-muted-foreground/10 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(example.code, example.id)}
                      >
                        {copiedExampleId === example.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRunExample(example.code)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="api" className="h-full">
          <ScrollArea className="h-full">
            <div className="p-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="endpoints">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Endpoints</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-6">
                      <div>
                        <h3 className="font-medium">POST /api/chat</h3>
                        <p className="text-sm text-muted-foreground">
                          Envia uma mensagem para o modelo de IA e recebe uma resposta.
                        </p>
                        <div className="mt-2 border-l-2 border-muted-foreground/20 pl-4">
                          <h4 className="text-sm font-medium">Parâmetros</h4>
                          <ul className="mt-1 space-y-1 text-sm">
                            <li><code>messages</code>: Array de objetos de mensagem</li>
                            <li><code>model</code>: ID do modelo (opcional)</li>
                            <li><code>temperature</code>: Controle de aleatoriedade (opcional)</li>
                            <li><code>max_tokens</code>: Limite de tokens (opcional)</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">POST /api/chat/stream</h3>
                        <p className="text-sm text-muted-foreground">
                          Envia uma mensagem e recebe a resposta em formato de stream.
                        </p>
                        <div className="mt-2 border-l-2 border-muted-foreground/20 pl-4">
                          <h4 className="text-sm font-medium">Parâmetros</h4>
                          <p className="text-sm">Os mesmos parâmetros de /api/chat</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="models">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>Modelos</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border rounded-md p-3">
                          <h3 className="font-medium">gpt-4o</h3>
                          <p className="text-sm text-muted-foreground">
                            Modelo mais recente da OpenAI, com bom equilíbrio entre qualidade e velocidade.
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h3 className="font-medium">claude-3-opus</h3>
                          <p className="text-sm text-muted-foreground">
                            Modelo mais avançado da Anthropic, excelente para tarefas complexas.
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h3 className="font-medium">gemini-pro</h3>
                          <p className="text-sm text-muted-foreground">
                            Modelo da Google, com bom desempenho em tarefas gerais.
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h3 className="font-medium">mistral-large</h3>
                          <p className="text-sm text-muted-foreground">
                            Modelo da Mistral AI, eficiente e com boa qualidade.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tools">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span>Ferramentas</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-6">
                      <div>
                        <h3 className="font-medium">function_calling</h3>
                        <p className="text-sm text-muted-foreground">
                          Permite que o modelo chame funções definidas pelo usuário.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">retrieval</h3>
                        <p className="text-sm text-muted-foreground">
                          Permite que o modelo busque informações em uma base de conhecimento.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">code_interpreter</h3>
                        <p className="text-sm text-muted-foreground">
                          Permite que o modelo execute código Python para resolver problemas.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-2">Recursos Adicionais</h3>
                <div className="space-y-2">
                  <a
                    href="#"
                    className="flex items-center gap-2 text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Documentação completa em PDF</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  
                  <a
                    href="#"
                    className="flex items-center gap-2 text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Code className="h-4 w-4" />
                    <span>Repositório de exemplos no GitHub</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  
                  <a
                    href="#"
                    className="flex items-center gap-2 text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="h-4 w-4" />
                    <span>Vídeos tutoriais</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </div>
    </div>
  )
}
