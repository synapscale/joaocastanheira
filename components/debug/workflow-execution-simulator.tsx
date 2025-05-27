"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Database,
  Cpu,
  Network,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvas } from "@/contexts/canvas-context"

interface ExecutionStep {
  id: string
  nodeId: string
  nodeName: string
  timestamp: number
  status: "pending" | "running" | "success" | "error"
  input?: any
  output?: any
  duration?: number
  error?: string
}

interface DataPacket {
  id: string
  data: any
  type: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
  timestamp: number
  status: "traveling" | "delivered" | "processed"
}

interface NodeExecutionState {
  nodeId: string
  status: "idle" | "waiting" | "processing" | "completed" | "error"
  inputsReceived: Record<string, any>
  outputsGenerated: Record<string, any>
  executionTime?: number
  lastUpdate: number
}

// Sample data generators for different node types
const DATA_GENERATORS = {
  "data-input": () => ({
    rawData: [
      { id: 1, name: "Alice", age: 30, department: "Engineering" },
      { id: 2, name: "Bob", age: 25, department: "Marketing" },
      { id: 3, name: "Charlie", age: 35, department: "Sales" },
      { id: 4, name: "Diana", age: 28, department: "Engineering" },
      { id: 5, name: "Eve", age: 32, department: "HR" },
    ],
    metadata: {
      source: "employee_database",
      timestamp: new Date().toISOString(),
      recordCount: 5,
      schema: ["id", "name", "age", "department"],
    },
  }),

  "input-processor": () => ({
    textData: "Analyze this customer feedback: The product is amazing and exceeded my expectations!",
    imageData: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...", // Mock image data
    audioData: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...", // Mock audio data
  }),

  validator: (input: any) => {
    const validData = input.filter((item: any) => item.age >= 18 && item.name && item.department)
    const invalidData = input.filter((item: any) => item.age < 18 || !item.name || !item.department)

    return {
      validData,
      invalidData,
      validationReport: {
        totalRecords: input.length,
        validRecords: validData.length,
        invalidRecords: invalidData.length,
        validationRules: ["age >= 18", "name required", "department required"],
      },
    }
  },

  splitter: (input: any) => {
    const batchSize = Math.ceil(input.length / 3)
    return {
      batch1: input.slice(0, batchSize),
      batch2: input.slice(batchSize, batchSize * 2),
      batch3: input.slice(batchSize * 2),
    }
  },

  "text-ai": (input: string) => ({
    sentiment: {
      score: 0.85,
      label: "positive",
      confidence: 0.92,
    },
    entities: [
      { text: "product", type: "PRODUCT", confidence: 0.95 },
      { text: "customer", type: "PERSON", confidence: 0.88 },
    ],
    summary: "Positive customer feedback about product quality",
  }),

  "vision-ai": (input: string) => ({
    objects: [
      { name: "person", confidence: 0.95, bbox: [100, 100, 200, 300] },
      { name: "laptop", confidence: 0.88, bbox: [250, 150, 400, 250] },
    ],
    faces: [{ confidence: 0.92, emotions: { happy: 0.8, neutral: 0.2 } }],
    textOcr: "Welcome to our office",
  }),

  "audio-ai": (input: string) => ({
    transcript: "Hello, I would like to inquire about your services",
    emotions: {
      neutral: 0.6,
      happy: 0.3,
      curious: 0.1,
    },
    speakerId: "speaker_001",
  }),

  transformer: (input: any) => {
    return input.map((item: any) => ({
      ...item,
      processed: true,
      transformedAt: new Date().toISOString(),
      score: Math.random() * 100,
    }))
  },

  aggregator: (...inputs: any[]) => {
    const allData = inputs.flat()
    return {
      aggregatedData: allData,
      summary: {
        totalRecords: allData.length,
        averageScore: allData.reduce((sum: number, item: any) => sum + (item.score || 0), 0) / allData.length,
        categories: [...new Set(allData.map((item: any) => item.department || item.type || "unknown"))],
      },
    }
  },

  "content-merger": (textAnalysis: any, imageAnalysis: any, audioAnalysis: any) => ({
    mergedContent: {
      text: textAnalysis,
      image: imageAnalysis,
      audio: audioAnalysis,
      correlations: {
        textImageMatch: 0.75,
        textAudioMatch: 0.82,
        overallCoherence: 0.78,
      },
    },
    confidenceScore: 0.78,
  }),

  "insight-generator": (content: any) => ({
    insights: [
      "High customer satisfaction detected across multiple channels",
      "Visual and audio cues align with positive text sentiment",
      "Recommended for feature highlighting in marketing",
    ],
    recommendations: [
      "Amplify positive feedback in testimonials",
      "Use similar visual elements in future campaigns",
      "Consider audio testimonials for authenticity",
    ],
  }),
}

