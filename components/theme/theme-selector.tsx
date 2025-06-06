"use client"

import React from 'react'
import { useTheme } from './theme-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Paintbrush, Moon, Sun, Monitor, Check, RotateCcw } from 'lucide-react'

interface ThemeSelectorProps {
  triggerClassName?: string
}

export function ThemeSelector({ triggerClassName = '' }: ThemeSelectorProps) {
  const { theme, setTheme, customColors, setCustomColors, resetCustomColors } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)
  const [localColors, setLocalColors] = React.useState(customColors)
  
  // Atualizar cores locais quando as cores globais mudarem
  React.useEffect(() => {
    setLocalColors(customColors)
  }, [customColors])
  
  // Aplicar cores locais ao sistema de temas
  const applyColors = () => {
    setCustomColors(localColors)
    setIsOpen(false)
  }
  
  // Resetar cores para os valores padrão
  const handleReset = () => {
    resetCustomColors()
    setLocalColors(customColors)
  }
  
  // Atualizar uma cor específica
  const updateColor = (key: string, value: string) => {
    setLocalColors(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={triggerClassName}
      >
        <Paintbrush className="h-5 w-5" />
        <span className="sr-only">Personalizar tema</span>
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Personalizar tema</DialogTitle>
            <DialogDescription>
              Escolha um tema ou personalize as cores da interface.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="theme">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="theme">Tema</TabsTrigger>
              <TabsTrigger value="colors">Cores</TabsTrigger>
            </TabsList>
            
            <TabsContent value="theme" className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center gap-2 h-24"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-6 w-6" />
                  <span>Claro</span>
                  {theme === 'light' && <Check className="absolute top-2 right-2 h-4 w-4" />}
                </Button>
                
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center gap-2 h-24"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-6 w-6" />
                  <span>Escuro</span>
                  {theme === 'dark' && <Check className="absolute top-2 right-2 h-4 w-4" />}
                </Button>
                
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center gap-2 h-24"
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-6 w-6" />
                  <span>Sistema</span>
                  {theme === 'system' && <Check className="absolute top-2 right-2 h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="primary-color">Cor primária</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-8 w-8 rounded-full border"
                      style={{ backgroundColor: localColors.primary }}
                    />
                    <Input
                      id="primary-color"
                      type="text"
                      value={localColors.primary}
                      onChange={(e) => updateColor('primary', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="accent-color">Cor de destaque</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-8 w-8 rounded-full border"
                      style={{ backgroundColor: localColors.accent }}
                    />
                    <Input
                      id="accent-color"
                      type="text"
                      value={localColors.accent}
                      onChange={(e) => updateColor('accent', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="background-color">Cor de fundo</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-8 w-8 rounded-full border"
                      style={{ backgroundColor: localColors.background }}
                    />
                    <Input
                      id="background-color"
                      type="text"
                      value={localColors.background}
                      onChange={(e) => updateColor('background', e.target.value)}
                    />
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="mt-2"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar padrão
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={applyColors}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ThemeSelector
