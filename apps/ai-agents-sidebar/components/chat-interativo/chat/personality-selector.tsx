/**
 * PersonalitySelector Component
 *
 * A component for selecting AI assistant personalities.
 * Displays available personalities and allows searching and selecting from recent personalities.
 */
"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import { ChevronDown, Clock, Sparkles, Search, Brain, Lightbulb, Zap, Compass, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useApp } from "@/contexts/app-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { BaseComponentProps } from "../../../../shared/types/component-types"
import type { Personality } from "@/types/chat"

/**
 * Props for the PersonalitySelector component
 */
export interface PersonalitySelectorProps extends BaseComponentProps {
  /**
   * List of available personalities to display
   * If not provided, default personalities will be used
   */
  personalities?: Personality[]

  /**
   * Callback fired when a personality is selected
   * @param personality The selected personality
   */
  onPersonalitySelect?: (personality: Personality) => void

  /**
   * Size of the selector button
   * @default "sm"
   */
  size?: "sm" | "md" | "lg"

  /**
   * Width of the popover content
   * @default "64"
   */
  contentWidth?: string

  /**
   * Maximum height of the scroll area
   * @default "80"
   */
  maxHeight?: string

  /**
   * Whether to show the search input
   * @default true
   */
  showSearch?: boolean

  /**
   * Whether to show the tabs for all/recent personalities
   * @default true
   */
  showTabs?: boolean

  /**
   * Whether to show personality descriptions
   * @default true
   */
  showDescriptions?: boolean

  /**
   * Default tab to show
   * @default "all"
   */
  defaultTab?: "all" | "recent"

  /**
   * Placeholder text for the search input
   * @default "Search personalities..."
   */
  searchPlaceholder?: string

  /**
   * Text to display when no personalities are found
   * @default "No personalities found"
   */
  emptyStateText?: string

  /**
   * Text to display when no recent personalities are found
   * @default "No recent personalities"
   */
  noRecentPersonalitiesText?: string

  /**
   * Custom icon for the selector button
   * @default <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 mr-0.5" />
   */
  buttonIcon?: React.ReactNode

  /**
   * Custom label for the selector button
   * If not provided, the selected personality's name will be used
   */
  buttonLabel?: string
}

/**
 * Default personalities available in the selector
 */
export const DEFAULT_PERSONALITIES: Personality[] = [
  {
    id: "systematic",
    name: "Systematic",
    description: "Structured and methodical responses, focused on clear processes and steps.",
    icon: <Brain className="h-4 w-4" />,
    systemPrompt:
      "You are a systematic assistant that provides structured and methodical responses. Organize your answers in clear steps and use numbered lists when appropriate. Be precise and detailed in your explanations.",
  },
  {
    id: "objective",
    name: "Objective",
    description: "Direct and factual responses, without opinions or unnecessary elaboration.",
    icon: <Compass className="h-4 w-4" />,
    systemPrompt:
      "You are an objective assistant that provides direct and factual responses. Avoid personal opinions and unnecessary elaboration. Be concise and to the point, prioritizing verifiable facts.",
  },
  {
    id: "natural",
    name: "Natural",
    description: "Conversational and balanced tone.",
    icon: <Sparkles className="h-4 w-4" />,
    systemPrompt:
      "You are an assistant with a natural conversational tone. Communicate in a friendly and accessible way, as in a normal conversation between people. Maintain a balance between being informative and conversational.",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Responses with innovative approaches and lateral thinking.",
    icon: <Lightbulb className="h-4 w-4" />,
    systemPrompt:
      "You are a creative assistant that offers innovative approaches and lateral thinking. Explore unconventional possibilities, make unexpected connections, and offer original perspectives. Encourage creative thinking in your responses.",
  },
  {
    id: "imaginative",
    name: "Imaginative",
    description: "Expansive and exploratory responses, with hypothetical scenarios and analogies.",
    icon: <Palette className="h-4 w-4" />,
    systemPrompt:
      "You are an imaginative assistant that provides expansive and exploratory responses. Use hypothetical scenarios, vivid analogies, and illustrative examples. Explore possibilities and help the user visualize concepts in a rich and detailed manner.",
  },
  {
    id: "technical",
    name: "Technical",
    description: "Detailed responses with focus on technical aspects and precision.",
    icon: <Zap className="h-4 w-4" />,
    systemPrompt:
      "You are a technical assistant that provides detailed responses with focus on technical aspects and precision. Use specific terminology, cite sources when relevant, and provide in-depth explanations. Prioritize technical accuracy in all your responses.",
  },
]

/**
 * PersonalitySelector component
 */
