"use client"

import { VariableProvider } from "@/context/variable-context"

export default function VariablesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VariableProvider>
      {children}
    </VariableProvider>
  )
}
