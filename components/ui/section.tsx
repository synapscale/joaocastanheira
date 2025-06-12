"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "../../lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

/**
 * Propriedades do componente Section
 */
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Título da seção
   * @example <Section title="Informações do Usuário" />
   */
  title?: React.ReactNode

  /**
   * Descrição da seção, exibida abaixo do título
   * @example <Section description="Preencha os dados do seu perfil" />
   */
  description?: React.ReactNode

  /**
   * Actions to be displayed in the header
   * @example <Section actions={<Button>Save</Button>} />
   */
  actions?: React.ReactNode

  /**
   * Classe CSS adicional para o título
   * @example <Section titleClassName="text-primary" />
   */
  titleClassName?: string

  /**
   * Classe CSS adicional para a descrição
   * @example <Section descriptionClassName="italic" />
   */
  descriptionClassName?: string

  /**
   * Classe CSS adicional para o conteúdo
   * @example <Section contentClassName="grid grid-cols-2 gap-4" />
   */
  contentClassName?: string

  /**
   * Classe CSS adicional para o cabeçalho (título + descrição + headerRight)
   * @example <Section headerClassName="border-b pb-2" />
   */
  headerClassName?: string

  /**
   * Conteúdo a ser exibido no lado direito do cabeçalho
   * @example <Section headerRight={<Button>Adicionar</Button>} />
   */
  headerRight?: React.ReactNode

  /**
   * Se verdadeiro, adiciona uma borda ao redor da seção
   * @default false
   * @example <Section bordered />
   */
  bordered?: boolean

  /**
   * Se verdadeiro, adiciona um preenchimento interno à seção
   * @default false
   * @example <Section padded />
   */
  padded?: boolean

  /**
   * Nível do título (h1, h2, h3, etc.)
   * @default "h2"
   * @example <Section titleAs="h3" />
   */
  titleAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

  /**
   * ID para o título, útil para acessibilidade
   * @example <Section titleId="user-info-title" />
   */
  titleId?: string

  /**
   * Se verdadeiro, remove o espaçamento entre o título e o conteúdo
   * @default false
   * @example <Section noTitleGap />
   */
  noTitleGap?: boolean

  /**
   * Conteúdo da seção
   * @example <Section>Conteúdo da seção</Section>
   */
  children: React.ReactNode

  /**
   * Se verdadeiro, adiciona uma sombra à seção
   * @default false
   * @example <Section shadowed />
   */
  shadowed?: boolean

  /**
   * Tamanho do arredondamento das bordas
   * @default "lg"
   * @example <Section borderRadius="none" />
   */
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"

  /**
   * Cor de fundo da seção
   * @example <Section backgroundColor="bg-gray-50" />
   */
  backgroundColor?: string

  /**
   * Largura máxima da seção
   * @example <Section maxWidth="max-w-3xl" />
   */
  maxWidth?: string

  /**
   * Alinhamento horizontal da seção
   * @default "left"
   * @example <Section horizontalAlignment="center" />
   */
  horizontalAlignment?: "left" | "center" | "right"

  /**
   * Se verdadeiro, torna a seção colapsável
   * @default false
   * @example <Section collapsible initialCollapsed={false} />
   */
  collapsible?: boolean

  /**
   * Estado inicial da seção colapsável
   * @default false
   * @example <Section collapsible initialCollapsed={true} />
   */
  initialCollapsed?: boolean

  /**
   * Função chamada quando o estado de colapso muda
   * @example <Section collapsible onCollapseChange={(collapsed) => console.log(collapsed)} />
   */
  onCollapseChange?: (collapsed: boolean) => void

  /**
   * Se verdadeiro, adiciona uma linha divisória após o título
   * @default false
   * @example <Section divider />
   */
  divider?: boolean

  /**
   * Estilo da linha divisória
   * @default "solid"
   * @example <Section divider dividerStyle="dashed" />
   */
  dividerStyle?: "solid" | "dashed" | "dotted"

  /**
   * Cor da linha divisória
   * @example <Section divider dividerColor="border-gray-300" />
   */
  dividerColor?: string

  /**
   * Test ID for testing purposes
   * @example <Section testId="section-1" />
   */
  testId?: string

  /**
   * Default collapsed state for collapsible sections
   * @default false
   * @example <Section collapsible defaultCollapsed={true} />
   */
  defaultCollapsed?: boolean

  /**
   * Callback function when the section is collapsed or expanded
   * @example <Section collapsible onToggleCollapse={(collapsed) => console.log(collapsed)} />
   */
  onToggleCollapse?: (collapsed: boolean) => void
}

/**
 * Section component
 *
 * A container for grouping related content with an optional title, description,
 * and actions. Can be made collapsible.
 *
 * @example
 * \`\`\`tsx
 * <Section
 *   title="User Information"
 *   description="Enter your personal details below"
 *   actions={<Button>Save</Button>}
 *   collapsible
 * >
 *   <form>...</form>
 * </Section>
 * \`\`\`
 */
export const Section: React.FC<SectionProps> = ({
  className,
  children,
  title,
  description,
  actions,
  collapsible = false,
  defaultCollapsed = false,
  onToggleCollapse,
  testId,
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onToggleCollapse?.(newState)
  }

  return (
    <section className={cn("rounded-lg border border-gray-200", className)} data-testid={testId} {...props}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            {title && <h2 className="text-lg font-medium text-gray-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          <div className="flex items-center space-x-2">
            {actions}
            {collapsible && (
              <button
                type="button"
                onClick={handleToggle}
                className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-600"
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? "Expand section" : "Collapse section"}
              >
                {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      )}
      <div className={cn("p-4", isCollapsed && collapsible ? "hidden" : "block")}>{children}</div>
    </section>
  )
}
