"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, TestTube, CheckCircle, XCircle, AlertCircle, Clock, FileText, Download } from "lucide-react"
import type { CustomNode } from "@/types/skill-types"
import { useToast } from "@/hooks/use-toast"

interface TestCase {
  id: string
  name: string
  description: string
  inputs: Record<string, any>
  expectedOutputs?: Record<string, any>
  timeout?: number
}

interface TestResult {
  testCaseId: string
  success: boolean
  outputs: Record<string, any>
  executionTime: number
  error?: string
  logs: string[]
}

interface CompositionTesterProps {
  customNode: CustomNode
  onTestComplete?: (results: TestResult[]) => void
}

export function CompositionTester({ customNode, onTestComplete }: CompositionTesterProps) {
  const { toast } = useToast()

  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: "default",
      name: "Teste Básico",
      description: "Teste com valores padrão",
      inputs: {},
      timeout: 30000,
    },
  ])

  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTestCase, setSelectedTestCase] = useState<string>("default")

  // Adicionar novo caso de teste
  const addTestCase = useCallback(() => {
    const newTestCase: TestCase = {
      id: `test_${Date.now()}`,
      name: `Teste ${testCases.length + 1}`,
      description: "",
      inputs: {},
      timeout: 30000,
    }

    setTestCases((prev) => [...prev, newTestCase])
    setSelectedTestCase(newTestCase.id)
  }, [testCases.length])

  // Remover caso de teste
  const removeTestCase = useCallback(
    (testCaseId: string) => {
      if (testCases.length <= 1) {
        toast({
          title: "Não é possível remover",
          description: "Deve haver pelo menos um caso de teste",
          variant: "destructive",
        })
        return
      }

      setTestCases((prev) => prev.filter((tc) => tc.id !== testCaseId))
      if (selectedTestCase === testCaseId) {
        setSelectedTestCase(testCases[0].id)
      }
    },
    [testCases, selectedTestCase, toast],
  )

  // Atualizar caso de teste
  const updateTestCase = useCallback((testCaseId: string, updates: Partial<TestCase>) => {
    setTestCases((prev) => prev.map((tc) => (tc.id === testCaseId ? { ...tc, ...updates } : tc)))
  }, [])

  // Executar um caso de teste
  const executeTestCase = useCallback(
    async (testCase: TestCase): Promise<TestResult> => {
      const startTime = Date.now()
      const logs: string[] = []

      try {
        logs.push(`Iniciando execução do teste: ${testCase.name}`)
        logs.push(`Inputs: ${JSON.stringify(testCase.inputs, null, 2)}`)

        // Simular execução da composição
        // Em uma implementação real, isso executaria as skills em sequência
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 500))

        // Simular resultado baseado nos inputs
        const outputs: Record<string, any> = {}

        // Para cada output definido no node customizado
        customNode.outputs.forEach((output) => {
          // Simular valor baseado no tipo
          switch (output.dataType) {
            case "string":
              outputs[output.id] = `Resultado para ${output.name}`
              break
            case "number":
              outputs[output.id] = Math.random() * 100
              break
            case "boolean":
              outputs[output.id] = Math.random() > 0.5
              break
            case "array":
              outputs[output.id] = [1, 2, 3]
              break
            case "object":
              outputs[output.id] = { status: "success", data: testCase.inputs }
              break
            default:
              outputs[output.id] = `Output ${output.name}`
          }
        })

        const executionTime = Date.now() - startTime
        logs.push(`Execução concluída em ${executionTime}ms`)
        logs.push(`Outputs: ${JSON.stringify(outputs, null, 2)}`)

        return {
          testCaseId: testCase.id,
          success: true,
          outputs,
          executionTime,
          logs,
        }
      } catch (error) {
        const executionTime = Date.now() - startTime
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

        logs.push(`Erro na execução: ${errorMessage}`)

        return {
          testCaseId: testCase.id,
          success: false,
          outputs: {},
          executionTime,
          error: errorMessage,
          logs,
        }
      }
    },
    [customNode.outputs],
  )

  // Executar todos os testes
  const runAllTests = useCallback(async () => {
    setIsRunning(true)
    setTestResults([])

    try {
      const results: TestResult[] = []

      for (const testCase of testCases) {
        toast({
          title: "Executando teste",
          description: `Executando: ${testCase.name}`,
        })

        const result = await executeTestCase(testCase)
        results.push(result)
        setTestResults((prev) => [...prev, result])
      }

      const successCount = results.filter((r) => r.success).length
      const totalCount = results.length

      toast({
        title: "Testes concluídos",
        description: `${successCount}/${totalCount} testes passaram`,
        variant: successCount === totalCount ? "default" : "destructive",
      })

      onTestComplete?.(results)
    } catch (error) {
      toast({
        title: "Erro nos testes",
        description: "Erro ao executar os testes",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }, [testCases, executeTestCase, toast, onTestComplete])

  // Executar teste específico
  const runSingleTest = useCallback(
    async (testCaseId: string) => {
      const testCase = testCases.find((tc) => tc.id === testCaseId)
      if (!testCase) return

      setIsRunning(true)

      try {
        const result = await executeTestCase(testCase)
        setTestResults((prev) => prev.filter((r) => r.testCaseId !== testCaseId).concat(result))

        toast({
          title: result.success ? "Teste passou" : "Teste falhou",
          description: result.success ? `${testCase.name} executado com sucesso` : `${testCase.name}: ${result.error}`,
          variant: result.success ? "default" : "destructive",
        })
      } catch (error) {
        toast({
          title: "Erro no teste",
          description: "Erro ao executar o teste",
          variant: "destructive",
        })
      } finally {
        setIsRunning(false)
      }
    },
    [testCases, executeTestCase, toast],
  )

  // Gerar relatório de testes
  const generateReport = useCallback(() => {
    const report = {
      node: {
        name: customNode.name,
        description: customNode.description,
        version: customNode.version,
      },
      testSummary: {
        total: testResults.length,
        passed: testResults.filter((r) => r.success).length,
        failed: testResults.filter((r) => !r.success).length,
        averageExecutionTime: testResults.reduce((acc, r) => acc + r.executionTime, 0) / testResults.length,
      },
      testResults: testResults.map((result) => ({
        testCase: testCases.find((tc) => tc.id === result.testCaseId),
        result,
      })),
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `test-report-${customNode.name}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Relatório gerado",
      description: "Relatório de testes baixado com sucesso",
    })
  }, [customNode, testResults, testCases, toast])

  const selectedTest = testCases.find((tc) => tc.id === selectedTestCase)
  const selectedResult = testResults.find((r) => r.testCaseId === selectedTestCase)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Testes de Composição</h2>
            <p className="text-sm text-gray-500">Node: {customNode.name}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={runAllTests} disabled={isRunning} className="flex items-center gap-2">
              {isRunning ? <Clock className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Executar Todos
            </Button>

            {testResults.length > 0 && (
              <Button variant="outline" onClick={generateReport}>
                <Download className="h-4 w-4 mr-2" />
                Relatório
              </Button>
            )}
          </div>
        </div>

        {/* Resumo dos Resultados */}
        {testResults.length > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {testResults.filter((r) => r.success).length} Passou
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              {testResults.filter((r) => !r.success).length} Falhou
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.round(testResults.reduce((acc, r) => acc + r.executionTime, 0) / testResults.length)}ms médio
            </Badge>
          </div>
        )}
      </div>

      <div className="flex-1 flex">
        {/* Lista de Casos de Teste */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Casos de Teste</h3>
              <Button size="sm" onClick={addTestCase}>
                <TestTube className="h-4 w-4 mr-1" />
                Novo
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {testCases.map((testCase) => {
                const result = testResults.find((r) => r.testCaseId === testCase.id)

                return (
                  <Card
                    key={testCase.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTestCase === testCase.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedTestCase(testCase.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{testCase.name}</h4>
                          {testCase.description && <p className="text-xs text-gray-500 mt-1">{testCase.description}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                          {result && (
                            <div className="flex items-center">
                              {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              runSingleTest(testCase.id)
                            }}
                            disabled={isRunning}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Editor do Caso de Teste Selecionado */}
        <div className="flex-1 flex flex-col">
          {selectedTest && (
            <Tabs defaultValue="config" className="flex-1 flex flex-col">
              <div className="border-b border-gray-200 bg-white p-4">
                <TabsList>
                  <TabsTrigger value="config">Configuração</TabsTrigger>
                  <TabsTrigger value="result">Resultado</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="config" className="flex-1 p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Teste</Label>
                    <Input
                      value={selectedTest.name}
                      onChange={(e) => updateTestCase(selectedTest.id, { name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Timeout (ms)</Label>
                    <Input
                      type="number"
                      value={selectedTest.timeout}
                      onChange={(e) => updateTestCase(selectedTest.id, { timeout: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={selectedTest.description}
                    onChange={(e) => updateTestCase(selectedTest.id, { description: e.target.value })}
                    placeholder="Descrição do que este teste valida"
                  />
                </div>

                <div>
                  <Label>Inputs de Teste (JSON)</Label>
                  <Textarea
                    value={JSON.stringify(selectedTest.inputs, null, 2)}
                    onChange={(e) => {
                      try {
                        const inputs = JSON.parse(e.target.value)
                        updateTestCase(selectedTest.id, { inputs })
                      } catch (error) {
                        // Ignorar erro de parsing durante digitação
                      }
                    }}
                    placeholder="{ }"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label>Outputs Esperados (JSON) - Opcional</Label>
                  <Textarea
                    value={JSON.stringify(selectedTest.expectedOutputs || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const expectedOutputs = JSON.parse(e.target.value)
                        updateTestCase(selectedTest.id, { expectedOutputs })
                      } catch (error) {
                        // Ignorar erro de parsing durante digitação
                      }
                    }}
                    placeholder="{ }"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                {testCases.length > 1 && (
                  <Button variant="destructive" onClick={() => removeTestCase(selectedTest.id)}>
                    Remover Teste
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="result" className="flex-1 p-4">
                {selectedResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {selectedResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">{selectedResult.success ? "Teste Passou" : "Teste Falhou"}</span>
                      <Badge variant="outline">{selectedResult.executionTime}ms</Badge>
                    </div>

                    {selectedResult.error && (
                      <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                          <CardTitle className="text-red-700 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Erro
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-sm text-red-600 whitespace-pre-wrap">{selectedResult.error}</pre>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle>Outputs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                          {JSON.stringify(selectedResult.outputs, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Execute o teste para ver os resultados</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="logs" className="flex-1 p-4">
                {selectedResult?.logs ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Logs de Execução
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-1">
                          {selectedResult.logs.map((log, index) => (
                            <div key={index} className="text-sm font-mono p-2 bg-gray-50 rounded">
                              {log}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Execute o teste para ver os logs</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