export function WorkflowExecutionSimulator() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [dataPackets, setDataPackets] = useState<DataPacket[]>([])
  const [nodeStates, setNodeStates] = useState<Record<string, NodeExecutionState>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [executionSpeed, setExecutionSpeed] = useState(1000) // ms between steps
  const [totalDuration, setTotalDuration] = useState(0)
  const [executionProgress, setExecutionProgress] = useState(0)

  const { nodes, connections } = useCanvas()
  const executionTimer = useRef<NodeJS.Timeout | null>(null)
  const startTime = useRef<number>(0)

  // Initialize node states
  useEffect(() => {
    const states: Record<string, NodeExecutionState> = {}
    nodes.forEach((node) => {
      states[node.id] = {
        nodeId: node.id,
        status: "idle",
        inputsReceived: {},
        outputsGenerated: {},
        lastUpdate: Date.now(),
      }
    })
    setNodeStates(states)
  }, [nodes])

  const generateNodeOutput = useCallback((node: any, inputs: Record<string, any>) => {
    const nodeType = node.type.toLowerCase()
    const generator = DATA_GENERATORS[nodeType as keyof typeof DATA_GENERATORS]

    if (!generator) {
      // Generic processor
      return { result: inputs, processed: true }
    }

    if (typeof generator === "function") {
      const inputValues = Object.values(inputs)
      if (inputValues.length === 0) {
        return generator()
      } else if (inputValues.length === 1) {
        return generator(inputValues[0])
      } else {
        return generator(...inputValues)
      }
    }

    return generator
  }, [])

  const findInputNodes = useCallback(() => {
    return nodes.filter((node) => !node.inputs || node.inputs.length === 0)
  }, [nodes])

  const findNextExecutableNodes = useCallback(
    (completedNodeIds: string[]) => {
      return nodes.filter((node) => {
        if (completedNodeIds.includes(node.id)) return false
        if (!node.inputs || node.inputs.length === 0) return false

        // Check if all required inputs are available
        const requiredInputs = node.inputs.filter((input) => input.required !== false)
        const availableInputs = connections.filter(
          (conn) => conn.target === node.id && completedNodeIds.includes(conn.source),
        )

        return availableInputs.length >= requiredInputs.length
      })
    },
    [nodes, connections],
  )

  const executeNode = useCallback(
    async (node: any): Promise<ExecutionStep> => {
      const startTime = Date.now()

      const step: ExecutionStep = {
        id: `step-${node.id}-${Date.now()}`,
        nodeId: node.id,
        nodeName: node.data.name,
        timestamp: startTime,
        status: "running",
      }

      setExecutionSteps((prev) => [...prev, step])

      // Update node state
      setNodeStates((prev) => ({
        ...prev,
        [node.id]: {
          ...prev[node.id],
          status: "processing",
          lastUpdate: Date.now(),
        },
      }))

      try {
        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700))

        // Get inputs from connected nodes
        const nodeInputs: Record<string, any> = {}
        const incomingConnections = connections.filter((conn) => conn.target === node.id)

        for (const conn of incomingConnections) {
          const sourceState = nodeStates[conn.source]
          if (sourceState && sourceState.outputsGenerated[conn.sourcePort || "output"]) {
            nodeInputs[conn.targetPort || "input"] = sourceState.outputsGenerated[conn.sourcePort || "output"]
          }
        }

        // Generate outputs
        const outputs = generateNodeOutput(node, nodeInputs)
        const duration = Date.now() - startTime

        // Update step
        const completedStep: ExecutionStep = {
          ...step,
          status: "success",
          input: nodeInputs,
          output: outputs,
          duration,
        }

        setExecutionSteps((prev) => prev.map((s) => (s.id === step.id ? completedStep : s)))

        // Update node state
        setNodeStates((prev) => ({
          ...prev,
          [node.id]: {
            ...prev[node.id],
            status: "completed",
            inputsReceived: nodeInputs,
            outputsGenerated: outputs,
            executionTime: duration,
            lastUpdate: Date.now(),
          },
        }))

        // Create data packets for outgoing connections
        const outgoingConnections = connections.filter((conn) => conn.source === node.id)
        const packets: DataPacket[] = outgoingConnections.map((conn) => ({
          id: `packet-${conn.id}-${Date.now()}`,
          data: outputs[conn.sourcePort || "output"],
          type: conn.data?.dataType || "any",
          sourceNodeId: conn.source,
          sourcePortId: conn.sourcePort || "output",
          targetNodeId: conn.target,
          targetPortId: conn.targetPort || "input",
          timestamp: Date.now(),
          status: "traveling",
        }))

        setDataPackets((prev) => [...prev, ...packets])

        return completedStep
      } catch (error) {
        const duration = Date.now() - startTime
        const errorStep: ExecutionStep = {
          ...step,
          status: "error",
          duration,
          error: error instanceof Error ? error.message : "Unknown error",
        }

        setExecutionSteps((prev) => prev.map((s) => (s.id === step.id ? errorStep : s)))

        setNodeStates((prev) => ({
          ...prev,
          [node.id]: {
            ...prev[node.id],
            status: "error",
            lastUpdate: Date.now(),
          },
        }))

        return errorStep
      }
    },
    [connections, nodeStates, generateNodeOutput],
  )

  const startExecution = useCallback(async () => {
    if (nodes.length === 0) return

    setIsExecuting(true)
    setIsPaused(false)
    setExecutionSteps([])
    setDataPackets([])
    setCurrentStep(0)
    setExecutionProgress(0)
    startTime.current = Date.now()

    const completedNodes: string[] = []
    const inputNodes = findInputNodes()

    // Execute input nodes first
    for (const node of inputNodes) {
      if (isPaused) break
      await executeNode(node)
      completedNodes.push(node.id)
      setCurrentStep((prev) => prev + 1)
      setExecutionProgress((completedNodes.length / nodes.length) * 100)
    }

    // Execute remaining nodes in dependency order
    while (completedNodes.length < nodes.length && !isPaused) {
      const nextNodes = findNextExecutableNodes(completedNodes)

      if (nextNodes.length === 0) {
        console.warn("No more executable nodes found, but workflow not complete")
        break
      }

      // Execute next batch of nodes (can be parallel)
      const promises = nextNodes.map((node) => executeNode(node))
      const results = await Promise.all(promises)

      results.forEach((result) => {
        if (result.status === "success") {
          completedNodes.push(result.nodeId)
        }
      })

      setCurrentStep((prev) => prev + nextNodes.length)
      setExecutionProgress((completedNodes.length / nodes.length) * 100)

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, executionSpeed / 2))
    }

    setTotalDuration(Date.now() - startTime.current)
    setIsExecuting(false)
    setExecutionProgress(100)
  }, [nodes, isPaused, executeNode, findInputNodes, findNextExecutableNodes, executionSpeed])

  const pauseExecution = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resumeExecution = useCallback(() => {
    setIsPaused(false)
    startExecution()
  }, [startExecution])

  const stopExecution = useCallback(() => {
    setIsExecuting(false)
    setIsPaused(false)
    if (executionTimer.current) {
      clearTimeout(executionTimer.current)
    }
  }, [])

  const resetExecution = useCallback(() => {
    stopExecution()
    setExecutionSteps([])
    setDataPackets([])
    setCurrentStep(0)
    setExecutionProgress(0)
    setTotalDuration(0)

    // Reset node states
    const states: Record<string, NodeExecutionState> = {}
    nodes.forEach((node) => {
      states[node.id] = {
        nodeId: node.id,
        status: "idle",
        inputsReceived: {},
        outputsGenerated: {},
        lastUpdate: Date.now(),
      }
    })
    setNodeStates(states)
  }, [stopExecution, nodes])

  const getNodeStatusColor = (status: NodeExecutionState["status"]) => {
    switch (status) {
      case "processing":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "waiting":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  const getStepStatusIcon = (status: ExecutionStep["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const successSteps = executionSteps.filter((s) => s.status === "success").length
  const errorSteps = executionSteps.filter((s) => s.status === "error").length
  const avgExecutionTime =
    executionSteps.length > 0
      ? executionSteps.reduce((sum, step) => sum + (step.duration || 0), 0) / executionSteps.length
      : 0

  return (
    <div className="space-y-6">
      {/* Execution Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Workflow Execution Simulator
          </CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant={isExecuting ? "default" : "secondary"}>
              {isExecuting ? (isPaused ? "Paused" : "Running") : "Idle"}
            </Badge>
            <Badge variant="outline">{nodes.length} Nodes</Badge>
            <Badge variant="outline">{connections.length} Connections</Badge>
            <Badge variant="outline">{executionSteps.length} Steps</Badge>

            <div className="flex gap-2">
              {!isExecuting ? (
                <Button onClick={startExecution} size="sm" disabled={nodes.length === 0}>
                  <Play className="h-4 w-4 mr-1" />
                  Start Execution
                </Button>
              ) : isPaused ? (
                <Button onClick={resumeExecution} size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              ) : (
                <Button onClick={pauseExecution} size="sm">
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}

              <Button onClick={stopExecution} size="sm" variant="outline" disabled={!isExecuting}>
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>

              <Button onClick={resetExecution} size="sm" variant="outline">
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {isExecuting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Execution Progress</span>
                <span>{Math.round(executionProgress)}%</span>
              </div>
              <Progress value={executionProgress} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Execution Timeline</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>✅ {successSteps} Success</span>
              <span>❌ {errorSteps} Errors</span>
              <span>⚡ {avgExecutionTime.toFixed(0)}ms Avg</span>
              {totalDuration > 0 && <span>🕒 {totalDuration}ms Total</span>}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {executionSteps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No execution steps yet</p>
                <p className="text-xs">Start execution to see workflow progress</p>
              </div>
            ) : (
              executionSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    step.status === "running"
                      ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                      : step.status === "success"
                        ? "bg-green-50 dark:bg-green-950/20"
                        : step.status === "error"
                          ? "bg-red-50 dark:bg-red-950/20"
                          : "bg-slate-50 dark:bg-slate-800",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">#{index + 1}</span>
                    {getStepStatusIcon(step.status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{step.nodeName}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {step.duration && <span>{step.duration}ms</span>}
                        <span>{new Date(step.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {step.input && Object.keys(step.input).length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Input: {Object.keys(step.input).join(", ")}
                      </div>
                    )}

                    {step.output && Object.keys(step.output).length > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Output: {Object.keys(step.output).join(", ")}
                      </div>
                    )}

                    {step.error && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">Error: {step.error}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Node States */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Node Execution States</CardTitle>
            <p className="text-sm text-muted-foreground">Real-time node processing status</p>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {Object.values(nodeStates).map((state) => {
              const node = nodes.find((n) => n.id === state.nodeId)
              if (!node) return null

              return (
                <div
                  key={state.nodeId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div className={cn("w-3 h-3 rounded-full", getNodeStatusColor(state.status))} />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{node.data.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {state.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>📥 {Object.keys(state.inputsReceived).length} inputs</span>
                      <span>📤 {Object.keys(state.outputsGenerated).length} outputs</span>
                      {state.executionTime && <span>⚡ {state.executionTime}ms</span>}
                    </div>

                    {state.status === "completed" && Object.keys(state.outputsGenerated).length > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Generated: {Object.keys(state.outputsGenerated).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Data Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Flow Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">Live data packet transmission through workflow</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Data Packets */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Network className="h-4 w-4 text-blue-500" />
                Data Packets ({dataPackets.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {dataPackets.slice(-10).map((packet) => (
                  <div key={packet.id} className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-mono">{packet.type}</span>
                      <Badge variant="outline" className="text-xs">
                        {packet.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {nodes.find((n) => n.id === packet.sourceNodeId)?.data.name} →{" "}
                      {nodes.find((n) => n.id === packet.targetNodeId)?.data.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Metrics */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-500" />
                Performance Metrics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Nodes Processed:</span>
                  <span className="font-mono">
                    {successSteps}/{nodes.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-mono">
                    {executionSteps.length > 0 ? Math.round((successSteps / executionSteps.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Execution:</span>
                  <span className="font-mono">{avgExecutionTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Throughput:</span>
                  <span className="font-mono">{dataPackets.length} packets</span>
                </div>
                {totalDuration > 0 && (
                  <div className="flex justify-between">
                    <span>Total Duration:</span>
                    <span className="font-mono">{(totalDuration / 1000).toFixed(1)}s</span>
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Health */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-green-500" />
                Workflow Health
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Active Nodes:</span>
                  <span className="font-mono">
                    {Object.values(nodeStates).filter((s) => s.status === "processing").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Nodes:</span>
                  <span className="font-mono">
                    {Object.values(nodeStates).filter((s) => s.status === "completed").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Error Nodes:</span>
                  <span className="font-mono">
                    {Object.values(nodeStates).filter((s) => s.status === "error").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data Integrity:</span>
                  <span className="font-mono">{errorSteps === 0 ? "✅ Good" : "⚠️ Issues"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Summary */}
          {executionSteps.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {isExecuting ? "Workflow Executing" : "Execution Complete"}
                </span>
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {isExecuting
                  ? `Processing ${currentStep}/${nodes.length} nodes with ${dataPackets.length} data packets in transit`
                  : `Successfully processed ${successSteps} nodes with ${dataPackets.length} data packets transferred`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
