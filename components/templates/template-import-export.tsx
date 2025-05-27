"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useTemplates } from "@/context/template-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Download, Upload, Copy, Check } from "lucide-react"

export function TemplateImportExport() {
  const { exportTemplates, importTemplates } = useTemplates()
  const { toast } = useToast()
  const [openExport, setOpenExport] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [exportData, setExportData] = useState("")
  const [importData, setImportData] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle export
  const handleExport = () => {
    try {
      const data = exportTemplates()
      setExportData(data)
      setOpenExport(true)
    } catch (error) {
      toast({
        title: "Export Error",
        description: (error as Error).message || "Failed to export templates",
        variant: "destructive",
      })
    }
  }

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(exportData)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Handle download as file
  const handleDownload = () => {
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `n8n-templates-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle import from text
  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "Import Error",
        description: "No data to import",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    try {
      const count = await importTemplates(importData)
      toast({
        title: "Import Success",
        description: `Successfully imported ${count} templates`,
      })
      setOpenImport(false)
      setImportData("")
    } catch (error) {
      toast({
        title: "Import Error",
        description: (error as Error).message || "Failed to import templates",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImportData(event.target.result as string)
      }
    }
    reader.readAsText(file)
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpenImport(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </div>

      {/* Export Dialog */}
      <Dialog open={openExport} onOpenChange={setOpenExport}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Export Templates</DialogTitle>
            <DialogDescription>Copy the JSON below or download it as a file.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea value={exportData} readOnly className="font-mono text-xs h-[300px]" />
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy}>
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={openImport} onOpenChange={setOpenImport}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Templates</DialogTitle>
            <DialogDescription>Paste JSON data or upload a file to import templates.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON data here..."
              className="font-mono text-xs h-[300px]"
            />
            <div className="flex justify-center">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".json" className="hidden" />
              <Button variant="outline" onClick={triggerFileInput}>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenImport(false)} disabled={isImporting}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importData.trim() || isImporting}>
              {isImporting ? "Importing..." : "Import Templates"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
