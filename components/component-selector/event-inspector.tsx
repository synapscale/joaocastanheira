"use client"

import { useState, useEffect } from "react"
import { Activity, Play, Eye, Code, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface EventInfo {
  type: string
  handler: string | Function
  source: "react" | "dom" | "inferred"
  active?: boolean
}

interface EventInspectorProps {
  element: HTMLElement
  onClose: () => void
}

export default function EventInspector({ element, onClose }: EventInspectorProps) {
  const [events, setEvents] = useState<EventInfo[]>([])
  const [activeTab, setActiveTab] = useState<"all" | "react" | "dom">("all")
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [monitoredEvents, setMonitoredEvents] = useState<string[]>([])
  const [detectedEvents, setDetectedEvents] = useState<Set<string>>(new Set())

  // Lista de eventos comuns para monitorar
  const commonEvents = [
    // Mouse events
    "click",
    "dblclick",
    "mousedown",
    "mouseup",
    "mouseover",
    "mouseout",
    "mousemove",
    // Keyboard events
    "keydown",
    "keyup",
    "keypress",
    // Form events
    "submit",
    "change",
    "input",
    "focus",
    "blur",
    // Touch events
    "touchstart",
    "touchend",
    "touchmove",
    // Drag events
    "dragstart",
    "dragend",
    "dragover",
    "dragenter",
    "dragleave",
    "drop",
  ]

  // Detecta eventos quando o componente é montado
  useEffect(() => {
    detectEvents()
  }, [element])

  // Função para detectar eventos associados ao elemento
  const detectEvents = () => {
    const detectedEvents: EventInfo[] = []

    // 1. Detectar eventos React via props
    const reactEvents = detectReactEvents(element)
    detectedEvents.push(...reactEvents)

    // 2. Detectar eventos DOM
    const domEvents = detectDOMEvents(element)
    detectedEvents.push(...domEvents)

    // 3. Inferir eventos com base em atributos e classes
    const inferredEvents = inferEvents(element)
    detectedEvents.push(...inferredEvents)

    // Remover duplicatas (mesmo tipo de evento)
    const uniqueEvents = detectedEvents.reduce((acc: EventInfo[], event) => {
      if (!acc.some((e) => e.type === event.type)) {
        acc.push(event)
      }
      return acc
    }, [])

    setEvents(uniqueEvents)
  }

  // Detecta eventos React via React Fiber
  const detectReactEvents = (element: HTMLElement): EventInfo[] => {
    const events: EventInfo[] = []

    try {
      // Acessa as propriedades internas do React
      const key = Object.keys(element).find(
        (key) => key.startsWith("__reactFiber$") || key.startsWith("__reactInternalInstance$"),
      )

      if (!key) return events

      // @ts-ignore - Acessando propriedades internas do React
      const fiber = element[key]
      if (!fiber) return events

      // Navega pelo fiber para encontrar o componente
      let fiberNode = fiber
      while (fiberNode) {
        if (fiberNode.memoizedProps) {
          // Procura por props que parecem ser handlers de eventos
          Object.entries(fiberNode.memoizedProps).forEach(([propName, propValue]) => {
            // Eventos React começam com "on" e têm a segunda letra maiúscula
            if (
              propName.startsWith("on") &&
              propName.length > 2 &&
              propName[2] === propName[2].toUpperCase() &&
              typeof propValue === "function"
            ) {
              const eventType = propName.slice(2).toLowerCase() // Remove "on" e converte para minúsculas

              // Tenta obter o nome da função
              let handlerName = "[Anonymous Function]"
              if (propValue.name) {
                handlerName = propValue.name
              } else if (propValue.toString) {
                const fnString = propValue.toString()
                const namedFnMatch = fnString.match(/function\s+([^(]+)/)
                if (namedFnMatch) {
                  handlerName = namedFnMatch[1].trim()
                } else if (fnString.includes("=>")) {
                  handlerName = "[Arrow Function]"
                }
              }

              events.push({
                type: eventType,
                handler: handlerName,
                source: "react",
              })
            }
          })
        }

        // Continua navegando pelo fiber
        fiberNode = fiberNode.return
      }
    } catch (error) {
      console.error("Erro ao detectar eventos React:", error)
    }

    return events
  }

  // Detecta eventos DOM via getEventListeners (quando disponível) ou inferência
  const detectDOMEvents = (element: HTMLElement): EventInfo[] => {
    const events: EventInfo[] = []

    try {
      // Tenta usar getEventListeners se disponível (apenas em DevTools)
      // @ts-ignore - getEventListeners não está tipado
      if (window.getEventListeners && typeof window.getEventListeners === "function") {
        // @ts-ignore
        const listeners = window.getEventListeners(element)

        Object.entries(listeners).forEach(([type, handlers]) => {
          events.push({
            type,
            handler: `[DOM Event] (${handlers.length} handlers)`,
            source: "dom",
          })
        })
      }

      // Verifica atributos on* no elemento
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("on") && !attr.name.startsWith("on:")) {
          const eventType = attr.name.slice(2) // Remove "on"
          events.push({
            type: eventType,
            handler: attr.value || "[Inline Handler]",
            source: "dom",
          })
        }
      })
    } catch (error) {
      console.error("Erro ao detectar eventos DOM:", error)
    }

    return events
  }

  // Infere eventos com base em atributos, classes e comportamentos comuns
  const inferEvents = (element: HTMLElement): EventInfo[] => {
    const events: EventInfo[] = []

    // Elementos clicáveis
    if (
      element.tagName === "BUTTON" ||
      element.tagName === "A" ||
      element.getAttribute("role") === "button" ||
      element.classList.contains("btn") ||
      element.classList.contains("button")
    ) {
      if (!events.some((e) => e.type === "click")) {
        events.push({
          type: "click",
          handler: "[Inferred Click Handler]",
          source: "inferred",
        })
      }
    }

    // Elementos de formulário
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.tagName === "SELECT") {
      if (!events.some((e) => e.type === "change")) {
        events.push({
          type: "change",
          handler: "[Inferred Change Handler]",
          source: "inferred",
        })
      }

      if (!events.some((e) => e.type === "focus")) {
        events.push({
          type: "focus",
          handler: "[Inferred Focus Handler]",
          source: "inferred",
        })
      }

      if (!events.some((e) => e.type === "blur")) {
        events.push({
          type: "blur",
          handler: "[Inferred Blur Handler]",
          source: "inferred",
        })
      }
    }

    // Elementos de formulário
    if (element.tagName === "FORM") {
      if (!events.some((e) => e.type === "submit")) {
        events.push({
          type: "submit",
          handler: "[Inferred Submit Handler]",
          source: "inferred",
        })
      }
    }

    return events
  }

  // Inicia o monitoramento de eventos em tempo real
  const startMonitoring = () => {
    setIsMonitoring(true)
    setMonitoredEvents(commonEvents)
    setDetectedEvents(new Set())

    // Adiciona listeners para todos os eventos comuns
    commonEvents.forEach((eventType) => {
      const handler = () => {
        setDetectedEvents((prev) => {
          const updated = new Set(prev)
          updated.add(eventType)
          return updated
        })
      }

      // Adiciona o listener
      element.addEventListener(eventType, handler, { capture: true })

      // Armazena o handler para remoção posterior
      // @ts-ignore - Adicionando propriedade temporária
      if (!element.__eventMonitors) {
        // @ts-ignore
        element.__eventMonitors = {}
      }
      // @ts-ignore
      element.__eventMonitors[eventType] = handler
    })
  }

  // Para o monitoramento de eventos
  const stopMonitoring = () => {
    setIsMonitoring(false)

    // Remove todos os listeners adicionados
    // @ts-ignore
    if (element.__eventMonitors) {
      commonEvents.forEach((eventType) => {
        // @ts-ignore
        const handler = element.__eventMonitors[eventType]
        if (handler) {
          element.removeEventListener(eventType, handler, { capture: true })
        }
      })
      // @ts-ignore
      delete element.__eventMonitors
    }
  }

  // Limpa os listeners quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        stopMonitoring()
      }
    }
  }, [isMonitoring])

  // Filtra eventos com base na aba selecionada
  const filteredEvents = events.filter((event) => {
    if (activeTab === "all") return true
    return event.source === activeTab
  })

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
          <Activity className="h-4 w-4 mr-2 text-primary" />
          Inspetor de Eventos
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          <Code className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </div>

      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="w-full grid grid-cols-3 h-8 rounded-full bg-gray-100 dark:bg-gray-700 p-1">
            <TabsTrigger
              value="all"
              className="rounded-full text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="react"
              className="rounded-full text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              React
            </TabsTrigger>
            <TabsTrigger
              value="dom"
              className="rounded-full text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              DOM
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between">
        <Button
          size="sm"
          variant={isMonitoring ? "destructive" : "outline"}
          className="text-xs h-8 rounded-full"
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
        >
          {isMonitoring ? (
            <>
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Parar Monitoramento
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 mr-1.5" /> Monitorar Eventos
            </>
          )}
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-8 rounded-full" onClick={detectEvents}>
          Atualizar
        </Button>
      </div>

      {isMonitoring && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30">
          <div className="text-xs text-blue-700 dark:text-blue-300 flex items-start">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>
              Interaja com o elemento para detectar eventos em tempo real. Os eventos detectados serão destacados
              abaixo.
            </span>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 max-h-80">
        <div className="p-2 space-y-1">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">Nenhum evento detectado</div>
          ) : (
            filteredEvents.map((event, index) => {
              const isDetected = detectedEvents.has(event.type)
              return (
                <div
                  key={`${event.type}-${index}`}
                  className={`p-2 rounded-md ${
                    isDetected
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30"
                      : "bg-gray-50 dark:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm text-gray-800 dark:text-gray-200 flex items-center">
                      {event.type}
                      {isDetected && (
                        <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-[10px]">
                          Ativo
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        event.source === "react"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : event.source === "dom"
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                            : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {event.source === "react" ? "React" : event.source === "dom" ? "DOM" : "Inferido"}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    Handler: {typeof event.handler === "string" ? event.handler : "[Function]"}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        {events.length} eventos detectados
      </div>
    </div>
  )
}
