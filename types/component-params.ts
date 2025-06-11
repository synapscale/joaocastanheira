/**
 * @file Comprehensive parameter definitions for components
 *
 * This file contains detailed type definitions for component parameters,
 * including documentation, validation rules, and contextual information.
 */

import type React from "react"
import type { Agent, BadgeItem } from "./agent-types"

/**
 * Base properties that all components should support
 * @property className - CSS class to apply to the component
 * @property id - Unique identifier for the component (for accessibility and testing)
 * @property testId - Data attribute for testing purposes
 * @property ariaLabel - Accessible label for the component
 * @property ariaDescribedBy - ID of element that describes this component
 */
export interface BaseComponentProps {
  /**
   * CSS class to apply to the component.
   * Use this to override default styling or apply custom styles.
   * @example "mt-4 text-center"
   */
  className?: string

  /**
   * Unique identifier for the component.
   * Used for accessibility, form associations, and testing.
   * @example "user-profile-form"
   */
  id?: string

  /**
   * Data attribute for testing purposes.
   * Used by testing frameworks to locate components.
   * @example "user-profile-submit-button"
   */
  testId?: string

  /**
   * Accessible label for the component.
   * Used by screen readers when no visible label is present.
   * @example "Submit form"
   */
  ariaLabel?: string

  /**
   * ID of element that describes this component.
   * Creates an association with descriptive text for accessibility.
   * @example "profile-form-description"
   */
  ariaDescribedBy?: string
}

/**
 * Properties for interactive components
 * @property disabled - Whether the component is disabled
 * @property loading - Whether the component is in a loading state
 * @property onClick - Function to call when the component is clicked
 * @property onFocus - Function to call when the component receives focus
 * @property onBlur - Function to call when the component loses focus
 * @property tabIndex - Tab order of the component
 */
export interface InteractiveComponentProps extends BaseComponentProps {
  /**
   * Whether the component is disabled.
   * When true, the component cannot be interacted with and appears visually disabled.
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the component is in a loading state.
   * When true, the component displays a loading indicator and may be disabled.
   * @default false
   */
  loading?: boolean

  /**
   * Function to call when the component is clicked.
   * @param event - The click event
   */
  onClick?: (event: React.MouseEvent) => void

  /**
   * Function to call when the component receives focus.
   * @param event - The focus event
   */
  onFocus?: (event: React.FocusEvent) => void

  /**
   * Function to call when the component loses focus.
   * @param event - The blur event
   */
  onBlur?: (event: React.FocusEvent) => void

  /**
   * Tab order of the component.
   * Controls the order in which elements receive focus when tabbing.
   * @example 0
   */
  tabIndex?: number
}

/**
 * Properties for form field components
 * @property label - Label text for the field
 * @property name - Name attribute for the field
 * @property error - Error message to display
 * @property required - Whether the field is required
 * @property helperText - Additional text to help the user
 * @property labelClassName - CSS class for the label element
 * @property errorClassName - CSS class for the error message
 * @property helperTextClassName - CSS class for the helper text
 * @property hideLabel - Whether to visually hide the label (still accessible to screen readers)
 * @property headerRight - Content to display on the right side of the header
 */
export interface FormFieldProps extends BaseComponentProps {
  /**
   * Label text for the field.
   * Displayed above the field and used for accessibility.
   * @example "Email Address"
   */
  label?: string

  /**
   * Name attribute for the field.
   * Used for form submission and accessibility.
   * @example "email"
   */
  name?: string

  /**
   * Error message to display.
   * Shown when the field has an error, typically after validation.
   * @example "Please enter a valid email address"
   */
  error?: string

  /**
   * Whether the field is required.
   * Adds a visual indicator and sets the HTML required attribute.
   * @default false
   */
  required?: boolean

  /**
   * Additional text to help the user.
   * Displayed below the field to provide guidance.
   * @example "We'll never share your email with anyone else"
   */
  helperText?: string

  /**
   * CSS class for the label element.
   * Use this to override default label styling.
   * @example "text-lg font-bold"
   */
  labelClassName?: string

  /**
   * CSS class for the error message.
   * Use this to override default error styling.
   * @example "text-red-600 font-bold"
   */
  errorClassName?: string

  /**
   * CSS class for the helper text.
   * Use this to override default helper text styling.
   * @example "text-xs italic"
   */
  helperTextClassName?: string

  /**
   * Whether to visually hide the label.
   * When true, the label is still accessible to screen readers.
   * @default false
   */
  hideLabel?: boolean

  /**
   * Content to display on the right side of the header.
   * Useful for adding actions or additional information.
   * @example <Button>Reset</Button>
   */
  headerRight?: React.ReactNode
}

