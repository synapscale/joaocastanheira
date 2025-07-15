"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  User,
  Shield,
  Monitor,
  Palette,
  Grid,
  Timer,
  RefreshCw,
  Eye,
  EyeOff,
  Bell,
  Globe,
  Sun,
  Moon,
  Laptop,
  Lock,
  Building,
  Save
} from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface UserInfo {
  id: string
  email: string
  username?: string
  first_name?: string
  last_name?: string
  full_name?: string
  bio?: string
  avatar_url?: string
  profile_image_url?: string
  is_active?: boolean
  is_verified?: boolean
  is_superuser?: boolean
  role?: string
  created_at?: string
  updated_at?: string
}

interface AppSettings {
  theme: string
  language: string
  showGrid: boolean
  snapToGrid: boolean
  autoSave: boolean
  autoSaveInterval: number
  timeout: number
  maxMemory: number
  parallelExecutions: number
  notifications: boolean
  sessionTimeout: number
  enableAnimations: boolean
  compactMode: boolean
  showMinimap: boolean
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: ""
  })

  const [settings, setSettings] = useState<AppSettings>({
    theme: "light",
    language: "pt-BR",
    showGrid: true,
    snapToGrid: true,
    autoSave: true,
    autoSaveInterval: 5,
    timeout: 60,
    maxMemory: 1024,
    parallelExecutions: 4,
    notifications: true,
    sessionTimeout: 60,
    enableAnimations: true,
    compactMode: false,
    showMinimap: true,
  })

  const { user } = useAuth()

  useEffect(() => {
    loadUserData()
    loadSettings()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('synapsefrontend_auth_token') || sessionStorage.getItem('synapsefrontend_auth_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const loadUserData = async () => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.warn('NEXT_PUBLIC_API_URL not configured')
      setLoadingUser(false)
      return
    }

    try {
      setLoadingUser(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: getAuthHeaders(),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('User data loaded:', data)
        setUserInfo(data)
        setProfileData({
          name: data.full_name || data.username || "",
          email: data.email || "",
          bio: data.bio || ""
        })
      } else if (response.status === 401) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
          variant: "destructive",
        })
        // window.location.href = '/login'
      } else {
        console.log('Failed to load user data:', response.status)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        title: "Modo offline",
        description: "Usando dados locais temporariamente.",
        variant: "default",
      })
    } finally {
      setLoadingUser(false)
    }
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }

  // TODO: Backend - Implementar endpoint PUT /auth/profile
  // Para atualizar informações do perfil do usuário
  // Endpoint: PUT /auth/profile (prefixo /api/v1/ adicionado automaticamente)
  // Headers: Authorization: Bearer {token}, Content-Type: application/json
  // Request body: { full_name?: string, email?: string, bio?: string }
  // Response: UserResponse (mesmo schema do GET /auth/me)
  // Status codes: 200 (success), 401 (unauthorized), 422 (validation error)
  const saveProfile = async () => {
    setLoading(true)
    try {
      // TEMPORÁRIO: Salvando apenas localmente até o endpoint ser implementado no backend
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
      //   method: 'PUT',
      //   headers: getAuthHeaders(),
      //   body: JSON.stringify({
      //     full_name: profileData.name,
      //     email: profileData.email,
      //     bio: profileData.bio
      //   }),
      // })

      // if (response.ok) {
      //   const updatedUser = await response.json()
      //   setUserInfo(updatedUser)
      //   toast({
      //     title: "Perfil atualizado",
      //     description: "Suas informações de perfil foram atualizadas com sucesso.",
      //   })
      // } else {
      //   throw new Error('Failed to update profile')
      // }

      // SIMULAÇÃO - Salvando localmente até o endpoint estar disponível
      if (userInfo) {
        const updatedUser = {
          ...userInfo,
          full_name: profileData.name,
          email: profileData.email,
          bio: profileData.bio
        }
        setUserInfo(updatedUser)
      }
      
      toast({
        title: "Perfil atualizado localmente",
        description: "Suas informações foram salvas localmente. Endpoint de atualização será implementado no backend.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao atualizar suas informações.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    if (strength <= 2) return { score: strength, label: "Fraca", color: "text-red-500" }
    if (strength <= 3) return { score: strength, label: "Média", color: "text-yellow-500" }
    return { score: strength, label: "Forte", color: "text-green-500" }
  }

  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos de senha.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const formData = new URLSearchParams()
      formData.append('current_password', passwordData.currentPassword)
      formData.append('new_password', passwordData.newPassword)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('synapsefrontend_auth_token') || sessionStorage.getItem('synapsefrontend_auth_token')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      if (response.ok) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        toast({
          title: "Senha alterada",
          description: "Sua senha foi alterada com sucesso.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Erro ao alterar senha",
          description: errorData.detail || "Senha atual incorreta ou erro no servidor.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao alterar senha",
        description: "Ocorreu um erro ao alterar sua senha.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings))
      
      const root = document.documentElement
      if (settings.theme === 'dark') {
        root.classList.add('dark')
      } else if (settings.theme === 'light') {
        root.classList.remove('dark')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas configurações.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetSettings = () => {
    const defaultSettings: AppSettings = {
      theme: "light",
      language: "pt-BR",
      showGrid: true,
      snapToGrid: true,
      autoSave: true,
      autoSaveInterval: 5,
      timeout: 60,
      maxMemory: 1024,
      parallelExecutions: 4,
      notifications: true,
      sessionTimeout: 60,
      enableAnimations: true,
      compactMode: false,
      showMinimap: true,
    }
    setSettings(defaultSettings)
    toast({
      title: "Configurações restauradas",
      description: "As configurações padrão foram restauradas.",
    })
  }

  if (loadingUser) {
    return (
      <div className="container mx-auto py-8 space-y-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 space-y-8 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas configurações pessoais e de sistema.
            </p>
          </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                onClick={resetSettings}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Restaurar configurações padrão</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Restaurar configurações padrão</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Separator />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Conta</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência da interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Escuro
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Laptop className="h-4 w-4" />
                        Sistema
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animações</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar animações na interface
                  </p>
                </div>
                <Switch
                  checked={settings.enableAnimations}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableAnimations: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo compacto</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduzir espaçamento da interface
                  </p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, compactMode: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid className="h-5 w-5" />
                Canvas
              </CardTitle>
              <CardDescription>
                Configurações do canvas de trabalho
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar grade</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibir grade no canvas
                  </p>
                </div>
                <Switch
                  checked={settings.showGrid}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showGrid: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Snap to grid</Label>
                  <p className="text-sm text-muted-foreground">
                    Alinhar elementos à grade
                  </p>
                </div>
                <Switch
                  checked={settings.snapToGrid}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, snapToGrid: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save</Label>
                  <p className="text-sm text-muted-foreground">
                    Salvar automaticamente o trabalho
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                />
              </div>

              {settings.autoSave && (
                <div className="space-y-2">
                  <Label htmlFor="autoSaveInterval">Intervalo de auto-save (minutos)</Label>
                  <Select
                    value={settings.autoSaveInterval.toString()}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, autoSaveInterval: parseInt(value) }))}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minuto</SelectItem>
                      <SelectItem value="2">2 minutos</SelectItem>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Execução
              </CardTitle>
              <CardDescription>
                Configurações de performance e execução
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (segundos)</Label>
                <Select
                  value={settings.timeout.toString()}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, timeout: parseInt(value) }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 segundos</SelectItem>
                    <SelectItem value="60">60 segundos</SelectItem>
                    <SelectItem value="120">2 minutos</SelectItem>
                    <SelectItem value="300">5 minutos</SelectItem>
                    <SelectItem value="600">10 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMemory">Memória máxima (MB)</Label>
                <Select
                  value={settings.maxMemory.toString()}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, maxMemory: parseInt(value) }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512 MB</SelectItem>
                    <SelectItem value="1024">1 GB</SelectItem>
                    <SelectItem value="2048">2 GB</SelectItem>
                    <SelectItem value="4096">4 GB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parallelExecutions">Execuções paralelas</Label>
                <Select
                  value={settings.parallelExecutions.toString()}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, parallelExecutions: parseInt(value) }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={loading}>
              {loading ? "Salvando..." : "Salvar configurações"}
            </Button>
          </div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do perfil
              </CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nome completo</Label>
                <Input
                  id="profile-name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-bio">Bio</Label>
                <Input
                  id="profile-bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Uma breve descrição sobre você"
                />
              </div>
            </CardContent>
          </Card>

          {userInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Status da conta
                </CardTitle>
                <CardDescription>
                  Informações sobre sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email verificado</span>
                  <Badge variant={userInfo.is_verified ? "default" : "secondary"}>
                    {userInfo.is_verified ? "Verificado" : "Não verificado"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conta ativa</span>
                  <Badge variant={userInfo.is_active ? "default" : "destructive"}>
                    {userInfo.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Função</span>
                  <Badge variant="outline">
                    {userInfo.role || "Usuário"}
                  </Badge>
                </div>
                {userInfo.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Membro desde</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(userInfo.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={loading}>
              {loading ? "Salvando..." : "Salvar perfil"}
            </Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Alterar senha
              </CardTitle>
              <CardDescription>
                Mantenha sua conta segura alterando sua senha regularmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha atual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}
                    </span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite sua nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                    </span>
                  </Button>
                </div>
                {passwordData.newPassword && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>Força da senha:</span>
                    <span className={passwordStrength.color}>
                      {passwordStrength.label}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 w-6 rounded-full ${
                            level <= passwordStrength.score
                              ? passwordStrength.score <= 2
                                ? "bg-red-500"
                                : passwordStrength.score <= 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirme sua nova senha"
                />
              </div>

              <Button 
                onClick={changePassword} 
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full"
              >
                {loading ? "Alterando..." : "Alterar senha"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de segurança
              </CardTitle>
              <CardDescription>
                Configurações adicionais de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Timeout da sessão (minutos)</Label>
                <Select
                  value={settings.sessionTimeout.toString()}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(value) }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="480">8 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações gerais
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localização
              </CardTitle>
              <CardDescription>
                Configurações de idioma e região
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-language">Idioma do sistema</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={loading}>
              {loading ? "Salvando..." : "Salvar configurações"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </ProtectedRoute>
  )
}
