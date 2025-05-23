/**
 * Otimizações de Performance
 * 
 * Este arquivo implementa melhorias de performance usando React Server Components,
 * Edge Functions, Streaming de Respostas e Analytics Avançados.
 */

// ========== SERVER COMPONENTS ==========

/**
 * Exemplo de React Server Component
 * 
 * Os Server Components são renderizados no servidor e enviam apenas HTML para o cliente,
 * reduzindo o JavaScript enviado e melhorando o tempo de carregamento inicial.
 * 
 * Arquivo: app/dashboard/page.tsx
 */
export const ServerComponentExample = `
// Este é um Server Component (não precisa do "use client")
import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { RecentProjects } from '@/components/dashboard/recent-projects'
import { ProjectStats } from '@/components/dashboard/project-stats'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Função para buscar dados do servidor
async function getProjectData() {
  // Esta função é executada no servidor durante a renderização
  const res = await fetch('https://api.example.com/projects', {
    // Opções de cache para otimizar requisições
    next: { revalidate: 60 } // Revalidar a cada 60 segundos
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch projects')
  }
  
  return res.json()
}

export default async function DashboardPage() {
  // Dados buscados no servidor, sem JavaScript no cliente
  const projectData = await getProjectData()
  
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="container py-6">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Componente com Suspense para streaming */}
            <Suspense fallback={<LoadingSpinner />}>
              <ProjectStats />
            </Suspense>
            
            <RecentProjects projects={projectData.recentProjects} />
          </div>
        </main>
      </div>
    </div>
  )
}
`

/**
 * Exemplo de Client Component que interage com Server Component
 * 
 * Arquivo: components/dashboard/recent-projects.tsx
 */
export const ClientComponentExample = `
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/dashboard/project-card'

export function RecentProjects({ projects }) {
  // Estado gerenciado no cliente
  const [filter, setFilter] = useState('all')
  
  // Filtragem feita no cliente
  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    return project.type === filter
  })
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Projetos Recentes</h2>
        
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
          <Button 
            variant={filter === 'chat' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('chat')}
          >
            Chat
          </Button>
          <Button 
            variant={filter === 'canvas' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('canvas')}
          >
            Canvas
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Nenhum projeto encontrado.
          </p>
        )}
      </div>
    </div>
  )
}
`

// ========== EDGE FUNCTIONS ==========

/**
 * Exemplo de Edge Function para API de Chat
 * 
 * As Edge Functions são executadas em servidores próximos aos usuários,
 * reduzindo a latência e melhorando a experiência global.
 * 
 * Arquivo: app/api/chat/route.ts
 */
export const EdgeFunctionExample = `
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

// Configuração da API da OpenAI
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

// Configuração para executar na Edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages, model = 'gpt-4o', temperature = 0.7 } = await req.json()

    // Faz a requisição para a OpenAI
    const response = await openai.createChatCompletion({
      model,
      messages,
      temperature,
      stream: true,
    })

    // Cria um stream para enviar a resposta gradualmente
    const stream = OpenAIStream(response)
    
    // Retorna uma resposta streaming
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('[CHAT API ERROR]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
`

/**
 * Exemplo de Edge Function para processamento de imagem
 * 
 * Arquivo: app/api/image/process/route.ts
 */
export const EdgeImageProcessingExample = `
import { createParser } from 'eventsource-parser'

// Configuração para executar na Edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const prompt = formData.get('prompt') as string
    
    if (!image || !prompt) {
      return new Response(JSON.stringify({ error: 'Missing image or prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Converte a imagem para base64
    const imageBuffer = await image.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const dataURI = \`data:\${image.type};base64,\${base64Image}\`
    
    // Faz a requisição para a API de processamento de imagem
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: dataURI } }
            ]
          }
        ],
        stream: true,
      }),
    })
    
    // Cria um stream para enviar a resposta gradualmente
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        const parser = createParser((event) => {
          if (event.type === 'event') {
            const data = event.data
            
            if (data === '[DONE]') {
              controller.close()
              return
            }
            
            try {
              const json = JSON.parse(data)
              const text = json.choices[0]?.delta?.content || ''
              
              if (text) {
                controller.enqueue(encoder.encode(text))
              }
            } catch (e) {
              controller.error(e)
            }
          }
        })
        
        // Alimenta o parser com chunks da resposta
        const reader = response.body?.getReader()
        if (!reader) return
        
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value, { stream: true })
            parser.feed(chunk)
          }
        } catch (e) {
          controller.error(e)
        }
      },
    })
    
    // Retorna uma resposta streaming
    return new Response(stream)
  } catch (error) {
    console.error('[IMAGE PROCESSING ERROR]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
`