/**
 * Properties for the AgentFormHeader component
 * @property isNewAgent - Whether this is a new agent or an existing one
 * @property isSubmitting - Whether the form is currently submitting
 * @property onSubmit - Function to call when the submit button is clicked
 * @property onOpenTemplates - Function to call when the templates button is clicked
 * @property isValid - Whether the form is valid and can be submitted
 * @property title - Title to display in the header
 * @property backUrl - URL to navigate to when the back button is clicked
 * @property backText - Text to display in the back button
 * @property createButtonText - Text to display in the create button
 * @property saveButtonText - Text to display in the save button
 * @property templatesButtonText - Text to display in the templates button
 * @property headerContent - Additional content to display in the header
 * @property hideTemplatesButton - Whether to hide the templates button
 * @property hideBackButton - Whether to hide the back button
 * @property onBack - Function to call when the back button is clicked
 */
export interface AgentFormHeaderProps extends BaseComponentProps {
  /**
   * Whether this is a new agent or an existing one.
   * Controls the text of the submit button and potentially other UI elements.
   * @required
   */
  isNewAgent: boolean

  /**
   * Whether the form is currently submitting.
   * When true, the submit button shows a loading state and is disabled.
   * @required
   */
  isSubmitting: boolean

  /**
   * Function to call when the submit button is clicked.
   * Should trigger form validation and submission.
   * @required
   */
  onSubmit: () => void

  /**
   * Function to call when the templates button is clicked.
   * Should open the templates modal or navigate to templates page.
   * @required
   */
  onOpenTemplates: () => void

  /**
   * Whether the form is valid and can be submitted.
   * When false, the submit button is disabled.
   * @required
   */
  isValid: boolean

  /**
   * Title to display in the header.
   * If not provided, defaults based on isNewAgent.
   * @default isNewAgent ? "Novo Agente" : "Editar Agente"
   * @example "Criar Assistente de Vendas"
   */
  title?: string

  /**
   * URL to navigate to when the back button is clicked.
   * Only used if onBack is not provided.
   * @default "/agentes"
   */
  backUrl?: string

  /**
   * Text to display in the back button.
   * @default "Voltar"
   */
  backText?: string

  /**
   * Text to display in the create button.
   * Used when isNewAgent is true.
   * @default "Criar Agente"
   */
  createButtonText?: string

  /**
   * Text to display in the save button.
   * Used when isNewAgent is false.
   * @default "Salvar Alterações"
   */
  saveButtonText?: string

  /**
   * Text to display in the templates button.
   * @default "Templates"
   */
  templatesButtonText?: string

  /**
   * Additional content to display in the header.
   * Rendered after the title.
   * @example <Badge>Draft</Badge>
   */
  headerContent?: React.ReactNode

  /**
   * Whether to hide the templates button.
   * @default false
   */
  hideTemplatesButton?: boolean

  /**
   * Whether to hide the back button.
   * @default false
   */
  hideBackButton?: boolean

  /**
   * Function to call when the back button is clicked.
   * If provided, overrides the default behavior of navigating to backUrl.
   * Use this to handle unsaved changes confirmation.
   * @param event - The click event
   */
  onBack?: (event: React.MouseEvent) => void
}

/**
 * Properties for the PromptEditor component
 * @property value - The current value of the prompt
 * @property onChange - Function to call when the value changes
 * @property onSelectTemplate - Function to call when a template is selected
 * @property error - Error message to display
 * @property minHeight - Minimum height of the editor
 * @property label - Label for the editor
 * @property required - Whether the field is required
 * @property onBlur - Function to call when the editor loses focus
 * @property placeholder - Placeholder text to display when the editor is empty
 * @property readOnly - Whether the editor is read-only
 * @property maxLength - Maximum length of the prompt
 * @property showCharCount - Whether to show the character count
 * @property autoFocus - Whether the editor should automatically receive focus
 * @property showTemplateButton - Whether to show the template button
 */
export interface PromptEditorProps extends BaseComponentProps {
  /**
   * The current value of the prompt.
   * This is the text content of the editor.
   * @required
   */
  value: string

  /**
   * Function to call when the value changes.
   * Called with the new value whenever the user types or pastes.
   * @required
   * @param value - The new value of the prompt
   */
  onChange: (value: string) => void

  /**
   * Function to call when a template is selected.
   * If not provided, the template button will not be shown.
   * @param content - The content of the selected template
   */
  onSelectTemplate?: () => void

  /**
   * Error message to display.
   * Shown when the field has an error, typically after validation.
   * @example "Prompt is required"
   */
  error?: string

  /**
   * Minimum height of the editor.
   * Can be any valid CSS height value.
   * @default "200px"
   */
  minHeight?: string

  /**
   * Label for the editor.
   * Displayed above the editor and used for accessibility.
   * @example "Agent Prompt"
   */
  label?: string

  /**
   * Whether the field is required.
   * Adds a visual indicator and sets the HTML required attribute.
   * @default false
   */
  required?: boolean

  /**
   * Function to call when the editor loses focus.
   * Useful for triggering validation.
   */
  onBlur?: () => void

