"use client"

import { useState } from "react"
import { Check, Code, FileText, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export type InsertFormat = "reference" | "snippet" | "markdown" | "jsx"

interface InsertFormatSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (format: InsertFormat) => void
  componentName: string
}

export default function InsertFormatSelector({
  open,
  onOpenChange,
  onSelect,
  componentName,
}: InsertFormatSelectorProps) {
  const [selectedFormat, setSelectedFormat] = useState<InsertFormat>("reference")

  const handleSelect = () => {
    onSelect(selectedFormat)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inserir Referência ao Componente</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Escolha como deseja inserir a referência ao componente <strong>{componentName}</strong> no chat:
          </p>

          <RadioGroup
            value={selectedFormat}
            onValueChange={(value) => setSelectedFormat(value as InsertFormat)}
            className="space-y-3"
          >
            <div className="flex items-start space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <RadioGroupItem value="reference" id="reference" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="reference" className="font-medium">
                  <MessageSquare className="h-4 w-4 inline-block mr-2 text-primary" />
                  Componente Interativo
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Insere um componente de referência interativo com detalhes e opções.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <RadioGroupItem value="snippet" id="snippet" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="snippet" className="font-medium">
                  <Code className="h-4 w-4 inline-block mr-2 text-primary" />
                  Snippet de Código
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Insere um snippet de código JSX com as props básicas do componente.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <RadioGroupItem value="markdown" id="markdown" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="markdown" className="font-medium">
                  <FileText className="h-4 w-4 inline-block mr-2 text-primary" />
                  Markdown
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Insere uma referência formatada em Markdown com link para documentação.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <RadioGroupItem value="jsx" id="jsx" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="jsx" className="font-medium">
                  <Check className="h-4 w-4 inline-block mr-2 text-primary" />
                  Simples
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Insere apenas o nome do componente em formato JSX: {`<${componentName} />`}
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSelect}>Inserir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
