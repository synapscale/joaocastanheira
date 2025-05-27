"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeDefinitions } from "@/context/node-definition-context"
import type { NodeDefinition } from "@/types/node-definition"
import { Search, Plus, Edit, Trash2, Copy, Download, Upload, FileUp } from "lucide-react"

export function NodeDefinitionList() {
  const router = useRouter()
  const { toast } = useToast()
  const { nodeDefinitions, deleteNodeDefinition, addNodeDefinition } = useNodeDefinitions()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDefinition, setSelectedDefinition] = useState<NodeDefinition | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importData, setImportData] = useState("")

  const filteredDefinitions = nodeDefinitions.filter(
    (def) =>
      def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (def.tags && def.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))),
  )

  const handleCreateNew = () => {
    router.push("/node-definitions/create")
  }

  const handleEdit = (definition: NodeDefinition) => {
    router.push(`/node-definitions/edit/${definition.id}`)
  }

  const handleDelete = (definition: NodeDefinition) => {
    deleteNodeDefinition(definition.id)
    toast({
      title: "Node definition deleted",
      description: `"${definition.name}" has been deleted.`,
    })
  }

  const handleDuplicate = (definition: NodeDefinition) => {
    const newDefinition: NodeDefinition = {
      ...definition,
      id: `node-def-${Date.now()}`,
      name: `${definition.name} (copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    addNodeDefinition(newDefinition)
    toast({
      title: "Node definition duplicated",
      description: `"${definition.name}" has been duplicated.`,
    })
  }

  const handleExport = (definition: NodeDefinition) => {
    try {
      const dataStr = JSON.stringify(definition, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

      const exportFileDefaultName = `${definition.name.toLowerCase().replace(/\s+/g, "-")}-definition.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Node definition exported",
        description: `"${definition.name}" has been exported as JSON.`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the node definition.",
        variant: "destructive",
      })
    }
  }

  const handleImport = () => {
    try {
      const definition = JSON.parse(importData)

      // Basic validation
      if (!definition.name || !definition.type || !definition.category) {
        throw new Error("Invalid node definition format")
      }

      // Ensure it has a unique ID
      definition.id = `node-def-${Date.now()}`
      definition.createdAt = new Date()
      definition.updatedAt = new Date()

      addNodeDefinition(definition)
      setImportDialogOpen(false)
      setImportData("")

      toast({
        title: "Node definition imported",
        description: `"${definition.name}" has been imported successfully.`,
      })
    } catch (error) {
      toast({
        title: "Import failed",
        description: "The provided JSON is not a valid node definition.",
        variant: "destructive",
      })
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        setImportData(content)
      } catch (error) {
        toast({
          title: "File read error",
          description: "Could not read the selected file.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Node Definitions</CardTitle>
              <CardDescription>Manage your custom node definitions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Node Definition</DialogTitle>
                    <DialogDescription>Paste the JSON of a node definition or upload a file.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-center border-2 border-dashed rounded-md p-6">
                      <label className="flex flex-col items-center cursor-pointer">
                        <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium mb-1">Click to upload a file</span>
                        <span className="text-xs text-muted-foreground">or drag and drop</span>
                        <input type="file" accept=".json" className="hidden" onChange={handleFileImport} />
                      </label>
                    </div>
                    <textarea
                      className="w-full h-64 p-2 border rounded-md font-mono text-sm"
                      placeholder='{"name": "My Node", "type": "myNode", ...}'
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImport}>Import</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search node definitions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredDefinitions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">No node definitions found</div>
              <Button onClick={handleCreateNew}>Create your first node definition</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDefinitions.map((definition) => (
                <Card key={definition.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{definition.name}</CardTitle>
                      <Badge variant={definition.deprecated ? "destructive" : "secondary"}>
                        {definition.deprecated ? "Deprecated" : `v${definition.version}`}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{definition.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline">{definition.category}</Badge>
                      {definition.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-muted">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Created: {new Date(definition.createdAt).toLocaleDateString()}</div>
                      <div>Updated: {new Date(definition.updatedAt).toLocaleDateString()}</div>
                      {definition.author && <div>Author: {definition.author}</div>}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(definition)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDuplicate(definition)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleExport(definition)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Node Definition</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{definition.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(definition)}
                            className="bg-red-500 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
