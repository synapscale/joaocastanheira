"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { VariableSelectorForEditor } from "./variable-selector"
import { CodeTemplatesLibrary } from "./code-templates-library"
import { Copy, FileText, Wand2, Terminal } from "lucide-react"

interface CodeEditorToolbarProps {
  onCopy: () => void
  onFormat: () => void
  onInsertVariable: (variableReference: string) => void
  onInsertSnippet: (snippet: string) => void
  showConsole: boolean
  toggleConsole: () => void
  language: string
}

export function CodeEditorToolbar({
  onCopy,
  onFormat,
  onInsertVariable,
  onInsertSnippet,
  showConsole,
  toggleConsole,
  language = "javascript",
}: CodeEditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 mb-2">
      <TooltipProvider>
        <div className="flex items-center gap-1 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy code</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onFormat}>
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Format code</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-1 mr-2">
          <VariableSelectorForEditor onInsert={onInsertVariable} buttonSize="sm" buttonVariant="ghost" />

          <CodeTemplatesLibrary language={language} onInsert={onInsertSnippet} buttonVariant="ghost" buttonSize="sm" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 ${showConsole ? "bg-muted" : ""}`}
                onClick={toggleConsole}
              >
                <Terminal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle console</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Wand2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI Assist</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
