# 📋 PLANO DE IMPLEMENTAÇÃO: Sistema de Hierarquias e Permissões SaaS

**Data:** Janeiro 2025  
**Versão:** 1.0  
**Status:** Em Planejamento  

## 🔍 ANÁLISE DA SITUAÇÃO ATUAL

### ✅ **O que já existe e funciona:**
1. **Estrutura de Workspaces** - API completa implementada
2. **Sistema de Membros** - Convites e gestão básica funcionando
3. **Tipos TypeScript** - Definições completas em `types/plan-types.ts` e `types/workspace-types.ts`
4. **Componentes Admin** - `components/admin/plan-management.tsx` implementado
5. **Context de Planos** - `context/plan-context.tsx` com estrutura básica
6. **Dashboard de Workspaces** - `components/workspaces/enhanced-workspace-dashboard.tsx`

### ❌ **Problemas identificados:**
1. **Endpoints Missing** - APIs `/admin/plans/` e `/admin/customers/` não existem
2. **Integração Incompleta** - Componentes fazem chamadas para APIs inexistentes
3. **Página /team Básica** - Apenas renderiza um dashboard simples
4. **Contexto Mock** - PlanContext usando dados mockados
5. **Permissões Limitadas** - Sistema de permissões não implementado completamente

---

## 🎯 PLANO DE AÇÃO COMPLETO

### **FASE 1: BACKEND - Estruturação de APIs (CRÍTICA)**

#### 1.1 - Endpoints de Administração de Planos
**Localização:** Precisa ser criado no backend (FastAPI)

```python
# Endpoints necessários:
POST   /api/v1/admin/plans/              # Criar plano
GET    /api/v1/admin/plans/              # Listar planos  
GET    /api/v1/admin/plans/{plan_id}     # Obter plano específico
PUT    /api/v1/admin/plans/{plan_id}     # Atualizar plano
DELETE /api/v1/admin/plans/{plan_id}     # Deletar plano
PATCH  /api/v1/admin/plans/{plan_id}     # Ativar/desativar plano
```

**Esquemas necessários:**
```python
class PlanCreate(BaseModel):
    name: str
    slug: str
    description: str
    price: float
    currency: str = "USD"
    billing_cycle: Literal["monthly", "yearly"]
    is_active: bool = True
    is_featured: bool = False
    sort_order: int = 0
    limits: PlanLimits

class PlanLimits(BaseModel):
    max_workspaces: int
    max_members_per_workspace: int
    max_projects_per_workspace: int
    max_storage_gb: int
    max_api_requests_per_month: int
    max_executions_per_month: int
    max_file_upload_size_mb: int
    can_create_custom_roles: bool
    can_use_api: bool
    can_export_data: bool
    can_use_webhooks: bool
    can_use_integrations: bool
    can_use_sso: bool
    has_priority_support: bool
```

#### 1.2 - Endpoints de Gestão de Clientes/Usuários
```python
GET    /api/v1/admin/customers/          # Listar clientes
GET    /api/v1/admin/customers/{user_id} # Detalhes do cliente
PUT    /api/v1/admin/customers/{user_id} # Atualizar cliente
GET    /api/v1/admin/customers/{user_id}/workspaces # Workspaces do cliente
```

#### 1.3 - Endpoints de Billing e Assinaturas
```python
GET    /api/v1/billing/subscription      # Assinatura atual do usuário
POST   /api/v1/billing/upgrade           # Upgrade de plano
GET    /api/v1/billing/usage            # Estatísticas de uso
GET    /api/v1/billing/history          # Histórico de cobrança
POST   /api/v1/billing/cancel           # Cancelar assinatura
```

#### 1.4 - Expansão dos Endpoints de Workspaces
**Status:** Parcialmente implementado - precisa expansão

```python
# Endpoints adicionais necessários:
GET    /api/v1/workspaces/{id}/roles               # Roles disponíveis no workspace
POST   /api/v1/workspaces/{id}/roles               # Criar role customizada
PUT    /api/v1/workspaces/{id}/members/{member_id}/role # Alterar role de membro
DELETE /api/v1/workspaces/{id}/members/{member_id} # Remover membro
GET    /api/v1/workspaces/{id}/settings            # Configurações do workspace
PUT    /api/v1/workspaces/{id}/settings            # Atualizar configurações
GET    /api/v1/workspaces/{id}/usage               # Uso do workspace
```

---

### **FASE 2: FRONTEND - Refatoração e Melhorias**

#### 2.1 - Corrigir API Service
**Arquivo:** `lib/api/service.ts`

**Ações necessárias:**
1. Adicionar métodos para endpoints de admin:
```typescript
// Métodos a adicionar:
async getPlans(): Promise<Plan[]>
async createPlan(plan: PlanFormData): Promise<Plan>
async updatePlan(id: string, plan: PlanFormData): Promise<Plan>
async deletePlan(id: string): Promise<void>
async getCustomers(): Promise<CustomerOverview[]>
async getBillingInfo(): Promise<BillingInfo>
async upgradePlan(planId: string): Promise<Subscription>
```

