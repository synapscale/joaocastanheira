"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeEditor } from "@/components/node-editor/code-editor"

interface CodeTemplateEditorProps {
  value: string
  onChange: (value: string) => void
}

export function CodeTemplateEditor({ value, onChange }: CodeTemplateEditorProps) {
  const [language, setLanguage] = useState("javascript")
  const [fontSize, setFontSize] = useState(14)

  const templates = {
    javascript: `// Node code template
// This code will be used as a starting point when users create a node of this type

// Access input data
const items = $input.all();

// Process each item
const results = items.map(item => {
  // Transform the item
  return {
    ...item.json,
    processed: true,
    timestamp: new Date().toISOString()
  };
});

// Return the processed data
return results;`,
    typescript: `// Node code template (TypeScript)
// This code will be used as a starting point when users create a node of this type

interface InputItem {
  id: string;
  [key: string]: any;
}

interface OutputItem extends InputItem {
  processed: boolean;
  timestamp: string;
}

// Access input data
const items = $input.all();

// Process each item
const results = items.map(item => {
  // Transform the item
  const result: OutputItem = {
    ...item.json,
    processed: true,
    timestamp: new Date().toISOString()
  };
  return result;
});

// Return the processed data
return results;`,
    python: `# Node code template (Python)
# This code will be used as a starting point when users create a node of this type

# Access input data
items = $input.all()

# Process each item
results = []
for item in items:
    # Transform the item
    processed_item = item.json.copy()
    processed_item['processed'] = True
    processed_item['timestamp'] = datetime.now().isoformat()
    results.append(processed_item)

# Return the processed data
return results`,
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    // If the code is empty or matches one of the templates, update it
    if (!value || Object.values(templates).includes(value)) {
      onChange(templates[newLanguage as keyof typeof templates] || "")
    }
  }

  const handleReset = () => {
    onChange(templates[language as keyof typeof templates] || "")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Code Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset to Default
            </Button>
          </div>
        </div>

        <CodeEditor
          value={value}
          onChange={onChange}
          language={language}
          fontSize={fontSize}
          height="400px"
          isChanged={false}
          onCopy={() => {}}
          onFormat={() => {}}
        />

        <p className="text-sm text-muted-foreground">
          This code template will be used as a starting point when users create a node of this type. It should include
          the basic structure and examples of how to use the node's inputs and outputs.
        </p>
      </CardContent>
    </Card>
  )
}
