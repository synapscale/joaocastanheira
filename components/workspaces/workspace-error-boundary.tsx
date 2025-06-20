/**
 * Error Boundary para o Dashboard de Workspaces
 * Captura erros de renderização e JSON parsing
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

class WorkspaceErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Workspace Dashboard Error:', error, errorInfo)
    this.setState({
      hasError: true,
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <div>
                    <CardTitle>Erro no Dashboard</CardTitle>
                    <CardDescription>
                      Ocorreu um erro inesperado no dashboard de workspaces
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {this.state.error?.message || 'Erro desconhecido'}
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4">
                  <Button onClick={this.handleRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                  <Button variant="outline" onClick={() => window.history.back()}>
                    Voltar
                  </Button>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Detalhes do Erro (Desenvolvimento)
                    </summary>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default WorkspaceErrorBoundary

// Hook para detectar erros de JSON parsing
export const useSafeJsonParse = (data: any) => {
  try {
    if (typeof data === 'string') {
      return JSON.parse(data)
    }
    return data
  } catch (error) {
    console.warn('JSON Parse Error:', error, 'Data:', data)
    return null
  }
}

// Helper para validar dados da API
export const validateApiResponse = (response: any, expectedKeys: string[] = []) => {
  if (!response || typeof response !== 'object') {
    return false
  }

  // Verificar se todas as chaves esperadas existem
  for (const key of expectedKeys) {
    if (!(key in response)) {
      return false
    }
  }

  return true
}

// Helper para acessar dados aninhados com segurança
export const safeGet = (obj: any, path: string, defaultValue: any = null) => {
  try {
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue
      }
      result = result[key]
    }
    
    return result !== undefined ? result : defaultValue
  } catch (error) {
    console.warn('Safe get error:', error, 'Path:', path)
    return defaultValue
  }
} 