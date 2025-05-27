"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Search,
  Download,
  Users,
  Star,
  Zap,
  TrendingUp,
} from "lucide-react"
import { marketplaceE2ETest } from "@/scripts/e2e-marketplace-test"

interface TestResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: any
  duration: number
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  warnings: number
  duration: number
}

/**
 * MARKETPLACE TEST RUNNER COMPONENT
 *
 * Visual interface for running and displaying marketplace E2E test results
 * Provides detailed feedback on all marketplace functionality
 */
export function MarketplaceTestRunner() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [summary, setSummary] = useState<TestSummary | null>(null)
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set())

  const runTests = async () => {
    setIsRunning(true)
    setResults([])
    setSummary(null)

    try {
      const testResults = await marketplaceE2ETest.runCompleteTest()
      setResults(testResults.results)
      setSummary(testResults.summary)
    } catch (error) {
      console.error("Test execution failed:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const toggleTestExpansion = (testName: string) => {
    const newExpanded = new Set(expandedTests)
    if (newExpanded.has(testName)) {
      newExpanded.delete(testName)
    } else {
      newExpanded.add(testName)
    }
    setExpandedTests(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "fail":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: "default",
      fail: "destructive",
      warning: "secondary",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status.toUpperCase()}</Badge>
  }

  const getTestIcon = (testName: string) => {
    const icons = {
      "Marketplace Service Functionality": ShoppingCart,
      "Search and Filtering": Search,
      "Item Details": Star,
      "Installation Process": Download,
      "Collections Management": Users,
      "Categories System": Star,
      "User Interactions": Users,
      "Integration with Skills System": Zap,
      Performance: TrendingUp,
      "Error Handling": AlertTriangle,
    }

    const IconComponent = icons[testName as keyof typeof icons] || CheckCircle
    return <IconComponent className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Marketplace E2E Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={runTests} disabled={isRunning} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              {isRunning ? "Running Tests..." : "Run Marketplace Tests"}
            </Button>

            {isRunning && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 animate-spin" />
                Testing marketplace functionality...
              </div>
            )}
          </div>

          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{summary.duration}ms</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>
          )}

          {summary && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {summary.passed}/{summary.total} tests passed
                </span>
              </div>
              <Progress value={(summary.passed / summary.total) * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Test Results</h3>

          {results.map((result, index) => (
            <Card key={index} className="overflow-hidden">
              <Collapsible>
                <CollapsibleTrigger className="w-full" onClick={() => toggleTestExpansion(result.name)}>
                  <CardHeader className="hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        {getTestIcon(result.name)}
                        <div className="text-left">
                          <CardTitle className="text-base">{result.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result.status)}
                        <Badge variant="outline" className="text-xs">
                          {result.duration}ms
                        </Badge>
                        {expandedTests.has(result.name) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {result.details && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Test Details</h4>
                        <pre className="text-xs overflow-auto">{JSON.stringify(result.details, null, 2)}</pre>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}

      {results.length === 0 && !isRunning && (
        <Card>
          <CardContent className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Test Marketplace</h3>
            <p className="text-muted-foreground mb-4">
              Run the comprehensive test suite to verify all marketplace functionality
            </p>
            <Button onClick={runTests} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start Testing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
