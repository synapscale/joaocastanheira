"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Preview } from "@/components/node-editor/preview"

interface DocumentationEditorProps {
  value: string
  onChange: (value: string) => void
}

export function DocumentationEditor({ value, onChange }: DocumentationEditorProps) {
  const [activeTab, setActiveTab] = useState("edit")

  const defaultDocumentation = `# Node Documentation

## Overview
Describe what this node does and when to use it.

## Inputs
Describe the expected inputs for this node:

- **Input 1**: Description of the first input
- **Input 2**: Description of the second input

## Outputs
Describe the outputs this node produces:

- **Output 1**: Description of the first output
- **Output 2**: Description of the second output

## Parameters
Describe the parameters this node accepts:

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| Parameter 1 | String | Description of parameter 1 | Default value |
| Parameter 2 | Number | Description of parameter 2 | Default value |

## Examples
Provide examples of how to use this node:

\`\`\`javascript
// Example code
const result = processData(input);
\`\`\`

## Tips and Best Practices
- Tip 1
- Tip 2
- Tip 3

## Troubleshooting
Common issues and how to resolve them:

- **Issue 1**: Resolution for issue 1
- **Issue 2**: Resolution for issue 2
`

  const handleReset = () => {
    onChange(defaultDocumentation)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Documentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset to Template
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[500px] font-mono text-sm"
              placeholder="# Node Documentation"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use Markdown to format the documentation. Include information about inputs, outputs, parameters, and
              examples.
            </p>
          </TabsContent>

          <TabsContent value="preview">
            <div className="border rounded-md p-4 min-h-[500px] overflow-y-auto bg-white">
              <Preview content={value} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