  /**
   * Placeholder text to display when the editor is empty.
   * Provides guidance to the user about what to enter.
   * @default "# Title\n\nYou are an assistant that..."
   */
  placeholder?: string

  /**
   * Whether the editor is read-only.
   * When true, the user cannot edit the content.
   * @default false
   */
  readOnly?: boolean

  /**
   * Maximum length of the prompt.
   * If provided, shows a character count and limits input.
   */
  maxLength?: number

  /**
   * Whether to show the character count.
   * Only applies if maxLength is provided.
   * @default true
   */
  showCharCount?: boolean

  /**
   * Whether the editor should automatically receive focus.
   * @default false
   */
  autoFocus?: boolean

  /**
   * Whether to show the template button.
   * If false, the template button will not be shown regardless of onSelectTemplate.
   * @default true
   */
  showTemplateButton?: boolean
}

/**
 * Properties for the BadgeList component
 * @property items - Array of badge items to display
 * @property onAdd - Function to call when the add button is clicked
 * @property onRemove - Function to call when a badge is removed
 * @property onEdit - Function to call when a badge is edited
 * @property addLabel - Label for the add button
 * @property maxItems - Maximum number of items allowed
 * @property emptyMessage - Message to display when there are no items
 * @property readOnly - Whether the list is read-only
 * @property addButtonVariant - Variant of the add button
 * @property badgeVariant - Variant of the badges
 * @property sortable - Whether the badges can be reordered
 * @property onReorder - Function to call when badges are reordered
 * @property confirmRemoval - Whether to confirm before removing a badge
 * @property removeBadgeAriaLabel - Accessible label for the remove badge button
 */
export interface BadgeListProps extends BaseComponentProps {
  /**
   * Array of badge items to display.
   * Each item must have an id and label.
   * @required
   */
  items: BadgeItem[]

  /**
   * Function to call when the add button is clicked.
   * Should add a new badge to the items array.
   * @required
   */
  onAdd: () => void

  /**
   * Function to call when a badge is removed.
   * Called with the id of the badge to remove.
   * @required
   * @param id - The id of the badge to remove
   */
  onRemove: (id: string) => void

  /**
   * Function to call when a badge is edited.
   * If provided, badges become editable on click.
   * @param id - The id of the badge to edit
   * @param newLabel - The new label for the badge
   */
  onEdit?: (id: string, newLabel: string) => void

  /**
   * Label for the add button.
   * Also used in aria-label with "Add " prefix.
   * @default "Item"
   */
  addLabel?: string

  /**
   * Maximum number of items allowed.
   * When reached, the add button is disabled.
   * @default 10
   */
  maxItems?: number

  /**
   * Message to display when there are no items.
   * @default "Nenhum item adicionado"
   */
  emptyMessage?: string

  /**
   * Whether the list is read-only.
   * When true, badges cannot be removed or edited.
   * @default false
   */
  readOnly?: boolean

  /**
   * Variant of the add button.
   * Controls the visual style of the button.
   * @default "outline"
   */
  addButtonVariant?: "default" | "outline" | "ghost" | "link"

  /**
   * Variant of the badges.
   * Controls the visual style of the badges.
   * @default "secondary"
   */
  badgeVariant?: "default" | "secondary" | "outline" | "destructive"

  /**
   * Whether the badges can be reordered.
   * When true, badges can be dragged to change order.
   * @default false
   */
  sortable?: boolean

  /**
   * Function to call when badges are reordered.
   * Called with the new order of badge items.
   * @param items - The new order of badge items
   */
  onReorder?: (items: BadgeItem[]) => void

  /**
   * Whether to confirm before removing a badge.
   * When true, shows a confirmation dialog.
   * @default false
   */
  confirmRemoval?: boolean

  /**
   * Accessible label for the remove badge button.
   * If not provided, defaults to "Remove {label}".
   * @example "Remove tag"
   */
  removeBadgeAriaLabel?: string
}

/**
 * Properties for the AgentBasicInfo component
 * @property name - Name of the agent
 * @property type - Type of the agent
 * @property model - Model of the agent
 * @property description - Description of the agent
 * @property status - Status of the agent
 * @property onChangeName - Function to call when the name changes
 * @property onChangeType - Function to call when the type changes
 * @property onChangeModel - Function to call when the model changes
 * @property onChangeDescription - Function to call when the description changes
 * @property onChangeStatus - Function to call when the status changes
 * @property onBlurName - Function to call when the name field loses focus
 * @property nameError - Error message for the name field
 * @property isNewAgent - Whether this is a new agent
 * @property descriptionMaxLength - Maximum length of the description
 * @property nameMaxLength - Maximum length of the name
 * @property descriptionPlaceholder - Placeholder for the description field
 * @property namePlaceholder - Placeholder for the name field
 */
export interface AgentBasicInfoProps extends BaseComponentProps {
  /**
   * Name of the agent.
   * Used as the primary identifier for the agent.
   * @required
   */
  name: string

