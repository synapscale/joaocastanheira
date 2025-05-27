"use client"

import { AdvancedNodeComposer } from "@/components/skills/advanced-node-composer"
import { NodeComposerTestRunner } from "@/components/debug/node-composer-test-runner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ComposerPage() {
  return (
    <div className="h-screen">
      <Tabs defaultValue="composer" className="h-full">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="composer">Node Composer</TabsTrigger>
            <TabsTrigger value="tests">Testes E2E</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="composer" className="h-full mt-0">
          <AdvancedNodeComposer />
        </TabsContent>

        <TabsContent value="tests" className="p-6">
          <NodeComposerTestRunner />
        </TabsContent>
      </Tabs>
    </div>
  )
}
