"use client"

/**
 * UNIFIED SIDEBAR - OTIMIZADO
 *
 * Sidebar unificado otimizado com componentes base reutilizáveis.
 * Mantém aparência visual idêntica enquanto melhora a arquitetura.
 */

import { NavigationSectionBase } from "@/components/ui/base/navigation-section"
import { NavigationUtils } from "@/config/navigation-config"

/**
 * Props para UnifiedSidebar
 */
interface UnifiedSidebarProps {
  /** Variante visual dos itens */
  itemVariant?: "default" | "compact" | "minimal"
  /** Se deve mostrar ferramentas de desenvolvimento */
  showDevelopmentTools?: boolean
  /** Se deve mostrar badges nos itens */
  showBadges?: boolean
  /** Se deve mostrar tooltips nos itens */
  showTooltips?: boolean
  /** Classe CSS adicional */
  className?: string
}

/**
 * UnifiedSidebar - Componente de sidebar otimizado
 *
 * Versão otimizada do sidebar usando componentes base reutilizáveis.
 * Mantém funcionalidade e aparência visual idênticas ao original.
 *
 * Melhorias implementadas:
 * - Uso de componentes base para reduzir duplicação
 * - Configuração centralizada e tipada
 * - Hook personalizado para lógica de navegação
 * - Separação clara de responsabilidades
 * - Suporte a props para customização
 */
export function UnifiedSidebar({
  itemVariant = "default",
  showDevelopmentTools,
  showBadges = true,
  showTooltips = true,
  className,
}: UnifiedSidebarProps = {}) {
  // Determina se deve mostrar ferramentas de desenvolvimento
  const shouldShowDevTools = showDevelopmentTools ?? NavigationUtils.shouldShowDevelopmentTools()

  /**
   * Renderiza seção de ferramentas de desenvolvimento
   * Condicional baseada no ambiente
   */
  const renderDevelopmentSection = () => {
    if (!shouldShowDevTools) {
      return null
    }

    const developmentConfig = NavigationUtils.getDevelopmentConfig()

    return (
      <div className="mt-auto pt-4 border-t border-border">
        <NavigationSectionBase
          section={developmentConfig}
          sectionKey="development"
          itemVariant={itemVariant}
          showBadges={showBadges}
          showTooltips={showTooltips}
        />
      </div>
    )
  }

  return (
    <aside
      className={`flex flex-col h-full space-y-2 ${className || ""}`}
      role="complementary"
      aria-label="Main application navigation"
    >
      {/* Seções principais de navegação */}
      {NavigationUtils.getAllSections().map(([sectionKey, sectionConfig]) => (
        <NavigationSectionBase
          key={sectionKey}
          section={sectionConfig}
          sectionKey={sectionKey}
          itemVariant={itemVariant}
          showBadges={showBadges}
          showTooltips={showTooltips}
        />
      ))}

      {/* Seção de ferramentas de desenvolvimento (condicional) */}
      {renderDevelopmentSection()}
    </aside>
  )
}

/**
 * Variantes pré-configuradas para casos comuns
 */
export const SidebarVariants = {
  /**
   * Sidebar padrão com todas as funcionalidades
   */
  Default: () => <UnifiedSidebar />,

  /**
   * Sidebar compacto para espaços reduzidos
   */
  Compact: () => <UnifiedSidebar itemVariant="compact" showBadges={false} />,

  /**
   * Sidebar mínimo para interfaces simplificadas
   */
  Minimal: () => <UnifiedSidebar itemVariant="minimal" showBadges={false} showTooltips={false} />,

  /**
   * Sidebar para desenvolvimento com ferramentas visíveis
   */
  Development: () => <UnifiedSidebar showDevelopmentTools={true} />,
} as const