  /**
   * Type of the agent.
   * Determines the agent's capabilities and behavior.
   * @required
   */
  type: string

  /**
   * Model of the agent.
   * Specifies which AI model the agent uses.
   * @required
   */
  model: string

  /**
   * Description of the agent.
   * Provides additional context about the agent's purpose.
   * @required
   */
  description: string

  /**
   * Status of the agent.
   * Indicates whether the agent is active, a draft, or archived.
   * @required
   */
  status: string

  /**
   * Function to call when the name changes.
   * @required
   * @param value - The new name value
   */
  onChangeName: (value: string) => void

  /**
   * Function to call when the type changes.
   * @required
   * @param value - The new type value
   */
  onChangeType: (value: string) => void

  /**
   * Function to call when the model changes.
   * @required
   * @param value - The new model value
   */
  onChangeModel: (value: string) => void

  /**
   * Function to call when the description changes.
   * @required
   * @param value - The new description value
   */
  onChangeDescription: (value: string) => void

  /**
   * Function to call when the status changes.
   * @required
   * @param value - The new status value
   */
  onChangeStatus: (value: string) => void

  /**
   * Function to call when the name field loses focus.
   * Typically used to trigger validation.
   * @required
   */
  onBlurName: () => void

  /**
   * Error message for the name field.
   * Displayed when the name is invalid.
   */
  nameError?: string

  /**
   * Whether this is a new agent.
   * Affects autofocus behavior.
   * @required
   */
  isNewAgent: boolean

  /**
   * Maximum length of the description.
   * @default 200
   */
  descriptionMaxLength?: number

  /**
   * Maximum length of the name.
   * @default 50
   */
  nameMaxLength?: number

  /**
   * Placeholder for the description field.
   * @default "Breve descrição do agente"
   */
  descriptionPlaceholder?: string

  /**
   * Placeholder for the name field.
   * @default "Digite o nome do agente"
   */
  namePlaceholder?: string
}

/**
 * Properties for the AgentPromptTab component
 * @property prompt - The current prompt value
 * @property onChangePrompt - Function to call when the prompt changes
 * @property onBlurPrompt - Function to call when the prompt field loses focus
 * @property promptError - Error message for the prompt field
 * @property onOpenTemplates - Function to call when the templates button is clicked
 * @property minHeight - Minimum height of the prompt editor
 * @property showToolbar - Whether to show the prompt tools toolbar
 * @property toolbarPosition - Position of the toolbar
 * @property customTools - Custom tools to add to the toolbar
 */
export interface AgentPromptTabProps extends BaseComponentProps {
  /**
   * The current prompt value.
   * This is the text content of the prompt editor.
   * @required
   */
  prompt: string

  /**
   * Function to call when the prompt changes.
   * @required
   * @param value - The new prompt value
   */
  onChangePrompt: (value: string) => void

  /**
   * Function to call when the prompt field loses focus.
   * Typically used to trigger validation.
   * @required
   */
  onBlurPrompt: () => void

  /**
   * Error message for the prompt field.
   * Displayed when the prompt is invalid.
   */
  promptError?: string

  /**
   * Function to call when the templates button is clicked.
   * Should open the templates modal.
   * @required
   */
  onOpenTemplates: () => void

  /**
   * Minimum height of the prompt editor.
   * @default "300px"
   */
  minHeight?: string

  /**
   * Whether to show the prompt tools toolbar.
   * @default true
   */
  showToolbar?: boolean

  /**
   * Position of the toolbar.
   * @default "top"
   */
  toolbarPosition?: "top" | "bottom"

  /**
   * Custom tools to add to the toolbar.
   * These will be appended to the default tools.
   */
  customTools?: Array<{
    id: string
    name: string
    icon: React.ReactNode
    snippet: string
  }>
}

/**
 * Properties for the AgentParametersTab component
 * @property maxTokens - Maximum number of tokens
 * @property temperature - Temperature value
 * @property topP - Top P value
 * @property frequencyPenalty - Frequency penalty value
 * @property presencePenalty - Presence penalty value
 * @property userDecision - Whether to allow user decision
 * @property onChangeMaxTokens - Function to call when max tokens changes
 * @property onChangeTemperature - Function to call when temperature changes
 * @property onChangeTopP - Function to call when top P changes
 * @property onChangeFrequencyPenalty - Function to call when frequency penalty changes
 * @property onChangePresencePenalty - Function to call when presence penalty changes
 * @property onChangeUserDecision - Function to call when user decision changes
 * @property onBlurMaxTokens - Function to call when max tokens field loses focus
 * @property onBlurTemperature - Function to call when temperature field loses focus
 * @property onBlurTopP - Function to call when top P field loses focus
 * @property onBlurFrequencyPenalty - Function to call when frequency penalty field loses focus
 * @property onBlurPresencePenalty - Function to call when presence penalty field loses focus
 * @property maxTokensError - Error message for max tokens field
 * @property temperatureError - Error message for temperature field
 * @property topPError - Error message for top P field
 * @property frequencyPenaltyError - Error message for frequency penalty field
 * @property presencePenaltyError - Error message for presence penalty field
 * @property showAdvancedOptions - Whether to show advanced options
 * @property advancedOptionsDefaultOpen - Whether advanced options are open by default
 */
