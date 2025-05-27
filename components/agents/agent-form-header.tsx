"use client"

import Link from "next/link"
import type React from "react"
import { ArrowLeft, Save, LayoutTemplateIcon as Templates } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AgentFormHeaderProps } from "@/types/component-params"

/**
 * Header component for the agent form
 *
 * This component displays the header of the agent form, including the back button,
 * title, and action buttons (templates and submit).
 *
 * @example
 * ```tsx
 * <AgentFormHeader
 *   isNewAgent={true}
 *   isSubmitting={false}
 *   onSubmit={handleSubmit}
 *   onOpenTemplates={openTemplatesModal}
 *   isValid={isFormValid}
 *   title="Create New Assistant"
 * />
 * ```
 *
 * @param props - Component properties
 * @returns React component
 */
export function AgentFormHeader({
  // Required props
  isNewAgent,
  isSubmitting,
  onSubmit,
  onOpenTemplates,
  isValid,

  // Optional props with defaults
  title,
  backUrl = "/agentes",
  backText = "Voltar",
  createButtonText = "Criar Agente",
  saveButtonText = "Salvar Alterações",
  templatesButtonText = "Templates",
  headerContent,
  className,
  hideTemplatesButton = false,
  hideBackButton = false,
  onBack,

  // Accessibility props
  id,
  testId,
  ariaLabel,
}: AgentFormHeaderProps) {
  const submitButtonText = isNewAgent ? createButtonText : saveButtonText
  const headerTitle = title || (isNewAgent ? "Novo Agente" : "Editar Agente")

  const handleBack = (e: React.MouseEvent) => {
    if (onBack) {
      onBack(e)
    }
  }

  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between p-3 sm:p-4 md:p-6 bg-white border-b sticky top-0 z-10 gap-2 sm:gap-0",
        className,
      )}
      id={id}
      data-testid={testId}
      aria-label={ariaLabel || "Form header"}
    >
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto mb-2 sm:mb-0">
        {!hideBackButton && (
          <>
            {onBack ? (
              <button
                onClick={handleBack}
                className="flex items-center text-gray-500 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md p-1"
                aria-label={backText}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1" aria-hidden="true" />
                <span className="text-sm sm:text-base">{backText}</span>
              </button>
            ) : (
              <Link
                href={backUrl}
                className="flex items-center text-gray-500 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md p-1"
                aria-label={backText}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1" aria-hidden="true" />
                <span className="text-sm sm:text-base">{backText}</span>
              </Link>
            )}
            <div className="w-px h-5 sm:h-6 bg-gray-200" aria-hidden="true"></div>
          </>
        )}

        <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{headerTitle}</h1>

        {headerContent && <div className="ml-2">{headerContent}</div>}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {!hideTemplatesButton && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-1 text-gray-600 h-8 sm:h-9"
              onClick={onOpenTemplates}
              aria-label={`Abrir ${templatesButtonText.toLowerCase()}`}
              disabled={isSubmitting}
            >
              <Templates className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              <span className="text-xs sm:text-sm">{templatesButtonText}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="sm:hidden flex items-center justify-center w-9 h-9 p-0"
              onClick={onOpenTemplates}
              aria-label={`Abrir ${templatesButtonText.toLowerCase()}`}
              disabled={isSubmitting}
            >
              <Templates className="h-4 w-4" aria-hidden="true" />
            </Button>
          </>
        )}

        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !isValid}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-3 sm:px-4 h-9 text-xs sm:text-sm shadow-sm"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="sr-only sm:not-sr-only">Salvando...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" aria-hidden="true" />
              {submitButtonText}
            </>
          )}
        </Button>
      </div>
    </header>
  )
}
