"use client"

import { MarketplaceProvider } from "@/context/marketplace-context"

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MarketplaceProvider>
      {children}
    </MarketplaceProvider>
  )
}
