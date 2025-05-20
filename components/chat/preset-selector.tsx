/**
 * PresetSelector Component
 *
 * A component for selecting chat presets that combine model, tool, and personality settings.
 * Allows users to save and load preset configurations.
 */
"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import { ChevronDown, Plus, Save, Trash2, Clock, Star, StarOff, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useApp } from "@/contexts/app-context"
import type { BaseComponentProps } from "@types/component-types"
import type { ChatPreset } from "../../../../packages/types/chat"

/**
 * Props for the PresetSelector component
 */
export interface PresetSelectorProps extends BaseComponentProps {
  /**
   * List of available presets
   * If not provided, presets from the app context will be used
   */
  presets?: ChatPreset[]

  /**
   * Callback fired when a preset is selected
   * @param preset The selected preset
   */
  onPresetSelect?: (preset: ChatPreset) => void

  /**
   * Callback fired when a preset is saved
   * @param preset The saved preset
   */
  onPresetSave?: (preset: ChatPreset) => void

  /**
   * Callback fired when a preset is deleted
   * @param presetId The ID of the deleted preset
   */
  onPresetDelete?: (presetId: string) => void

  /**
   * Size of the selector button
   * @default "sm"
   */
  size?: "sm" | "md" | "lg"

  /**
   * Width of the popover content
   * @default "300px"
   */
  contentWidth?: string

  /**
   * Maximum height of the preset list
   * @default "300px"
   */
  maxHeight?: string

  /**
   * Whether to show the "Create New" button
   * @default true
   */
  showCreateButton?: boolean

  /**
   * Whether to show the "Save Current" button
   * @default true
   */
  showSaveButton?: boolean

  /**
   * Whether to allow favoriting presets
   * @default true
   */
  allowFavorites?: boolean

  /**
   * Whether to show preset descriptions
   * @default true
   */
  showDescriptions?: boolean

  /**
   * Text to display when no presets are found
   * @default "No presets found"
   */
  emptyStateText?: string

  /**
   * Custom label for the selector button
   * @default "Presets"
   */
  buttonLabel?: string
}

/**
 * PresetSelector component
 */
