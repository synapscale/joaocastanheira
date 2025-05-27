"use client"

import type React from "react"

import { useState } from "react"
import { useTemplates } from "@/context/template-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { SaveTemplateDialog } from "./save-template-dialog"
import { TemplateImportExport } from "./template-import-export"
import { Search, MoreVertical, Play, Calendar, X, Save } from "lucide-react"
import type { NodeTemplate } from "@/types/node-template"

export function TemplateBrowser() {
  const { filteredTemplates, templates, categories, filters, setFilters, applyTemplate, deleteTemplate } =
    useTemplates()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [previewTemplate, setPreviewTemplate] = useState<NodeTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Get all unique tags from templates
  const allTags = Array.from(new Set(templates.flatMap((template) => template.tags))).sort()

  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    setActiveTab(categoryId)

    if (categoryId === "all") {
      setFilters({ ...filters, categories: [] })
    } else {
      setFilters({ ...filters, categories: [categoryId] })
    }
  }

  // Handle tag filter
  const handleTagFilter = (tag: string) => {
    if (filters.tags.includes(tag)) {
      setFilters({
        ...filters,
        tags: filters.tags.filter((t) => t !== tag),
      })
    } else {
      setFilters({
        ...filters,
        tags: [...filters.tags, tag],
      })
    }
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      search: e.target.value,
    })
  }

  // Handle template application
  const handleApplyTemplate = (templateId: string) => {
    try {
      applyTemplate(templateId)
      toast({
        title: "Success",
        description: "Template applied successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to apply template",
        variant: "destructive",
      })
    }
  }

  // Handle template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      try {
        await deleteTemplate(templateId)
        toast({
          title: "Success",
          description: "Template deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: (error as Error).message || "Failed to delete template",
          variant: "destructive",
        })
      }
    }
  }

  // Handle template preview
  const handlePreviewTemplate = (template: NodeTemplate) => {
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflow Templates</h1>
        <div className="flex gap-2">
          <TemplateImportExport />
          <SaveTemplateDialog />
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." value={filters.search} onChange={handleSearch} className="pl-10" />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center mr-2">
              <span className="text-sm text-muted-foreground">Tags:</span>
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleTagFilter(tag)}>
                  {tag}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleCategoryFilter}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters, or create a new template.
              </p>
              <SaveTemplateDialog
                trigger={
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Current Workflow as Template
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{template.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>Preview</DropdownMenuItem>
                          {!template.isBuiltIn && (
                            <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)}>
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => handleTagFilter(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Created: {formatDate(template.createdAt)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => handleApplyTemplate(template.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Apply Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="py-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Template Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>{" "}
                    {categories.find((c) => c.id === previewTemplate.category)?.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span> {formatDate(previewTemplate.createdAt)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Updated:</span> {formatDate(previewTemplate.updatedAt)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nodes:</span> {previewTemplate.nodes.length}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {previewTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Nodes</h4>
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  <div className="space-y-2">
                    {previewTemplate.nodes.map((node) => (
                      <div key={node.id} className="p-2 border rounded-md">
                        <div className="font-medium">{node.name}</div>
                        <div className="text-sm text-muted-foreground">{node.description}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleApplyTemplate(previewTemplate.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Apply Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
