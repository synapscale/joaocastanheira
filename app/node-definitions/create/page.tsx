"use client"

import { useRouter } from "next/navigation"
import { NodeTemplateCreator } from "@/components/node-creator/node-template-creator"

export default function CreateNodeDefinitionPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6">
      <NodeTemplateCreator onCancel={() => router.push("/node-definitions")} />
    </div>
  )
}
