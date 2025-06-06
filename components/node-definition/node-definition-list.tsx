"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useNodeDefinitions } from "@/context/node-definition-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Download,
  Upload,
  FileUp,
  Code,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { NodeDefinition } from "@/types/node-definition"

export function NodeDefinitionList() {
  const router = useRouter()
  const { toast } = useToast()
  const { nodeDefinitions, addNodeDefinition, updateNodeDefinition, deleteNodeDefinition, isLoading } =
    useNodeDefinitions()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importData, setImportData] = useState("")
  const [deleteConfirmNode, setDeleteConfirmNode] = useState<NodeDefinition | null>(null)
  const [view, setView] = useState<"grid" | "list">("grid")

  // Extract unique categories and tags
  const categories = Array.from(new Set(nodeDefinitions.map((node) => node.category)))
  const allTags = nodeDefinitions.flatMap((node) => node.tags || [])
  const tags = Array.from(new Set(allTags))

  // Filter nodes based on search, category, and tag
  const filteredNodes = nodeDefinitions.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.tags && node.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    const matchesCategory = selectedCategory ? node.category === selectedCategory : true
    const matchesTag = selectedTag ? node.tags?.includes(selectedTag) : true

    return matchesSearch && matchesCategory && matchesTag
  })

  const handleCreateNew = () => {
    router.push("/node-definitions/create")
  }

  const handleEdit = (node: NodeDefinition) => {
    router.push(`/node-definitions/edit/${node.id}`)
  }

  const handleDuplicate = (node: NodeDefinition) => {
    const newNode = {
      ...node,
      id: `node-${Date.now()}`,
      name: `${node.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    addNodeDefinition(newNode)
    toast({
      title: "Node duplicated",
      description: `${node.name} has been duplicated successfully.`,
    })
  }

  const handleDelete = (node: NodeDefinition) => {
    deleteNodeDefinition(node.id)
    setDeleteConfirmNode(null)
    toast({
      title: "Node deleted",
      description: `${node.name} has been deleted successfully.`,
    })
  }

  const handleExport = (node: NodeDefinition) => {
    try {
      const dataStr = JSON.stringify(node, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

      const exportFileName = `${node.name.toLowerCase().replace(/\s+/g, "-")}-definition.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileName)
      linkElement.click()

      toast({
        title: "Node exported",
        description: `${node.name} has been exported as JSON.`,
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
      const nodeData = JSON.parse(importData)

      // Basic validation
      if (!nodeData.name || !nodeData.type || !nodeData.category) {
        throw new Error("Invalid node definition format")
      }

      // Ensure it has a unique ID
      nodeData.id = `node-${Date.now()}`
      nodeData.createdAt = new Date()
      nodeData.updatedAt = new Date()

      addNodeDefinition(nodeData)
      setImportDialogOpen(false)
      setImportData("")

      toast({
        title: "Node imported",
        description: `${nodeData.name} has been imported successfully.`,
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

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory(null)
    setSelectedTag(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Node Definitions</h2>
          <p className="text-muted-foreground">Create and manage node definitions for your workflows</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import Node Definition</DialogTitle>
                <DialogDescription>Upload a JSON file or paste the node definition JSON.</DialogDescription>
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

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search node definitions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {(selectedCategory || selectedTag) && (
                <Badge variant="secondary" className="ml-2">
                  {(selectedCategory ? 1 : 0) + (selectedTag ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className="flex items-center justify-between"
              >
                {category}
                {selectedCategory === category && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {tags.length > 0 ? (
              tags.map((tag) => (
                <DropdownMenuItem
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className="flex items-center justify-between"
                >
                  {tag}
                  {selectedTag === tag && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No tags available</DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={resetFilters} className="text-primary">
              Reset Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="sm"
            className="rounded-none"
            onClick={() => setView("grid")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            className="rounded-none"
            onClick={() => setView("list")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Applied filters */}
      {(selectedCategory || selectedTag || searchQuery) && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchQuery}
              <XCircle className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchQuery("")} />
            </Badge>
          )}

          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {selectedCategory}
              <XCircle className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedCategory(null)} />
            </Badge>
          )}

          {selectedTag && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Tag: {selectedTag}
              <XCircle className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedTag(null)} />
            </Badge>
          )}

          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={resetFilters}>
            Clear All
          </Button>
        </div>
      )}

      {/* Node list */}
      {filteredNodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No node definitions found</h3>
          <p className="text-muted-foreground mb-6">
            {nodeDefinitions.length === 0
              ? "Get started by creating your first node definition"
              : "Try adjusting your search or filters"}
          </p>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Node
          </Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNodes.map((node) => (
            <Card key={node.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{node.name}</CardTitle>
                  <Badge variant={node.deprecated ? "destructive" : "secondary"}>
                    {node.deprecated ? "Deprecated" : `v${node.version}`}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{node.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="outline">{node.category}</Badge>
                  {node.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-muted">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    <span>Type: {node.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Updated: {new Date(node.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {node.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Author: {node.author}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(node)}>
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(node)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(node)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(node)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteConfirmNode(node)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Version</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Updated</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNodes.map((node, index) => (
                <tr key={node.id} className={`border-t ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                  <td className="p-3">
                    <div className="font-medium">{node.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{node.description}</div>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <Badge variant="outline">{node.category}</Badge>
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <Badge variant={node.deprecated ? "destructive" : "secondary"}>
                      {node.deprecated ? "Deprecated" : `v${node.version}`}
                    </Badge>
                  </td>
                  <td className="p-3 hidden lg:table-cell text-sm text-muted-foreground">
                    {new Date(node.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(node)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicate(node)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(node)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteConfirmNode(node)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirmNode} onOpenChange={(open) => !open && setDeleteConfirmNode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Node Definition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmNode?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmNode && handleDelete(deleteConfirmNode)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
