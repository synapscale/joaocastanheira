"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TestTube, Play, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"

export default function IntegrationTestsPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const testSuites = [
    {
      name: "Authentication Tests",
      tests: ["Login Flow", "Logout Flow", "Token Validation", "Password Reset"],
      status: "passed",
      duration: "2.3s",
    },
    {
      name: "API Integration Tests",
      tests: ["GET Endpoints", "POST Endpoints", "PUT Endpoints", "DELETE Endpoints"],
      status: "passed",
      duration: "1.8s",
    },
    {
      name: "Database Tests",
      tests: ["Connection", "CRUD Operations", "Migrations", "Transactions"],
      status: "failed",
      duration: "3.1s",
    },
    {
      name: "UI Component Tests",
      tests: ["Sidebar Navigation", "Form Validation", "Modal Interactions", "Responsive Design"],
      status: "running",
      duration: "0.5s",
    },
  ]

  const runTests = async () => {
    setIsRunning(true)
    // Simular execução de testes
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <TestTube className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testes de Integração</h1>
          <p className="text-muted-foreground">Execute e monitore testes automatizados do sistema.</p>
        </div>
        <Button onClick={runTests} disabled={isRunning}>
          {isRunning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          {isRunning ? "Executando..." : "Executar Testes"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Testes</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">4 suítes de teste</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">12</div>
            <p className="text-xs text-muted-foreground">75% de sucesso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falharam</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Execução</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1</div>
            <p className="text-xs text-muted-foreground">Aguardando...</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Suítes de Teste
          </CardTitle>
          <CardDescription>Status detalhado de cada suíte de teste</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testSuites.map((suite, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(suite.status)}
                    <h3 className="font-semibold">{suite.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(suite.status)}>
                      {suite.status === "passed" && "Aprovado"}
                      {suite.status === "failed" && "Falhou"}
                      {suite.status === "running" && "Executando"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{suite.duration}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {suite.tests.map((test, testIndex) => (
                    <div key={testIndex} className="text-sm p-2 bg-muted rounded text-center">
                      {test}
                    </div>
                  ))}
                </div>
                {suite.status === "running" && (
                  <div className="mt-3">
                    <Progress value={33} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
