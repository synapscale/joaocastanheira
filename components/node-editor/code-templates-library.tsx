"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Code, Copy } from "lucide-react"
import { useCodeTemplates } from "@/context/code-template-context"
import { cn } from "@/lib/utils"

interface CodeTemplatesLibraryProps {
  language: string
  onInsert: (code: string) => void
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonSize?: "default" | "sm" | "lg" | "icon"
}

export function CodeTemplatesLibrary({
  language,
  onInsert,
  buttonVariant = "outline",
  buttonSize = "default",
}: CodeTemplatesLibraryProps) {
  const { templates } = useCodeTemplates()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [open, setOpen] = useState(false)

  // Get available categories from templates
  const categories = ["all", ...new Set(templates.map((template) => template.category))]

  // Filter templates based on search query, selected category, and language
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory

    const matchesLanguage = template.language === "all" || template.language === language

    return matchesSearch && matchesCategory && matchesLanguage
  })

  // Handle template selection
  const handleSelectTemplate = (code: string) => {
    onInsert(code)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          <Code className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Code Templates</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
          <TabsList className="mb-4 flex flex-wrap h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No templates found for your search criteria
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors"
                    onClick={() => handleSelectTemplate(template.code)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="outline" className="capitalize">
                        {template.category}
                      </Badge>
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
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          template.language === "javascript" && "bg-yellow-100 text-yellow-800 border-yellow-200",
                          template.language === "typescript" && "bg-blue-100 text-blue-800 border-blue-200",
                          template.language === "python" && "bg-green-100 text-green-800 border-green-200",
                          template.language === "all" && "bg-gray-100 text-gray-800 border-gray-200",
                        )}
                      >
                        {template.language}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Insert
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
