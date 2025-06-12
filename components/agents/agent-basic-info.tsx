"use client"
import { InputField } from "../form/input-field"
import { SelectField } from "../form/select-field"
import { MODEL_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS } from "../../constants/agent-constants"

/**
 * Component for the basic information section of the agent form
 *
 * This component displays and manages the basic information fields for an agent,
 * including name, type, model, description, and status.
 */
export function AgentBasicInfo({
  // Required props
  agent,
  onChange,

  // Optional props with defaults
  nameError,
  descriptionMaxLength = 200,
  nameMaxLength = 50,
  descriptionPlaceholder = "Breve descrição do agente",
  namePlaceholder = "Digite o nome do agente",

  // Accessibility props
  className,
  id,
  testId,
  ariaLabel,
}) {
  const componentId = id || "agent-basic-info"
  
  const handleChange = (field, value) => {
    onChange({
      ...agent,
      [field]: value
    });
  };

  return (
    <div
      className={className}
      id={componentId}
      data-testid={testId}
      aria-label={ariaLabel || "Informações básicas do agente"}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="w-full sm:w-1/2">
          <InputField
            id={`${componentId}-name`}
            label="Nome do Agente"
            name="name"
            value={agent.name}
            onChange={(value) => handleChange('name', value)}
            placeholder={namePlaceholder}
            required
            error={nameError}
            maxLength={nameMaxLength}
            autoFocus={true}
            aria-describedby={nameError ? `${componentId}-name-error` : undefined}
          />
        </div>

        <div className="w-full sm:w-1/2 flex gap-3 sm:gap-4">
          <div className="w-1/2">
            <SelectField
              id={`${componentId}-type`}
              label="Tipo"
              name="type"
              value={agent.type}
              onChange={(value) => handleChange('type', value)}
              options={TYPE_OPTIONS}
              aria-label="Tipo do agente"
            />
          </div>

          <div className="w-1/2">
            <SelectField
              id={`${componentId}-model`}
              label="Modelo"
              name="model"
              value={agent.model}
              onChange={(value) => handleChange('model', value)}
              options={MODEL_OPTIONS}
              aria-label="Modelo do agente"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-3 sm:mt-4">
        <div className="w-full sm:w-1/2">
          <InputField
            id={`${componentId}-description`}
            label="Descrição"
            name="description"
            value={agent.description}
            onChange={(value) => handleChange('description', value)}
            placeholder={descriptionPlaceholder}
            maxLength={descriptionMaxLength}
            aria-label="Descrição do agente"
          />
        </div>

        <div className="w-full sm:w-1/2">
          <SelectField
            id={`${componentId}-status`}
            label="Status"
            name="status"
            value={agent.status}
            onChange={(value) => handleChange('status', value)}
            options={STATUS_OPTIONS}
            aria-label="Status do agente"
          />
        </div>
      </div>
    </div>
  )
}