export default function PresetSelector({
  className = "",
  style,
  id,
  disabled = false,
  dataAttributes,
  presets,
  onPresetSelect,
  onPresetSave,
  onPresetDelete,
  size = "sm",
  contentWidth = "300px",
  maxHeight = "300px",
  showCreateButton = true,
  showSaveButton = true,
  allowFavorites = true,
  showDescriptions = true,
  emptyStateText = "No presets found",
  buttonLabel = "Presets",
}: PresetSelectorProps) {
  // SECTION: Local state
  const [isOpen, setIsOpen] = useState(false)
  const [newPresetName, setNewPresetName] = useState("")
  const [newPresetDescription, setNewPresetDescription] = useState("")
  const [isCreatingPreset, setIsCreatingPreset] = useState(false)

  // SECTION: Application context
  const {
    selectedModel,
    selectedTool,
    selectedPersonality,
    userPreferences,
    savedPresets = [],
    savePreset,
    deletePreset,
    toggleFavoritePreset,
    applyPreset,
  } = useApp()

  // SECTION: Derived data

  /**
   * Presets to display in the selector
   */
  const presetsToDisplay = useMemo(() => {
    return presets || savedPresets
  }, [presets, savedPresets])

  /**
   * Favorite presets
   */
  const favoritePresets = useMemo(() => {
    return presetsToDisplay.filter((preset) => preset.isFavorite)
  }, [presetsToDisplay])

  /**
   * Regular (non-favorite) presets
   */
  const regularPresets = useMemo(() => {
    return presetsToDisplay.filter((preset) => !preset.isFavorite)
  }, [presetsToDisplay])

  // SECTION: Event handlers

  /**
   * Handle preset selection
   */
  const handleSelectPreset = useCallback(
    (preset: ChatPreset) => {
      applyPreset(preset)
      onPresetSelect?.(preset)
      setIsOpen(false)
    },
    [applyPreset, onPresetSelect],
  )

  /**
   * Handle preset creation
   */
  const handleCreatePreset = useCallback(() => {
    if (!newPresetName.trim()) return

    const newPreset: ChatPreset = {
      id: `preset_${Date.now()}`,
      name: newPresetName.trim(),
      description: newPresetDescription.trim() || undefined,
      model: selectedModel.id,
      tool: selectedTool,
      personality: selectedPersonality,
      createdAt: Date.now(),
      isFavorite: false,
    }

    savePreset(newPreset)
    onPresetSave?.(newPreset)

    setNewPresetName("")
    setNewPresetDescription("")
    setIsCreatingPreset(false)
  }, [newPresetName, newPresetDescription, selectedModel, selectedTool, selectedPersonality, savePreset, onPresetSave])

  /**
   * Handle preset deletion
   */
  const handleDeletePreset = useCallback(
    (preset: ChatPreset, e: React.MouseEvent) => {
      e.stopPropagation()
      deletePreset(preset.id)
      onPresetDelete?.(preset.id)
    },
    [deletePreset, onPresetDelete],
  )

  /**
   * Handle toggling preset favorite status
   */
  const handleToggleFavorite = useCallback(
    (preset: ChatPreset, e: React.MouseEvent) => {
      e.stopPropagation()
      toggleFavoritePreset(preset.id)
    },
    [toggleFavoritePreset],
  )

  // Prepare data attributes
  const allDataAttributes = {
    "data-component": "PresetSelector",
    "data-component-path": "@/components/chat/preset-selector",
    ...(dataAttributes || {}),
  }

  // SECTION: Size mappings
  const sizeClasses = {
    sm: "text-xs h-8",
    md: "text-sm h-9",
    lg: "text-base h-10",
  }

  // SECTION: Render
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-1 ${sizeClasses[size]} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 rounded-full ${className}`}
          style={style}
          id={id}
          disabled={disabled}
          {...allDataAttributes}
        >
          <Settings className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 mr-0.5" />
          {buttonLabel}
          <ChevronDown className="h-3 w-3 ml-1 text-gray-500 dark:text-gray-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl bg-white dark:bg-gray-800 transition-colors duration-200"
        style={{ width: contentWidth }}
        align="start"
        sideOffset={4}
      >
        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Presets</h3>

            <div className="flex items-center space-x-2">
              {showSaveButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setIsCreatingPreset(true)}
                  disabled={isCreatingPreset || disabled}
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save Current
                </Button>
              )}

              {showCreateButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setIsCreatingPreset(true)}
                  disabled={isCreatingPreset || disabled}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create New
                </Button>
              )}
            </div>
          </div>

          {isCreatingPreset && (
            <div className="mt-3 space-y-2">
              <Input
                placeholder="Preset name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="h-8 text-sm"
                disabled={disabled}
              />

              <Input
                placeholder="Description (optional)"
                value={newPresetDescription}
                onChange={(e) => setNewPresetDescription(e.target.value)}
                className="h-8 text-sm"
                disabled={disabled}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setIsCreatingPreset(false)
                    setNewPresetName("")
                    setNewPresetDescription("")
                  }}
                  disabled={disabled}
                >
                  Cancel
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleCreatePreset}
                  disabled={!newPresetName.trim() || disabled}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        <ScrollArea className={`max-h-[${maxHeight}]`}>
          {presetsToDisplay.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center">
              <Settings className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p>{emptyStateText}</p>
              <p className="text-xs mt-1 max-w-[250px]">Save your current settings as a preset for quick access</p>
            </div>
          ) : (
            <div className="py-2">
              {/* Favorite presets */}
              {allowFavorites && favoritePresets.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center">
                    <Star className="h-3 w-3 mr-1 text-amber-500" />
                    Favorites
                  </div>

                  <div>
                    {favoritePresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                        onClick={() => handleSelectPreset(preset)}
                      >
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">{preset.name}</div>
                          {showDescriptions && preset.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{preset.description}</div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {preset.model} • {preset.tool} • {preset.personality}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          {allowFavorites && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={(e) => handleToggleFavorite(preset, e)}
                              disabled={disabled}
                            >
                              <StarOff className="h-3.5 w-3.5 text-amber-500" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500"
                            onClick={(e) => handleDeletePreset(preset, e)}
                            disabled={disabled}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular presets */}
              <div>
                <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Presets
                </div>

                <div>
                  {regularPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                      onClick={() => handleSelectPreset(preset)}
                    >
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{preset.name}</div>
                        {showDescriptions && preset.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{preset.description}</div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {preset.model} • {preset.tool} • {preset.personality}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {allowFavorites && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => handleToggleFavorite(preset, e)}
                            disabled={disabled}
                          >
                            <Star className="h-3.5 w-3.5 text-gray-400 hover:text-amber-500" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500"
                          onClick={(e) => handleDeletePreset(preset, e)}
                          disabled={disabled}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
