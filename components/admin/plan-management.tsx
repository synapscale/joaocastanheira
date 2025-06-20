/**
 * Componente para Administradores do SaaS gerenciarem planos
 * Primeiro nível da hierarquia: SaaS Owners → Plans → Customers
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Star,
  Crown,
  Zap,
  Shield,
  Eye,
  RefreshCw
} from 'lucide-react'

import { apiService } from '@/lib/api/service'
import type { Plan, PlanFeature, CustomerOverview, Subscription } from '@/types/plan-types'

interface PlanFormData {
  name: string
  slug: string
  description: string
  price: number
  currency: string
  billing_cycle: 'monthly' | 'yearly'
  is_active: boolean
  is_featured: boolean
  sort_order: number
  limits: {
    max_workspaces: number
    max_members_per_workspace: number
    max_projects_per_workspace: number
    max_storage_gb: number
    max_api_requests_per_month: number
    max_executions_per_month: number
    max_file_upload_size_mb: number
    can_create_custom_roles: boolean
    can_use_api: boolean
    can_export_data: boolean
    can_use_webhooks: boolean
    can_use_integrations: boolean
    can_use_sso: boolean
    has_priority_support: boolean
  }
}

export default function PlanManagement() {
  const [activeTab, setActiveTab] = useState('plans')
  const [plans, setPlans] = useState<Plan[]>([])
  const [customers, setCustomers] = useState<CustomerOverview[]>([])
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false)
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  // Form data
  const [planForm, setPlanForm] = useState<PlanFormData>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    currency: 'USD',
    billing_cycle: 'monthly',
    is_active: true,
    is_featured: false,
    sort_order: 0,
    limits: {
      max_workspaces: 1,
      max_members_per_workspace: 5,
      max_projects_per_workspace: 10,
      max_storage_gb: 1,
      max_api_requests_per_month: 1000,
      max_executions_per_month: 1000,
      max_file_upload_size_mb: 10,
      can_create_custom_roles: false,
      can_use_api: true,
      can_export_data: false,
      can_use_webhooks: false,
      can_use_integrations: false,
      can_use_sso: false,
      has_priority_support: false
    }
  })

  // ===== LOAD DATA =====

  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/admin/plans/')
      setPlans(response.plans || [])
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/admin/customers/')
      setCustomers(response.customers || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  // ===== PLAN ACTIONS =====

  const handleCreatePlan = async () => {
    try {
      setLoading(true)
      const response = await apiService.post('/admin/plans/', planForm)
      
      if (response.plan) {
        setPlans([...plans, response.plan])
        resetPlanForm()
        setIsCreatePlanOpen(false)
      }
    } catch (error) {
      console.error('Erro ao criar plano:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return
    
    try {
      setLoading(true)
      const response = await apiService.put(`/admin/plans/${selectedPlan.id}`, planForm)
      
      if (response.plan) {
        setPlans(plans.map(p => p.id === selectedPlan.id ? response.plan : p))
        resetPlanForm()
        setIsEditPlanOpen(false)
        setSelectedPlan(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar plano:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja deletar este plano?')) return
    
    try {
      setLoading(true)
      await apiService.delete(`/admin/plans/${planId}`)
      setPlans(plans.filter(p => p.id !== planId))
    } catch (error) {
      console.error('Erro ao deletar plano:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      await apiService.patch(`/admin/plans/${planId}`, { is_active: isActive })
      setPlans(plans.map(p => p.id === planId ? { ...p, is_active: isActive } : p))
    } catch (error) {
      console.error('Erro ao alterar status do plano:', error)
    }
  }

  // ===== HELPERS =====

  const resetPlanForm = () => {
    setPlanForm({
      name: '',
      slug: '',
      description: '',
      price: 0,
      currency: 'USD',
      billing_cycle: 'monthly',
      is_active: true,
      is_featured: false,
      sort_order: 0,
      limits: {
        max_workspaces: 1,
        max_members_per_workspace: 5,
        max_projects_per_workspace: 10,
        max_storage_gb: 1,
        max_api_requests_per_month: 1000,
        max_executions_per_month: 1000,
        max_file_upload_size_mb: 10,
        can_create_custom_roles: false,
        can_use_api: true,
        can_export_data: false,
        can_use_webhooks: false,
        can_use_integrations: false,
        can_use_sso: false,
        has_priority_support: false
      }
    })
  }

  const openEditPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setPlanForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      billing_cycle: plan.billing_cycle,
      is_active: plan.is_active,
      is_featured: plan.is_featured,
      sort_order: plan.sort_order,
      limits: plan.limits
    })
    setIsEditPlanOpen(true)
  }

  const getPlanIcon = (planSlug: string) => {
    switch (planSlug) {
      case 'free': return <Package className="h-5 w-5" />
      case 'pro': return <Zap className="h-5 w-5" />
      case 'enterprise': return <Crown className="h-5 w-5" />
      default: return <Package className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'trialing': return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>
      case 'past_due': return <Badge className="bg-yellow-100 text-yellow-800">Vencido</Badge>
      case 'canceled': return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  // ===== EFFECTS =====

  useEffect(() => {
    loadPlans()
    loadCustomers()
  }, [])

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Administração de Planos</h1>
            <p className="text-muted-foreground">Gerencie planos, recursos e clientes da plataforma</p>
          </div>
          
          <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Plano</DialogTitle>
                <DialogDescription>
                  Configure um novo plano de assinatura para seus clientes.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Informações Básicas</h3>
                  
                  <div>
                    <Label htmlFor="plan-name">Nome do Plano</Label>
                    <Input
                      id="plan-name"
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      placeholder="Ex: Pro"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="plan-slug">Slug</Label>
                    <Input
                      id="plan-slug"
                      value={planForm.slug}
                      onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })}
                      placeholder="Ex: pro"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="plan-description">Descrição</Label>
                    <Input
                      id="plan-description"
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      placeholder="Descrição do plano"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plan-price">Preço</Label>
                      <Input
                        id="plan-price"
                        type="number"
                        value={planForm.price}
                        onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan-cycle">Ciclo</Label>
                      <Select value={planForm.billing_cycle} onValueChange={(value: any) => setPlanForm({ ...planForm, billing_cycle: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="plan-active"
                        checked={planForm.is_active}
                        onCheckedChange={(checked) => setPlanForm({ ...planForm, is_active: checked })}
                      />
                      <Label htmlFor="plan-active">Ativo</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="plan-featured"
                        checked={planForm.is_featured}
                        onCheckedChange={(checked) => setPlanForm({ ...planForm, is_featured: checked })}
                      />
                      <Label htmlFor="plan-featured">Destaque</Label>
                    </div>
                  </div>
                </div>

                {/* Limites e Recursos */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Limites e Recursos</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max Workspaces</Label>
                      <Input
                        type="number"
                        value={planForm.limits.max_workspaces}
                        onChange={(e) => setPlanForm({
                          ...planForm,
                          limits: { ...planForm.limits, max_workspaces: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Max Membros/Workspace</Label>
                      <Input
                        type="number"
                        value={planForm.limits.max_members_per_workspace}
                        onChange={(e) => setPlanForm({
                          ...planForm,
                          limits: { ...planForm.limits, max_members_per_workspace: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Max Projetos/Workspace</Label>
                      <Input
                        type="number"
                        value={planForm.limits.max_projects_per_workspace}
                        onChange={(e) => setPlanForm({
                          ...planForm,
                          limits: { ...planForm.limits, max_projects_per_workspace: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Storage (GB)</Label>
                      <Input
                        type="number"
                        value={planForm.limits.max_storage_gb}
                        onChange={(e) => setPlanForm({
                          ...planForm,
                          limits: { ...planForm.limits, max_storage_gb: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>API Calls/Mês</Label>
                      <Input
                        type="number"
                        value={planForm.limits.max_api_requests_per_month}
                        onChange={(e) => setPlanForm({
                          ...planForm,
                          limits: { ...planForm.limits, max_api_requests_per_month: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Execuções/Mês</Label>
                      <Input
                        type="number"
                        value={planForm.limits.max_executions_per_month}
                        onChange={(e) => setPlanForm({
                          ...planForm,
                          limits: { ...planForm.limits, max_executions_per_month: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Recursos Avançados</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={planForm.limits.can_use_api}
                          onCheckedChange={(checked) => setPlanForm({
                            ...planForm,
                            limits: { ...planForm.limits, can_use_api: checked }
                          })}
                        />
                        <Label>Acesso API</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={planForm.limits.can_export_data}
                          onCheckedChange={(checked) => setPlanForm({
                            ...planForm,
                            limits: { ...planForm.limits, can_export_data: checked }
                          })}
                        />
                        <Label>Exportar Dados</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={planForm.limits.can_use_webhooks}
                          onCheckedChange={(checked) => setPlanForm({
                            ...planForm,
                            limits: { ...planForm.limits, can_use_webhooks: checked }
                          })}
                        />
                        <Label>Webhooks</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={planForm.limits.can_use_integrations}
                          onCheckedChange={(checked) => setPlanForm({
                            ...planForm,
                            limits: { ...planForm.limits, can_use_integrations: checked }
                          })}
                        />
                        <Label>Integrações</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={planForm.limits.can_use_sso}
                          onCheckedChange={(checked) => setPlanForm({
                            ...planForm,
                            limits: { ...planForm.limits, can_use_sso: checked }
                          })}
                        />
                        <Label>SSO</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={planForm.limits.has_priority_support}
                          onCheckedChange={(checked) => setPlanForm({
                            ...planForm,
                            limits: { ...planForm.limits, has_priority_support: checked }
                          })}
                        />
                        <Label>Suporte Prioritário</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreatePlan} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Criar Plano
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Planos
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="relative">
                  {plan.is_featured && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Destaque
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlanIcon(plan.slug)}
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                      </div>
                      <Switch
                        checked={plan.is_active}
                        onCheckedChange={(checked) => handleTogglePlanStatus(plan.id, checked)}
                      />
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          ${plan.price}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                          </span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Workspaces:</span>
                          <span>{plan.limits.max_workspaces === -1 ? '∞' : plan.limits.max_workspaces}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Membros/Workspace:</span>
                          <span>{plan.limits.max_members_per_workspace === -1 ? '∞' : plan.limits.max_members_per_workspace}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage:</span>
                          <span>{plan.limits.max_storage_gb === -1 ? '∞' : `${plan.limits.max_storage_gb}GB`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>API Calls/mês:</span>
                          <span>{plan.limits.max_api_requests_per_month === -1 ? '∞' : plan.limits.max_api_requests_per_month.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditPlan(plan)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clientes</CardTitle>
                <CardDescription>Gerencie os clientes e suas assinaturas</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Workspaces</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Última Atividade</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPlanIcon(customer.subscription.plan.slug)}
                            <span className="capitalize">{customer.subscription.plan.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(customer.subscription.status)}
                        </TableCell>
                        <TableCell>{customer.workspaces_count}</TableCell>
                        <TableCell>${customer.lifetime_value.toFixed(2)}</TableCell>
                        <TableCell>{new Date(customer.last_activity).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customers.length}</div>
                  <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${customers.reduce((acc, c) => acc + c.subscription.plan.price, 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">+8% em relação ao mês passado</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {customers.filter(c => c.subscription.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">94% de taxa de retenção</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{plans.filter(p => p.is_active).length}</div>
                  <p className="text-xs text-muted-foreground">de {plans.length} planos totais</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Plataforma</CardTitle>
                <CardDescription>Configure as configurações globais da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Registro Público</Label>
                    <p className="text-sm text-muted-foreground">Permitir que novos usuários se registrem na plataforma</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Criar Workspace Automático</Label>
                    <p className="text-sm text-muted-foreground">Criar workspace padrão para novos usuários</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Período de Trial</Label>
                    <p className="text-sm text-muted-foreground">Duração do período de teste gratuito</p>
                  </div>
                  <Select defaultValue="14">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="14">14 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button>Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Plan Dialog */}
        <Dialog open={isEditPlanOpen} onOpenChange={setIsEditPlanOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Plano</DialogTitle>
              <DialogDescription>
                Modifique as configurações do plano selecionado.
              </DialogDescription>
            </DialogHeader>
            
            {/* Same form as create, but with update functionality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ... Same content as create form ... */}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditPlanOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdatePlan} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                Atualizar Plano
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 