// ========== STREAMING DE RESPOSTAS ==========

/**
 * Exemplo de componente de chat com streaming de respostas
 * 
 * Arquivo: components/chat/streaming-chat.tsx
 */
export const StreamingChatExample = `
"use client"

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Message } from '@/types/chat'
import { MultimodalInput } from '@/components/multimodal-integration'
import { MediaViewer } from '@/components/multimodal-integration'

export function StreamingChat() {
  const [attachments, setAttachments] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Hook da biblioteca 'ai' que gerencia o estado e streaming
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  } = useChat({
    api: '/api/chat',
    // Opções para streaming
    onResponse: (response) => {
      // Você pode processar a resposta aqui
      console.log('Streaming started', response)
    },
    onFinish: (message) => {
      // Chamado quando o streaming termina
      console.log('Streaming finished', message)
    },
  })
  
  // Rola para o final quando novas mensagens chegam
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])
  
  // Manipula o envio de mídia
  const handleSendMedia = async (file: File, type: string) => {
    // Cria uma URL para visualização
    const url = URL.createObjectURL(file)
    
    // Adiciona à lista de anexos
    const attachment = {
      id: Date.now().toString(),
      type,
      name: file.name,
      url,
      size: file.size,
    }
    
    setAttachments(prev => [...prev, attachment])
    
    // Envia a mensagem com o anexo
    const formData = new FormData()
    formData.append('file', file)
    
    // Adiciona a mensagem localmente
    append({
      role: 'user',
      content: \`[Anexo: \${file.name}]\`,
      attachments: [attachment],
    })
    
    // Envia para o servidor
    try {
      const response = await fetch('/api/chat/attachment', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Falha ao enviar anexo')
      }
      
      const data = await response.json()
      
      // Adiciona a resposta do assistente
      append({
        role: 'assistant',
        content: data.message,
      })
    } catch (error) {
      console.error('Erro ao enviar anexo:', error)
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Bem-vindo ao Chat</h3>
              <p className="text-muted-foreground">
                Envie uma mensagem para começar a conversa.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 rounded-lg p-4",
                message.role === 'user'
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <Avatar
                className="h-8 w-8"
                name={message.role === 'user' ? 'Você' : 'Assistente'}
              />
              
              <div className="flex-1 space-y-2">
                <div className="prose prose-sm dark:prose-invert">
                  {message.content}
                </div>
                
                {message.attachments?.map(attachment => (
                  <MediaViewer
                    key={attachment.id}
                    media={attachment}
                  />
                ))}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <MultimodalInput
        onSendMessage={(text) => {
          // Usa o handleSubmit do hook useChat
          const formData = new FormData()
          formData.append('message', text)
          handleSubmit({ preventDefault: () => {} } as any)
        }}
        onSendMedia={handleSendMedia}
      />
    </div>
  )
}
`

// ========== ANALYTICS AVANÇADOS ==========

/**
 * Exemplo de sistema de analytics para telemetria anônima
 * 
 * Arquivo: lib/analytics.ts
 */
