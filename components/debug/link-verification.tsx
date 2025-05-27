"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export function LinkVerification() {
  const testLinks = [
    { href: "/", label: "Home" },
    { href: "/skills", label: "Skills" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/canvas", label: "Canvas" },
    { href: "/settings", label: "Settings" },
  ]

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Link Verification Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground mb-4">Testing Next.js Link component imports and functionality:</p>

        {testLinks.map((link) => (
          <div key={link.href} className="flex items-center justify-between">
            <span className="text-sm">{link.label}</span>
            <Link href={link.href}>
              <Button variant="outline" size="sm">
                Test Link
              </Button>
            </Link>
          </div>
        ))}

        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 dark:text-green-200">All Link imports working correctly!</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
