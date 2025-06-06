"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Markdown } from "./markdown"

interface DocumentationEditorProps {
  value: string
  onChange: (value: string) => void
}

export function DocumentationEditor({ value, onChange }: DocumentationEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "preview")}>
        <div className="flex items-center justify-between px-4 pt-4">
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const template = `# ${value ? "Documentation" : "Node Name"}\n\n## Description\n\nProvide a detailed description of what this node does.\n\n## Inputs\n\n- **Input 1**: Description of the first input\n- **Input 2**: Description of the second input\n\n## Outputs\n\n- **Output 1**: Description of the first output\n- **Output 2**: Description of the second output\n\n## Parameters\n\n- **Parameter 1**: Description of the first parameter\n- **Parameter 2**: Description of the second parameter\n\n## Examples\n\n### Basic Usage\n\n\`\`\`json\n{\n  "parameter1": "value1",\n  "parameter2": "value2"\n}\n\`\`\`\n\n## Notes\n\nAny additional information or caveats about using this node.`
              }}
            >
              Insert Template
            </Button>
          </div>
        </div>

        <TabsContent value="write" className="p-4">
          <textarea
            className="w-full h-[400px] p-4 border rounded-md font-mono text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="# Node Documentation

Write Markdown documentation for your node here. Include:

- Description of what the node does
- Input and output details
- Parameter descriptions
- Usage examples
- Any other relevant information"
          />
        </TabsContent>

        <TabsContent value="preview" className="p-4">
          <div className="border rounded-md p-4 min-h-[400px] prose prose-sm max-w-none">
            {value ? (
              <Markdown content={value} />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>No documentation content to preview</p>
                <p className="text-sm">Switch to the Write tab to add content</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
