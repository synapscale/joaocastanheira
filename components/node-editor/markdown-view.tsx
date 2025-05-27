"use client"

import { memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface MarkdownViewProps {
  data: any
  emptyMessage?: string
}

/**
 * MarkdownView component for rendering markdown content
 */
function MarkdownViewComponent({ data, emptyMessage = "No markdown content to display" }: MarkdownViewProps) {
  // If data is not a string, try to convert it
  const markdownContent =
    typeof data === "string"
      ? data
      : typeof data === "object" && data !== null
        ? JSON.stringify(data, null, 2)
        : String(data)

  if (!markdownContent) {
    return <div className="text-center p-4 text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <div className="p-4 overflow-auto max-h-[400px]">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "")
              return !inline && match ? (
                <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export const MarkdownView = memo(MarkdownViewComponent)
