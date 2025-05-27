"use client"

import { useState } from "react"
import { CollectionsBrowser } from "@/components/marketplace/collections-browser"
import { UserCollections } from "@/components/marketplace/user-collections"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState("browse")

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coleções</h1>
        <p className="text-muted-foreground">Explore coleções curadas de agentes e workflows ou crie suas próprias.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Explorar</TabsTrigger>
          <TabsTrigger value="my-collections">Minhas Coleções</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <CollectionsBrowser />
        </TabsContent>

        <TabsContent value="my-collections" className="space-y-6">
          <UserCollections />
        </TabsContent>
      </Tabs>
    </div>
  )
}
