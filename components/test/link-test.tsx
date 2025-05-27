"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LinkTest() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Link Test Component</h2>
      <div className="space-y-2">
        <Link href="/" className="block">
          <Button variant="outline">Home Link</Button>
        </Link>
        <Link href="/skills" className="block">
          <Button variant="outline">Skills Link</Button>
        </Link>
        <Link href="/marketplace" className="block">
          <Button variant="outline">Marketplace Link</Button>
        </Link>
      </div>
    </div>
  )
}
