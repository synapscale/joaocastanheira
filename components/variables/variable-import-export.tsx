"use client"

import { useState } from "react"
import { useVariables } from "@/context/variable-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Download, Upload, Copy, Check } from "lucide-react"

interface VariableImportExportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VariableImportExport({ open, onOpenChange }: VariableImportExportProps) {
  const { variables, addVariable } = useVariables()
  const { toast } = useToast()
  const [importData, setImportData] = useState("")
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("export")

  // Filter out system variables for export
  const exportableVariables = variables.filter((v) => !v.isSystem)

  const handleExport = () => {
    const exportData = JSON.stringify(exportableVariables, null, 2)

    // Create a blob and download it
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "workflow-variables.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Variables exported",
      description: `Exported ${exportableVariables.length} variables`,
    })
  }

  const handleCopyToClipboard = () => {
    const exportData = JSON.stringify(exportableVariables, null, 2)
    navigator.clipboard.writeText(exportData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Copied to clipboard",
      description: `${exportableVariables.length} variables copied to clipboard`,
    })
  }

  const handleImport = () => {
    try {
      const parsedData = JSON.parse(importData)

      if (!Array.isArray(parsedData)) {
        throw new Error("Import data must be an array of variables")
      }

      let importCount = 0
      for (const item of parsedData) {
        // Validate the variable has required fields
        if (!item.name || !item.key || !item.type || !item.scope) {
          continue
        }

        // Add the variable
        addVariable({
          name: item.name,
          key: item.key,
          type: item.type,
          scope: item.scope,
          value: item.value,
          description: item.description,
          encrypted: item.encrypted,
          tags: item.tags,
        })
        importCount++
      }

      toast({
        title: "Variables imported",
        description: `Successfully imported ${importCount} variables`,
      })

      setImportData("")
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Invalid JSON format",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import/Export Variables</DialogTitle>
          <DialogDescription>Share variables between workflows or create backups</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 pt-4">
            {exportableVariables.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-muted-foreground">No variables available for export</p>
              </div>
            ) : (
              <>
                <Textarea
                  readOnly
                  value={JSON.stringify(exportableVariables, null, 2)}
                  className="font-mono text-sm min-h-[200px]"
                />
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    {exportableVariables.length} variable{exportableVariables.length !== 1 ? "s" : ""} available for
                    export
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCopyToClipboard}>
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Download JSON
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4 pt-4">
            <Textarea
              placeholder="Paste JSON data here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="font-mono text-sm min-h-[200px]"
            />
            <p className="text-sm text-muted-foreground">Paste exported variable data in JSON format</p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {activeTab === "import" && (
            <Button onClick={handleImport} disabled={!importData.trim()}>
              <Upload className="h-4 w-4 mr-2" />
              Import Variables
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
