/**
 * Settings Page Component
 *
 * This page allows users to configure various aspects of the application,
 * including general settings, canvas behavior, and execution parameters.
 *
 * @returns {JSX.Element} The settings interface
 */
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do seu ambiente de workflow.</p>
      </div>
      <Separator />

      {/* Settings sections */}
      <div className="grid gap-6">
        {/* General settings card */}
        <Card>
          <CardHeader>
            <CardTitle>Geral</CardTitle>
            <CardDescription>Configurações gerais do ambiente de workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme selection */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme">Tema</Label>
                <p className="text-sm text-muted-foreground">Escolha entre tema claro e escuro.</p>
              </div>
              <select
                id="theme"
                className="w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                aria-label="Selecione o tema"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="system">Sistema</option>
              </select>
            </div>

            <Separator />

            {/* Canvas grid settings */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-grid">Mostrar grade</Label>
                <p className="text-sm text-muted-foreground">Exibir grade no canvas de workflow.</p>
              </div>
              <Switch id="show-grid" defaultChecked aria-label="Mostrar grade no canvas" />
            </div>

            {/* Grid snapping settings */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="snap-grid">Snap to grid</Label>
                <p className="text-sm text-muted-foreground">Alinhar nós automaticamente à grade.</p>
              </div>
              <Switch id="snap-grid" defaultChecked aria-label="Ativar snap to grid" />
            </div>
          </CardContent>
        </Card>

        {/* Execution settings card */}
        <Card>
          <CardHeader>
            <CardTitle>Execução</CardTitle>
            <CardDescription>Configurações de execução de workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timeout setting */}
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (segundos)</Label>
              <Input
                id="timeout"
                type="number"
                defaultValue={60}
                min={1}
                aria-label="Tempo máximo de execução em segundos"
              />
              <p className="text-xs text-muted-foreground">Tempo máximo de execução de um workflow.</p>
            </div>

            {/* Save button */}
            <div className="pt-4 flex justify-end">
              <Button aria-label="Salvar configurações">Salvar configurações</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
