"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface NodeCodeProps {
  code: string
}

export function NodeCode({ code }: NodeCodeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-10">
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <pre className="bg-muted p-4 rounded-md overflow-auto text-sm h-[400px]">
        <code>{code}</code>
      </pre>
    </div>
  )
}
