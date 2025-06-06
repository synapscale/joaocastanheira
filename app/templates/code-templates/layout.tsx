"use client"

import { CodeTemplateProvider } from "@/context/code-template-context"
import { TemplateProvider } from "@/context/template-context"

export default function CodeTemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TemplateProvider>
      <CodeTemplateProvider>
        {children}
      </CodeTemplateProvider>
    </TemplateProvider>
  )
}
