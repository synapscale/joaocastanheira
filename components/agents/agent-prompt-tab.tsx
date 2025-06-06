"use client"
import { PromptEditor } from "./prompt-editor"
import { PromptToolsBar } from "./prompt-tools-bar"
import { PROMPT_TOOLS, PROMPT_TOOL_SNIPPETS } from "@/constants/agent-constants"

/**
 * Component for the prompt tab of the agent form
 */
export function AgentPromptTab({
  // Required props
  prompt,
  onChangePrompt,
  onBlurPrompt,
  onOpenTemplates,

  // Optional props with defaults
  promptError,
  minHeight = "300px",
  showToolbar = true,
  toolbarPosition = "top",
  customTools = [],

  // Accessibility props
  className,
  id,
  testId,
  ariaLabel,
}) {
  // Handle tool click
  const handleToolClick = (toolId) => {
    const snippet = PROMPT_TOOL_SNIPPETS[toolId]
    if (snippet) {
      onChangePrompt(prompt + snippet)
    } else if (customTools) {
      const customTool = customTools.find((tool) => tool.id === toolId)
      if (customTool?.snippet) {
        onChangePrompt(prompt + customTool.snippet)
      }
    }
  }

  const componentId = id || "agent-prompt-tab"
  const allTools = [...PROMPT_TOOLS, ...customTools]

  return (
    <div
      className={className}
      id={componentId}
      data-testid={testId}
      aria-label={ariaLabel || "Editor de prompt do agente"}
    >
      {/* Barra de ferramentas de prompt */}
      {showToolbar && toolbarPosition === "top" && (
        <PromptToolsBar
          tools={allTools}
          onToolClick={handleToolClick}
          id={`${componentId}-toolbar`}
          aria-label="Ferramentas de prompt"
        />
      )}

      {/* Editor de prompt */}
      <PromptEditor
        value={prompt}
        onChange={onChangePrompt}
        onBlur={onBlurPrompt}
        error={promptError}
        minHeight={minHeight}
        label="Prompt do Agente"
        required
        onSelectTemplate={onOpenTemplates}
        id={`${componentId}-editor`}
        aria-describedby={promptError ? `${componentId}-editor-error` : undefined}
      />

      {/* Barra de ferramentas de prompt (se posição for bottom) */}
      {showToolbar && toolbarPosition === "bottom" && (
        <PromptToolsBar
          tools={allTools}
          onToolClick={handleToolClick}
          className="mt-3"
          id={`${componentId}-toolbar`}
          aria-label="Ferramentas de prompt"
        />
      )}
    </div>
  )
}