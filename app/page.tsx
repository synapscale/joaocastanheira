"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  BarChart3,
  Bot,
  Briefcase,
  Clock,
  FileText,
  Layers,
  Plus,
  Settings,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Dashboard configuration
const DASHBOARD_STATS = {
  totalAgents: { value: 12, change: "+2", period: "desde o mês passado", icon: Bot },
  activeWorkflows: { value: 8, change: "+1", period: "desde ontem", icon: Activity },
  completedTasks: { value: 156, change: "+12", period: "hoje", icon: Zap },
  successRate: { value: 94, change: "+2%", period: "desde a semana passada", icon: TrendingUp },
} as const

const QUICK_ACTIONS = [
  {
    title: "Novo Canvas",
    description: "Criar um novo fluxo de trabalho",
    icon: Layers,
    href: "/canvas",
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    title: "Marketplace",
    description: "Explorar agentes e templates",
    icon: Bot,
    href: "/marketplace",
    gradient: "from-purple-500 to-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    title: "Configurações",
    description: "Gerenciar preferências",
    icon: Settings,
    href: "/settings",
    gradient: "from-green-500 to-green-600",
    bg: "bg-green-50 dark:bg-green-950/20",
  },
] as const

const PROJECT_STATUS = {
  active: { label: "Ativo", class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" },
  completed: { label: "Concluído", class: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" },
  "in-progress": {
    label: "Em Progresso",
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  },
} as const

const CATEGORY_ICONS = {
  marketing: TrendingUp,
  ai: Sparkles,
  analytics: BarChart3,
  default: FileText,
} as const

interface ProjectData {
  id: string
  name: string
  description: string
  progress: number
  status: keyof typeof PROJECT_STATUS
  lastModified: string
  category: keyof typeof CATEGORY_ICONS | string
}

export default function HomePage() {
  const [recentProjects] = useState<ProjectData[]>([
    {
      id: "1",
      name: "Automação de E-mail Marketing",
      description: "Workflow para campanhas automatizadas",
      progress: 85,
      status: "active",
      lastModified: "2 horas atrás",
      category: "marketing",
    },
    {
      id: "2",
      name: "Análise de Sentimentos",
      description: "IA para análise de feedback de clientes",
      progress: 100,
      status: "completed",
      lastModified: "1 dia atrás",
      category: "ai",
    },
    {
      id: "3",
      name: "Dashboard de Vendas",
      description: "Visualização de dados em tempo real",
      progress: 60,
      status: "in-progress",
      lastModified: "3 horas atrás",
      category: "analytics",
    },
  ])

  const renderStatCard = (
    key: keyof typeof DASHBOARD_STATS,
    stat: (typeof DASHBOARD_STATS)[keyof typeof DASHBOARD_STATS],
  ) => {
    const IconComponent = stat.icon
    const titles = {
      totalAgents: "Total de Agentes",
      activeWorkflows: "Workflows Ativos",
      completedTasks: "Tarefas Concluídas",
      successRate: "Taxa de Sucesso",
    }

    return (
      <Card key={key}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{titles[key]}</CardTitle>
          <IconComponent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stat.value}
            {key === "successRate" ? "%" : ""}
          </div>
          <p className="text-xs text-muted-foreground">
            {stat.change} {stat.period}
          </p>
        </CardContent>
      </Card>
    )
  }

  const renderQuickAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    const IconComponent = action.icon

    return (
      <Link key={action.title} href={action.href}>
        <div
          className={cn(
            "flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer hover:scale-[1.02]",
            action.bg,
          )}
        >
          <div className={cn("p-2 rounded-lg bg-gradient-to-br", action.gradient)}>
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{action.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{action.description}</p>
          </div>
        </div>
      </Link>
    )
  }

  const renderProject = (project: ProjectData, index: number) => {
    const CategoryIcon = CATEGORY_ICONS[project.category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default
    const status = PROJECT_STATUS[project.status]

    return (
      <div key={project.id}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded-lg flex-shrink-0">
            <CategoryIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{project.name}</h3>
              <Badge variant="secondary" className={status.class}>
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{project.description}</p>
            <div className="flex items-center gap-2 mb-2">
              <Progress value={project.progress} className="flex-1 h-2" />
              <span className="text-xs font-medium flex-shrink-0">{project.progress}%</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {project.lastModified}
            </div>
          </div>
        </div>
        {index < recentProjects.length - 1 && <Separator className="my-4" />}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está um resumo da sua atividade.</p>
        </div>
        <Button asChild>
          <Link href="/canvas">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Link>
        </Button>
      </header>

      {/* Statistics */}
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(DASHBOARD_STATS).map(([key, stat]) =>
            renderStatCard(key as keyof typeof DASHBOARD_STATS, stat),
          )}
        </div>
      </section>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <section className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">{QUICK_ACTIONS.map(renderQuickAction)}</CardContent>
          </Card>
        </section>

        {/* Recent projects */}
        <section className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Projetos Recentes
              </CardTitle>
              <CardDescription>Seus projetos mais recentes e seu progresso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">{recentProjects.map(renderProject)}</div>
              <div className="mt-6 pt-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/canvas">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Novo Projeto
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
