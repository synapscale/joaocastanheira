"use client"
import { useState } from "react"
import { Section } from "../ui/section"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../../lib/utils"
import { InputField } from "../form/input-field"

/**
 * Component for the parameters tab of the agent form
 */
export function AgentParametersTab({
  // Required props
  maxTokens,
  temperature,
  topP,
  frequencyPenalty,
  presencePenalty,
  userDecision,
  onChangeMaxTokens,
  onChangeTemperature,
  onChangeTopP,
  onChangeFrequencyPenalty,
  onChangePresencePenalty,
  onChangeUserDecision,
  onBlurMaxTokens,
  onBlurTemperature,
  onBlurTopP,
  onBlurFrequencyPenalty,
  onBlurPresencePenalty,

  // Optional props with defaults
  maxTokensError,
  temperatureError,
  topPError,
  frequencyPenaltyError,
  presencePenaltyError,
  showAdvancedOptions = true,
  advancedOptionsDefaultOpen = false,

  // Accessibility props
  className,
  id,
  testId,
  ariaLabel,
}) {
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(advancedOptionsDefaultOpen)

  const toggleAdvancedOptions = () => {
    setAdvancedOptionsOpen(!advancedOptionsOpen)
  }

  const componentId = id || "agent-parameters-tab"

  return (
    <div className={className} id={componentId} data-testid={testId} aria-label={ariaLabel || "Parâmetros do modelo"}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          id={`${componentId}-max-tokens`}
          label="Máximo de Tokens"
          name="maxTokens"
          type="number"
          value={maxTokens}
          onChange={onChangeMaxTokens}
          onBlur={onBlurMaxTokens}
          error={maxTokensError}
          helperText="Número máximo de tokens a serem gerados"
          aria-describedby={maxTokensError ? `${componentId}-max-tokens-error` : undefined}
        />

        <InputField
          id={`${componentId}-temperature`}
          label="Temperatura"
          name="temperature"
          type="number"
          step="0.1"
          value={temperature}
          onChange={onChangeTemperature}
          onBlur={onBlurTemperature}
          error={temperatureError}
          helperText="Controla a aleatoriedade (0-2)"
          aria-describedby={temperatureError ? `${componentId}-temperature-error` : undefined}
        />

        {(!showAdvancedOptions || advancedOptionsOpen) && (
          <>
            <InputField
              id={`${componentId}-top-p`}
              label="Top P"
              name="topP"
              type="number"
              step="0.1"
              value={topP}
              onChange={onChangeTopP}
              onBlur={onBlurTopP}
              error={topPError}
              helperText="Amostragem de núcleo (0-1)"
              aria-describedby={topPError ? `${componentId}-top-p-error` : undefined}
            />

            <InputField
              id={`${componentId}-frequency-penalty`}
              label="Penalidade de Frequência"
              name="frequencyPenalty"
              type="number"
              step="0.1"
              value={frequencyPenalty}
              onChange={onChangeFrequencyPenalty}
              onBlur={onBlurFrequencyPenalty}
              error={frequencyPenaltyError}
              helperText="Penaliza palavras frequentes (-2 a 2)"
              aria-describedby={frequencyPenaltyError ? `${componentId}-frequency-penalty-error` : undefined}
            />

            <InputField
              id={`${componentId}-presence-penalty`}
              label="Penalidade de Presença"
              name="presencePenalty"
              type="number"
              step="0.1"
              value={presencePenalty}
              onChange={onChangePresencePenalty}
              onBlur={onBlurPresencePenalty}
              error={presencePenaltyError}
              helperText="Penaliza palavras já usadas (-2 a 2)"
              aria-describedby={presencePenaltyError ? `${componentId}-presence-penalty-error` : undefined}
            />
          </>
        )}
      </div>

      {showAdvancedOptions && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleAdvancedOptions}
          className="mt-4 text-xs text-muted-foreground"
          aria-expanded={advancedOptionsOpen}
          aria-controls={`${componentId}-advanced-options`}
        >
          {advancedOptionsOpen ? (
            <>
              <ChevronUp className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Ocultar opções avançadas
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Mostrar opções avançadas
            </>
          )}
        </Button>
      )}

      <div className="mt-4 flex items-center space-x-2">
        <Switch
          id={`${componentId}-user-decision`}
          checked={userDecision}
          onCheckedChange={onChangeUserDecision}
          aria-label="Permitir que o usuário ajuste os parâmetros"
        />
        <Label htmlFor={`${componentId}-user-decision`} className={cn("text-sm", "cursor-pointer", "select-none")}>
          Permitir que o usuário ajuste os parâmetros
        </Label>
      </div>
    </div>
  )
}
