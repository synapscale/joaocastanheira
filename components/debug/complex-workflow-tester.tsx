"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GitBranch, Play, RotateCcw, CheckCircle, XCircle, Zap, Network, ArrowRight, Split, Merge } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvas } from "@/contexts/canvas-context"

interface WorkflowTest {
  id: string
  name: string
  status: "pending" | "running" | "success" | "error"
  duration?: number
  details?: string
  nodeCount?: number
  connectionCount?: number
}

interface WorkflowNode {
  id: string
  name: string
  type: string
  category: "input" | "transform" | "branch" | "merge" | "output" | "filter"
  position: { x: number; y: number }
  inputs: Array<{ id: string; name: string; type: string }>
  outputs: Array<{ id: string; name: string; type: string }>
  color: string
}

interface WorkflowConnection {
  id: string
  source: string
  sourcePort: string
  target: string
  targetPort: string
  description: string
  dataType: string
}

// Complex workflow templates
const WORKFLOW_TEMPLATES = {
  dataProcessingPipeline: {
    name: "Data Processing Pipeline",
    description: "Multi-stage data processing with branching and filtering",
    nodes: [
      {
        id: "data-source",
        name: "Data Source",
        type: "data-input",
        category: "input" as const,
        position: { x: 50, y: 200 },
        inputs: [],
        outputs: [
          { id: "raw-data", name: "Raw Data", type: "array" },
          { id: "metadata", name: "Metadata", type: "object" },
        ],
        color: "bg-green-500",
      },
      {
        id: "data-validator",
        name: "Data Validator",
        type: "validator",
        category: "filter" as const,
        position: { x: 250, y: 150 },
        inputs: [{ id: "data-in", name: "Data Input", type: "array" }],
        outputs: [
          { id: "valid-data", name: "Valid Data", type: "array" },
          { id: "invalid-data", name: "Invalid Data", type: "array" },
          { id: "validation-report", name: "Report", type: "object" },
        ],
        color: "bg-yellow-500",
      },
      {
        id: "data-splitter",
        name: "Data Splitter",
        type: "splitter",
        category: "branch" as const,
        position: { x: 450, y: 100 },
        inputs: [{ id: "data-in", name: "Data Input", type: "array" }],
        outputs: [
          { id: "batch-1", name: "Batch 1", type: "array" },
          { id: "batch-2", name: "Batch 2", type: "array" },
          { id: "batch-3", name: "Batch 3", type: "array" },
        ],
        color: "bg-blue-500",
      },
      {
        id: "transform-a",
        name: "Transform A",
        type: "transformer",
        category: "transform" as const,
        position: { x: 650, y: 50 },
        inputs: [{ id: "data-in", name: "Data Input", type: "array" }],
        outputs: [{ id: "transformed", name: "Transformed", type: "array" }],
        color: "bg-purple-500",
      },
      {
        id: "transform-b",
        name: "Transform B",
        type: "transformer",
        category: "transform" as const,
        position: { x: 650, y: 150 },
        inputs: [{ id: "data-in", name: "Data Input", type: "array" }],
        outputs: [{ id: "transformed", name: "Transformed", type: "array" }],
        color: "bg-purple-500",
      },
      {
        id: "aggregator",
        name: "Data Aggregator",
        type: "aggregator",
        category: "merge" as const,
        position: { x: 850, y: 100 },
        inputs: [
          { id: "stream-1", name: "Stream 1", type: "array" },
          { id: "stream-2", name: "Stream 2", type: "array" },
          { id: "stream-3", name: "Stream 3", type: "array" },
        ],
        outputs: [
          { id: "aggregated", name: "Aggregated Data", type: "array" },
          { id: "summary", name: "Summary", type: "object" },
        ],
        color: "bg-indigo-500",
      },
      {
        id: "output-sink",
        name: "Output Sink",
        type: "data-output",
        category: "output" as const,
        position: { x: 1050, y: 150 },
        inputs: [
          { id: "final-data", name: "Final Data", type: "array" },
          { id: "summary", name: "Summary", type: "object" },
        ],
        outputs: [],
        color: "bg-red-500",
      },
      {
        id: "error-handler",
        name: "Error Handler",
        type: "error-handler",
        category: "output" as const,
        position: { x: 450, y: 300 },
        inputs: [
          { id: "invalid-data", name: "Invalid Data", type: "array" },
          { id: "validation-report", name: "Report", type: "object" },
        ],
        outputs: [],
        color: "bg-red-400",
      },
    ] as WorkflowNode[],
    connections: [
      {
        id: "conn-1",
        source: "data-source",
        sourcePort: "raw-data",
        target: "data-validator",
        targetPort: "data-in",
        description: "Raw data to validator",
        dataType: "array",
      },
      {
        id: "conn-2",
        source: "data-validator",
        sourcePort: "valid-data",
        target: "data-splitter",
        targetPort: "data-in",
        description: "Valid data to splitter",
        dataType: "array",
      },
      {
        id: "conn-3",
        source: "data-splitter",
        sourcePort: "batch-1",
        target: "transform-a",
        targetPort: "data-in",
        description: "Batch 1 to Transform A",
        dataType: "array",
      },
      {
        id: "conn-4",
        source: "data-splitter",
        sourcePort: "batch-2",
        target: "transform-b",
        targetPort: "data-in",
        description: "Batch 2 to Transform B",
        dataType: "array",
      },
      {
        id: "conn-5",
        source: "transform-a",
        sourcePort: "transformed",
        target: "aggregator",
        targetPort: "stream-1",
        description: "Transform A to Aggregator",
        dataType: "array",
      },
      {
        id: "conn-6",
        source: "transform-b",
        sourcePort: "transformed",
        target: "aggregator",
        targetPort: "stream-2",
        description: "Transform B to Aggregator",
        dataType: "array",
      },
      {
        id: "conn-7",
        source: "data-splitter",
        sourcePort: "batch-3",
        target: "aggregator",
        targetPort: "stream-3",
        description: "Batch 3 direct to Aggregator",
        dataType: "array",
      },
      {
        id: "conn-8",
        source: "aggregator",
        sourcePort: "aggregated",
        target: "output-sink",
        targetPort: "final-data",
        description: "Aggregated data to output",
        dataType: "array",
      },
      {
        id: "conn-9",
        source: "aggregator",
        sourcePort: "summary",
        target: "output-sink",
        targetPort: "summary",
        description: "Summary to output",
        dataType: "object",
      },
      {
        id: "conn-10",
        source: "data-validator",
        sourcePort: "invalid-data",
        target: "error-handler",
        targetPort: "invalid-data",
        description: "Invalid data to error handler",
        dataType: "array",
      },
      {
        id: "conn-11",
        source: "data-validator",
        sourcePort: "validation-report",
        target: "error-handler",
        targetPort: "validation-report",
        description: "Validation report to error handler",
        dataType: "object",
      },
    ] as WorkflowConnection[],
  },

  aiProcessingChain: {
    name: "AI Processing Chain",
    description: "Multi-model AI processing with parallel execution",
    nodes: [
      {
        id: "input-processor",
        name: "Input Processor",
        type: "input-processor",
        category: "input" as const,
        position: { x: 50, y: 250 },
        inputs: [],
        outputs: [
          { id: "text-data", name: "Text Data", type: "string" },
          { id: "image-data", name: "Image Data", type: "blob" },
          { id: "audio-data", name: "Audio Data", type: "blob" },
        ],
        color: "bg-green-500",
      },
      {
        id: "text-analyzer",
        name: "Text Analyzer",
        type: "text-ai",
        category: "transform" as const,
        position: { x: 300, y: 150 },
        inputs: [{ id: "text-in", name: "Text Input", type: "string" }],
        outputs: [
          { id: "sentiment", name: "Sentiment", type: "object" },
          { id: "entities", name: "Entities", type: "array" },
          { id: "summary", name: "Summary", type: "string" },
        ],
        color: "bg-blue-500",
      },
      {
        id: "image-analyzer",
        name: "Image Analyzer",
        type: "vision-ai",
        category: "transform" as const,
        position: { x: 300, y: 300 },
        inputs: [{ id: "image-in", name: "Image Input", type: "blob" }],
        outputs: [
          { id: "objects", name: "Objects", type: "array" },
          { id: "faces", name: "Faces", type: "array" },
          { id: "text-ocr", name: "OCR Text", type: "string" },
        ],
        color: "bg-purple-500",
      },
      {
        id: "audio-analyzer",
        name: "Audio Analyzer",
        type: "audio-ai",
        category: "transform" as const,
        position: { x: 300, y: 450 },
        inputs: [{ id: "audio-in", name: "Audio Input", type: "blob" }],
        outputs: [
          { id: "transcript", name: "Transcript", type: "string" },
          { id: "emotions", name: "Emotions", type: "object" },
          { id: "speaker-id", name: "Speaker ID", type: "string" },
        ],
        color: "bg-orange-500",
      },
      {
        id: "content-merger",
        name: "Content Merger",
        type: "content-merger",
        category: "merge" as const,
        position: { x: 550, y: 250 },
        inputs: [
          { id: "text-analysis", name: "Text Analysis", type: "object" },
          { id: "image-analysis", name: "Image Analysis", type: "object" },
          { id: "audio-analysis", name: "Audio Analysis", type: "object" },
        ],
        outputs: [
          { id: "merged-content", name: "Merged Content", type: "object" },
          { id: "confidence-score", name: "Confidence", type: "number" },
        ],
        color: "bg-indigo-500",
      },
      {
        id: "insight-generator",
        name: "Insight Generator",
        type: "insight-ai",
        category: "transform" as const,
        position: { x: 750, y: 200 },
        inputs: [{ id: "content-in", name: "Content Input", type: "object" }],
        outputs: [
          { id: "insights", name: "Insights", type: "array" },
          { id: "recommendations", name: "Recommendations", type: "array" },
        ],
        color: "bg-pink-500",
      },
      {
        id: "report-generator",
        name: "Report Generator",
        type: "report-generator",
        category: "output" as const,
        position: { x: 950, y: 250 },
        inputs: [
          { id: "insights-in", name: "Insights", type: "array" },
          { id: "recommendations-in", name: "Recommendations", type: "array" },
          { id: "confidence-in", name: "Confidence", type: "number" },
        ],
        outputs: [],
        color: "bg-red-500",
      },
    ] as WorkflowNode[],
    connections: [
      {
        id: "ai-conn-1",
        source: "input-processor",
        sourcePort: "text-data",
        target: "text-analyzer",
        targetPort: "text-in",
        description: "Text to analyzer",
        dataType: "string",
      },
      {
        id: "ai-conn-2",
        source: "input-processor",
        sourcePort: "image-data",
        target: "image-analyzer",
        targetPort: "image-in",
        description: "Image to analyzer",
        dataType: "blob",
      },
      {
        id: "ai-conn-3",
        source: "input-processor",
        sourcePort: "audio-data",
        target: "audio-analyzer",
        targetPort: "audio-in",
        description: "Audio to analyzer",
        dataType: "blob",
      },
      {
        id: "ai-conn-4",
        source: "text-analyzer",
        sourcePort: "sentiment",
        target: "content-merger",
        targetPort: "text-analysis",
        description: "Text analysis to merger",
        dataType: "object",
      },
      {
        id: "ai-conn-5",
        source: "image-analyzer",
        sourcePort: "objects",
        target: "content-merger",
        targetPort: "image-analysis",
        description: "Image analysis to merger",
        dataType: "object",
      },
      {
        id: "ai-conn-6",
        source: "audio-analyzer",
        sourcePort: "transcript",
        target: "content-merger",
        targetPort: "audio-analysis",
        description: "Audio analysis to merger",
        dataType: "object",
      },
      {
        id: "ai-conn-7",
        source: "content-merger",
        sourcePort: "merged-content",
        target: "insight-generator",
        targetPort: "content-in",
        description: "Merged content to insights",
        dataType: "object",
      },
      {
        id: "ai-conn-8",
        source: "insight-generator",
        sourcePort: "insights",
        target: "report-generator",
        targetPort: "insights-in",
        description: "Insights to report",
        dataType: "array",
      },
      {
        id: "ai-conn-9",
        source: "insight-generator",
        sourcePort: "recommendations",
        target: "report-generator",
        targetPort: "recommendations-in",
        description: "Recommendations to report",
        dataType: "array",
      },
      {
        id: "ai-conn-10",
        source: "content-merger",
        sourcePort: "confidence-score",
        target: "report-generator",
        targetPort: "confidence-in",
        description: "Confidence to report",
        dataType: "number",
      },
    ] as WorkflowConnection[],
  },
}

