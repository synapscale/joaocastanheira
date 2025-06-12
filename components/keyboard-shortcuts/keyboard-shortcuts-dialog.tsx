"use client"

import React from 'react'
import { useKeyboardShortcuts } from './keyboard-shortcuts-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Keyboard } from 'lucide-react'

interface KeyboardShortcutsDialogProps {
  triggerClassName?: string
}

export function KeyboardShortcutsDialog({ triggerClassName = '' }: KeyboardShortcutsDialogProps) {
  const { shortcuts, isShortcutsDialogOpen, setShortcutsDialogOpen } = useKeyboardShortcuts()
  
  // Agrupar atalhos por categoria
  const shortcutsByCategory = React.useMemo(() => {
    const categories: Record<string, Array<{ id: string, keys: string[], description: string }>> = {}
    
    Object.entries(shortcuts).forEach(([id, config]) => {
      const { keys, description, category } = config
      
      if (!categories[category]) {
        categories[category] = []
      }
      
      categories[category].push({ id, keys, description })
    })
    
    return categories
  }, [shortcuts])
  
  // Renderizar tecla de atalho
  const renderKey = (key: string) => {
    return (
      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
        {key}
      </kbd>
    )
  }
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShortcutsDialogOpen(true)}
        className={triggerClassName}
      >
        <Keyboard className="h-5 w-5" />
        <span className="sr-only">Atalhos de teclado</span>
      </Button>
      
      <Dialog open={isShortcutsDialogOpen} onOpenChange={setShortcutsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atalhos de teclado</DialogTitle>
            <DialogDescription>
              Lista de atalhos de teclado disponíveis no sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {Object.entries(shortcutsByCategory).length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nenhum atalho de teclado registrado.
              </div>
            ) : (
              Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-medium mb-2">{category}</h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map(({ id, keys, description }) => (
                      <div key={id} className="flex justify-between items-center">
                        <span className="text-sm">{description}</span>
                        <div className="flex gap-1">
                          {keys.map((key, index) => (
                            <React.Fragment key={index}>
                              {index > 0 && <span className="text-gray-500">+</span>}
                              {renderKey(key)}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShortcutsDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default KeyboardShortcutsDialog