export const AnalyticsExample = `
/**
 * Sistema de Analytics Avançados
 * 
 * Este módulo implementa telemetria anônima para identificar gargalos
 * de performance e problemas de UX.
 */
"use client"

import { useEffect, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Tipos de eventos
export type AnalyticsEventType = 
  | 'page_view'
  | 'feature_use'
  | 'error'
  | 'performance'
  | 'user_timing'
  | 'resource_timing'
  | 'interaction'

// Interface para um evento de analytics
export interface AnalyticsEvent {
  type: AnalyticsEventType
  name: string
  value?: number
  metadata?: Record<string, any>
  timestamp: number
}

// Configuração global
const ANALYTICS_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics',
  sampleRate: Number(process.env.NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE || '0.1'),
  sessionTimeout: Number(process.env.NEXT_PUBLIC_ANALYTICS_SESSION_TIMEOUT || '30'),
  batchSize: Number(process.env.NEXT_PUBLIC_ANALYTICS_BATCH_SIZE || '10'),
  debug: process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true',
}

// Fila de eventos para envio em lote
let eventQueue: AnalyticsEvent[] = []
let sessionId: string | null = null
let userId: string | null = null

/**
 * Inicializa o sistema de analytics
 */
export function initAnalytics() {
  if (typeof window === 'undefined' || !ANALYTICS_CONFIG.enabled) return
  
  // Gera ou recupera o ID da sessão
  sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = \`session_\${Date.now()}_\${Math.random().toString(36).substring(2, 9)}\`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  
  // Gera ou recupera o ID do usuário (anônimo)
  userId = localStorage.getItem('analytics_user_id')
  if (!userId) {
    userId = \`user_\${Math.random().toString(36).substring(2, 15)}\`
    localStorage.setItem('analytics_user_id', userId)
  }
  
  // Configura observadores de performance
  if ('PerformanceObserver' in window) {
    // Observa métricas de performance web vitals
    try {
      const perfObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (ANALYTICS_CONFIG.debug) {
            console.debug('[Analytics] Performance entry:', entry)
          }
          
          // Registra métricas importantes
          if (entry.entryType === 'largest-contentful-paint') {
            trackEvent('performance', 'lcp', {
              value: entry.startTime,
              metadata: {
                element: (entry as any).element?.tagName || 'unknown',
              },
            })
          } else if (entry.entryType === 'first-input') {
            trackEvent('performance', 'fid', {
              value: (entry as any).processingStart - entry.startTime,
            })
          } else if (entry.entryType === 'layout-shift') {
            if (!(entry as any).hadRecentInput) {
              trackEvent('performance', 'cls', {
                value: (entry as any).value,
              })
            }
          }
        })
      })
      
      // Observa diferentes tipos de métricas
      perfObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      perfObserver.observe({ type: 'first-input', buffered: true })
      perfObserver.observe({ type: 'layout-shift', buffered: true })
    } catch (e) {
      console.error('[Analytics] Error setting up PerformanceObserver:', e)
    }
  }
  
  // Configura listener para erros não capturados
  window.addEventListener('error', (event) => {
    trackEvent('error', 'uncaught_error', {
      metadata: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      },
    })
  })
  
  // Configura listener para rejeições de promessas não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    trackEvent('error', 'unhandled_rejection', {
      metadata: {
        reason: String(event.reason),
        stack: event.reason?.stack,
      },
    })
  })
  
  // Configura envio periódico de eventos em lote
  setInterval(flushEvents, 10000) // A cada 10 segundos
  
  // Garante que os eventos sejam enviados antes do usuário sair da página
  window.addEventListener('beforeunload', () => {
    flushEvents(true)
  })
  
  if (ANALYTICS_CONFIG.debug) {
    console.debug('[Analytics] Initialized with config:', ANALYTICS_CONFIG)
  }
}

/**
 * Rastreia um evento de analytics
 */
export function trackEvent(
  type: AnalyticsEventType,
  name: string,
  options?: {
    value?: number
    metadata?: Record<string, any>
  }
) {
  if (typeof window === 'undefined' || !ANALYTICS_CONFIG.enabled) return
  
  // Amostragem para reduzir volume de dados
  if (Math.random() > ANALYTICS_CONFIG.sampleRate) return
  
  const event: AnalyticsEvent = {
    type,
    name,
    value: options?.value,
    metadata: options?.metadata,
    timestamp: Date.now(),
  }
  
  eventQueue.push(event)
  
  if (ANALYTICS_CONFIG.debug) {
    console.debug('[Analytics] Tracked event:', event)
  }
  
  // Envia imediatamente se a fila atingir o tamanho do lote
  if (eventQueue.length >= ANALYTICS_CONFIG.batchSize) {
    flushEvents()
  }
}

/**
 * Envia os eventos em fila para o servidor
 */
export function flushEvents(immediate = false) {
  if (
    typeof window === 'undefined' ||
    !ANALYTICS_CONFIG.enabled ||
    eventQueue.length === 0
  ) return
  
  const events = [...eventQueue]
  eventQueue = []
  
  const payload = {
    sessionId,
    userId,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    events,
  }
  
  const sendBeacon = () => {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json',
      })
      return navigator.sendBeacon(ANALYTICS_CONFIG.endpoint, blob)
    }
    return false
  }
  
  const fetchData = async () => {
    try {
      const response = await fetch(ANALYTICS_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Para requisições não críticas, use keepalive
        keepalive: true,
      })
      
      if (!response.ok) {
        console.error('[Analytics] Failed to send events:', response.status)
      }
    } catch (error) {
      console.error('[Analytics] Error sending events:', error)
    }
  }
  
  // Tenta usar sendBeacon para garantir que os dados sejam enviados
  // mesmo se o usuário estiver saindo da página
  if (immediate) {
    const beaconSuccess = sendBeacon()
    if (!beaconSuccess) {
      fetchData()
    }
  } else {
    fetchData()
  }
  
  if (ANALYTICS_CONFIG.debug) {
    console.debug('[Analytics] Flushed events:', events.length)
  }
}

/**
 * Hook para rastrear visualizações de página
 */
export function usePageViewTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Rastreia visualização de página
    trackEvent('page_view', pathname, {
      metadata: {
        url: window.location.href,
        referrer: document.referrer,
        query: Object.fromEntries(searchParams.entries()),
      },
    })
    
    // Rastreia tempo de carregamento da página
    if (window.performance) {
      const pageNav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (pageNav) {
        trackEvent('performance', 'page_load', {
          value: pageNav.loadEventEnd - pageNav.startTime,
          metadata: {
            dns: pageNav.domainLookupEnd - pageNav.domainLookupStart,
            tcp: pageNav.connectEnd - pageNav.connectStart,
            ttfb: pageNav.responseStart - pageNav.requestStart,
            download: pageNav.responseEnd - pageNav.responseStart,
            dom: pageNav.domComplete - pageNav.domInteractive,
          },
        })
      }
    }
  }, [pathname, searchParams])
}

/**
 * Hook para rastrear interações do usuário
 */
export function useInteractionTracking() {
  const trackInteraction = useCallback((
    element: string,
    action: string,
    metadata?: Record<string, any>
  ) => {
    trackEvent('interaction', \`\${element}_\${action}\`, { metadata })
  }, [])
  
  return { trackInteraction }
}

/**
 * Rastreia o tempo de uma operação
 */
export function trackTiming(name: string, callback: () => any) {
  const start = performance.now()
  const result = callback()
  const duration = performance.now() - start
  
  trackEvent('user_timing', name, {
    value: duration,
  })
  
  return result
}

/**
 * Rastreia o tempo de uma operação assíncrona
 */
export async function trackTimingAsync(name: string, callback: () => Promise<any>) {
  const start = performance.now()
  const result = await callback()
  const duration = performance.now() - start
  
  trackEvent('user_timing', name, {
    value: duration,
  })
  
  return result
}

// Inicializa o sistema de analytics
if (typeof window !== 'undefined') {
  initAnalytics()
}
`

