"use client"

import { TemplateProvider } from "@/context/template-context"
import { MarketplaceProvider } from "@/context/marketplace-context"

export default function MarketplaceCategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TemplateProvider>
      <MarketplaceProvider>
        {children}
      </MarketplaceProvider>
    </TemplateProvider>
  )
}
