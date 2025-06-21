# 🛠️ MAPA TÉCNICO DE IMPLEMENTAÇÃO

## 📋 LISTA DE ARQUIVOS A CRIAR/MODIFICAR

### **BACKEND - APIs Necessárias**
```
backend/
├── models/
│   ├── plan.py                 # ✅ Modelo de planos
│   ├── subscription.py         # ✅ Modelo de assinaturas  
│   └── billing.py              # ✅ Modelo de cobrança
├── routers/
│   ├── admin/
│   │   ├── __init__.py
│   │   ├── plans.py            # 🆕 Admin - Gestão de planos
│   │   └── customers.py        # 🆕 Admin - Gestão de clientes
│   ├── billing.py              # 🆕 Billing - Assinaturas e cobrança
│   └── workspaces.py           # 🔄 Expandir endpoints existentes
└── services/
    ├── plan_service.py         # 🆕 Lógica de negócio de planos
    ├── billing_service.py      # 🆕 Lógica de cobrança
    └── permission_service.py   # 🆕 Validação de permissões
```

### **FRONTEND - Componentes e Estrutura**
```
frontend/
├── components/
│   ├── team/                   # 🆕 Pasta para componentes da página /team
│   │   ├── workspace-management-tab.tsx
│   │   ├── member-management-tab.tsx
│   │   ├── permission-management-tab.tsx
│   │   ├── billing-management-tab.tsx
│   │   └── settings-tab.tsx
│   ├── common/                 # 🆕 Componentes reutilizáveis
│   │   ├── permission-gate.tsx
│   │   ├── upgrade-prompt.tsx
│   │   └── plan-limits-display.tsx
│   └── admin/
│       └── plan-management.tsx # 🔄 Corrigir APIs inexistentes
├── hooks/
│   ├── use-permissions.ts      # 🆕 Hook de permissões
│   ├── use-billing.ts          # 🆕 Hook de cobrança
│   └── use-plan-limits.ts      # 🆕 Hook de limites de planos
├── types/
│   ├── permissions.ts          # 🆕 Tipos de permissões
│   └── billing.ts              # 🆕 Tipos de cobrança
├── middleware/
│   └── plan-validation.ts      # 🆕 Validação de limites
└── context/
    └── plan-context.tsx        # 🔄 Remover mocks, usar APIs reais
```

---

## 🔧 IMPLEMENTAÇÃO POR FASES

### **FASE 1: Backend Critical (Semana 1-2)**

#### 1. Criar Endpoints Admin Plans
**Arquivo:** `backend/routers/admin/plans.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.plan import Plan, PlanCreate, PlanUpdate
from ..services.plan_service import PlanService
from ..auth import get_current_admin_user

router = APIRouter(prefix="/admin/plans", tags=["admin-plans"])

@router.get("/", response_model=List[Plan])
async def list_plans(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    return PlanService.get_plans(db, skip=skip, limit=limit)

@router.post("/", response_model=Plan)
async def create_plan(
    plan: PlanCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    return PlanService.create_plan(db, plan)

@router.put("/{plan_id}", response_model=Plan)
async def update_plan(
    plan_id: str,
    plan: PlanUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    return PlanService.update_plan(db, plan_id, plan)
```

#### 2. Expandir API Service Frontend
**Arquivo:** `lib/api/service.ts`

```typescript
// Adicionar métodos de admin
async getPlans(): Promise<Plan[]> {
  return await this.get<Plan[]>('/admin/plans/')
}

async createPlan(plan: PlanFormData): Promise<Plan> {
  return await this.post<Plan>('/admin/plans/', plan)
}

async updatePlan(id: string, plan: PlanFormData): Promise<Plan> {
  return await this.put<Plan>(`/admin/plans/${id}`, plan)
}

async deletePlan(id: string): Promise<void> {
  await this.delete(`/admin/plans/${id}`)
}

// Métodos de billing
async getBillingInfo(): Promise<BillingInfo> {
  return await this.get<BillingInfo>('/billing/subscription')
}

async upgradePlan(planId: string): Promise<Subscription> {
  return await this.post<Subscription>('/billing/upgrade', { plan_id: planId })
}
```

### **FASE 2: Frontend Core (Semana 3)**

#### 1. Corrigir Plan Context
**Arquivo:** `context/plan-context.tsx`

```typescript
'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiService } from '@/lib/api/service'
import type { Plan, Subscription, BillingInfo } from '@/types/plan-types'

export function PlanProvider({ children }: PlanProviderProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [plansData, billingData] = await Promise.all([
        apiService.getPlans(),
        apiService.getBillingInfo()
      ])
      
      setPlans(plansData)
      setCurrentPlan(billingData.subscription.plan)
      setSubscription(billingData.subscription)
    } catch (error) {
      console.error('Error loading plan data:', error)
    } finally {
      setLoading(false)
    }
  }

  // ... resto da implementação
}
```