2. Expandir métodos de workspace:
```typescript
// Métodos a adicionar:
async getWorkspaceRoles(workspaceId: string): Promise<WorkspaceRole[]>
async createWorkspaceRole(workspaceId: string, role: CreateRoleData): Promise<WorkspaceRole>
async updateMemberRole(workspaceId: string, memberId: string, roleId: string): Promise<void>
async removeMember(workspaceId: string, memberId: string): Promise<void>
async getWorkspaceSettings(workspaceId: string): Promise<WorkspaceSettings>
async updateWorkspaceSettings(workspaceId: string, settings: WorkspaceSettings): Promise<WorkspaceSettings>
```

#### 2.2 - Melhorar Context de Planos
**Arquivo:** `context/plan-context.tsx`

**Status atual:** Usando dados mockados  
**Ação:** Integrar com APIs reais:

```typescript
// Substituir dados mock por chamadas reais:
const loadCurrentUserPlan = async () => {
  const billingInfo = await apiService.getBillingInfo()
  setCurrentPlan(billingInfo.subscription.plan)
  setUsage(billingInfo.usage_stats)
  setLimits(billingInfo.limits)
}

const loadAvailablePlans = async () => {
  const plans = await apiService.getPlans()
  setPlans(plans)
}
```

#### 2.3 - Expandir Página /team
**Arquivo:** `app/team/page.tsx`

**Status atual:** Só renderiza `EnhancedWorkspaceDashboard`  
**Plano:** Criar sistema completo de abas:

