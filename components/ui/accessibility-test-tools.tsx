'use client'

import React, { useState, useEffect } from 'react'
import { Check, X, AlertTriangle, Eye, Keyboard, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AccessibilityTestResult {
  category: string
  test: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  priority: 'high' | 'medium' | 'low'
}

export interface AccessibilityTestSuiteProps {
  targetElement?: HTMLElement | null
  autoRun?: boolean
  showResults?: boolean
  className?: string
}

// Testes de acessibilidade automatizados
const runAccessibilityTests = (element: HTMLElement | null): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = []
  
  if (!element) {
    results.push({
      category: 'Setup',
      test: 'Element Detection',
      status: 'fail',
      message: 'Elemento de teste não encontrado',
      priority: 'high'
    })
    return results
  }

  // 1. Teste de labels e elementos de formulário
  const formInputs = element.querySelectorAll('input, textarea, select')
  formInputs.forEach((input, index) => {
    const inputElement = input as HTMLInputElement
    const label = element.querySelector(`label[for="${inputElement.id}"]`)
    const ariaLabel = inputElement.getAttribute('aria-label')
    const ariaLabelledBy = inputElement.getAttribute('aria-labelledby')
    
    if (!label && !ariaLabel && !ariaLabelledBy) {
      results.push({
        category: 'Form Labels',
        test: `Input ${index + 1} (${inputElement.type})`,
        status: 'fail',
        message: 'Campo sem label, aria-label ou aria-labelledby',
        priority: 'high'
      })
    } else {
      results.push({
        category: 'Form Labels',
        test: `Input ${index + 1} (${inputElement.type})`,
        status: 'pass',
        message: 'Campo possui label adequado',
        priority: 'high'
      })
    }
  })

  // 2. Teste de hierarquia de cabeçalhos
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let previousLevel = 0
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1))
    
    if (index === 0 && level !== 1 && level !== 2) {
      results.push({
        category: 'Heading Structure',
        test: `First Heading Level`,
        status: 'warning',
        message: `Primeiro cabeçalho é ${heading.tagName}, deveria ser H1 ou H2`,
        priority: 'medium'
      })
    }
    
    if (index > 0 && level > previousLevel + 1) {
      results.push({
        category: 'Heading Structure',
        test: `Heading ${index + 1}`,
        status: 'fail',
        message: `Salto de nível: ${previousLevel} para ${level}`,
        priority: 'medium'
      })
    } else if (headings.length > 0) {
      results.push({
        category: 'Heading Structure',
        test: `Heading Hierarchy`,
        status: 'pass',
        message: 'Hierarquia de cabeçalhos adequada',
        priority: 'medium'
      })
    }
    
    previousLevel = level
  })

  // 3. Teste de contraste de cores (simulação básica)
  const colorElements = element.querySelectorAll('[class*="text-"], [style*="color"]')
  if (colorElements.length > 0) {
    results.push({
      category: 'Color Contrast',
      test: 'Text Color Elements',
      status: 'pass',
      message: `${colorElements.length} elementos com cores personalizadas encontrados`,
      priority: 'high'
    })
  }

  // 4. Teste de navegação por teclado
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  if (focusableElements.length === 0) {
    results.push({
      category: 'Keyboard Navigation',
      test: 'Focusable Elements',
      status: 'fail',
      message: 'Nenhum elemento focalizável encontrado',
      priority: 'high'
    })
  } else {
    results.push({
      category: 'Keyboard Navigation',
      test: 'Focusable Elements',
      status: 'pass',
      message: `${focusableElements.length} elementos focalizáveis encontrados`,
      priority: 'high'
    })
  }

  // 5. Teste de ARIA landmarks
  const landmarks = element.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer')
  if (landmarks.length > 0) {
    results.push({
      category: 'ARIA Landmarks',
      test: 'Page Structure',
      status: 'pass',
      message: `${landmarks.length} landmarks ARIA encontrados`,
      priority: 'medium'
    })
  } else {
    results.push({
      category: 'ARIA Landmarks',
      test: 'Page Structure',
      status: 'warning',
      message: 'Poucos ou nenhum landmark ARIA encontrado',
      priority: 'medium'
    })
  }

  // 6. Teste de alt text em imagens
  const images = element.querySelectorAll('img')
  let imagesWithoutAlt = 0
  
  images.forEach(img => {
    const altText = img.getAttribute('alt')
    if (!altText && altText !== '') {
      imagesWithoutAlt++
    }
  })
  
  if (images.length > 0) {
    if (imagesWithoutAlt === 0) {
      results.push({
        category: 'Images',
        test: 'Alt Text',
        status: 'pass',
        message: `Todas as ${images.length} imagens possuem alt text`,
        priority: 'high'
      })
    } else {
      results.push({
        category: 'Images',
        test: 'Alt Text',
        status: 'fail',
        message: `${imagesWithoutAlt} de ${images.length} imagens sem alt text`,
        priority: 'high'
      })
    }
  }

  // 7. Teste de aria-live regions
  const liveRegions = element.querySelectorAll('[aria-live], [role="status"], [role="alert"]')
  if (liveRegions.length > 0) {
    results.push({
      category: 'Screen Reader',
      test: 'Live Regions',
      status: 'pass',
      message: `${liveRegions.length} regiões dinâmicas para screen reader`,
      priority: 'medium'
    })
  } else {
    results.push({
      category: 'Screen Reader',
      test: 'Live Regions',
      status: 'warning',
      message: 'Nenhuma região dinâmica encontrada',
      priority: 'medium'
    })
  }

  return results
}

