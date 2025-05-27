"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { SkillLibrary } from "@/components/skills/skill-library"

export default function SkillsPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Skills</h1>
          <p className="text-muted-foreground">Gerencie suas skills personalizadas</p>
        </div>
        <Button onClick={() => router.push("/skills/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Skill
        </Button>
      </div>

      <SkillLibrary />
    </div>
  )
}
