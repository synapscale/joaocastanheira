"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MarketplaceService } from "@/services/marketplace-service"
import type { PublishRequest, ImportHistory } from "@/types/marketplace-types"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Clock, MoreHorizontal, FileUp, FileDown, CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react"

/**
 * UserMarketplaceItems Component
 *
 * Manages and displays user's marketplace items including published skills/nodes
 * and import history. Provides functionality to export, view, and manage items.
 *
 * Features:
 * - Tabbed interface for published items and import history
 * - Export functionality for items
 * - Status badges for different item states
 * - Loading states and error handling
 * - Responsive grid layout
 */
export function UserMarketplaceItems() {
  // Router and toast for navigation and notifications
  const router = useRouter()
  const { toast } = useToast()

  // Component state management
  const [activeTab, setActiveTab] = useState<"published" | "imported">("published")
  const [isLoading, setIsLoading] = useState(true)
  const [publishHistory, setPublishHistory] = useState<PublishRequest[]>([])
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([])

  /**
   * Loads user's marketplace history (published and imported items)
   * Handles loading states and error scenarios
   */
  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const [publishData, importData] = await Promise.all([
        MarketplaceService.getUserPublishHistory(),
        MarketplaceService.getUserImportHistory(),
      ])
      setPublishHistory(publishData)
      setImportHistory(importData)
    } catch (error) {
      console.error("Error loading marketplace history:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Load history on component mount
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  /**
   * Exports an item as JSON file for download
   * @param itemType - Type of item (skill or node)
   * @param itemId - Unique identifier of the item
   */
  const handleExportItem = useCallback(
    async (itemType: "skill" | "node", itemId: string) => {
      try {
        const jsonData = await MarketplaceService.exportItem(itemType, itemId)

        // Create downloadable blob and trigger download
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
      }
    },
    [toast],
  )

  /**
   * Renders status badge for published items
   * @param status - Current status of the published item
   */
  const renderPublishStatus = useMemo(
    () => (status: string) => {
      const statusConfig = {
        published: { variant: "success" as const, icon: CheckCircle, label: "Publicado" },
        pending: { variant: "outline" as const, icon: Clock, label: "Pendente" },
        rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejeitado" },
        draft: { variant: "secondary" as const, icon: FileDown, label: "Rascunho" },
      }

      const config = statusConfig[status as keyof typeof statusConfig] || {
        variant: "outline" as const,
        icon: Clock,
        label: status,
      }

      const IconComponent = config.icon

      return (
        <Badge variant={config.variant} className="flex items-center gap-1">
          <IconComponent className="w-3 h-3" />
          {config.label}
        </Badge>
      )
    },
    [],
  )

  /**
   * Renders status badge for imported items
   * @param status - Current status of the imported item
   */
  const renderImportStatus = useMemo(
    () => (status: string) => {
      const statusConfig = {
        success: { variant: "success" as const, icon: CheckCircle, label: "Sucesso" },
        failed: { variant: "destructive" as const, icon: XCircle, label: "Falha" },
      }

      const config = statusConfig[status as keyof typeof statusConfig] || {
        variant: "outline" as const,
        icon: Clock,
        label: status,
      }

      const IconComponent = config.icon

      return (
        <Badge variant={config.variant} className="flex items-center gap-1">
          <IconComponent className="w-3 h-3" />
          {config.label}
        </Badge>
      )
    },
    [],
  )

  /**
   * Renders loading skeleton cards
   */
  const renderLoadingSkeletons = useMemo(() => {
    return Array.from({ length: 3 }).map((_, index) => (
      <Card key={`skeleton-${index}`}>
        <CardHeader className="p-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mt-1" />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </CardFooter>
      </Card>
    ))
  }, [])

  /**
   * Renders empty state for published items
   */
  const renderPublishedEmptyState = useMemo(
    () => (
      <div className="text-center py-12">
        <FileUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma publicação encontrada</h3>
        <p className="text-muted-foreground mb-4">Você ainda não publicou nenhum item no marketplace.</p>
        <Button onClick={() => router.push("/skills")}>Ir para Biblioteca de Skills</Button>
      </div>
    ),
    [router],
  )

  /**
   * Renders empty state for imported items
   */
  const renderImportedEmptyState = useMemo(
    () => (
      <div className="text-center py-12">
        <FileDown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma importação encontrada</h3>
        <p className="text-muted-foreground mb-4">Você ainda não importou nenhum item do marketplace.</p>
        <Button onClick={() => router.push("/marketplace")}>Explorar Marketplace</Button>
      </div>
    ),
    [router],
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="border-b px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Meus Itens do Marketplace</h2>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={loadHistory}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs
          defaultValue="published"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "published" | "imported")}
        >
          <TabsList className="w-full">
            <TabsTrigger value="published" className="flex-1">
              Publicações
            </TabsTrigger>
            <TabsTrigger value="imported" className="flex-1">
              Importações
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-4 overflow-auto">
        <Tabs value={activeTab}>
          {/* Published Items Tab */}
          <TabsContent value="published" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{renderLoadingSkeletons}</div>
            ) : publishHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishHistory.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {item.itemType === "skill" ? "Skill" : "Node"}: {item.itemId}
                          </CardTitle>
                          <CardDescription>
                            Versão {item.version} • {item.isUpdate ? "Atualização" : "Nova publicação"}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Mais opções</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.status === "published" && (
                              <DropdownMenuItem>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver no Marketplace
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleExportItem(item.itemType, item.itemId)}>
                              <FileDown className="w-4 h-4 mr-2" />
                              Exportar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Status:</span>
                        {renderPublishStatus(item.status)}
                      </div>
                      {item.reviewNotes && (
                        <div className="mt-2 p-2 bg-muted rounded-md text-xs">
                          <p className="font-medium">Notas de revisão:</p>
                          <p>{item.reviewNotes}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>Enviado em {new Date(item.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              renderPublishedEmptyState
            )}
          </TabsContent>

          {/* Imported Items Tab */}
          <TabsContent value="imported" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{renderLoadingSkeletons}</div>
            ) : importHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {importHistory.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {item.itemType === "skill" ? "Skill" : "Node"}: {item.itemId}
                          </CardTitle>
                          <CardDescription>Versão {item.version}</CardDescription>
                        </div>
                        {item.status === "success" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Mais opções</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/skills?id=${item.localItemId}`)}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver na Biblioteca
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Status:</span>
                        {renderImportStatus(item.status)}
                      </div>
                      {item.errorMessage && (
                        <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md text-xs">
                          <p className="font-medium">Erro:</p>
                          <p>{item.errorMessage}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>Importado em {new Date(item.importedAt).toLocaleDateString()}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              renderImportedEmptyState
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
