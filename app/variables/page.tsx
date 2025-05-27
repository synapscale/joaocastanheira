"use client"

import { useState } from "react"
import { useVariables } from "@/context/variable-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VariableList } from "@/components/variables/variable-list"
import { VariableDialog } from "@/components/variables/variable-dialog"
import { VariableImportExport } from "@/components/variables/variable-import-export"
import { Plus, Search, FileDown } from "lucide-react"
import type { VariableScope } from "@/types/variable"

export default function VariablesPage() {
  const { variables, getVariablesByScope } = useVariables()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<VariableScope>("global")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportExportOpen, setIsImportExportOpen] = useState(false)

  // Filter variables based on search query and active tab
  const filteredVariables = getVariablesByScope(activeTab).filter(
    (variable) =>
      variable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variable.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variable.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Variables</h1>
          <p className="text-muted-foreground">Manage variables that can be used across your workflow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportExportOpen(true)}>
            <FileDown className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Variable
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search variables..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="global" value={activeTab} onValueChange={(value) => setActiveTab(value as VariableScope)}>
        <TabsList>
          <TabsTrigger value="global">
            Global Variables
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
              {getVariablesByScope("global").length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="workflow">
            Workflow Variables
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
              {getVariablesByScope("workflow").length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="node">
            Node Variables
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{getVariablesByScope("node").length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-6">
          <VariableList
            variables={filteredVariables}
            scope="global"
            emptyState={{
              title: "No global variables",
              description: "Global variables are accessible across all workflows",
              action: <Button onClick={() => setIsCreateDialogOpen(true)}>Create Global Variable</Button>,
            }}
          />
        </TabsContent>

        <TabsContent value="workflow" className="mt-6">
          <VariableList
            variables={filteredVariables}
            scope="workflow"
            emptyState={{
              title: "No workflow variables",
              description: "Workflow variables are only accessible within the current workflow",
              action: <Button onClick={() => setIsCreateDialogOpen(true)}>Create Workflow Variable</Button>,
            }}
          />
        </TabsContent>

        <TabsContent value="node" className="mt-6">
          <VariableList
            variables={filteredVariables}
            scope="node"
            emptyState={{
              title: "No node variables",
              description: "Node variables are only accessible within specific nodes",
              action: <Button onClick={() => setIsCreateDialogOpen(true)}>Create Node Variable</Button>,
            }}
          />
        </TabsContent>
      </Tabs>

      <VariableDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} defaultScope={activeTab} />

      <VariableImportExport open={isImportExportOpen} onOpenChange={setIsImportExportOpen} />
    </div>
  )
}