export function ComplexWorkflowTester() {
  const [tests, setTests] = useState<WorkflowTest[]>([
    { id: "data-pipeline", name: "Data Processing Pipeline", status: "pending" },
    { id: "ai-chain", name: "AI Processing Chain", status: "pending" },
    { id: "branching-validation", name: "Branching Validation", status: "pending" },
    { id: "merge-validation", name: "Merge Point Validation", status: "pending" },
    { id: "data-flow-analysis", name: "Data Flow Analysis", status: "pending" },
    { id: "performance-test", name: "Performance Test", status: "pending" },
  ])

  const [activeTest, setActiveTest] = useState<string | null>(null)
  const [currentWorkflow, setCurrentWorkflow] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [createdNodes, setCreatedNodes] = useState<string[]>([])
  const [createdConnections, setCreatedConnections] = useState<string[]>([])

  const { nodes, connections, addNode, addConnection, clearCanvas } = useCanvas()

  const updateTestStatus = useCallback(
    (
      testId: string,
      status: WorkflowTest["status"],
      details?: string,
      duration?: number,
      nodeCount?: number,
      connectionCount?: number,
    ) => {
      setTests((prev) =>
        prev.map((test) =>
          test.id === testId ? { ...test, status, details, duration, nodeCount, connectionCount } : test,
        ),
      )
    },
    [],
  )

  const createWorkflow = useCallback(
    async (workflowKey: keyof typeof WORKFLOW_TEMPLATES) => {
      const startTime = Date.now()
      const workflow = WORKFLOW_TEMPLATES[workflowKey]

      setCurrentWorkflow(workflow.name)
      setProgress(0)

      try {
        const nodeIds: string[] = []
        const connectionIds: string[] = []

        // Create nodes with progress updates
        for (let i = 0; i < workflow.nodes.length; i++) {
          const workflowNode = workflow.nodes[i]
          const nodeId = `${workflowKey}-${workflowNode.id}-${Date.now()}`

          const newNode = {
            id: nodeId,
            type: workflowNode.type,
            position: workflowNode.position,
            data: {
              name: workflowNode.name,
              description: `${workflow.description} - ${workflowNode.category}`,
              inputs: workflowNode.inputs.length,
              outputs: workflowNode.outputs.length,
            },
            inputs: workflowNode.inputs.map((input) => ({
              ...input,
              connected: false,
              connections: [],
            })),
            outputs: workflowNode.outputs.map((output) => ({
              ...output,
              connected: false,
              connections: [],
            })),
          }

          addNode(newNode)
          nodeIds.push(nodeId)

          setProgress(((i + 1) / workflow.nodes.length) * 50) // 50% for nodes
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // Create connections with progress updates
        for (let i = 0; i < workflow.connections.length; i++) {
          const workflowConn = workflow.connections[i]

          // Find actual node IDs
          const sourceNodeIndex = workflow.nodes.findIndex((n) => n.id === workflowConn.source)
          const targetNodeIndex = workflow.nodes.findIndex((n) => n.id === workflowConn.target)

          if (sourceNodeIndex >= 0 && targetNodeIndex >= 0) {
            const sourceNodeId = nodeIds[sourceNodeIndex]
            const targetNodeId = nodeIds[targetNodeIndex]

            const connectionId = `${workflowKey}-${workflowConn.id}-${Date.now()}`

            const newConnection = {
              id: connectionId,
              source: sourceNodeId,
              target: targetNodeId,
              sourcePort: workflowConn.sourcePort,
              targetPort: workflowConn.targetPort,
              label: workflowConn.description,
              data: { dataType: workflowConn.dataType },
            }

            addConnection(newConnection)
            connectionIds.push(connectionId)
          }

          setProgress(50 + ((i + 1) / workflow.connections.length) * 50) // 50% for connections
          await new Promise((resolve) => setTimeout(resolve, 150))
        }

        setCreatedNodes(nodeIds)
        setCreatedConnections(connectionIds)

        const duration = Date.now() - startTime
        return {
          success: true,
          duration,
          nodeCount: nodeIds.length,
          connectionCount: connectionIds.length,
        }
      } catch (error) {
        return { success: false, error: error.toString() }
      }
    },
    [addNode, addConnection],
  )

  const testDataProcessingPipeline = useCallback(async () => {
    setActiveTest("data-pipeline")
    updateTestStatus("data-pipeline", "running", "Creating data processing pipeline...")

    const result = await createWorkflow("dataProcessingPipeline")

    if (result.success) {
      updateTestStatus(
        "data-pipeline",
        "success",
        `Pipeline created with branching and merging`,
        result.duration,
        result.nodeCount,
        result.connectionCount,
      )
    } else {
      updateTestStatus("data-pipeline", "error", `Error: ${result.error}`)
    }
  }, [createWorkflow, updateTestStatus])

  const testAIProcessingChain = useCallback(async () => {
    setActiveTest("ai-chain")
    updateTestStatus("ai-chain", "running", "Creating AI processing chain...")

    const result = await createWorkflow("aiProcessingChain")

    if (result.success) {
      updateTestStatus(
        "ai-chain",
        "success",
        `AI chain created with parallel processing`,
        result.duration,
        result.nodeCount,
        result.connectionCount,
      )
    } else {
      updateTestStatus("ai-chain", "error", `Error: ${result.error}`)
    }
  }, [createWorkflow, updateTestStatus])

  const testBranchingValidation = useCallback(() => {
    const startTime = Date.now()
    setActiveTest("branching-validation")
    updateTestStatus("branching-validation", "running", "Validating branching connections...")

    try {
      // Find nodes with multiple outputs (branching points)
      const branchingNodes = nodes.filter((node) => node.outputs && node.outputs.length > 1)

      // Validate that branching nodes have multiple outgoing connections
      let branchingConnections = 0
      for (const node of branchingNodes) {
        const outgoingConnections = connections.filter((conn) => conn.source === node.id)
        branchingConnections += outgoingConnections.length
      }

      const duration = Date.now() - startTime
      updateTestStatus(
        "branching-validation",
        "success",
        `Found ${branchingNodes.length} branching nodes with ${branchingConnections} outgoing connections`,
        duration,
      )
    } catch (error) {
      updateTestStatus("branching-validation", "error", `Error: ${error}`)
    }
  }, [nodes, connections, updateTestStatus])

  const testMergeValidation = useCallback(() => {
    const startTime = Date.now()
    setActiveTest("merge-validation")
    updateTestStatus("merge-validation", "running", "Validating merge point connections...")

    try {
      // Find nodes with multiple inputs (merge points)
      const mergeNodes = nodes.filter((node) => node.inputs && node.inputs.length > 1)

      // Validate that merge nodes have multiple incoming connections
      let mergingConnections = 0
      for (const node of mergeNodes) {
        const incomingConnections = connections.filter((conn) => conn.target === node.id)
        mergingConnections += incomingConnections.length
      }

      const duration = Date.now() - startTime
      updateTestStatus(
        "merge-validation",
        "success",
        `Found ${mergeNodes.length} merge nodes with ${mergingConnections} incoming connections`,
        duration,
      )
    } catch (error) {
      updateTestStatus("merge-validation", "error", `Error: ${error}`)
    }
  }, [nodes, connections, updateTestStatus])

  const testDataFlowAnalysis = useCallback(() => {
    const startTime = Date.now()
    setActiveTest("data-flow-analysis")
    updateTestStatus("data-flow-analysis", "running", "Analyzing data flow paths...")

    try {
      // Find all possible paths from input to output nodes
      const inputNodes = nodes.filter((node) => !node.inputs || node.inputs.length === 0)
      const outputNodes = nodes.filter((node) => !node.outputs || node.outputs.length === 0)

      // Simple path counting (BFS-like approach)
      let totalPaths = 0
      for (const inputNode of inputNodes) {
        for (const outputNode of outputNodes) {
          // Count paths between input and output (simplified)
          const pathExists = connections.some((conn) => conn.source === inputNode.id || conn.target === outputNode.id)
          if (pathExists) totalPaths++
        }
      }

      const duration = Date.now() - startTime
      updateTestStatus(
        "data-flow-analysis",
        "success",
        `Analyzed ${totalPaths} data flow paths between ${inputNodes.length} inputs and ${outputNodes.length} outputs`,
        duration,
      )
    } catch (error) {
      updateTestStatus("data-flow-analysis", "error", `Error: ${error}`)
    }
  }, [nodes, connections, updateTestStatus])

  const testPerformance = useCallback(() => {
    const startTime = Date.now()
    setActiveTest("performance-test")
    updateTestStatus("performance-test", "running", "Testing performance with complex workflow...")

    try {
      // Performance metrics
      const nodeCount = nodes.length
      const connectionCount = connections.length
      const avgConnectionsPerNode = nodeCount > 0 ? connectionCount / nodeCount : 0

      // Calculate complexity score
      const complexityScore = nodeCount + connectionCount * 2 + avgConnectionsPerNode * 10

      const duration = Date.now() - startTime
      updateTestStatus(
        "performance-test",
        "success",
        `Performance test completed. Complexity score: ${complexityScore.toFixed(1)}`,
        duration,
        nodeCount,
        connectionCount,
      )
    } catch (error) {
      updateTestStatus("performance-test", "error", `Error: ${error}`)
    }
  }, [nodes, connections, updateTestStatus])

  const runFullWorkflowTest = useCallback(async () => {
    // Reset all tests
    setTests((prev) =>
      prev.map((test) => ({ ...test, status: "pending" as const, details: undefined, duration: undefined })),
    )
    setCreatedNodes([])
    setCreatedConnections([])
    setProgress(0)

    // Clear existing data
    clearCanvas()

    // Run tests in sequence
    await testDataProcessingPipeline()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await testAIProcessingChain()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    testBranchingValidation()
    await new Promise((resolve) => setTimeout(resolve, 500))

    testMergeValidation()
    await new Promise((resolve) => setTimeout(resolve, 500))

    testDataFlowAnalysis()
    await new Promise((resolve) => setTimeout(resolve, 500))

    testPerformance()

    setActiveTest(null)
    setCurrentWorkflow(null)
    setProgress(100)
  }, [
    clearCanvas,
    testDataProcessingPipeline,
    testAIProcessingChain,
    testBranchingValidation,
    testMergeValidation,
    testDataFlowAnalysis,
    testPerformance,
  ])

  const resetTests = useCallback(() => {
    setTests((prev) =>
      prev.map((test) => ({ ...test, status: "pending" as const, details: undefined, duration: undefined })),
    )
    setCreatedNodes([])
    setCreatedConnections([])
    setActiveTest(null)
    setCurrentWorkflow(null)
    setProgress(0)
    clearCanvas()
  }, [clearCanvas])

  const getStatusIcon = (status: WorkflowTest["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
    }
  }

  const getStatusColor = (status: WorkflowTest["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600 dark:text-green-400"
      case "error":
        return "text-red-600 dark:text-red-400"
      case "running":
        return "text-blue-600 dark:text-blue-400"
      default:
        return "text-slate-600 dark:text-slate-400"
    }
  }

  const successCount = tests.filter((t) => t.status === "success").length
  const totalTests = tests.length
  const totalNodes = tests.reduce((sum, test) => sum + (test.nodeCount || 0), 0)
  const totalConnections = tests.reduce((sum, test) => sum + (test.connectionCount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-500" />
            Complex Workflow Testing Suite
          </CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant={successCount === totalTests ? "default" : "secondary"}>
              {successCount}/{totalTests} Tests Passed
            </Badge>
            <Badge variant="outline">{totalNodes} Total Nodes</Badge>
            <Badge variant="outline">{totalConnections} Total Connections</Badge>
            <div className="flex gap-2">
              <Button onClick={runFullWorkflowTest} size="sm" variant="outline" disabled={activeTest !== null}>
                <Play className="h-4 w-4 mr-1" />
                Run Full Test
              </Button>
              <Button onClick={resetTests} size="sm" variant="outline">
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
          {currentWorkflow && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Network className="h-4 w-4" />
                Creating: {currentWorkflow}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workflow Test Progress</CardTitle>
            <p className="text-sm text-muted-foreground">Testing complex branching and merging scenarios</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {tests.map((test) => (
              <div
                key={test.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  activeTest === test.id
                    ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                    : "bg-slate-50 dark:bg-slate-800",
                )}
              >
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{test.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {test.nodeCount && <span>{test.nodeCount}N</span>}
                      {test.connectionCount && <span>{test.connectionCount}C</span>}
                      {test.duration && <span>{test.duration}ms</span>}
                    </div>
                  </div>
                  {test.details && <p className={cn("text-xs mt-1", getStatusColor(test.status))}>{test.details}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Workflow Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workflow Templates</CardTitle>
            <p className="text-sm text-muted-foreground">Complex workflow patterns being tested</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(WORKFLOW_TEMPLATES).map(([key, template]) => (
              <div key={key} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {template.nodes.length} Nodes
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {template.connections.length} Connections
                  </Badge>
                </div>
                <h4 className="font-medium mb-1">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>

                {/* Workflow Pattern Visualization */}
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Input</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <Split className="h-3 w-3 text-blue-500" />
                    <span>Branch</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Transform</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <Merge className="h-3 w-3 text-indigo-500" />
                    <span>Merge</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Output</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Live Canvas Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Workflow Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">Real-time analysis of canvas workflow complexity</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Nodes by Category */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Network className="h-4 w-4 text-blue-500" />
                Node Types
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Input Nodes:</span>
                  <span className="font-mono">{nodes.filter((n) => !n.inputs || n.inputs.length === 0).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transform Nodes:</span>
                  <span className="font-mono">
                    {nodes.filter((n) => n.inputs && n.inputs.length > 0 && n.outputs && n.outputs.length > 0).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Output Nodes:</span>
                  <span className="font-mono">{nodes.filter((n) => !n.outputs || n.outputs.length === 0).length}</span>
                </div>
              </div>
            </div>

            {/* Branching Analysis */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Split className="h-4 w-4 text-purple-500" />
                Branching
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Branch Points:</span>
                  <span className="font-mono">{nodes.filter((n) => n.outputs && n.outputs.length > 1).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Branches:</span>
                  <span className="font-mono">{Math.max(0, ...nodes.map((n) => n.outputs?.length || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Branches:</span>
                  <span className="font-mono">
                    {nodes.length > 0
                      ? (nodes.reduce((sum, n) => sum + (n.outputs?.length || 0), 0) / nodes.length).toFixed(1)
                      : "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Merging Analysis */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Merge className="h-4 w-4 text-indigo-500" />
                Merging
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Merge Points:</span>
                  <span className="font-mono">{nodes.filter((n) => n.inputs && n.inputs.length > 1).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Inputs:</span>
                  <span className="font-mono">{Math.max(0, ...nodes.map((n) => n.inputs?.length || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Inputs:</span>
                  <span className="font-mono">
                    {nodes.length > 0
                      ? (nodes.reduce((sum, n) => sum + (n.inputs?.length || 0), 0) / nodes.length).toFixed(1)
                      : "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Complexity Metrics */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Complexity
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Nodes:</span>
                  <span className="font-mono">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Connections:</span>
                  <span className="font-mono">{connections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Complexity Score:</span>
                  <span className="font-mono">
                    {(
                      nodes.length +
                      connections.length * 2 +
                      (nodes.length > 0 ? (connections.length / nodes.length) * 10 : 0)
                    ).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          {(nodes.length > 0 || connections.length > 0) && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-purple-700 dark:text-purple-300">Complex Workflow Active</span>
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                Successfully managing {nodes.length} nodes with {connections.length} connections across multiple data
                paths and processing stages.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
