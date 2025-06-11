"use client"

import type React from "react"

import { useState } from "react"
import { useTemplates } from "@/context/template-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Search, Play, FileCode } from "lucide-react"

interface TemplateSelectorDialogProps {
  trigger?: React.ReactNode
  onClose?: () => void
}

export function TemplateSelectorDialog({ trigger, onClose }: TemplateSelectorDialogProps) {
  const { templates, applyTemplate } = useTemplates()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Filter templates based on search
  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
  )

  // Handle template application
  const handleApplyTemplate = (templateId: string) => {
    try {
      applyTemplate(templateId)
      toast({
        title: "Success",
        description: "Template applied successfully",
      })
      setOpen(false)
      if (onClose) onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to apply template",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileCode className="h-4 w-4 mr-2" />
            Apply Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply Template</DialogTitle>
          <DialogDescription>Select a template to apply to your workflow.</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No templates found</p>
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-3 hover:border-primary transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleApplyTemplate(template.id)}
                    >
                      <Play className="h-3 w-3 mr-2" />
                      Apply
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
