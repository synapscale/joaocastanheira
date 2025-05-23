"use client"

import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState } from "react"

export default function AttributeHelp() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setOpen(true)}
      >
        <Info className="h-4 w-4 text-blue-500" />
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Como usar atributos personalizados</DialogTitle>
          <DialogDescription>
            Atributos personalizados permitem identificar componentes de forma mais precisa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <h3 className="font-medium">Tipos de atributos</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <strong>Seletor CSS:</strong> Define quais elementos serão selecionados (ex:{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">[data-component]</code>)
              </li>
              <li>
                <strong>Extração de nome:</strong> Extrai o nome do componente do atributo especificado
              </li>
              <li>
                <strong>Extração de caminho:</strong> Extrai o caminho do componente do atributo especificado
              </li>
              <li>
                <strong>Busca de componente pai:</strong> Procura um componente pai que corresponda ao seletor
                especificado
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Exemplos de uso</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
              <p className="mb-2">
                <strong>Exemplo 1:</strong> Detectar componentes com atributo data-component
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nome: data-component</li>
                <li>Seletor: [data-component]</li>
                <li>Extração de nome: Ativada</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm mt-2">
              <p className="mb-2">
                <strong>Exemplo 2:</strong> Detectar botões do ModelSelector
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nome: model-selector</li>
                <li>Seletor: button[aria-haspopup='dialog']</li>
                <li>Busca de componente pai: Ativada</li>
                <li>Seletor do pai: .model-selector, [data-component='ModelSelector']</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Dicas</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Use prioridades mais altas (ex: 100) para atributos que devem ser verificados primeiro</li>
              <li>Combine diferentes estratégias para melhorar a detecção de componentes complexos</li>
              <li>
                Adicione atributos{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">data-component</code> aos
                seus componentes para facilitar a detecção
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
