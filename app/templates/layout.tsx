"use client"

import { CodeTemplateProvider } from "@/context/code-template-context"

export default function CodeTemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CodeTemplateProvider>
      {children}
    </CodeTemplateProvider>
  )
}