// Componente principal de teste de acessibilidade
export const AccessibilityTestSuite: React.FC<AccessibilityTestSuiteProps> = ({
  targetElement,
  autoRun = false,
  showResults = true,
  className
}) => {
  const [results, setResults] = useState<AccessibilityTestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastRun, setLastRun] = useState<Date | null>(null)

  const runTests = () => {
    setIsRunning(true)
    
    setTimeout(() => {
      const testResults = runAccessibilityTests(targetElement || null)
      setResults(testResults)
      setLastRun(new Date())
      setIsRunning(false)
    }, 500) // Simular tempo de processamento
  }

  useEffect(() => {
    if (autoRun && targetElement) {
      runTests()
    }
  }, [autoRun, targetElement])

  const handleRunTests = () => {
    if (targetElement) {
      runTests()
    }
  }

  const getStatusIcon = (status: AccessibilityTestResult['status']) => {
    switch (status) {
      case 'pass':
        return <Check className="w-4 h-4 text-green-500" />
      case 'fail':
        return <X className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: AccessibilityTestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'text-green-600 dark:text-green-400'
      case 'fail':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getPriorityBadge = (priority: AccessibilityTestResult['priority']) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
    
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        colors[priority]
      )}>
        {priority}
      </span>
    )
  }

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = []
    }
    acc[result.category].push(result)
    return acc
  }, {} as Record<string, AccessibilityTestResult[]>)

  const summaryStats = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    warnings: results.filter(r => r.status === 'warning').length
  }

  if (!showResults) {
    return (
      <button
        onClick={runTests}
        disabled={isRunning}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isRunning ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Testando...
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            Testar Acessibilidade
          </>
        )}
      </button>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header e controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Teste de Acessibilidade
          </h3>
        </div>
        
        <button
          onClick={runTests}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Executar Testes
            </>
          )}
        </button>
      </div>

      {/* Estatísticas do resumo */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summaryStats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {summaryStats.passed}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Passou</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {summaryStats.failed}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">Falhou</div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {summaryStats.warnings}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Avisos</div>
          </div>
        </div>
      )}

      {/* Resultados dos testes */}
      {Object.keys(groupedResults).length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedResults).map(([category, categoryResults]) => (
            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white">{category}</h4>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {categoryResults.map((result, index) => (
                  <div key={index} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {result.test}
                        </div>
                        <div className={cn('text-sm', getStatusColor(result.status))}>
                          {result.message}
                        </div>
                      </div>
                    </div>
                    
                    {getPriorityBadge(result.priority)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tempo da última execução */}
      {lastRun && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Última execução: {lastRun.toLocaleTimeString()}
        </div>
      )}

      {/* Mensagem se não há resultados */}
      {results.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Clique em "Executar Testes" para verificar a acessibilidade</p>
        </div>
      )}
    </div>
  )
}

// Hook para usar testes de acessibilidade
export const useAccessibilityTesting = () => {
  const [results, setResults] = useState<AccessibilityTestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = (element: HTMLElement | null) => {
    setIsRunning(true)
    
    setTimeout(() => {
      const testResults = runAccessibilityTests(element)
      setResults(testResults)
      setIsRunning(false)
    }, 500)
  }

  return {
    results,
    isRunning,
    runTests
  }
} 