export default function PersonalitySelector({
  className = "",
  style,
  id,
  disabled = false,
  dataAttributes,
  personalities = DEFAULT_PERSONALITIES,
  onPersonalitySelect,
  size = "sm",
  contentWidth = "64",
  maxHeight = "80",
  showSearch = true,
  showTabs = true,
  showDescriptions = true,
  defaultTab = "all",
  searchPlaceholder = "Search personalities...",
  emptyStateText = "No personalities found",
  noRecentPersonalitiesText = "No recent personalities",
  buttonIcon = <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 mr-0.5" />,
  buttonLabel,
}: PersonalitySelectorProps) {
  // SECTION: Local state
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "recent">(defaultTab)

  // SECTION: Application context
  const { selectedPersonality, setSelectedPersonality, userPreferences } = useApp()

  // SECTION: Derived data

  /**
   * Filter personalities based on search query
   */
  const filteredPersonalities = useMemo(() => {
    if (!searchQuery.trim()) return personalities

    const query = searchQuery.toLowerCase()
    return personalities.filter(
      (personality) =>
        personality.name.toLowerCase().includes(query) || personality.description.toLowerCase().includes(query),
    )
  }, [personalities, searchQuery])

  /**
   * Find the currently selected personality object
   */
  const selectedPersonalityObj = useMemo(() => {
    return (
      personalities.find((p) => p.name === selectedPersonality) ||
      personalities.find((p) => p.id === "natural") ||
      personalities[2]
    ) // Default to Natural or the third item
  }, [personalities, selectedPersonality])

  /**
   * Check if there are recent personalities
   */
  const hasRecentPersonalities = userPreferences?.recentPersonalities && userPreferences.recentPersonalities.length > 0

  /**
   * Get recent personalities
   */
  const recentPersonalities = useMemo(() => {
    if (!hasRecentPersonalities) return []

    return userPreferences.recentPersonalities
      .map((personalityName) => personalities.find((p) => p.name === personalityName))
      .filter((personality): personality is Personality => !!personality)
  }, [personalities, userPreferences.recentPersonalities, hasRecentPersonalities])

  // SECTION: Event handlers

  /**
   * Handle personality selection
   */
  const handleSelectPersonality = useCallback(
    (personality: Personality) => {
      setSelectedPersonality(personality.name)
      onPersonalitySelect?.(personality)
      setIsOpen(false)
    },
    [setSelectedPersonality, onPersonalitySelect],
  )

  /**
   * Handle tab change
   */
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as "all" | "recent")
    setSearchQuery("")
  }, [])

  // Prepare data attributes
  const allDataAttributes = {
    "data-component": "PersonalitySelector",
    "data-component-path": "@/components/chat/personality-selector",
    ...(dataAttributes || {}),
  }

  // SECTION: Render
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger button */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={`text-xs flex items-center gap-1 ${
            size === "sm" ? "h-8" : size === "md" ? "h-9" : "h-10"
          } bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 rounded-full ${className}`}
          style={style}
          id={id}
          disabled={disabled}
          {...allDataAttributes}
        >
          {buttonIcon}
          {buttonLabel || selectedPersonality}
          <ChevronDown className="h-3 w-3 ml-1 text-gray-500 dark:text-gray-400" />
        </Button>
      </PopoverTrigger>

      {/* Popover content */}
      <PopoverContent
        className={`w-${contentWidth} p-0 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl bg-white dark:bg-gray-800 transition-colors duration-200`}
        align="start"
        sideOffset={4}
      >
        {showTabs ? (
          <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={handleTabChange}>
            {/* Header with search and tabs */}
            <div className="border-b border-gray-100 dark:border-gray-700 px-3 py-2">
              {/* Search input */}
              {showSearch && (
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm rounded-full bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 focus:border-primary/30 focus:ring-primary/20"
                  />
                </div>
              )}

              {/* Tabs */}
              <TabsList className="w-full grid grid-cols-2 h-9 rounded-full bg-gray-100 dark:bg-gray-700 p-1">
                <TabsTrigger
                  value="all"
                  className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="recent"
                  className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  Recent
                </TabsTrigger>
              </TabsList>
            </div>

            {/* "All" tab content */}
            <TabsContent value="all" className="mt-0">
              <ScrollArea className={`max-h-${maxHeight} scrollbar-thin`}>
                {filteredPersonalities.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">{emptyStateText}</div>
                ) : (
                  <div className="py-2 space-y-0.5">
                    {filteredPersonalities.map((personality) => (
                      <button
                        key={personality.id}
                        className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg ${
                          personality.name === selectedPersonality ? "bg-primary/5 dark:bg-primary/10" : ""
                        }`}
                        onClick={() => handleSelectPersonality(personality)}
                        disabled={disabled}
                      >
                        <div className="flex items-center">
                          {personality.icon && (
                            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 mr-2">
                              {personality.icon}
                            </span>
                          )}
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">{personality.name}</div>
                            {showDescriptions && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {personality.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* "Recent" tab content */}
            <TabsContent value="recent" className="mt-0">
              <ScrollArea className={`max-h-${maxHeight} scrollbar-thin`}>
                {!hasRecentPersonalities ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center">
                    <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p>{noRecentPersonalitiesText}</p>
                    <p className="text-xs mt-1 max-w-[250px]">
                      Personalities you use will appear here for quick access
                    </p>
                  </div>
                ) : (
                  <div className="py-2 space-y-0.5">
                    {recentPersonalities.map((personality) => (
                      <button
                        key={personality.id}
                        className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg ${
                          personality.name === selectedPersonality ? "bg-primary/5 dark:bg-primary/10" : ""
                        }`}
                        onClick={() => handleSelectPersonality(personality)}
                        disabled={disabled}
                      >
                        <div className="flex items-center">
                          {personality.icon && (
                            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 mr-2">
                              {personality.icon}
                            </span>
                          )}
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">{personality.name}</div>
                            {showDescriptions && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {personality.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          // Simple view without tabs
          <div>
            {/* Search input */}
            {showSearch && (
              <div className="relative px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm rounded-full bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 focus:border-primary/30 focus:ring-primary/20"
                />
              </div>
            )}

            {/* Personalities list */}
            <ScrollArea className={`max-h-${maxHeight} scrollbar-thin`}>
              {filteredPersonalities.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">{emptyStateText}</div>
              ) : (
                <div className="py-2 space-y-0.5">
                  {filteredPersonalities.map((personality) => (
                    <button
                      key={personality.id}
                      className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg ${
                        personality.name === selectedPersonality ? "bg-primary/5 dark:bg-primary/10" : ""
                      }`}
                      onClick={() => handleSelectPersonality(personality)}
                      disabled={disabled}
                    >
                      <div className="flex items-center">
                        {personality.icon && (
                          <span className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 mr-2">
                            {personality.icon}
                          </span>
                        )}
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">{personality.name}</div>
                          {showDescriptions && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {personality.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
