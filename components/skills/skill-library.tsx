"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSkillsStore } from "@/stores/use-skills-store"
import type { Skill, SkillType, CustomNode } from "@/types/skill-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SkillEditor } from "./skill-editor"
import { NodeComposer } from "./node-composer"
import { MarketplaceService } from "@/services/marketplace-service"
import {
  Search,
  Plus,
  Settings,
  Code,
  Database,
  GitBranch,
  Bot,
  Globe,
  FileText,
  MoreHorizontal,
  Copy,
  Trash,
  Edit,
  Eye,
  Upload,
  Download,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

/**
 * SkillLibrary Component
 *
 * Comprehensive library interface for managing skills and custom nodes.
 * Provides filtering, searching, and CRUD operations for both skills and nodes.
 *
 * Features:
 * - Tabbed interface for skills and nodes
 * - Advanced filtering by type, tags, and search query
 * - CRUD operations (create, read, update, delete)
 * - Export/import functionality
 * - Marketplace integration
 * - Responsive grid layout
 */
export function SkillLibrary() {
  // Dependencies
  const router = useRouter()
  const { toast } = useToast()
  const { skills, customNodes, deleteSkill, deleteCustomNode } = useSkillsStore()

  // Component state
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"skills" | "nodes">("skills")
  const [selectedSkillType, setSelectedSkillType] = useState<SkillType | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Dialog states
  const [isSkillEditorOpen, setIsSkillEditorOpen] = useState(false)
  const [isNodeComposerOpen, setIsNodeComposerOpen] = useState(false)
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [viewingSkill, setViewingSkill] = useState<Skill | null>(null)
  const [viewingNode, setViewingNode] = useState<CustomNode | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "skill" | "node"; name: string } | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  /**
   * Filters skills based on current search criteria
   */
  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      // Search query filter
      const matchesQuery =
        searchQuery === "" ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase())

      // Skill type filter
      const matchesType = selectedSkillType === null || skill.type === selectedSkillType

      // Tags filter
      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => skill.metadata?.tags?.includes(tag))

      return matchesQuery && matchesType && matchesTags
    })
  }, [skills, searchQuery, selectedSkillType, selectedTags])

  /**
   * Filters custom nodes based on current search criteria
   */
  const filteredNodes = useMemo(() => {
    return customNodes.filter((node) => {
      // Search query filter
      const matchesQuery =
        searchQuery === "" ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase())

      // Tags filter
      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => node.metadata?.tags?.includes(tag))

      return matchesQuery && matchesTags
    })
  }, [customNodes, searchQuery, selectedTags])

  /**
   * Gets all unique tags from skills and nodes
   */
  const allTags = useMemo(() => {
    return Array.from(
      new Set([
        ...skills.flatMap((skill) => skill.metadata?.tags || []),
        ...customNodes.flatMap((node) => node.metadata?.tags || []),
      ]),
    )
  }, [skills, customNodes])

  /**
   * Handles item deletion with confirmation
   */
  const handleDelete = useCallback(() => {
    if (!itemToDelete) return

    if (itemToDelete.type === "skill") {
      deleteSkill(itemToDelete.id)
    } else {
      deleteCustomNode(itemToDelete.id)
    }

    setIsDeleteDialogOpen(false)
    setItemToDelete(null)

    toast({
      title: "Sucesso",
      description: `${itemToDelete.type === "skill" ? "Skill" : "Node"} excluído com sucesso.`,
    })
  }, [itemToDelete, deleteSkill, deleteCustomNode, toast])

  /**
   * Exports an item as JSON file
   * @param itemType - Type of item to export
   * @param itemId - ID of item to export
   */
  const handleExportItem = useCallback(
    async (itemType: "skill" | "node", itemId: string) => {
      setIsExporting(true)
      try {
        const jsonData = await MarketplaceService.exportItem(itemType, itemId)

        // Create and trigger download
        const blob = new Blob([jsonData], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const downloadLink = document.createElement("a")

        downloadLink.href = url
        downloadLink.download = `${itemType}-${itemId}.json`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(url)

        toast({
          title: "Sucesso",
          description: "Item exportado com sucesso!",
        })
      } catch (error) {
        console.error("Error exporting item:", error)
        toast({
          title: "Erro",
          description: "Não foi possível exportar o item.",
          variant: "destructive",
        })
      } finally {
        setIsExporting(false)
      }
    },
    [toast],
  )

  /**
   * Navigates to marketplace publish page for an item
   * @param itemType - Type of item to publish
   * @param itemId - ID of item to publish
   */
  const handlePublishItem = useCallback(
    (itemType: "skill" | "node", itemId: string) => {
      router.push(`/marketplace?publish=true&type=${itemType}&id=${itemId}`)
    },
    [router],
  )

  /**
   * Gets appropriate icon for skill type
   * @param type - Skill type
   */
  const getSkillTypeIcon = useCallback((type: SkillType) => {
    const iconMap = {
      "data-transformation": FileText,
      "data-input": Database,
      "data-output": Database,
      "control-flow": GitBranch,
      "ui-interaction": Settings,
      integration: Globe,
      ai: Bot,
      utility: Code,
      custom: Code,
    }

    const IconComponent = iconMap[type] || Code
    return <IconComponent className="w-4 h-4" />
  }, [])

  /**
   * Handles tag selection/deselection
   * @param tag - Tag to toggle
   */
  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }, [])

  /**
   * Opens skill editor for new or existing skill
   * @param skillId - ID of skill to edit (null for new)
   */
  const openSkillEditor = useCallback((skillId: string | null = null) => {
    setEditingSkillId(skillId)
    setIsSkillEditorOpen(true)
  }, [])

  /**
   * Opens node composer for new or existing node
   * @param nodeId - ID of node to edit (null for new)
   */
  const openNodeComposer = useCallback((nodeId: string | null = null) => {
    setEditingNodeId(nodeId)
    setIsNodeComposerOpen(true)
  }, [])

  /**
   * Opens view dialog for skill or node
   * @param item - Item to view
   * @param type - Type of item
   */
  const openViewDialog = useCallback((item: Skill | CustomNode, type: "skill" | "node") => {
    if (type === "skill") {
      setViewingSkill(item as Skill)
      setViewingNode(null)
    } else {
      setViewingNode(item as CustomNode)
      setViewingSkill(null)
    }
    setIsViewDialogOpen(true)
  }, [])

  /**
   * Opens delete confirmation dialog
   * @param item - Item to delete
   * @param type - Type of item
   */
  const openDeleteDialog = useCallback((item: { id: string; name: string }, type: "skill" | "node") => {
    setItemToDelete({ ...item, type })
    setIsDeleteDialogOpen(true)
  }, [])

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="border-b px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Biblioteca de Skills</h2>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/marketplace")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Marketplace
            </Button>
            <Button variant="outline" size="sm" onClick={() => openSkillEditor()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Skill
            </Button>
            <Button variant="outline" size="sm" onClick={() => openNodeComposer()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Node
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs
          defaultValue="skills"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "skills" | "nodes")}
        >
          <TabsList className="w-full">
            <TabsTrigger value="skills" className="flex-1">
              Skills
            </TabsTrigger>
            <TabsTrigger value="nodes" className="flex-1">
              Nodes
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Input */}
        <div className="mt-3 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar Filters */}
          <div className="w-48 border-r p-4 overflow-auto">
            <div className="space-y-4">
              {/* Skill Type Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Tipos de Skill</h3>
                <div className="space-y-1">
                  <Button
                    variant={selectedSkillType === null ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedSkillType(null)}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Todos
                  </Button>
                  {(["data-transformation", "data-input", "data-output", "control-flow", "ai"] as SkillType[]).map(
                    (type) => (
                      <Button
                        key={type}
                        variant={selectedSkillType === type ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedSkillType(type)}
                      >
                        {getSkillTypeIcon(type)}
                        <span className="ml-2 capitalize">{type.replace("-", " ")}</span>
                      </Button>
                    ),
                  )}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="space-y-1">
                  {allTags.length > 0 ? (
                    allTags.map((tag) => (
                      <div key={tag} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onChange={() => handleTagToggle(tag)}
                          className="h-3 w-3 rounded border-gray-300 mr-2"
                        />
                        <label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                          {tag}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground">Nenhuma tag disponível</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 overflow-auto">
            <Tabs value={activeTab}>
              {/* Skills Tab */}
              <TabsContent value="skills" className="mt-0">
                {filteredSkills.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">Nenhuma skill encontrada</p>
                    <Button variant="outline" className="mt-4" onClick={() => openSkillEditor()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Nova Skill
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSkills.map((skill) => (
                      <Card key={skill.id}>
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base flex items-center">
                                {getSkillTypeIcon(skill.type)}
                                <span className="ml-2">{skill.name}</span>
                              </CardTitle>
                              <CardDescription>v{skill.version}</CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Mais opções</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openViewDialog(skill, "skill")}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openSkillEditor(skill.id)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportItem("skill", skill.id)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Exportar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePublishItem("skill", skill.id)}>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Publicar no Marketplace
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => openDeleteDialog(skill, "skill")}
                                >
                                  <Trash className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="py-2 text-sm">{skill.description}</CardContent>
                        <CardFooter className="text-xs text-muted-foreground py-3">
                          Atualizado em {new Date(skill.updatedAt).toLocaleDateString()}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Nodes Tab */}
              <TabsContent value="nodes" className="mt-0">
                {filteredNodes.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">Nenhum node encontrado</p>
                    <Button variant="outline" className="mt-4" onClick={() => openNodeComposer()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Novo Node
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNodes.map((node) => (
                      <Card key={node.id}>
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{node.name}</CardTitle>
                              <CardDescription>v{node.version}</CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Mais opções</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openViewDialog(node, "node")}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openNodeComposer(node.id)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportItem("node", node.id)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Exportar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePublishItem("node", node.id)}>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Publicar no Marketplace
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => openDeleteDialog(node, "node")}
                                >
                                  <Trash className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="py-2 text-sm">{node.description}</CardContent>
                        <CardFooter className="text-xs text-muted-foreground py-3">
                          Atualizado em {new Date(node.updatedAt).toLocaleDateString()}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Skill Editor Dialog */}
      {isSkillEditorOpen && (
        <Dialog open={isSkillEditorOpen} onOpenChange={setIsSkillEditorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <SkillEditor
              skillId={editingSkillId}
              onSave={() => setIsSkillEditorOpen(false)}
              onCancel={() => setIsSkillEditorOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Node Composer Dialog */}
      {isNodeComposerOpen && (
        <Dialog open={isNodeComposerOpen} onOpenChange={setIsNodeComposerOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <NodeComposer
              nodeId={editingNodeId}
              onSave={() => setIsNodeComposerOpen(false)}
              onCancel={() => setIsNodeComposerOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewingSkill ? viewingSkill.name : viewingNode?.name}</DialogTitle>
            <DialogDescription>{viewingSkill ? viewingSkill.description : viewingNode?.description}</DialogDescription>
          </DialogHeader>

          {viewingSkill && (
            <div className="space-y-2">
              <p>
                <strong>Tipo:</strong> {viewingSkill.type}
              </p>
              <p>
                <strong>Versão:</strong> {viewingSkill.version}
              </p>
              {viewingSkill.metadata?.tags && viewingSkill.metadata.tags.length > 0 && (
                <p>
                  <strong>Tags:</strong> {viewingSkill.metadata.tags.join(", ")}
                </p>
              )}
            </div>
          )}

          {viewingNode && (
            <div className="space-y-2">
              <p>
                <strong>Versão:</strong> {viewingNode.version}
              </p>
              {viewingNode.metadata?.tags && viewingNode.metadata.tags.length > 0 && (
                <p>
                  <strong>Tags:</strong> {viewingNode.metadata.tags.join(", ")}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir {itemToDelete?.type === "skill" ? "Skill" : "Node"}</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{itemToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