#### 2. Criar Hook de Permissões
**Arquivo:** `hooks/use-permissions.ts`

```typescript
import { usePlan } from '@/context/plan-context'
import { useAuth } from '@/context/auth-context'

export function usePermissions() {
  const { currentPlan } = usePlan()
  const { user } = useAuth()

  const hasPermission = (permission: string, workspaceId?: string): boolean => {
    if (!user || !currentPlan) return false

    // Verificar se é admin do sistema
    if (user.role === 'admin') return true

    // Verificar permissões baseadas no plano
    switch (permission) {
      case 'workspace.create':
        return currentPlan.limits.max_workspaces > 0
      case 'members.invite':
        return currentPlan.limits.max_members_per_workspace > 0
      case 'custom_roles.create':
        return currentPlan.limits.can_create_custom_roles
      // ... outras permissões
      default:
        return false
    }
  }

  const hasFeature = (feature: keyof PlanLimits): boolean => {
    if (!currentPlan) return false
    return currentPlan.limits[feature] === true
  }

  return { hasPermission, hasFeature }
}
```

### **FASE 3: Componentes UI (Semana 4)**

#### 1. Expandir Página Team
**Arquivo:** `app/team/page.tsx`

```typescript
import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WorkspaceManagementTab from '@/components/team/workspace-management-tab'
import MemberManagementTab from '@/components/team/member-management-tab'
import BillingManagementTab from '@/components/team/billing-management-tab'
import PermissionManagementTab from '@/components/team/permission-management-tab'
import SettingsTab from '@/components/team/settings-tab'

export default function TeamPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="border-b">
        <h1 className="text-3xl font-bold">Gerenciamento de Equipe</h1>
        <p className="text-muted-foreground">
          Gerencie workspaces, membros, permissões e configurações
        </p>
      </div>

      <Tabs defaultValue="workspaces" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
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

#### 2. Criar Componente Permission Gate
**Arquivo:** `components/common/permission-gate.tsx`

```typescript
import { usePermissions } from '@/hooks/use-permissions'
import { UpgradePrompt } from './upgrade-prompt'

interface PermissionGateProps {
  permission: string
  workspaceId?: string
  showUpgradePrompt?: boolean
  upgradeMessage?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({ 
  permission, 
  workspaceId, 
  showUpgradePrompt = true,
  upgradeMessage,
  fallback, 
  children 
}: PermissionGateProps) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission, workspaceId)) {
    if (showUpgradePrompt) {
      return (
        <UpgradePrompt 
          feature={upgradeMessage || `Esta funcionalidade`}
          currentPlan="free"
          requiredPlan="pro"
        />
      )
    }
    return fallback || null
  }

  return <>{children}</>
}
```

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### **1. Começar pelo Backend (Prioridade Máxima)**
```bash
# Criar estrutura de pastas
mkdir -p backend/routers/admin
mkdir -p backend/services
mkdir -p backend/models

# Implementar endpoints um por vez
# 1. Plans admin endpoints
# 2. Billing endpoints  
# 3. Expandir workspace endpoints
```

### **2. Corrigir ApiService**
```typescript
// lib/api/service.ts - Adicionar métodos faltantes
// Testar cada endpoint conforme implementado no backend
```

### **3. Atualizar Contextos**
```typescript
// context/plan-context.tsx - Remover mocks
// Integrar com APIs reais
```

### **4. Implementar Componentes**
```typescript
// Criar componentes das abas um por vez
// Começar com WorkspaceManagementTab (mais simples)
// Depois BillingManagementTab (mais complexo)
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### **Backend**
- [ ] Endpoints `/admin/plans/` funcionando
- [ ] Endpoints `/admin/customers/` funcionando
- [ ] Endpoints `/billing/` funcionando
- [ ] Expansão endpoints workspaces
- [ ] Validação de permissões no backend
- [ ] Testes de API

### **Frontend**
- [ ] ApiService atualizado e funcionando
- [ ] PlanContext usando APIs reais
- [ ] Hooks de permissões implementados
- [ ] Componentes das abas funcionando
- [ ] Permission Gate funcionando
- [ ] Upgrade Prompts funcionando

### **Integração**
- [ ] Fluxo completo de criação de workspace
- [ ] Fluxo completo de convite de membros
- [ ] Fluxo completo de upgrade de plano
- [ ] Validação de limites funcionando
- [ ] Controle de acesso funcionando

---

**🔄 Este documento será atualizado conforme implementação progride.** 