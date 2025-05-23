"use client"

import type React from "react"

import { useMarketplace } from "@/context/marketplace-context"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Users, FileCode, Star } from "lucide-react"

/**
 * Componente que exibe estatísticas do marketplace.
 * Mostra informações como total de templates, downloads, usuários e categoria mais popular.
 */
export function MarketplaceStats() {
  const { stats, isLoading } = useMarketplace()

  // Estado de carregamento
  if (isLoading || !stats) {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-busy="true"
        aria-label="Carregando estatísticas"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div
                className="h-16 bg-muted animate-pulse rounded-md"
                role="status"
                aria-label="Carregando estatística"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      role="region"
      aria-label="Estatísticas do marketplace"
    >
      <StatCard
        title="Total de Templates"
        value={stats.totalTemplates.toLocaleString()}
        icon={<FileCode className="h-5 w-5" />}
        color="text-blue-500"
        bgColor="bg-blue-100 dark:bg-blue-950"
        description="Número total de templates disponíveis no marketplace"
      />

      <StatCard
        title="Total de Downloads"
        value={stats.totalDownloads.toLocaleString()}
        icon={<Download className="h-5 w-5" />}
        color="text-green-500"
        bgColor="bg-green-100 dark:bg-green-950"
        description="Número total de downloads de todos os templates"
      />

      <StatCard
        title="Usuários na Comunidade"
        value={stats.totalUsers.toLocaleString()}
        icon={<Users className="h-5 w-5" />}
        color="text-purple-500"
        bgColor="bg-purple-100 dark:bg-purple-950"
        description="Número total de usuários registrados no marketplace"
      />

      <StatCard
        title="Categoria Principal"
        value={stats.popularCategories[0]?.name || "Nenhuma"}
        icon={<Star className="h-5 w-5" />}
        color="text-amber-500"
        bgColor="bg-amber-100 dark:bg-amber-950"
        description="Categoria mais popular no marketplace"
      />
    </div>
  )
}

/**
 * Props para o componente StatCard.
 */
interface StatCardProps {
  /** Título da estatística */
  title: string
  /** Valor da estatística */
  value: string
  /** Ícone a ser exibido */
  icon: React.ReactNode
  /** Cor do ícone */
  color: string
  /** Cor de fundo do ícone */
  bgColor: string
  /** Descrição para acessibilidade */
  description?: string
}

/**
 * Componente que exibe um card de estatística.
 *
 * @param props - Propriedades do componente
 * @param props.title - Título da estatística
 * @param props.value - Valor da estatística
 * @param props.icon - Ícone a ser exibido
 * @param props.color - Cor do ícone
 * @param props.bgColor - Cor de fundo do ícone
 * @param props.description - Descrição para acessibilidade
 */
function StatCard({ title, value, icon, color, bgColor, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between" title={description}>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h4 className="text-2xl font-bold mt-1">{value}</h4>
          </div>
          <div className={`p-3 rounded-full ${bgColor}`} aria-hidden="true">
            <div className={color}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
