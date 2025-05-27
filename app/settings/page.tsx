"use client"

import { useState } from "react"
import { SettingsSidebar } from "@/components/settings/settings-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Save, RefreshCw, Trash2, Download, Upload } from "lucide-react"
import { createResponsiveContainer } from "@/utils/responsive-utils"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      name: "João Silva",
      email: "joao@exemplo.com",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      theme: "system",
    },
    canvas: {
      autoSave: true,
      gridSnap: true,
      showMinimap: true,
      defaultZoom: 100,
      maxHistory: 50,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      workflowUpdates: true,
      marketplaceUpdates: false,
    },
    privacy: {
      profileVisibility: "public",
      shareAnalytics: true,
      allowCookies: true,
    },
  })

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl break-words">Informações Pessoais</CardTitle>
          <CardDescription className="text-sm break-words">Gerencie suas informações básicas de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 w-full max-w-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-full">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome
              </Label>
              <Input
                id="name"
                value={settings.general.name}
                onChange={(e) => updateSetting("general", "name", e.target.value)}
                className="w-full max-w-full"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={settings.general.email}
                onChange={(e) => updateSetting("general", "email", e.target.value)}
                className="w-full max-w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-full">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="language" className="text-sm font-medium">
                Idioma
              </Label>
              <Select
                value={settings.general.language}
                onValueChange={(value) => updateSetting("general", "language", value)}
              >
                <SelectTrigger className="w-full max-w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="timezone" className="text-sm font-medium">
                Fuso Horário
              </Label>
              <Select
                value={settings.general.timezone}
                onValueChange={(value) => updateSetting("general", "timezone", value)}
              >
                <SelectTrigger className="w-full max-w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl break-words">Aparência</CardTitle>
          <CardDescription className="text-sm break-words">Personalize a aparência da interface</CardDescription>
        </CardHeader>
        <CardContent className="w-full max-w-full overflow-hidden">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="theme" className="text-sm font-medium">
              Tema
            </Label>
            <Select value={settings.general.theme} onValueChange={(value) => updateSetting("general", "theme", value)}>
              <SelectTrigger className="w-full max-w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCanvasSettings = () => (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl break-words">Comportamento do Canvas</CardTitle>
          <CardDescription className="text-sm break-words">
            Configure como o canvas se comporta durante o uso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-4 w-full max-w-full">
            <div className="space-y-0.5 flex-1 min-w-0">
              <Label className="text-sm font-medium break-words">Auto-salvamento</Label>
              <p className="text-xs text-muted-foreground break-words">Salva automaticamente suas alterações</p>
            </div>
            <Switch
              checked={settings.canvas.autoSave}
              onCheckedChange={(checked) => updateSetting("canvas", "autoSave", checked)}
              className="flex-shrink-0"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4 w-full max-w-full">
            <div className="space-y-0.5 flex-1 min-w-0">
              <Label className="text-sm font-medium break-words">Snap para grade</Label>
              <p className="text-xs text-muted-foreground break-words">Alinha elementos automaticamente à grade</p>
            </div>
            <Switch
              checked={settings.canvas.gridSnap}
              onCheckedChange={(checked) => updateSetting("canvas", "gridSnap", checked)}
              className="flex-shrink-0"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4 w-full max-w-full">
            <div className="space-y-0.5 flex-1 min-w-0">
              <Label className="text-sm font-medium break-words">Mostrar minimapa</Label>
              <p className="text-xs text-muted-foreground break-words">Exibe uma visão geral do canvas</p>
            </div>
            <Switch
              checked={settings.canvas.showMinimap}
              onCheckedChange={(checked) => updateSetting("canvas", "showMinimap", checked)}
              className="flex-shrink-0"
            />
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-full">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="defaultZoom" className="text-sm font-medium">
                Zoom padrão (%)
              </Label>
              <Input
                id="defaultZoom"
                type="number"
                min="25"
                max="200"
                value={settings.canvas.defaultZoom}
                onChange={(e) => updateSetting("canvas", "defaultZoom", Number.parseInt(e.target.value))}
                className="w-full max-w-full"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="maxHistory" className="text-sm font-medium">
                Máximo de histórico
              </Label>
              <Input
                id="maxHistory"
                type="number"
                min="10"
                max="100"
                value={settings.canvas.maxHistory}
                onChange={(e) => updateSetting("canvas", "maxHistory", Number.parseInt(e.target.value))}
                className="w-full max-w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl break-words">Preferências de Notificação</CardTitle>
          <CardDescription className="text-sm break-words">Escolha como e quando receber notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-4 w-full max-w-full">
            <div className="space-y-0.5 flex-1 min-w-0">
              <Label className="text-sm font-medium break-words">Notificações por e-mail</Label>
              <p className="text-xs text-muted-foreground break-words">Receba atualizações importantes por e-mail</p>
            </div>
            <Switch
              checked={settings.notifications.emailNotifications}
              onCheckedChange={(checked) => updateSetting("notifications", "emailNotifications", checked)}
              className="flex-shrink-0"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4 w-full max-w-full">
            <div className="space-y-0.5 flex-1 min-w-0">
              <Label className="text-sm font-medium break-words">Notificações push</Label>
              <p className="text-xs text-muted-foreground break-words">Receba notificações no navegador</p>
            </div>
            <Switch
              checked={settings.notifications.pushNotifications}
              onCheckedChange={(checked) => updateSetting("notifications", "pushNotifications", checked)}
              className="flex-shrink-0"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4 w-full max-w-full">
            <div className="space-y-0.5 flex-1 min-w-0">
              <Label className="text-sm font-medium break-words">Atualizações de workflow</Label>
              <p className="text-xs text-muted-foreground break-words">Notificações sobre execução de workflows</p>
            </div>
            <Switch
              checked={settings.notifications.workflowUpdates}
              onCheckedChange={(checked) => updateSetting("notifications", "workflowUpdates", checked)}
              className="flex-shrink-0"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4 w-full max-w-full">
            <div className="space-y-0.5 flex-1 min-w-0">
              <Label className="text-sm font-medium break-words">Atualizações do marketplace</Label>
              <p className="text-xs text-muted-foreground break-words">Novos agentes e templates disponíveis</p>
            </div>
            <Switch
              checked={settings.notifications.marketplaceUpdates}
              onCheckedChange={(checked) => updateSetting("notifications", "marketplaceUpdates", checked)}
              className="flex-shrink-0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl break-words">Privacidade e Dados</CardTitle>
          <CardDescription className="text-sm break-words">
            Controle como seus dados são usados e compartilhados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 w-full max-w-full overflow-hidden">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="profileVisibility" className="text-sm font-medium">
              Visibilidade do perfil
            </Label>
            <Select
              value={settings.privacy.profileVisibility}
              onValueChange={(value) => updateSetting("privacy", "profileVisibility", value)}
            >
              <SelectTrigger className="w-full max-w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Público</SelectItem>
                <SelectItem value="private">Privado</SelectItem>
                <SelectItem value="friends">Apenas amigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4 w-full max-w-full">
            <div className="space-y-0.5 flex-1 min-w-0">
              <Label className="text-sm font-medium break-words">Compartilhar dados de análise</Label>
              <p className="text-xs text-muted-foreground break-words">
                Ajude a melhorar o produto compartilhando dados anônimos
              </p>
            </div>
            <Switch
              checked={settings.privacy.shareAnalytics}
              onCheckedChange={(checked) => updateSetting("privacy", "shareAnalytics", checked)}
              className="flex-shrink-0"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4 w-full max-w-full">
            <div className="space-y-0.5 flex-1 min-w-0">
              <Label className="text-sm font-medium break-words">Permitir cookies</Label>
              <p className="text-xs text-muted-foreground break-words">Necessário para funcionalidades básicas</p>
            </div>
            <Switch
              checked={settings.privacy.allowCookies}
              onCheckedChange={(checked) => updateSetting("privacy", "allowCookies", checked)}
              className="flex-shrink-0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return renderGeneralSettings()
      case "canvas":
        return renderCanvasSettings()
      case "notifications":
        return renderNotificationSettings()
      case "privacy":
        return renderPrivacySettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="flex h-full w-full max-w-full overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-64 flex-shrink-0 border-r bg-card overflow-hidden hidden lg:block">
        <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      </div>

      {/* Mobile Sidebar Toggle - Show on smaller screens */}
      <div className="lg:hidden w-full">
        <div className="p-4 border-b bg-card">
          <Select value={activeSection} onValueChange={setActiveSection}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Geral</SelectItem>
              <SelectItem value="canvas">Canvas</SelectItem>
              <SelectItem value="notifications">Notificações</SelectItem>
              <SelectItem value="privacy">Privacidade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <div className={createResponsiveContainer("", { padding: true })}>
          <div className="max-w-4xl mx-auto space-y-6 w-full max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full max-w-full">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">Configurações</h1>
                <p className="text-muted-foreground text-sm break-words">
                  Gerencie suas preferências e configurações da conta
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <RefreshCw className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Restaurar Padrões</span>
                  <span className="sm:hidden">Restaurar</span>
                </Button>
                <Button size="sm" className="text-xs sm:text-sm">
                  <Save className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Salvar Alterações</span>
                  <span className="sm:hidden">Salvar</span>
                </Button>
              </div>
            </div>

            {/* Content */}
            {renderContent()}

            {/* Footer Actions */}
            <Card className="w-full max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-destructive text-lg sm:text-xl break-words">Zona de Perigo</CardTitle>
                <CardDescription className="text-sm break-words">
                  Ações irreversíveis que afetam permanentemente sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 w-full max-w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-destructive/20 rounded-lg w-full max-w-full">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base break-words">Exportar dados</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      Baixe uma cópia de todos os seus dados
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-destructive/20 rounded-lg w-full max-w-full">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base break-words">Importar dados</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      Restaure dados de um backup anterior
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    <Upload className="mr-2 h-4 w-4" />
                    Importar
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-destructive rounded-lg bg-destructive/5 w-full max-w-full">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-destructive text-sm sm:text-base break-words">Excluir conta</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      Exclua permanentemente sua conta e todos os dados associados
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" className="flex-shrink-0">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