export interface AgentParametersTabProps extends BaseComponentProps {
  /**
   * Maximum number of tokens.
   * Controls the maximum length of the generated text.
   * @required
   */
  maxTokens: string

  /**
   * Temperature value.
   * Controls randomness: higher values make output more random.
   * @required
   */
  temperature: string

  /**
   * Top P value.
   * Controls diversity via nucleus sampling.
   * @required
   */
  topP: string

  /**
   * Frequency penalty value.
   * Reduces repetition of token sequences.
   * @required
   */
  frequencyPenalty: string

  /**
   * Presence penalty value.
   * Reduces repetition of topics.
   * @required
   */
  presencePenalty: string

  /**
   * Whether to allow user decision.
   * When true, users can adjust parameters at runtime.
   * @required
   */
  userDecision: boolean

  /**
   * Function to call when max tokens changes.
   * @required
   * @param value - The new max tokens value
   */
  onChangeMaxTokens: (value: string) => void

  /**
   * Function to call when temperature changes.
   * @required
   * @param value - The new temperature value
   */
  onChangeTemperature: (value: string) => void

  /**
   * Function to call when top P changes.
   * @required
   * @param value - The new top P value
   */
  onChangeTopP: (value: string) => void

  /**
   * Function to call when frequency penalty changes.
   * @required
   * @param value - The new frequency penalty value
   */
  onChangeFrequencyPenalty: (value: string) => void

  /**
   * Function to call when presence penalty changes.
   * @required
   * @param value - The new presence penalty value
   */
  onChangePresencePenalty: (value: string) => void

  /**
   * Function to call when user decision changes.
   * @required
   * @param checked - The new user decision value
   */
  onChangeUserDecision: (checked: boolean) => void

  /**
   * Function to call when max tokens field loses focus.
   * @required
   */
  onBlurMaxTokens: () => void

  /**
   * Function to call when temperature field loses focus.
   * @required
   */
  onBlurTemperature: () => void

  /**
   * Function to call when top P field loses focus.
   * @required
   */
  onBlurTopP: () => void

  /**
   * Function to call when frequency penalty field loses focus.
   * @required
   */
  onBlurFrequencyPenalty: () => void

  /**
   * Function to call when presence penalty field loses focus.
   * @required
   */
  onBlurPresencePenalty: () => void

  /**
   * Error message for max tokens field.
   * Displayed when the value is invalid.
   */
  maxTokensError?: string

  /**
   * Error message for temperature field.
   * Displayed when the value is invalid.
   */
  temperatureError?: string

  /**
   * Error message for top P field.
   * Displayed when the value is invalid.
   */
  topPError?: string

  /**
   * Error message for frequency penalty field.
   * Displayed when the value is invalid.
   */
  frequencyPenaltyError?: string

  /**
   * Error message for presence penalty field.
   * Displayed when the value is invalid.
   */
  presencePenaltyError?: string

  /**
   * Whether to show advanced options.
   * When false, only shows basic parameters.
   * @default true
   */
  showAdvancedOptions?: boolean

  /**
   * Whether advanced options are open by default.
   * Only applies if showAdvancedOptions is true.
   * @default false
   */
  advancedOptionsDefaultOpen?: boolean
}

/**
 * Properties for the AgentConnectionsTab component
 * @property agents - Array of related agents
 * @property urls - Array of related URLs
 * @property onAddAgent - Function to call when adding an agent
 * @property onRemoveAgent - Function to call when removing an agent
 * @property onAddUrl - Function to call when adding a URL
 * @property onRemoveUrl - Function to call when removing a URL
 * @property onEditAgent - Function to call when editing an agent
 * @property onEditUrl - Function to call when editing a URL
 * @property maxAgents - Maximum number of agents allowed
 * @property maxUrls - Maximum number of URLs allowed
 * @property agentsEmptyMessage - Message to display when there are no agents
 * @property urlsEmptyMessage - Message to display when there are no URLs
 * @property showAgentsSection - Whether to show the agents section
 * @property showUrlsSection - Whether to show the URLs section
 * @property agentsSectionTitle - Title for the agents section
 * @property urlsSectionTitle - Title for the URLs section
 */
export interface AgentConnectionsTabProps extends BaseComponentProps {
  /**
   * Array of related agents.
   * Each agent must have an id and label.
   * @required
   */
  agents: BadgeItem[]

  /**
   * Array of related URLs.
   * Each URL must have an id and label.
   * @required
   */
  urls: BadgeItem[]

