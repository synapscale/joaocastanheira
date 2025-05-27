"use client"

import { X, Download, Star, User, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MarketplaceRightSidebarProps {
  selectedItem: any
  onClose: () => void
}

export function MarketplaceRightSidebar({ selectedItem, onClose }: MarketplaceRightSidebarProps) {
  if (!selectedItem) return null

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Detalhes do Item</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Item Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedItem.icon && <selectedItem.icon className="h-5 w-5" />}
                {selectedItem.name || selectedItem.title}
              </CardTitle>
              <CardDescription>{selectedItem.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rating */}
              {selectedItem.rating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{selectedItem.rating}</span>
                  <span className="text-muted-foreground">({selectedItem.reviews || 0} avaliações)</span>
                </div>
              )}

              {/* Author */}
              {selectedItem.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedItem.author}</span>
                </div>
              )}

              {/* Date */}
              {selectedItem.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedItem.createdAt}</span>
                </div>
              )}

              {/* Tags */}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Instalar
              </Button>
              <Button variant="outline" className="w-full">
                Visualizar Código
              </Button>
              <Button variant="outline" className="w-full">
                Documentação
              </Button>
            </CardContent>
          </Card>

          {/* Additional Info */}
          {selectedItem.longDescription && (
            <Card>
              <CardHeader>
                <CardTitle>Descrição Detalhada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{selectedItem.longDescription}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
