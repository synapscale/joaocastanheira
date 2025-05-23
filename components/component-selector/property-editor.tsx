/**
 * PropertyEditor Component
 *
 * Allows viewing and editing properties of React components.
 * Provides a UI for inspecting and modifying component props, styles, and state.
 */
"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Settings,
  Save,
  X,
  Undo,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit,
  Check,
  DropletsIcon,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useApp } from "@/contexts/app-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { debounce } from "@/lib/utils"

/**
 * Property editor props
 */
interface PropertyEditorProps {
  element: HTMLElement | null
  onClose: () => void
  disabled?: boolean
}

/**
 * Property type definition
 */
type PropertyType = "string" | "number" | "boolean" | "object" | "function" | "array" | "unknown"

/**
 * Property interface
 */
interface Property {
  name: string
  value: any
  type: PropertyType
  editable: boolean
  originalValue?: any
  modified?: boolean
  category?: "props" | "style" | "state" | "attributes"
}

/**
 * PropertyEditor component
 */
export default function PropertyEditor({ element, onClose, disabled = false }: PropertyEditorProps) {
  // SECTION: State
  const [properties, setProperties] = useState<Property[]>([])
  const [activeTab, setActiveTab] = useState<"all" | "props" | "style" | "state">("all")
  const [filter, setFilter] = useState("")
  const [expandedProps, setExpandedProps] = useState<Set<string>>(new Set())
  const [editingProp, setEditingProp] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newPropName, setNewPropName] = useState("")
  const [newPropValue, setNewPropValue] = useState("")
  const [newPropType, setNewPropType] = useState<PropertyType>("string")
  const [isLoading, setIsLoading] = useState(false)

  // SECTION: Hooks
  const { setLastAction } = useApp()
  const { toast } = useToast()

  // SECTION: Effects

  /**
   * Extract properties when element changes
   */
  useEffect(() => {
    try {
      setIsLoading(true)

      // Add null check before extracting properties
      if (element) {
        extractProperties()
      } else {
        console.warn("Element is undefined or null in useEffect")
        setProperties([])
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error extracting properties"
      setError(errorMessage)
      console.error("Error extracting properties:", error)
      setProperties([])
    } finally {
      setIsLoading(false)
    }
  }, [element])

  // SECTION: Methods

  /**
   * Extract all properties from the component
   */
  const extractProperties = useCallback(() => {
    if (!element) {
      console.warn("Element is undefined or null in extractProperties")
      setProperties([])
      return
    }

    try {
      const extractedProps: Property[] = []

      // 1. Extract React props
      const reactProps = extractReactProps(element)
      extractedProps.push(...reactProps)

      // 2. Extract DOM attributes
      const domAttributes = extractDOMAttributes(element)
      extractedProps.push(...domAttributes)

      // 3. Extract styles
      const styleProps = extractStyleProperties(element)
      extractedProps.push(...styleProps)

      // 4. Extract state
      const stateProps = extractStateProperties(element)
      extractedProps.push(...stateProps)

      // Remove duplicates by name
      const uniqueProps = extractedProps.reduce((acc: Property[], prop) => {
        if (!acc.some((p) => p.name === prop.name)) {
          acc.push(prop)
        }
        return acc
      }, [])

      // Sort properties by name within each category
      const sortedProps = uniqueProps.sort((a, b) => {
        // First sort by category
        const categoryOrder = { props: 1, attributes: 2, style: 3, state: 4 }
        const catA = categoryOrder[a.category || "props"] || 99
        const catB = categoryOrder[b.category || "props"] || 99

        if (catA !== catB) return catA - catB

        // Then sort by name
        return a.name.localeCompare(b.name)
      })

      setProperties(sortedProps)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error extracting properties"
      setError(errorMessage)
      console.error("Error extracting properties:", error)
      setProperties([])
    }
  }, [element])

  /**
   * Extract React props from the element
   */
  const extractReactProps = useCallback((element: HTMLElement): Property[] => {
    const props: Property[] = []

    try {
      // Add null check before accessing element properties
      if (!element) {
        console.warn("Element is undefined or null in extractReactProps")
        return props
      }

      // Get React fiber key
      const key = Object.keys(element).find(
        (key) => key.startsWith("__reactFiber$") || key.startsWith("__reactInternalInstance$"),
      )

      if (!key) return props

      // @ts-ignore - Accessing internal React properties
      const fiber = element[key]
      if (!fiber) return props

      // Navigate the fiber tree to find props
      let fiberNode = fiber
      while (fiberNode) {
        if (fiberNode.memoizedProps) {
          // Process props
          Object.entries(fiberNode.memoizedProps).forEach(([propName, propValue]) => {
            // Skip internal props
            if (propName.startsWith("_") || propName === "children" || propName === "ref") {
              return
            }

            // Determine property type
            let type: PropertyType = "unknown"
            let editable = true

            if (propValue === null || propValue === undefined) {
              type = "string"
              propValue = ""
            } else if (typeof propValue === "string") {
              type = "string"
            } else if (typeof propValue === "number") {
              type = "number"
            } else if (typeof propValue === "boolean") {
              type = "boolean"
            } else if (typeof propValue === "function") {
              type = "function"
              editable = false
              propValue = "[Function]"
            } else if (Array.isArray(propValue)) {
              type = "array"
              editable = false
              propValue = "[Array]"
            } else if (propValue instanceof Node) {
              type = "object"
              editable = false
              propValue = "[DOM Element]"
            } else if (typeof propValue === "object") {
              type = "object"
              editable = false
              propValue = "[Object]"
            }

            props.push({
              name: propName,
              value: propValue,
              type,
              editable,
              category: "props",
            })
          })
        }

        // Continue traversing the fiber tree
        fiberNode = fiberNode.return
      }
    } catch (error) {
      console.error("Error extracting React props:", error)
    }

    return props
  }, [])

  /**
   * Extract DOM attributes from the element
   */
  const extractDOMAttributes = useCallback((element: HTMLElement): Property[] => {
    const attributes: Property[] = []

    try {
      // Add null check before accessing element properties
      if (!element) {
        console.warn("Element is undefined or null in extractDOMAttributes")
        return attributes
      }

      // Extract standard attributes
      Array.from(element.attributes || []).forEach((attr) => {
        // Filter out React internal attributes
        if (
          !attr.name.startsWith("__react") &&
          !attr.name.startsWith("data-reactroot") &&
          attr.name !== "style" // Style is handled separately
        ) {
          // Convert attributes to React prop format
          const propName = attr.name === "class" ? "className" : attr.name

          // Determine type and editability
          let type: PropertyType = "string"
          const editable = true

          // Handle special cases
          if (attr.name === "disabled" || attr.name === "checked" || attr.name === "readonly") {
            type = "boolean"
          }

          attributes.push({
            name: propName,
            value: attr.value,
            type,
            editable,
            category: "attributes",
          })
        }
      })

      // Extract input values
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.tagName === "SELECT") {
        const inputElement = element as HTMLInputElement

        if (!attributes.some((attr) => attr.name === "value")) {
          attributes.push({
            name: "value",
            value: inputElement.value,
            type: "string",
            editable: true,
            category: "attributes",
          })
        }

        if (inputElement.type === "checkbox" || inputElement.type === "radio") {
          if (!attributes.some((attr) => attr.name === "checked")) {
            attributes.push({
              name: "checked",
              value: inputElement.checked,
              type: "boolean",
              editable: true,
              category: "attributes",
            })
          }
        }
      }
    } catch (error) {
      console.error("Error extracting DOM attributes:", error)
    }

    return attributes
  }, [])

  /**
   * Extract style properties from the element
   */
  const extractStyleProperties = useCallback((element: HTMLElement): Property[] => {
    const styleProps: Property[] = []

    try {
      // Add null check before accessing element properties
      if (!element) {
        console.warn("Element is undefined or null in extractStyleProperties")
        return styleProps
      }

      const computedStyle = window.getComputedStyle(element)

      // Add style object property
      styleProps.push({
        name: "style",
        value: "[Style Object]",
        type: "object",
        editable: false,
        category: "style",
      })

      // Add individual style properties
      for (let i = 0; i < computedStyle.length; i++) {
        const propName = computedStyle[i]
        const propValue = computedStyle.getPropertyValue(propName)

        // Skip empty or default values
        if (propValue && propValue !== "none" && propValue !== "normal" && propValue !== "auto") {
          styleProps.push({
            name: `style.${propName}`,
            value: propValue,
            type: "string",
            editable: true,
            category: "style",
          })
        }
      }
    } catch (error) {
      console.error("Error extracting style properties:", error)
    }

    return styleProps
  }, [])

  /**
   * Extract state properties from the element
   */
  const extractStateProperties = useCallback((element: HTMLElement): Property[] => {
    const stateProps: Property[] = []
    const processedObjects = new WeakSet() // Track processed objects to avoid circular references

    try {
      // Add null check before accessing element properties
      if (!element) {
        console.warn("Element is undefined or null in extractStateProperties")
        return stateProps
      }

      // Get React fiber key
      const key = Object.keys(element).find(
        (key) => key.startsWith("__reactFiber$") || key.startsWith("__reactInternalInstance$"),
      )

      if (!key) return stateProps

      // @ts-ignore - Accessing internal React properties
      const fiber = element[key]
      if (!fiber) return stateProps

      // Navigate the fiber tree to find state
      let fiberNode = fiber
      while (fiberNode) {
        if (fiberNode.memoizedState) {
          // Process state safely with depth limiting
          const processState = (state: any, prefix = "state", depth = 0) => {
            // Limit recursion depth to prevent stack overflow
            if (depth > 3) return

            // Skip null or undefined state
            if (state === null || state === undefined) return

            // Skip if already processed (circular reference)
            if (typeof state === "object" && state !== null) {
              if (processedObjects.has(state)) return
              processedObjects.add(state)
            }

            // Special case: state hooks
            if (state.memoizedState !== undefined && state.queue) {
              const stateValue = state.memoizedState

              // Skip functions, DOM nodes, and complex objects
              if (typeof stateValue === "function" || stateValue instanceof Node) return

              // Skip circular references in hook state
              if (typeof stateValue === "object" && stateValue !== null) {
                if (stateValue === state || stateValue.memoizedState === state) return
              }

              stateProps.push({
                name: `${prefix}`,
                value: typeof stateValue === "object" ? "[Object]" : stateValue,
                type:
                  typeof stateValue === "boolean"
                    ? "boolean"
                    : typeof stateValue === "number"
                      ? "number"
                      : typeof stateValue === "string"
                        ? "string"
                        : "object",
                editable: typeof stateValue !== "object",
                category: "state",
              })
              return
            }

            // Normal state object
            if (typeof state === "object" && !Array.isArray(state) && state !== null) {
              // Limit the number of properties to process
              const entries = Object.entries(state).slice(0, 10)

              entries.forEach(([key, value]) => {
                // Skip internal properties
                if (key.startsWith("_") || key === "$$typeof") return

                // Determine type
                let type: PropertyType = "unknown"
                let editable = false
                let displayValue = value

                if (value === null || value === undefined) {
                  type = "string"
                  displayValue = ""
                  editable = true
                } else if (typeof value === "string") {
                  type = "string"
                  editable = true
                } else if (typeof value === "number") {
                  type = "number"
                  editable = true
                } else if (typeof value === "boolean") {
                  type = "boolean"
                  editable = true
                } else if (typeof value === "function") {
                  type = "function"
                  displayValue = "[Function]"
                } else if (Array.isArray(value)) {
                  type = "array"
                  displayValue = "[Array]"
                } else if (typeof value === "object") {
                  type = "object"
                  displayValue = "[Object]"

                  // Process nested objects recursively with increased depth
                  if (depth < 2) {
                    processState(value, `${prefix}.${key}`, depth + 1)
                  }
                }

                stateProps.push({
                  name: `${prefix}.${key}`,
                  value: displayValue,
                  type,
                  editable,
                  category: "state",
                })
              })
            }
          }

          processState(fiberNode.memoizedState)
        }

        // Continue traversing the fiber tree
        fiberNode = fiberNode.return
      }
    } catch (error) {
      console.error("Error extracting state:", error)
    }

    return stateProps
  }, [])

  /**
   * Apply a property change
   */
  const applyPropertyChange = useCallback(
    (propName: string, newValue: any) => {
      try {
        // Add null check before applying property changes
        if (!element) {
          console.warn("Element is undefined or null in applyPropertyChange")
          return false
        }

        // Find the property
        const propIndex = properties.findIndex((p) => p.name === propName)
        if (propIndex === -1) return false

        const prop = properties[propIndex]

        // Convert value to the correct type
        let typedValue = newValue
        if (prop.type === "number") {
          typedValue = Number(newValue)
          if (isNaN(typedValue)) return false
        } else if (prop.type === "boolean") {
          typedValue = Boolean(newValue)
        }

        // Apply the change based on property type
        if (propName.startsWith("style.")) {
          // Style property
          const styleProp = propName.substring(6) // Remove "style."
          element.style.setProperty(styleProp, String(typedValue))
        } else if (propName === "className") {
          // CSS class
          element.className = String(typedValue)
        } else if (
          propName === "value" &&
          (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)
        ) {
          // Input value
          element.value = String(typedValue)
        } else if (propName === "checked" && element instanceof HTMLInputElement) {
          // Checkbox or radio
          element.checked = Boolean(typedValue)
        } else if (propName.startsWith("state.")) {
          // State (more complex, may not work in all cases)
          applyStateChange(propName, typedValue)
        } else {
          // Generic attribute
          if (prop.type === "boolean") {
            if (typedValue) {
              element.setAttribute(propName, "")
            } else {
              element.removeAttribute(propName)
            }
          } else {
            element.setAttribute(propName, String(typedValue))
          }
        }

        // Update the properties list
        const updatedProperties = [...properties]
        updatedProperties[propIndex] = {
          ...prop,
          value: typedValue,
          modified: true,
          originalValue: prop.originalValue === undefined ? prop.value : prop.originalValue,
        }

        setProperties(updatedProperties)

        // Show success toast
        toast({
          title: "Property Updated",
          description: `Updated ${propName} to ${String(typedValue)}`,
          variant: "default",
        })

        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error applying property change"
        setError(errorMessage)
        console.error("Error applying property change:", error)
        return false
      }
    },
    [element, properties, toast],
  )

  /**
   * Apply a state change
   */
  const applyStateChange = useCallback(
    (propName: string, newValue: any) => {
      try {
        // Add null check before applying state changes
        if (!element) {
          console.warn("Element is undefined or null in applyStateChange")
          return false
        }

        // Get React fiber key
        const key = Object.keys(element).find(
          (key) => key.startsWith("__reactFiber$") || key.startsWith("__reactInternalInstance$"),
        )

        if (!key) return false

        // @ts-ignore - Accessing internal React properties
        const fiber = element[key]
        if (!fiber) return false

        // Navigate the fiber tree to find the component
        let fiberNode = fiber
        while (fiberNode) {
          if (fiberNode.stateNode && fiberNode.stateNode.setState) {
            // Found a component with setState
            const statePath = propName.substring(6).split(".") // Remove "state." and split into parts

            // Use setState to update the state
            fiberNode.stateNode.setState((prevState: any) => {
              // Handle null or undefined prevState
              if (!prevState) return { [statePath[0]]: newValue }

              // Create a deep copy of the state
              const newState = JSON.parse(JSON.stringify(prevState))

              // Navigate to the correct path and update the value
              let current = newState
              for (let i = 0; i < statePath.length - 1; i++) {
                if (!current[statePath[i]]) {
                  // Create the path if it doesn't exist
                  current[statePath[i]] = {}
                }
                current = current[statePath[i]]
              }

              // Update the final value
              current[statePath[statePath.length - 1]] = newValue

              return newState
            })

            return true
          }

          // Continue traversing the fiber tree
          fiberNode = fiberNode.return
        }

        return false
      } catch (error) {
        console.error("Error applying state change:", error)
        return false
      }
    },
    [element],
  )

  /**
   * Revert a property change
   */
  const revertPropertyChange = useCallback(
    (propName: string) => {
      try {
        // Find the property
        const propIndex = properties.findIndex((p) => p.name === propName)
        if (propIndex === -1) return

        const prop = properties[propIndex]
        if (!prop.modified || prop.originalValue === undefined) return

        // Revert the change
        applyPropertyChange(propName, prop.originalValue)

        // Update the properties list
        const updatedProperties = [...properties]
        updatedProperties[propIndex] = {
          ...prop,
          value: prop.originalValue,
          modified: false,
          originalValue: undefined,
        }

        setProperties(updatedProperties)

        // Show toast
        toast({
          title: "Property Reverted",
          description: `Reverted ${propName} to original value`,
          variant: "default",
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error reverting property change"
        setError(errorMessage)
        console.error("Error reverting property change:", error)
      }
    },
    [properties, applyPropertyChange, toast],
  )

  /**
   * Save all changes (mainly for visual feedback)
   */
  const saveAllChanges = useCallback(() => {
    // In practice, changes are already applied in real-time
    // This function is mainly for visual feedback and to clear the "modified" state
    const updatedProperties = properties.map((prop) => ({
      ...prop,
      modified: false,
      originalValue: undefined,
    }))

    setProperties(updatedProperties)
    setLastAction("Changes saved successfully")

    toast({
      title: "Changes Saved",
      description: "All property changes have been saved",
      variant: "success",
    })
  }, [properties, setLastAction, toast])

  /**
   * Revert all changes
   */
  const revertAllChanges = useCallback(() => {
    // Revert all modified properties
    properties.forEach((prop) => {
      if (prop.modified && prop.originalValue !== undefined) {
        applyPropertyChange(prop.name, prop.originalValue)
      }
    })

    // Update the properties list
    const updatedProperties = properties.map((prop) => ({
      ...prop,
      value: prop.modified && prop.originalValue !== undefined ? prop.originalValue : prop.value,
      modified: false,
      originalValue: undefined,
    }))

    setProperties(updatedProperties)
    setLastAction("Changes reverted")

    toast({
      title: "Changes Reverted",
      description: "All property changes have been reverted",
      variant: "default",
    })
  }, [properties, applyPropertyChange, setLastAction, toast])

  /**
   * Toggle property expansion
   */
  const togglePropExpansion = useCallback((propName: string) => {
    setExpandedProps((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(propName)) {
        newSet.delete(propName)
      } else {
        newSet.add(propName)
      }
      return newSet
    })
  }, [])

  /**
   * Add a new property
   */
  const addNewProperty = useCallback(() => {
    try {
      if (!newPropName || !element) {
        toast({
          title: "Invalid Property",
          description: "Property name cannot be empty",
          variant: "destructive",
        })
        return
      }

      // Check if property already exists
      if (properties.some((p) => p.name === newPropName)) {
        toast({
          title: "Property Exists",
          description: `Property "${newPropName}" already exists`,
          variant: "destructive",
        })
        return
      }

      // Convert value to correct type
      let typedValue = newPropValue
      if (newPropType === "number") {
        typedValue = Number(newPropValue)
        if (isNaN(typedValue)) {
          toast({
            title: "Invalid Value",
            description: "Value must be a valid number",
            variant: "destructive",
          })
          return
        }
      } else if (newPropType === "boolean") {
        typedValue = newPropValue === "true"
      }

      // Apply the new property
      if (newPropName.startsWith("style.")) {
        // Style property
        const styleProp = newPropName.substring(6)
        element.style.setProperty(styleProp, String(typedValue))
      } else {
        // Generic attribute
        element.setAttribute(newPropName, String(typedValue))
      }

      // Add to properties list
      setProperties((prev) => [
        ...prev,
        {
          name: newPropName,
          value: typedValue,
          type: newPropType,
          editable: true,
          category: newPropName.startsWith("style.") ? "style" : "attributes",
        },
      ])

      // Reset form
      setNewPropName("")
      setNewPropValue("")
      setNewPropType("string")

      // Show success toast
      toast({
        title: "Property Added",
        description: `Added ${newPropName} with value ${String(typedValue)}`,
        variant: "success",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error adding property"
      setError(errorMessage)
      console.error("Error adding property:", error)
    }
  }, [element, newPropName, newPropValue, newPropType, properties, toast])

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // SECTION: Event handlers

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setIsDragOver(true)
  }, [])

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  /**
   * Handle drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)

      try {
        const data = e.dataTransfer.getData("application/json")
        if (data) {
          const componentData = JSON.parse(data)

          // Try to find the DOM element for the component
          const elements = document.querySelectorAll(`[data-component="${componentData.name}"]`)
          if (elements.length > 0) {
            // If found, use the first element
            const foundElement = elements[0] as HTMLElement
            extractProperties()
            toast({
              title: "Component Loaded",
              description: `Properties of ${componentData.name} loaded successfully`,
              variant: "success",
            })
          } else {
            toast({
              title: "Component Not Found",
              description: "Could not locate the DOM element for this component",
              variant: "warning",
            })
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error processing dropped component"
        setError(errorMessage)
        console.error("Error processing dragged component:", error)
        toast({
          title: "Error Loading Component",
          description: "Could not process the dragged component",
          variant: "destructive",
        })
      }
    },
    [extractProperties, toast],
  )

  // SECTION: Computed values

  /**
   * Filter properties based on active tab and text filter
   */
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Text filter
      if (filter && !prop.name.toLowerCase().includes(filter.toLowerCase())) {
        return false
      }

      // Tab filter
      if (activeTab === "props") {
        return prop.category === "props" || prop.category === "attributes"
      } else if (activeTab === "style") {
        return prop.category === "style"
      } else if (activeTab === "state") {
        return prop.category === "state"
      }

      return true
    })
  }, [properties, filter, activeTab])

  /**
   * Count modified properties
   */
  const modifiedCount = useMemo(() => {
    return properties.filter((prop) => prop.modified).length
  }, [properties])

  /**
   * Debounced filter function
   */
  const debouncedSetFilter = useMemo(() => debounce((value: string) => setFilter(value), 300), [])

  // SECTION: Render
  return (
    <div
      className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border ${
        isDragOver ? "border-2 border-dashed border-primary/50 bg-primary/5" : "border-gray-200 dark:border-gray-700"
      } flex flex-col`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg z-10">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <DropletsIcon className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drop to edit this component's properties
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
          <Settings className="h-4 w-4 mr-2 text-primary" />
          Property Editor
          {modifiedCount > 0 && (
            <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
              {modifiedCount} changes
            </Badge>
          )}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="m-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
          <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-6 w-6 p-0" onClick={clearError}>
            <X className="h-3 w-3" />
          </Button>
        </Alert>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="p-4 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading properties...</p>
        </div>
      )}

      {/* Filter and tabs */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <Input
          placeholder="Filter properties..."
          defaultValue={filter}
          onChange={(e) => debouncedSetFilter(e.target.value)}
          className="h-8 text-sm rounded-full bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 focus:border-primary/30 focus:ring-primary/20"
          disabled={disabled}
        />

        <Tabs defaultValue="all" className="mt-2" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="w-full grid grid-cols-4 h-8 rounded-full bg-gray-100 dark:bg-gray-700 p-1">
            <TabsTrigger
              value="all"
              className="rounded-full text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              disabled={disabled}
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="props"
              className="rounded-full text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              disabled={disabled}
            >
              Props
            </TabsTrigger>
            <TabsTrigger
              value="style"
              className="rounded-full text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              disabled={disabled}
            >
              Style
            </TabsTrigger>
            <TabsTrigger
              value="state"
              className="rounded-full text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              disabled={disabled}
            >
              State
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Action buttons for modified properties */}
      {modifiedCount > 0 && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 rounded-full"
            onClick={revertAllChanges}
            disabled={disabled}
          >
            <Undo className="h-3.5 w-3.5 mr-1.5" /> Revert
          </Button>
          <Button
            size="sm"
            variant="default"
            className="text-xs h-8 rounded-full"
            onClick={saveAllChanges}
            disabled={disabled}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" /> Save Changes
          </Button>
        </div>
      )}

      {/* Property list */}
      <ScrollArea className="flex-1 max-h-80">
        <div className="p-2 space-y-1">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              {isDragOver
                ? "Drop a component here to see its properties"
                : isLoading
                  ? "Loading properties..."
                  : "No properties found"}
            </div>
          ) : (
            filteredProperties.map((prop) => {
              const isExpanded = expandedProps.has(prop.name)
              const isEditing = editingProp === prop.name

              // Determine prefix for grouping properties
              let prefix = ""
              if (prop.name.includes(".")) {
                prefix = prop.name.split(".")[0]
              }

              // Check if this is an object property
              const isObjectProp = prop.name === prefix

              return (
                <div
                  key={prop.name}
                  className={`p-2 rounded-md ${
                    prop.modified
                      ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30"
                      : "bg-gray-50 dark:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm text-gray-800 dark:text-gray-200 flex items-center">
                      {isObjectProp ? (
                        <button
                          className="mr-1 h-5 w-5 flex items-center justify-center rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={() => togglePropExpansion(prop.name)}
                          disabled={disabled}
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      ) : (
                        <span className="w-5"></span>
                      )}
                      {prop.name}
                      {prop.modified && (
                        <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 text-[10px]">
                          Modified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          prop.type === "string"
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : prop.type === "number"
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                              : prop.type === "boolean"
                                ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {prop.type}
                      </Badge>

                      {prop.editable && !isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={() => setEditingProp(prop.name)}
                          disabled={disabled}
                          aria-label="Edit"
                        >
                          <Edit className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                        </Button>
                      )}

                      {prop.modified && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                          onClick={() => revertPropertyChange(prop.name)}
                          disabled={disabled}
                          aria-label="Revert"
                        >
                          <Undo className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Property value */}
                  {!isEditing ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-5">
                      {prop.type === "boolean" ? (
                        <Switch
                          checked={Boolean(prop.value)}
                          onCheckedChange={(checked) => {
                            if (prop.editable && !disabled) {
                              applyPropertyChange(prop.name, checked)
                            }
                          }}
                          disabled={!prop.editable || disabled}
                        />
                      ) : (
                        <div className="truncate">{prop.value === "" ? '""' : String(prop.value)}</div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 pl-5 flex items-center space-x-2">
                      {prop.type === "boolean" ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={Boolean(prop.value)}
                            onCheckedChange={(checked) => applyPropertyChange(prop.name, checked)}
                            disabled={disabled}
                          />
                          <Label className="ml-2">{Boolean(prop.value) ? "True" : "False"}</Label>
                        </div>
                      ) : prop.type === "number" ? (
                        <Input
                          type="number"
                          value={prop.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value)
                            applyPropertyChange(prop.name, value)
                          }}
                          className="h-7 text-xs"
                          disabled={disabled}
                        />
                      ) : (
                        <Input
                          value={String(prop.value)}
                          onChange={(e) => applyPropertyChange(prop.name, e.target.value)}
                          className="h-7 text-xs"
                          disabled={disabled}
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400"
                        onClick={() => setEditingProp(null)}
                        disabled={disabled}
                        aria-label="Confirm"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer with property count and add button */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <span>{properties.length} properties found</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs rounded-full" disabled={disabled || !element}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="text-sm font-medium mb-2">Add Property</div>
            <div className="space-y-2">
              <div>
                <Label htmlFor="prop-name" className="text-xs">
                  Name
                </Label>
                <Input
                  id="prop-name"
                  className="h-7 text-xs mt-1"
                  placeholder="property.name"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="prop-type" className="text-xs">
                  Type
                </Label>
                <select
                  id="prop-type"
                  className="w-full h-7 text-xs mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  value={newPropType}
                  onChange={(e) => setNewPropType(e.target.value as PropertyType)}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
              <div>
                <Label htmlFor="prop-value" className="text-xs">
                  Value
                </Label>
                {newPropType === "boolean" ? (
                  <div className="flex items-center mt-1">
                    <Switch
                      id="prop-value"
                      checked={newPropValue === "true"}
                      onCheckedChange={(checked) => setNewPropValue(checked ? "true" : "false")}
                    />
                    <Label className="ml-2">{newPropValue === "true" ? "True" : "False"}</Label>
                  </div>
                ) : (
                  <Input
                    id="prop-value"
                    className="h-7 text-xs mt-1"
                    placeholder="value"
                    type={newPropType === "number" ? "number" : "text"}
                    value={newPropValue}
                    onChange={(e) => setNewPropValue(e.target.value)}
                  />
                )}
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="h-7 text-xs" onClick={addNewProperty} disabled={!newPropName}>
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
