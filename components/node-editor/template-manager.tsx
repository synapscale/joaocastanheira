"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Save, Trash2, Edit, FolderPlus } from "lucide-react"
import { CodeEditor } from "./code-editor"
import type { CodeTemplate } from "@/data/code-templates"

interface TemplateManagerProps {
  onSaveTemplate: (template: Omit<CodeTemplate, "id">) => void
  onDeleteTemplate: (templateId: string) => void
  customTemplates: CodeTemplate[]
}

export function TemplateManager({ onSaveTemplate, onDeleteTemplate, customTemplates }: TemplateManagerProps) {
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState<"create" | "edit">("create")
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [language, setLanguage] = useState<"javascript" | "typescript" | "python" | "all">("javascript")
  const [tags, setTags] = useState("")
  const [code, setCode] = useState("")

  // Reset form
  const resetForm = () => {
    setName("")
    setDescription("")
    setCategory("")
    setLanguage("javascript")
    setTags("")
    setCode("")
    setSelectedTemplate(null)
    setEditMode("create")
  }

  // Open create template dialog
  const handleCreateTemplate = () => {
    resetForm()
    setEditMode("create")
    setOpen(true)
  }

  // Open edit template dialog
  const handleEditTemplate = (template: CodeTemplate) => {
    setSelectedTemplate(template)
    setName(template.name)
    setDescription(template.description)
    setCategory(template.category)
    setLanguage(template.language)
    setTags(template.tags.join(", "))
    setCode(template.code)
    setEditMode("edit")
    setOpen(true)
  }

  // Save template
  const handleSaveTemplate = () => {
    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const template: Omit<CodeTemplate, "id"> = {
      name,
      description,
      category,
      language,
      tags: tagsArray,
      code,
    }

    onSaveTemplate(template)
    setOpen(false)
    resetForm()
  }

  // Delete template
  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      onDeleteTemplate(templateId)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Custom Templates</h2>
        <Button onClick={handleCreateTemplate} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {customTemplates.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <FolderPlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No custom templates yet</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleCreateTemplate}>
            Create your first template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customTemplates.map((template) => (
            <div key={template.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{template.name}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="capitalize">
                  {template.category}
                </Badge>
                <Badge variant="outline">{template.language}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editMode === "create" ? "Create Template" : "Edit Template"}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="all">All Languages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code Template</Label>
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  height="300px"
                  language={language === "all" ? "javascript" : language}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              {editMode === "create" ? "Create Template" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