```typescript
export default function TeamPage() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="workspaces">
        <TabsList>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="billing">Plano & Cobrança</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workspaces">
          <WorkspaceManagementTab />
        </TabsContent>
        
        <TabsContent value="members">
          <MemberManagementTab />
        </TabsContent>
        
        <TabsContent value="permissions">
          <PermissionManagementTab />
        </TabsContent>
        
        <TabsContent value="billing">
          <BillingManagementTab />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

#### 2.4 - Criar Componentes Específicos
**Novos componentes necessários:**

1. **`components/team/workspace-management-tab.tsx`**
   - Listagem e criação de workspaces
   - Controles baseados nos limites do plano
   - Estatísticas de uso

2. **`components/team/member-management-tab.tsx`**
   - Gestão de membros por workspace  
   - Convites e alteração de roles
   - Controle de permissões

3. **`components/team/permission-management-tab.tsx`**
   - Gestão de roles customizadas
   - Atribuição de permissões granulares
   - Preview de permissões por role

4. **`components/team/billing-management-tab.tsx`**
   - Visualização do plano atual
   - Estatísticas de uso vs limites
   - Opções de upgrade
   - Histórico de cobrança

5. **`components/team/settings-tab.tsx`**
   - Configurações gerais do workspace
   - Integrações disponíveis
   - Notificações

#### 2.5 - Melhorar Dashboard Existente
**Arquivo:** `components/workspaces/enhanced-workspace-dashboard.tsx`

**Melhorias necessárias:**
1. Integrar com context de planos real
2. Adicionar controles de permissão
3. Mostrar limites vs uso atual
4. Adicionar ações condicionais baseadas no plano

---

### **FASE 3: SISTEMA DE PERMISSÕES GRANULARES**

#### 3.1 - Definir Permissões do Sistema
**Arquivo:** `types/permissions.ts` (novo)

```typescript
export const SYSTEM_PERMISSIONS = {
  // Workspace permissions
  'workspace.create': 'Criar workspaces',
  'workspace.edit': 'Editar workspaces',
  'workspace.delete': 'Deletar workspaces',
  'workspace.view': 'Visualizar workspaces',
  
  // Member permissions  
  'members.invite': 'Convidar membros',
  'members.remove': 'Remover membros',
  'members.edit_role': 'Alterar roles de membros',
  'members.view': 'Visualizar membros',
  
  // Project permissions
  'projects.create': 'Criar projetos',
  'projects.edit': 'Editar projetos',
  'projects.delete': 'Deletar projetos',
  'projects.execute': 'Executar workflows',
  
  // Admin permissions
  'admin.plans': 'Gerenciar planos',
  'admin.users': 'Gerenciar usuários',
  'admin.billing': 'Gerenciar cobrança'
} as const
```

#### 3.2 - Criar Hook de Permissões
**Arquivo:** `hooks/use-permissions.ts` (novo)

```typescript
export function usePermissions() {
  const { currentPlan, subscription } = usePlan()
  const { user } = useAuth()
  
  const hasPermission = (permission: string, workspaceId?: string): boolean => {
    // Lógica para verificar permissões baseada em:
    // 1. Plano atual do usuário
    // 2. Role no workspace específico  
    // 3. Permissões customizadas
  }
  
  const hasFeature = (feature: string): boolean => {
    // Verificar se o plano inclui a feature
    return currentPlan?.limits[feature] === true
  }
  
  return { hasPermission, hasFeature }
}
```

#### 3.3 - Componente de Controle de Acesso
**Arquivo:** `components/common/permission-gate.tsx` (novo)

```typescript
interface PermissionGateProps {
  permission: string
  workspaceId?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({ permission, workspaceId, fallback, children }: PermissionGateProps) {
  const { hasPermission } = usePermissions()
  
  if (!hasPermission(permission, workspaceId)) {
    return fallback || null
  }
  
  return <>{children}</>
}
```

---

### **FASE 4: INTEGRAÇÃO E TESTES**

#### 4.1 - Middleware de Validação de Planos
**Arquivo:** `middleware/plan-validation.ts` (novo)

```typescript
export function validatePlanLimits(action: string, currentUsage: any, limits: PlanLimits): boolean {
  switch (action) {
    case 'create_workspace':
      return currentUsage.workspaces_count < limits.max_workspaces
    case 'invite_member':
      return currentUsage.members_count < limits.max_members_per_workspace
    // ... outras validações
  }
}
```

#### 4.2 - Componentes de Upgrade
**Arquivo:** `components/common/upgrade-prompt.tsx` (novo)

```typescript
interface UpgradePromptProps {
  feature: string
  currentPlan: string
  requiredPlan: string
}

export function UpgradePrompt({ feature, currentPlan, requiredPlan }: UpgradePromptProps) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-orange-600" />
          <div>
            <h3 className="font-semibold text-orange-900">
              Upgrade Necessário
            </h3>
            <p className="text-sm text-orange-700">
              {feature} está disponível no plano {requiredPlan}
            </p>
          </div>
          <Button variant="outline" className="ml-auto">
            Fazer Upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 📅 CRONOGRAMA DE IMPLEMENTAÇÃO

### **Semana 1-2: Backend Critical Path**
- [ ] Implementar endpoints `/admin/plans/`
- [ ] Implementar endpoints `/admin/customers/`  
- [ ] Implementar endpoints `/billing/`
- [ ] Expandir endpoints de workspaces
- [ ] Testes de API

### **Semana 3: Frontend Core**
- [ ] Corrigir `ApiService` com novos métodos
- [ ] Refatorar `PlanContext` para usar APIs reais
- [ ] Implementar hooks de permissões
- [ ] Criar componentes de controle de acesso

### **Semana 4: UI Components**
- [ ] Criar componentes de abas para página `/team`
- [ ] Implementar `WorkspaceManagementTab`
- [ ] Implementar `MemberManagementTab`
- [ ] Implementar `BillingManagementTab`

### **Semana 5: Integration & Polish**
- [ ] Integrar todos os componentes
- [ ] Implementar sistema de permissões granulares
- [ ] Criar componentes de upgrade
- [ ] Testes end-to-end

### **Semana 6: Testing & Deployment**
- [ ] Testes completos do fluxo
- [ ] Correções de bugs
- [ ] Documentação final
- [ ] Deploy em produção

---

## 🔧 COMANDOS PARA EXECUÇÃO

### **Estrutura de Arquivos a Criar:**
```
backend/
├── routers/
│   ├── admin.py              # Endpoints de admin
│   ├── billing.py            # Endpoints de billing
│   └── plans.py              # Endpoints de planos

frontend/
├── components/
│   ├── team/
│   │   ├── workspace-management-tab.tsx
│   │   ├── member-management-tab.tsx
│   │   ├── billing-management-tab.tsx
│   │   └── settings-tab.tsx
│   └── common/
│       ├── permission-gate.tsx
│       └── upgrade-prompt.tsx
├── hooks/
│   └── use-permissions.ts
└── types/
    └── permissions.ts
```

### **Ordem de Implementação:**
1. **Backend first** - Implementar todas as APIs necessárias
2. **ApiService** - Corrigir e expandir o serviço de API
3. **Contexts** - Atualizar contexts para usar APIs reais
4. **Componentes** - Implementar componentes por ordem de prioridade
5. **Integração** - Conectar tudo e testar fluxos completos

---

## 🎯 CRITÉRIOS DE SUCESSO

### **Funcionalidades Obrigatórias:**
- [ ] Admin pode criar/editar/deletar planos
- [ ] Usuários podem ver seu plano atual e limites
- [ ] Sistema de upgrade funcional
- [ ] Gestão completa de workspaces baseada em planos
- [ ] Sistema de convites e gestão de membros
- [ ] Permissões granulares por workspace
- [ ] Controles de limite baseados no plano

### **Experiência do Usuário:**
- [ ] Interface intuitiva para gestão de equipes
- [ ] Feedback claro sobre limites atingidos
- [ ] Processo de upgrade fluido
- [ ] Gestão de permissões visual e fácil

### **Performance e Segurança:**
- [ ] APIs otimizadas com paginação
- [ ] Validação de permissões no backend
- [ ] Controle de acesso robusto
- [ ] Logs de auditoria para ações críticas

---

**📝 Este documento será atualizado conforme o progresso da implementação.** 