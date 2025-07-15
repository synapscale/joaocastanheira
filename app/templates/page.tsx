"use client"

import { TemplateBrowser } from "@/components/templates/template-browser"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function TemplatesPage() {
  return (
    <ProtectedRoute>
      <TemplateBrowser />
    </ProtectedRoute>
  )
}