  /**
   * Function to call when adding an agent.
   * Should add a new agent to the agents array.
   * @required
   */
  onAddAgent: () => void

  /**
   * Function to call when removing an agent.
   * Called with the id of the agent to remove.
   * @required
   * @param id - The id of the agent to remove
   */
  onRemoveAgent: (id: string) => void

  /**
   * Function to call when adding a URL.
   * Should add a new URL to the urls array.
   * @required
   */
  onAddUrl: () => void

  /**
   * Function to call when removing a URL.
   * Called with the id of the URL to remove.
   * @required
   * @param id - The id of the URL to remove
   */
  onRemoveUrl: (id: string) => void

  /**
   * Function to call when editing an agent.
   * If provided, agents become editable on click.
   * @param id - The id of the agent to edit
   * @param newLabel - The new label for the agent
   */
  onEditAgent?: (id: string, newLabel: string) => void

  /**
   * Function to call when editing a URL.
   * If provided, URLs become editable on click.
   * @param id - The id of the URL to edit
   * @param newLabel - The new label for the URL
   */
  onEditUrl?: (id: string, newLabel: string) => void

  /**
   * Maximum number of agents allowed.
   * When reached, the add agent button is disabled.
   * @default 10
   */
  maxAgents?: number

  /**
   * Maximum number of URLs allowed.
   * When reached, the add URL button is disabled.
   * @default 10
   */
  maxUrls?: number

  /**
   * Message to display when there are no agents.
   * @default "Nenhum agente relacionado. Clique em 'Adicionar Agente' para vincular agentes."
   */
  agentsEmptyMessage?: string

  /**
   * Message to display when there are no URLs.
   * @default "Nenhuma URL relacionada. Clique em 'Adicionar URL' para vincular URLs."
   */
  urlsEmptyMessage?: string

  /**
   * Whether to show the agents section.
   * @default true
   */
  showAgentsSection?: boolean

  /**
   * Whether to show the URLs section.
   * @default true
   */
  showUrlsSection?: boolean

  /**
   * Title for the agents section.
   * @default "Agentes Relacionados"
   */
  agentsSectionTitle?: string

  /**
   * Title for the URLs section.
   * @default "URLs Relacionadas"
   */
  urlsSectionTitle?: string
}

/**
 * Properties for the AgentFormActions component
 * @property onReset - Function to call when the reset button is clicked
 * @property onSubmit - Function to call when the submit button is clicked
 * @property isSubmitting - Whether the form is currently submitting
 * @property isValid - Whether the form is valid and can be submitted
 * @property hasUnsavedChanges - Whether the form has unsaved changes
 * @property isNewAgent - Whether this is a new agent or an existing one
 * @property resetButtonText - Text to display in the reset button
 * @property submitButtonText - Text to display in the submit button
 * @property showResetButton - Whether to show the reset button
 * @property confirmReset - Whether to confirm before resetting
 * @property confirmSubmit - Whether to confirm before submitting
 * @property submitButtonVariant - Variant of the submit button
 * @property resetButtonVariant - Variant of the reset button
 * @property additionalActions - Additional actions to display
 */
export interface AgentFormActionsProps extends BaseComponentProps {
  /**
   * Function to call when the reset button is clicked.
   * Should reset the form to its initial state.
   * @required
   */
  onReset: () => void

  /**
   * Function to call when the submit button is clicked.
   * Should validate and submit the form.
   */
  onSubmit?: () => void

  /**
   * Whether the form is currently submitting.
   * When true, the submit button shows a loading state and is disabled.
   * @required
   */
  isSubmitting: boolean

  /**
   * Whether the form is valid and can be submitted.
   * When false, the submit button is disabled.
   * @required
   */
  isValid: boolean

  /**
   * Whether the form has unsaved changes.
   * When false, the reset button is disabled.
   * @required
   */
  hasUnsavedChanges: boolean

  /**
   * Whether this is a new agent or an existing one.
   * Controls the text of the submit button.
   * @required
   */
  isNewAgent: boolean

  /**
   * Text to display in the reset button.
   * @default "Redefinir"
   */
  resetButtonText?: string

  /**
   * Text to display in the submit button.
   * If not provided, defaults based on isNewAgent and isSubmitting.
   */
  submitButtonText?: string

  /**
   * Whether to show the reset button.
   * @default true
   */
  showResetButton?: boolean

  /**
   * Whether to confirm before resetting.
   * When true, shows a confirmation dialog.
   * @default false
   */
  confirmReset?: boolean

  /**
   * Whether to confirm before submitting.
   * When true, shows a confirmation dialog.
   * @default false
   */
  confirmSubmit?: boolean

  /**
   * Variant of the submit button.
   * Controls the visual style of the button.
   * @default "default"
   */
  submitButtonVariant?: "default" | "outline" | "ghost" | "link"

