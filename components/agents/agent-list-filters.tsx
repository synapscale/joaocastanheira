"use client"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AgentListFiltersProps } from "@/types/component-params"

/**
 * Filters component for the agent listing page
 *
 * This component displays the filters for the agent listing page,
 * including search and status filters.
 *
 * @example
 * ```tsx
 * <AgentListFilters
 *   searchQuery={searchQuery}
 *   statusFilter={statusFilter}
 *   onSearchChange={setSearchQuery}
 *   onStatusChange={setStatusFilter}
 * />
 * ```
 *
 * @param props - Component properties
 * @returns React component
 */
export function AgentListFilters({
  // Required props
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,

  // Optional props with defaults
  searchPlaceholder = "Buscar agentes...",
  showStatusFilter = true,
  customFilters,
  onClearFilters,
  showClearFilters = true,

  // Accessibility props
  className,
  id,
  testId,
  ariaLabel,
}: AgentListFiltersProps) {
  const hasActiveFilters = searchQuery || statusFilter !== "all"
  const componentId = id || "agent-list-filters"

  return (
    <div
      className={cn("flex flex-col sm:flex-row items-center gap-4 mb-6", className)}
      id={componentId}
      data-testid={testId}
      aria-label={ariaLabel || "Filtros de agentes"}
    >
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
          aria-hidden="true"
        />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-8"
          aria-label="Buscar agentes"
          data-testid={`${componentId}-search-input`}
        />
        {searchQuery && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => onSearchChange("")}
            aria-label="Limpar busca"
            data-testid={`${componentId}-clear-search`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {showStatusFilter && (
        <Tabs
          value={statusFilter}
          onValueChange={onStatusChange}
          className="w-full sm:w-auto"
          data-testid={`${componentId}-status-tabs`}
        >
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-900"
              data-testid={`${componentId}-status-all`}
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-900"
              data-testid={`${componentId}-status-active`}
            >
              Ativos
            </TabsTrigger>
            <TabsTrigger
              value="draft"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-900"
              data-testid={`${componentId}-status-draft`}
            >
              Rascunhos
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-900"
              data-testid={`${componentId}-status-archived`}
            >
              Arquivados
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {customFilters}

      {onClearFilters && showClearFilters && hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-xs"
          aria-label="Limpar todos os filtros"
          data-testid={`${componentId}-clear-all`}
        >
          <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
