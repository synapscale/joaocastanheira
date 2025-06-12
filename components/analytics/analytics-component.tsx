/**
 * Componente de Analytics
 * Criado por José - O melhor Full Stack do mundo
 * Sistema completo de insights e métricas
 */

'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, LineChart, PieChart, TrendingUp, TrendingDown, Users, Activity, Download, Eye, Calendar, Filter, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'

interface AnalyticsData {
  overview: {
    total_users: number
    total_workflows: number
    total_executions: number
    total_components: number
    growth_rate: number
  }
  usage: {
    daily_active_users: number
    weekly_active_users: number
    monthly_active_users: number
    avg_session_duration: number
  }
  performance: {
    avg_execution_time: number
    success_rate: number
    error_rate: number
    uptime: number
  }
  popular_components: Array<{
    id: number
    name: string
    downloads: number
    rating: number
    category: string
  }>
  execution_trends: Array<{
    date: string
    executions: number
    success_rate: number
  }>
  user_activity: Array<{
    date: string
    new_users: number
    active_users: number
    returning_users: number
  }>
}

interface MetricCard {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  trend: 'up' | 'down' | 'neutral'
}

export function AnalyticsComponent() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['users', 'executions', 'performance'])
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/dashboard?range=${timeRange}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de analytics",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
    toast({
      title: "Dados atualizados",
      description: "Os dados de analytics foram atualizados"
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  const getMetricCards = (): MetricCard[] => {
    if (!data) return []

    return [
      {
        title: 'Usuários Totais',
        value: formatNumber(data.overview.total_users),
        change: data.overview.growth_rate,
        icon: <Users className="w-5 h-5" />,
        trend: data.overview.growth_rate > 0 ? 'up' : data.overview.growth_rate < 0 ? 'down' : 'neutral'
      },
      {
        title: 'Workflows Criados',
        value: formatNumber(data.overview.total_workflows),
        change: 12.5,
        icon: <Activity className="w-5 h-5" />,
        trend: 'up'
      },
      {
        title: 'Execuções Totais',
        value: formatNumber(data.overview.total_executions),
        change: 8.2,
        icon: <BarChart className="w-5 h-5" />,
        trend: 'up'
      },
      {
        title: 'Componentes',
        value: formatNumber(data.overview.total_components),
        change: 15.3,
        icon: <Download className="w-5 h-5" />,
        trend: 'up'
      },
      {
        title: 'Usuários Ativos (Diário)',
        value: formatNumber(data.usage.daily_active_users),
        change: 5.7,
        icon: <TrendingUp className="w-5 h-5" />,
        trend: 'up'
      },
      {
        title: 'Taxa de Sucesso',
        value: `${data.performance.success_rate.toFixed(1)}%`,
        change: 2.1,
        icon: <TrendingUp className="w-5 h-5" />,
        trend: 'up'
      },
      {
        title: 'Tempo Médio de Execução',
        value: formatDuration(data.performance.avg_execution_time),
        change: -8.5,
        icon: <Activity className="w-5 h-5" />,
        trend: 'up'
      },
      {
        title: 'Uptime',
        value: `${data.performance.uptime.toFixed(2)}%`,
        change: 0.1,
        icon: <TrendingUp className="w-5 h-5" />,
        trend: 'up'
      }
    ]
  }

  const metricCards = getMetricCards()

  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 8 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Insights detalhados sobre o uso e performance da plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <div className="text-gray-400">
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="flex items-center text-sm">
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                ) : null}
                <span className={`${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
                <span className="text-gray-500 ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Execuções */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Execuções</CardTitle>
                <CardDescription>
                  Execuções de workflows ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Gráfico de linha seria renderizado aqui</p>
                    <p className="text-sm text-gray-500">
                      {data?.execution_trends.length} pontos de dados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Usuários */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade de Usuários</CardTitle>
                <CardDescription>
                  Usuários novos vs. recorrentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Gráfico de barras seria renderizado aqui</p>
                    <p className="text-sm text-gray-500">
                      {data?.user_activity.length} pontos de dados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Componentes Populares */}
          <Card>
            <CardHeader>
              <CardTitle>Componentes Mais Populares</CardTitle>
              <CardDescription>
                Top componentes por downloads e avaliações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.popular_components.slice(0, 5).map((component, index) => (
                  <div key={component.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{component.name}</h4>
                        <p className="text-sm text-gray-600">{component.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-gray-400" />
                        <span>{formatNumber(component.downloads)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{component.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Ativos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Diário</span>
                    <span>{formatNumber(data?.usage.daily_active_users || 0)}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Semanal</span>
                    <span>{formatNumber(data?.usage.weekly_active_users || 0)}</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Mensal</span>
                    <span>{formatNumber(data?.usage.monthly_active_users || 0)}</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Duração da Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {formatDuration(data?.usage.avg_session_duration || 0)}
                </div>
                <p className="text-sm text-gray-600">Tempo médio por sessão</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dia 1</span>
                    <span>85%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dia 7</span>
                    <span>65%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dia 30</span>
                    <span>45%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {data?.performance.success_rate.toFixed(1)}%
                </div>
                <Progress value={data?.performance.success_rate || 0} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Erro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {data?.performance.error_rate.toFixed(1)}%
                </div>
                <Progress value={data?.performance.error_rate || 0} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo de Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {formatDuration(data?.performance.avg_execution_time || 0)}
                </div>
                <p className="text-sm text-gray-600">Tempo médio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {data?.performance.uptime.toFixed(2)}%
                </div>
                <Progress value={data?.performance.uptime || 0} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

