"use client"

import { useState } from "react"
import { useCodeTemplates } from "@/context/code-template-context"
import { TemplateManager } from "@/components/node-editor/template-manager"
import type { CodeTemplate } from "@/data/code-templates"

export default function CodeTemplatesPage() {
  const { customTemplates, addCustomTemplate, updateCustomTemplate, deleteCustomTemplate } = useCodeTemplates()
  const [searchQuery, setSearchQuery] = useState("")

  // Handle save template
  const handleSaveTemplate = (template: Omit<CodeTemplate, "id">) => {
    addCustomTemplate(template)
  }

  // Handle update template
  const handleUpdateTemplate = (id: string, template: Omit<CodeTemplate, "id">) => {
    updateCustomTemplate(id, template)
  }

  // Handle delete template
  const handleDeleteTemplate = (id: string) => {
    deleteCustomTemplate(id)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Code Templates</h1>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <TemplateManager
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          customTemplates={customTemplates}
        />
      </div>
    </div>
  )
}