/**
 * Exemplo de API para receber dados de analytics
 * 
 * Arquivo: app/api/analytics/route.ts
 */
export const AnalyticsAPIExample = `
import { NextResponse } from 'next/server'

// Configuração para executar na Edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Validação básica
    if (!data.sessionId || !data.events || !Array.isArray(data.events)) {
      return NextResponse.json(
        { error: 'Invalid analytics data' },
        { status: 400 }
      )
    }
    
    // Processa os eventos
    // Em produção, você enviaria para um serviço de analytics como
    // Google Analytics, Mixpanel, PostHog, ou seu próprio data warehouse
    
    // Exemplo: enviar para um endpoint de coleta de dados
    if (process.env.ANALYTICS_COLLECTION_ENDPOINT) {
      await fetch(process.env.ANALYTICS_COLLECTION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ANALYTICS_API_KEY || '',
        },
        body: JSON.stringify(data),
      })
    } else {
      // Em desenvolvimento, apenas loga os eventos
      console.log('[Analytics] Received events:', data.events.length)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Analytics API Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
`

/**
 * Exemplo de dashboard de analytics
 * 
 * Arquivo: app/admin/analytics/page.tsx
 */
export const AnalyticsDashboardExample = `
import { Suspense } from 'react'
import { PerformanceMetrics } from '@/components/analytics/performance-metrics'
import { UserJourney } from '@/components/analytics/user-journey'
import { ErrorReport } from '@/components/analytics/error-report'
import { FeatureUsage } from '@/components/analytics/feature-usage'
import { PageViews } from '@/components/analytics/page-views'
import { DateRangePicker } from '@/components/analytics/date-range-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Função para buscar dados de analytics
async function getAnalyticsData(dateRange: { start: string; end: string }) {
  // Em produção, você buscaria dados do seu serviço de analytics
  const res = await fetch(\`\${process.env.ANALYTICS_API_URL}/dashboard\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${process.env.ANALYTICS_API_KEY}\`,
    },
    body: JSON.stringify({
      dateRange,
    }),
    next: { revalidate: 3600 }, // Revalidar a cada hora
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch analytics data')
  }
  
  return res.json()
}

export default async function AnalyticsDashboardPage({
  searchParams,
}: {
  searchParams: { start?: string; end?: string }
}) {
  // Determina o intervalo de datas
  const now = new Date()
  const defaultEnd = now.toISOString().split('T')[0]
  const defaultStart = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0]
  
  const dateRange = {
    start: searchParams.start || defaultStart,
    end: searchParams.end || defaultEnd,
  }
  
  // Busca dados de analytics
  const analyticsData = await getAnalyticsData(dateRange)
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <DateRangePicker
          defaultValue={dateRange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Usuários Ativos</CardTitle>
            <CardDescription>Usuários únicos no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.activeUsers.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">
              {analyticsData.activeUsersDelta > 0 ? '+' : ''}
              {analyticsData.activeUsersDelta.toFixed(1)}% vs. período anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tempo Médio na Página</CardTitle>
            <CardDescription>Duração média da sessão</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.floor(analyticsData.avgSessionDuration / 60)}m {analyticsData.avgSessionDuration % 60}s
            </div>
            <p className="text-sm text-muted-foreground">
              {analyticsData.avgSessionDurationDelta > 0 ? '+' : ''}
              {analyticsData.avgSessionDurationDelta.toFixed(1)}% vs. período anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Taxa de Erro</CardTitle>
            <CardDescription>Erros por 1000 requisições</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.errorRate.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">
              {analyticsData.errorRateDelta < 0 ? '+' : ''}
              {Math.abs(analyticsData.errorRateDelta).toFixed(1)}% vs. período anterior
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="performance">
        <TabsList className="mb-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Uso de Recursos</TabsTrigger>
          <TabsTrigger value="errors">Erros</TabsTrigger>
          <TabsTrigger value="journey">Jornada do Usuário</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <Suspense fallback={<LoadingSpinner />}>
            <PerformanceMetrics data={analyticsData.performance} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="usage">
          <Suspense fallback={<LoadingSpinner />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureUsage data={analyticsData.featureUsage} />
              <PageViews data={analyticsData.pageViews} />
            </div>
          </Suspense>
        </TabsContent>
        
        <TabsContent value="errors">
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorReport data={analyticsData.errors} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="journey">
          <Suspense fallback={<LoadingSpinner />}>
            <UserJourney data={analyticsData.userJourney} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
`

// Exporta todos os exemplos
export const PERFORMANCE_OPTIMIZATIONS = {
  ServerComponentExample,
  ClientComponentExample,
  EdgeFunctionExample,
  EdgeImageProcessingExample,
  StreamingChatExample,
  AnalyticsExample,
  AnalyticsAPIExample,
  AnalyticsDashboardExample,
}
