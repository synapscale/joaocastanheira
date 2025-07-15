"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Upload, Download, Trash2, RefreshCw } from "lucide-react"
import { useCodeTemplates } from "@/context/code-template-context"
import { codeTemplates as defaultTemplates } from "@/data/code-templates"

export function CodeTemplateMigration() {
  const {
    templates,
    isLoading,
    error,
    refreshTemplates,
    migrateLocalStorageTemplates,
    importDefaultTemplates,
    bulkImportTemplates,
  } = useCodeTemplates()

  const [migrationStatus, setMigrationStatus] = useState<{
    isRunning: boolean
    step: string
    progress: number
    results?: any
    error?: string
  }>({
    isRunning: false,
    step: "",
    progress: 0,
  })

  // Check if localStorage has custom templates
  const hasLocalStorageTemplates = () => {
    if (typeof window === "undefined") return false
    const stored = localStorage.getItem("customCodeTemplates")
    return stored && JSON.parse(stored).length > 0
  }

  // Check if API has templates
  const hasApiTemplates = templates.length > 0 && templates.some(t => t.user_id !== "system")

  // Handle migration from localStorage
  const handleMigrateLocalStorage = async () => {
    try {
      setMigrationStatus({
        isRunning: true,
        step: "Migrating localStorage templates...",
        progress: 25,
      })

      const result = await migrateLocalStorageTemplates()

      setMigrationStatus({
        isRunning: false,
        step: "Migration completed",
        progress: 100,
        results: result,
      })

      // Refresh templates to show updated list
      await refreshTemplates()
    } catch (err) {
      setMigrationStatus({
        isRunning: false,
        step: "Migration failed",
        progress: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  // Handle importing default templates
  const handleImportDefaults = async () => {
    try {
      setMigrationStatus({
        isRunning: true,
        step: "Importing default templates...",
        progress: 50,
      })

      const result = await importDefaultTemplates()

      setMigrationStatus({
        isRunning: false,
        step: "Import completed",
        progress: 100,
        results: result,
      })

      // Refresh templates to show updated list
      await refreshTemplates()
    } catch (err) {
      setMigrationStatus({
        isRunning: false,
        step: "Import failed",
        progress: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  // Clear localStorage templates (after successful migration)
  const handleClearLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("customCodeTemplates")
      setMigrationStatus({
        isRunning: false,
        step: "localStorage cleared",
        progress: 100,
      })
    }
  }

  const localStorageCount = hasLocalStorageTemplates() 
    ? JSON.parse(localStorage.getItem("customCodeTemplates") || "[]").length 
    : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Code Template Migration
          </CardTitle>
          <CardDescription>
            Migrate your code templates from localStorage to the API-driven system for better synchronization and sharing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Default Templates</p>
                    <p className="text-2xl font-bold">{defaultTemplates.length}</p>
                  </div>
                  <Download className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground">Built-in templates</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">localStorage Templates</p>
                    <p className="text-2xl font-bold">{localStorageCount}</p>
                  </div>
                  <Upload className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-xs text-muted-foreground">Custom templates in browser</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">API Templates</p>
                    <p className="text-2xl font-bold">{templates.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground">Synced templates</p>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                API Error: {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Migration Progress */}
          {migrationStatus.isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{migrationStatus.step}</span>
                <span className="text-sm text-muted-foreground">{migrationStatus.progress}%</span>
              </div>
              <Progress value={migrationStatus.progress} />
            </div>
          )}

          {/* Migration Results */}
          {migrationStatus.results && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Migration completed: {migrationStatus.results.imported} imported, {migrationStatus.results.skipped} skipped
                {migrationStatus.results.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Errors:</p>
                    <ul className="list-disc ml-4">
                      {migrationStatus.results.errors.map((error: string, index: number) => (
                        <li key={index} className="text-red-600">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Migration Error */}
          {migrationStatus.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {migrationStatus.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Migration Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Default Templates Import */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import Default Templates</CardTitle>
                <CardDescription>
                  Import the {defaultTemplates.length} built-in code templates to the API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(defaultTemplates.map(t => t.category))).map(category => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    onClick={handleImportDefaults}
                    disabled={migrationStatus.isRunning || isLoading}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Import Default Templates
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* localStorage Migration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Migrate localStorage Templates</CardTitle>
                <CardDescription>
                  Move custom templates from browser storage to the API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {localStorageCount > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Found {localStorageCount} custom templates in localStorage
                      </p>
                      <Button 
                        onClick={handleMigrateLocalStorage}
                        disabled={migrationStatus.isRunning || isLoading}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Migrate localStorage Templates
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No custom templates found in localStorage
                      </p>
                      <Button 
                        onClick={handleClearLocalStorage}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear localStorage
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <Button 
              onClick={refreshTemplates}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Template List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 