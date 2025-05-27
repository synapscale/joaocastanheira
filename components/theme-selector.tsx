"use client"
/**
 * Sistema de Temas Personalizáveis
 * 
 * Este componente implementa um sistema avançado de temas que permite
 * aos usuários personalizar cores, contrastes e estilos da interface.
 */

import { useState, useCallback, useEffect } from "react"
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Check, 
  Sliders, 
  Save,
  Trash,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppContext } from "@/contexts/app-context"
import { showNotification } from "@/components/ui/notification"

// Tipos de tema
export type ThemeMode = "light" | "dark" | "system"

// Interface para um tema personalizado
export interface CustomTheme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    card: string
    border: string
    muted: string
  }
  fontScale: number
  borderRadius: number
  spacing: number
  isDark: boolean
  createdAt: number
  updatedAt: number
}

// Temas predefinidos
const PRESET_THEMES: CustomTheme[] = [
  {
    id: "default-light",
    name: "Padrão Claro",
    colors: {
      primary: "#0284c7",
      secondary: "#7c3aed",
      accent: "#f59e0b",
      background: "#ffffff",
      foreground: "#020617",
      card: "#f8fafc",
      border: "#e2e8f0",
      muted: "#f1f5f9",
    },
    fontScale: 1,
    borderRadius: 0.5,
    spacing: 1,
    isDark: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "default-dark",
    name: "Padrão Escuro",
    colors: {
      primary: "#0ea5e9",
      secondary: "#8b5cf6",
      accent: "#fbbf24",
      background: "#020617",
      foreground: "#f8fafc",
      card: "#0f172a",
      border: "#1e293b",
      muted: "#1e293b",
    },
    fontScale: 1,
    borderRadius: 0.5,
    spacing: 1,
    isDark: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "forest",
    name: "Floresta",
    colors: {
      primary: "#059669",
      secondary: "#0d9488",
      accent: "#ca8a04",
      background: "#f0fdf4",
      foreground: "#14532d",
      card: "#ecfdf5",
      border: "#d1fae5",
      muted: "#dcfce7",
    },
    fontScale: 1,
    borderRadius: 0.75,
    spacing: 1,
    isDark: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "forest-dark",
    name: "Floresta Escura",
    colors: {
      primary: "#10b981",
      secondary: "#14b8a6",
      accent: "#eab308",
      background: "#052e16",
      foreground: "#ecfdf5",
      card: "#064e3b",
      border: "#065f46",
      muted: "#065f46",
    },
    fontScale: 1,
    borderRadius: 0.75,
    spacing: 1,
    isDark: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "sunset",
    name: "Pôr do Sol",
    colors: {
      primary: "#db2777",
      secondary: "#e11d48",
      accent: "#ea580c",
      background: "#fff1f2",
      foreground: "#881337",
      card: "#ffe4e6",
      border: "#fecdd3",
      muted: "#fce7f3",
    },
    fontScale: 1,
    borderRadius: 1,
    spacing: 1.1,
    isDark: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "sunset-dark",
    name: "Pôr do Sol Escuro",
    colors: {
      primary: "#ec4899",
      secondary: "#f43f5e",
      accent: "#f97316",
      background: "#4c0519",
      foreground: "#fce7f3",
      card: "#831843",
      border: "#9d174d",
      muted: "#9d174d",
    },
    fontScale: 1,
    borderRadius: 1,
    spacing: 1.1,
    isDark: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

interface ThemeSelectorProps {
  onThemeChange?: (theme: ThemeMode) => void
}

/**
 * Componente de seletor de tema
 */
export default function ThemeSelector({
  onThemeChange,
}: ThemeSelectorProps) {
  // Contexto da aplicação
  const { theme, setTheme } = useAppContext()
  
  // Estados
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([])
  const [activeCustomTheme, setActiveCustomTheme] = useState<string | null>(null)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [currentCustomization, setCurrentCustomization] = useState<CustomTheme | null>(null)
  const [newThemeName, setNewThemeName] = useState("")
  
  // Efeito para carregar temas personalizados do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // Carrega temas personalizados
    const savedThemes = localStorage.getItem("custom-themes")
    if (savedThemes) {
      try {
        setCustomThemes(JSON.parse(savedThemes))
      } catch (error) {
        console.error("Erro ao carregar temas personalizados:", error)
      }
    }
    
    // Carrega tema ativo
    const activeTheme = localStorage.getItem("active-custom-theme")
    if (activeTheme) {
      setActiveCustomTheme(activeTheme)
    }
  }, [])
  
  // Efeito para aplicar o tema personalizado ativo
  useEffect(() => {
    if (!activeCustomTheme) return
    
    const activeTheme = [...PRESET_THEMES, ...customThemes].find(t => t.id === activeCustomTheme)
    if (!activeTheme) return
    
    // Aplica as variáveis CSS do tema
    applyThemeToDOM(activeTheme)
    
    // Atualiza o modo claro/escuro
    setTheme(activeTheme.isDark ? "dark" : "light")
  }, [activeCustomTheme, customThemes, setTheme])
  
  /**
   * Aplica um tema ao DOM através de variáveis CSS
   */
  const applyThemeToDOM = useCallback((theme: CustomTheme) => {
    const root = document.documentElement
    
    // Cores
    root.style.setProperty("--primary", theme.colors.primary)
    root.style.setProperty("--primary-foreground", getContrastColor(theme.colors.primary))
    
    root.style.setProperty("--secondary", theme.colors.secondary)
    root.style.setProperty("--secondary-foreground", getContrastColor(theme.colors.secondary))
    
    root.style.setProperty("--accent", theme.colors.accent)
    root.style.setProperty("--accent-foreground", getContrastColor(theme.colors.accent))
    
    root.style.setProperty("--background", theme.colors.background)
    root.style.setProperty("--foreground", theme.colors.foreground)
    
    root.style.setProperty("--card", theme.colors.card)
    root.style.setProperty("--card-foreground", theme.colors.foreground)
    
    root.style.setProperty("--border", theme.colors.border)
    root.style.setProperty("--muted", theme.colors.muted)
    root.style.setProperty("--muted-foreground", adjustOpacity(theme.colors.foreground, 0.6))
    
    // Escala de fonte
    root.style.setProperty("--font-scale", theme.fontScale.toString())
    
    // Raio de borda
    root.style.setProperty("--radius", `${theme.borderRadius * 0.5}rem`)
    
    // Espaçamento
    root.style.setProperty("--spacing-scale", theme.spacing.toString())
  }, [])
  
  /**
   * Obtém uma cor de contraste para garantir legibilidade
   */
  const getContrastColor = (color: string): string => {
    // Converte hex para RGB
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    
    // Calcula luminância
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Retorna branco ou preto com base na luminância
    return luminance > 0.5 ? "#000000" : "#ffffff"
  }
  
  /**
   * Ajusta a opacidade de uma cor
   */
  const adjustOpacity = (color: string, opacity: number): string => {
    // Converte hex para RGB
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    
    // Retorna cor com opacidade
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  
  /**
   * Manipula a mudança de tema
   */
  const handleThemeChange = useCallback(
    (newTheme: ThemeMode) => {
      setTheme(newTheme)
      setActiveCustomTheme(null)
      localStorage.removeItem("active-custom-theme")
      
      if (onThemeChange) {
        onThemeChange(newTheme)
      }
    },
    [setTheme, onThemeChange]
  )
  
  /**
   * Manipula a seleção de um tema personalizado
   */
  const handleSelectCustomTheme = useCallback((themeId: string) => {
    setActiveCustomTheme(themeId)
    localStorage.setItem("active-custom-theme", themeId)
  }, [])
  
  /**
   * Inicia a personalização de um tema
   */
  const startCustomizing = useCallback((baseTheme?: CustomTheme) => {
    const base = baseTheme || (theme === "dark" ? PRESET_THEMES[1] : PRESET_THEMES[0])
    
    setCurrentCustomization({
      ...base,
      id: `custom-${Date.now()}`,
      name: "Meu Tema Personalizado",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    setNewThemeName("Meu Tema Personalizado")
    setIsCustomizing(true)
  }, [theme])
  
  /**
   * Salva um tema personalizado
   */
  const saveCustomTheme = useCallback(() => {
    if (!currentCustomization) return
    
    // Atualiza o nome e timestamp
    const themeToSave = {
      ...currentCustomization,
      name: newThemeName || "Tema Personalizado",
      updatedAt: Date.now(),
    }
    
    // Adiciona à lista de temas
    setCustomThemes(prev => {
      const updated = [...prev.filter(t => t.id !== themeToSave.id), themeToSave]
      
      // Salva no localStorage
      localStorage.setItem("custom-themes", JSON.stringify(updated))
      
      return updated
    })
    
    // Ativa o tema
    setActiveCustomTheme(themeToSave.id)
    localStorage.setItem("active-custom-theme", themeToSave.id)
    
    // Fecha o editor
    setIsCustomizing(false)
    setCurrentCustomization(null)
    
    // Notifica o usuário
    showNotification({
      type: "success",
      message: "Tema personalizado salvo com sucesso!",
    })
  }, [currentCustomization, newThemeName])
  
  /**
   * Exclui um tema personalizado
   */
  const deleteCustomTheme = useCallback((themeId: string) => {
    setCustomThemes(prev => {
      const updated = prev.filter(t => t.id !== themeId)
      
      // Salva no localStorage
      localStorage.setItem("custom-themes", JSON.stringify(updated))
      
      return updated
    })
    
    // Se o tema excluído estiver ativo, volta para o tema padrão
    if (activeCustomTheme === themeId) {
      setActiveCustomTheme(null)
      localStorage.removeItem("active-custom-theme")
      setTheme(theme)
    }
    
    // Notifica o usuário
    showNotification({
      type: "success",
      message: "Tema personalizado excluído com sucesso!",
    })
  }, [activeCustomTheme, setTheme, theme])
  
  /**
   * Atualiza uma propriedade do tema em personalização
   */
  const updateCustomization = useCallback(<K extends keyof CustomTheme>(
    key: K,
    value: CustomTheme[K]
  ) => {
    setCurrentCustomization(prev => {
      if (!prev) return null
      
      const updated = { ...prev, [key]: value }
      
      // Aplica as mudanças em tempo real
      applyThemeToDOM(updated)
      
      return updated
    })
  }, [applyThemeToDOM])
  
  /**
   * Atualiza uma cor do tema em personalização
   */
  const updateCustomizationColor = useCallback((
    colorKey: keyof CustomTheme["colors"],
    value: string
  ) => {
    setCurrentCustomization(prev => {
      if (!prev) return null
      
      const updated = {
        ...prev,
        colors: {
          ...prev.colors,
          [colorKey]: value,
        },
      }
      
      // Aplica as mudanças em tempo real
      applyThemeToDOM(updated)
      
      return updated
    })
  }, [applyThemeToDOM])
  
  /**
   * Renderiza o editor de tema personalizado
   */
  const renderThemeEditor = () => {
    if (!currentCustomization) return null
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Personalizar Tema</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCustomizing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="theme-name">Nome do tema</Label>
            <Input
              id="theme-name"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="mb-2 block">Modo</Label>
            <div className="flex gap-2">
              <Button
                variant={currentCustomization.isDark ? "outline" : "default"}
                size="sm"
                className="flex-1"
                onClick={() => updateCustomization("isDark", false)}
              >
                <Sun className="h-4 w-4 mr-2" />
                Claro
              </Button>
              <Button
                variant={currentCustomization.isDark ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => updateCustomization("isDark", true)}
              >
                <Moon className="h-4 w-4 mr-2" />
                Escuro
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block">Cores</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="primary-color" className="text-xs">Primária</Label>
                <div className="flex mt-1">
                  <div
                    className="w-8 h-8 rounded-l-md border-y border-l"
                    style={{ backgroundColor: currentCustomization.colors.primary }}
                  />
                  <Input
                    id="primary-color"
                    type="text"
                    value={currentCustomization.colors.primary}
                    onChange={(e) => updateCustomizationColor("primary", e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondary-color" className="text-xs">Secundária</Label>
                <div className="flex mt-1">
                  <div
                    className="w-8 h-8 rounded-l-md border-y border-l"
                    style={{ backgroundColor: currentCustomization.colors.secondary }}
                  />
                  <Input
                    id="secondary-color"
                    type="text"
                    value={currentCustomization.colors.secondary}
                    onChange={(e) => updateCustomizationColor("secondary", e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="accent-color" className="text-xs">Destaque</Label>
                <div className="flex mt-1">
                  <div
                    className="w-8 h-8 rounded-l-md border-y border-l"
                    style={{ backgroundColor: currentCustomization.colors.accent }}
                  />
                  <Input
                    id="accent-color"
                    type="text"
                    value={currentCustomization.colors.accent}
                    onChange={(e) => updateCustomizationColor("accent", e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="background-color" className="text-xs">Fundo</Label>
                <div className="flex mt-1">
                  <div
                    className="w-8 h-8 rounded-l-md border-y border-l"
                    style={{ backgroundColor: currentCustomization.colors.background }}
                  />
                  <Input
                    id="background-color"
                    type="text"
                    value={currentCustomization.colors.background}
                    onChange={(e) => updateCustomizationColor("background", e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block">Tipografia</Label>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="font-scale" className="text-xs">Escala de fonte</Label>
                  <span className="text-xs">{currentCustomization.fontScale.toFixed(1)}x</span>
                </div>
                <Slider
                  id="font-scale"
                  min={0.8}
                  max={1.2}
                  step={0.1}
                  value={[currentCustomization.fontScale]}
                  onValueChange={(value) => updateCustomization("fontScale", value[0])}
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block">Estilo</Label>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="border-radius" className="text-xs">Raio de borda</Label>
                  <span className="text-xs">{currentCustomization.borderRadius.toFixed(1)}</span>
                </div>
                <Slider
                  id="border-radius"
                  min={0}
                  max={2}
                  step={0.25}
                  value={[currentCustomization.borderRadius]}
                  onValueChange={(value) => updateCustomization("borderRadius", value[0])}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="spacing" className="text-xs">Espaçamento</Label>
                  <span className="text-xs">{currentCustomization.spacing.toFixed(1)}x</span>
                </div>
                <Slider
                  id="spacing"
                  min={0.8}
                  max={1.5}
                  step={0.1}
                  value={[currentCustomization.spacing]}
                  onValueChange={(value) => updateCustomization("spacing", value[0])}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustomizing(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={saveCustomTheme}
              className="gap-1"
            >
              <Save className="h-4 w-4" />
              Salvar tema
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <Popover open={isCustomizing} onOpenChange={setIsCustomizing}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            {theme === "dark" ? (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : theme === "light" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Monitor className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Tema</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleThemeChange("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Claro</span>
              {theme === "light" && !activeCustomTheme && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Escuro</span>
              {theme === "dark" && !activeCustomTheme && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              <span>Sistema</span>
              {theme === "system" && !activeCustomTheme && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Temas predefinidos</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            {PRESET_THEMES.map((presetTheme) => (
              <DropdownMenuItem
                key={presetTheme.id}
                onClick={() => handleSelectCustomTheme(presetTheme.id)}
              >
                <div
                  className="mr-2 h-4 w-4 rounded-full"
                  style={{ backgroundColor: presetTheme.colors.primary }}
                />
                <span>{presetTheme.name}</span>
                {activeCustomTheme === presetTheme.id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          
          {customThemes.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Meus temas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                {customThemes.map((customTheme) => (
                  <DropdownMenuItem
                    key={customTheme.id}
                    className="flex items-center justify-between"
                  >
                    <div
                      className="flex items-center"
                      onClick={() => handleSelectCustomTheme(customTheme.id)}
                    >
                      <div
                        className="mr-2 h-4 w-4 rounded-full"
                        style={{ backgroundColor: customTheme.colors.primary }}
                      />
                      <span>{customTheme.name}</span>
                      {activeCustomTheme === customTheme.id && (
                        <Check className="ml-2 h-4 w-4" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteCustomTheme(customTheme.id)
                      }}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => startCustomizing()}>
            <Palette className="mr-2 h-4 w-4" />
            <span>Personalizar tema</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => {
              // Reseta todos os temas personalizados
              setCustomThemes([])
              localStorage.removeItem("custom-themes")
              setActiveCustomTheme(null)
              localStorage.removeItem("active-custom-theme")
              handleThemeChange(theme)
              
              // Remove variáveis CSS personalizadas
              const root = document.documentElement
              root.removeAttribute("style")
              
              // Notifica o usuário
              showNotification({
                type: "success",
                message: "Temas personalizados resetados com sucesso!",
              })
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Resetar temas</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <PopoverContent className="w-80" align="end">
        {renderThemeEditor()}
      </PopoverContent>
    </Popover>
  )
}
