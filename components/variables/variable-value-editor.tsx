"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Eye, EyeOff } from "lucide-react"
import type { VariableType } from "@/types/variable"

interface VariableValueEditorProps {
  type: VariableType
  value: any
  onChange: (value: any) => void
  encrypted?: boolean
}

export function VariableValueEditor({ type, value, onChange, encrypted = false }: VariableValueEditorProps) {
  const [showSecret, setShowSecret] = useState(false)

  switch (type) {
    case "string":
      return (
        <div className="relative">
          <Input
            type={encrypted && !showSecret ? "password" : "text"}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter string value"
          />
          {encrypted && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
        </div>
      )

    case "number":
      return (
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="Enter number value"
        />
      )

    case "boolean":
      return (
        <div className="flex items-center space-x-2">
          <Switch checked={Boolean(value)} onCheckedChange={onChange} />
          <span>{Boolean(value) ? "True" : "False"}</span>
        </div>
      )

    case "json":
    case "array":
      return (
        <Textarea
          value={typeof value === "object" ? JSON.stringify(value, null, 2) : value || ""}
          onChange={(e) => {
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(e.target.value)
              onChange(parsed)
            } catch {
              // If not valid JSON, store as string
              onChange(e.target.value)
            }
          }}
          placeholder={type === "json" ? '{ "key": "value" }' : "[1, 2, 3]"}
          className="font-mono text-sm min-h-[150px]"
        />
      )

    case "date":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(new Date(value), "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={value ? new Date(value) : undefined} onSelect={onChange} initialFocus />
          </PopoverContent>
        </Popover>
      )

    case "expression":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="() => new Date().toISOString()"
          className="font-mono text-sm min-h-[150px]"
        />
      )

    case "secret":
      return (
        <div className="relative">
          <Input
            type={showSecret ? "text" : "password"}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter secret value"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setShowSecret(!showSecret)}
          >
            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      )

    default:
      return <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Enter value" />
  }
}