  /**
   * Variant of the reset button.
   * Controls the visual style of the button.
   * @default "outline"
   */
  resetButtonVariant?: "default" | "outline" | "ghost" | "link"

  /**
   * Additional actions to display.
   * Rendered before the reset and submit buttons.
   * @example <Button>Preview</Button>
   */
  additionalActions?: React.ReactNode
}

/**
 * Properties for the UnsavedChangesDialog component
 * @property open - Whether the dialog is open
 * @property onOpenChange - Function to call when the open state changes
 * @property onConfirm - Function to call when the user confirms
 * @property title - Title of the dialog
 * @property description - Description of the dialog
 * @property cancelText - Text for the cancel button
 * @property confirmText - Text for the confirm button
 * @property confirmVariant - Variant of the confirm button
 */
export interface UnsavedChangesDialogProps extends BaseComponentProps {
  /**
   * Whether the dialog is open.
   * @required
   */
  open: boolean

  /**
   * Function to call when the open state changes.
   * @required
   * @param open - The new open state
   */
  onOpenChange: (open: boolean) => void

  /**
   * Function to call when the user confirms.
   * Should proceed with the action that triggered the dialog.
   * @required
   */
  onConfirm: () => void

  /**
   * Title of the dialog.
   * @default "Alterações não salvas"
   */
  title?: string

  /**
   * Description of the dialog.
   * @default "Você tem alterações não salvas. Tem certeza que deseja sair sem salvar?"
   */
  description?: string

  /**
   * Text for the cancel button.
   * @default "Cancelar"
   */
  cancelText?: string

  /**
   * Text for the confirm button.
   * @default "Sair sem salvar"
   */
  confirmText?: string

  /**
   * Variant of the confirm button.
   * Controls the visual style of the button.
   * @default "destructive"
   */
  confirmVariant?: "default" | "destructive"
}

/**
 * Properties for the AgentCard component
 * @property agent - The agent to display
 * @property onDuplicate - Function to call when the duplicate action is triggered
 * @property onDelete - Function to call when the delete action is triggered
 * @property formatDate - Function to format dates
 * @property onView - Function to call when the view action is triggered
 * @property onEdit - Function to call when the edit action is triggered
 * @property onTest - Function to call when the test action is triggered
 * @property showActions - Whether to show the actions dropdown
 * @property customActions - Custom actions to add to the dropdown
 * @property showFooter - Whether to show the footer with dates
 * @property showBadges - Whether to show the badges for model, type, and status
 * @property onClick - Function to call when the card is clicked
 * @property isSelected - Whether the card is selected
 * @property selectable - Whether the card is selectable
 * @property onSelect - Function to call when the card is selected
 */
export interface AgentCardProps extends BaseComponentProps {
  /**
   * The agent to display.
   * Contains all the information about the agent.
   * @required
   */
  agent: Agent

  /**
   * Function to call when the duplicate action is triggered.
   * Should create a copy of the agent.
   * @required
   * @param agent - The agent to duplicate
   */
  onDuplicate: (agent: Agent) => void

  /**
   * Function to call when the delete action is triggered.
   * Should show a confirmation dialog before deleting.
   * @required
   * @param agent - The agent to delete
   */
  onDelete: (agent: Agent) => void

  /**
   * Function to format dates.
   * Used to format the created and updated dates.
   * @required
   * @param date - The date to format
   * @returns The formatted date string
   */
  formatDate: (date: string) => string

  /**
   * Function to call when the view action is triggered.
   * If not provided, uses default navigation.
   * @param agent - The agent to view
   */
  onView?: (agent: Agent) => void

  /**
   * Function to call when the edit action is triggered.
   * If not provided, uses default navigation.
   * @param agent - The agent to edit
   */
  onEdit?: (agent: Agent) => void

  /**
   * Function to call when the test action is triggered.
   * If not provided, uses default navigation.
   * @param agent - The agent to test
   */
  onTest?: (agent: Agent) => void

  /**
   * Whether to show the actions dropdown.
   * @default true
   */
  showActions?: boolean

  /**
   * Custom actions to add to the dropdown.
   * These will be appended to the default actions.
   */
  customActions?: Array<{
    label: string
    icon: React.ReactNode
    onClick: (agent: Agent) => void
    className?: string
  }>

  /**
   * Whether to show the footer with dates.
   * @default true
   */
  showFooter?: boolean

  /**
   * Whether to show the badges for model, type, and status.
   * @default true
   */
  showBadges?: boolean

  /**
   * Function to call when the card is clicked.
   * If not provided, navigates to the edit page.
   * @param agent - The agent that was clicked
   */
  onClick?: (agent: Agent) => void

  /**
   * Whether the card is selected.
   * Only applies if selectable is true.
   * @default false
   */
  isSelected?: boolean

  /**
   * Whether the card is selectable.
   * When true, the card can be selected by clicking.
   * @default false
   */
  selectable?: boolean

