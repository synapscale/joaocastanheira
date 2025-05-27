"use client"

import { useState } from "react"
import { X, HelpCircle, MousePointer2, KeyboardIcon as KeyboardKey } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function ComponentSelectorHelp() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 left-16 z-50 p-3 rounded-full shadow-lg bg-white dark:bg-gray-800 text-primary dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Seletor de Componentes</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-full"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-gray-700 dark:text-gray-300">
            O seletor de componentes permite que você identifique e referencie componentes específicos da interface para
            otimização.
          </p>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Como usar:</h3>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="mt-0.5">
                <MousePointer2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Ativar o modo de seleção</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clique no botão flutuante no canto inferior esquerdo ou pressione{" "}
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl</kbd> +{" "}
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Shift</kbd> +{" "}
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">C</kbd>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="mt-0.5">
                <MousePointer2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Selecionar um componente</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Passe o mouse sobre os elementos da interface. Eles serão destacados com uma borda tracejada.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="mt-0.5">
                <MousePointer2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Obter informações do componente</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clique com o botão direito no componente desejado para abrir o menu de contexto.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="mt-0.5">
                <KeyboardKey className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Cancelar a seleção</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pressione <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> para
                  cancelar o modo de seleção.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dica: Use esta ferramenta para referenciar componentes específicos ao solicitar otimizações ou
              modificações.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
