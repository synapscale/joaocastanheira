"use client"

import { EnhancedSkillEditorV2 } from "@/components/skills/enhanced-skill-editor-v2"
import { useRouter } from "next/navigation"
import { E2ETestRunner } from "@/components/debug/e2e-test-runner"

export default function CreateSkillPage() {
  const router = useRouter()

  const handleSave = (skillId: string) => {
    router.push(`/skills/${skillId}`)
  }

  const handleCancel = () => {
    router.push("/skills")
  }

  return (
    <div className="container mx-auto py-6">
      <EnhancedSkillEditorV2 onSave={handleSave} onCancel={handleCancel} />
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">🧪 Testes de Desenvolvimento</h2>
          <E2ETestRunner />
        </div>
      )}
    </div>
  )
}