  /**
   * Function to call when the card is selected.
   * Only applies if selectable is true.
   * @param agent - The agent that was selected
   */
  onSelect?: (agent: Agent) => void
}

/**
 * Properties for the AgentListHeader component
 * @property onCreateAgent - Function to call when the create agent button is clicked
 * @property title - Title to display in the header
 * @property createButtonText - Text to display in the create button
 * @property showCreateButton - Whether to show the create button
 * @property additionalActions - Additional actions to display
 */
export interface AgentListHeaderProps extends BaseComponentProps {
  /**
   * Function to call when the create agent button is clicked.
   * Should navigate to the create agent page.
   * @required
   */
  onCreateAgent: () => void

  /**
   * Title to display in the header.
   * @default "Agentes"
   */
  title?: string

  /**
   * Text to display in the create button.
   * @default "Novo Agente"
   */
  createButtonText?: string

  /**
   * Whether to show the create button.
   * @default true
   */
  showCreateButton?: boolean

  /**
   * Additional actions to display.
   * Rendered after the create button.
   * @example <Button>Import</Button>
   */
  additionalActions?: React.ReactNode
}

/**
 * Properties for the AgentListFilters component
 * @property searchQuery - Current search query
 * @property statusFilter - Current status filter
 * @property onSearchChange - Function to call when the search query changes
 * @property onStatusChange - Function to call when the status filter changes
 * @property searchPlaceholder - Placeholder for the search input
 * @property showStatusFilter - Whether to show the status filter
 * @property customFilters - Custom filters to add
 * @property onClearFilters - Function to call when filters are cleared
 * @property showClearFilters - Whether to show the clear filters button
 */
export interface AgentListFiltersProps extends BaseComponentProps {
  /**
   * Current search query.
   * Used to filter agents by name or description.
   * @required
   */
  searchQuery: string

  /**
   * Current status filter.
   * Used to filter agents by status.
   * @required
   */
  statusFilter: string

  /**
   * Function to call when the search query changes.
   * @required
   * @param value - The new search query
   */
  onSearchChange: (value: string) => void

  /**
   * Function to call when the status filter changes.
   * @required
   * @param value - The new status filter
   */
  onStatusChange: (value: string) => void

  /**
   * Placeholder for the search input.
   * @default "Buscar agentes..."
   */
  searchPlaceholder?: string

  /**
   * Whether to show the status filter.
   * @default true
   */
  showStatusFilter?: boolean

  /**
   * Custom filters to add.
   * These will be rendered after the status filter.
   */
  customFilters?: React.ReactNode

  /**
   * Function to call when filters are cleared.
   * Should reset all filters to their default values.
   */
  onClearFilters?: () => void

  /**
   * Whether to show the clear filters button.
   * Only applies if onClearFilters is provided.
   * @default true
   */
  showClearFilters?: boolean
}

/**
 * Properties for the AgentListEmpty component
 * @property onCreateAgent - Function to call when the create agent button is clicked
 * @property message - Message to display
 * @property createButtonText - Text to display in the create button
 * @property showCreateButton - Whether to show the create button
 * @property icon - Icon to display
 */
export interface AgentListEmptyProps extends BaseComponentProps {
  /**
   * Function to call when the create agent button is clicked.
   * Should navigate to the create agent page.
   * @required
   */
  onCreateAgent: () => void

  /**
   * Message to display.
   * @default "Nenhum agente encontrado."
   */
  message?: string

  /**
   * Text to display in the create button.
   * @default "Criar Novo Agente"
   */
  createButtonText?: string

  /**
   * Whether to show the create button.
   * @default true
   */
  showCreateButton?: boolean

  /**
   * Icon to display.
   * If not provided, no icon is shown.
   */
  icon?: React.ReactNode
}

/**
 * Properties for the AgentDeleteDialog component
 * @property agent - The agent to delete
 * @property onOpenChange - Function to call when the open state changes
 * @property onConfirm - Function to call when the user confirms
 * @property title - Title of the dialog
 * @property description - Description of the dialog
 * @property cancelText - Text for the cancel button
 * @property confirmText - Text for the confirm button
 */
export interface AgentDeleteDialogProps extends BaseComponentProps {
  /**
   * The agent to delete.
   * If null, the dialog is closed.
   */
  agent: Agent | null

  /**
   * Function to call when the open state changes.
   * @required
   * @param open - The new open state
   */
  onOpenChange: (open: boolean) => void

  /**
   * Function to call when the user confirms.
   * Should delete the agent.
   * @required
   */
  onConfirm: () => void

  /**
   * Title of the dialog.
   * @default "Excluir agente"
   */
  title?: string

  /**
   * Description of the dialog.
   * If not provided, uses a default message with the agent name.
   */
  description?: string

  /**
   * Text for the cancel button.
   * @default "Cancelar"
   */
  cancelText?: string

  /**
   * Text for the confirm button.
   * @default "Excluir"
   */
  confirmText?: string
}
