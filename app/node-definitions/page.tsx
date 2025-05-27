import { NodeTemplateList } from "@/components/node-creator/node-template-list"

export default function NodeDefinitionsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Templates de Nós</h1>
      <NodeTemplateList />
    </div>
  )
}
