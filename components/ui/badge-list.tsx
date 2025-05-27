"use client"
import { X, Plus } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

/**
 * A component for displaying and managing a list of badges
 *
 * This component allows users to view, add, edit, and remove badges.
 * It's useful for managing tags, categories, or any other list of items.
 *
 * @example
 * \`\`\`tsx
 * <BadgeList
 *   items={tags}
 *   onAdd={addTag}
 *   onRemove={removeTag}
 *   onEdit={editTag}
 *   addLabel="Tag"
 *   maxItems={10}
 *   emptyMessage="No tags added yet"
 * />
 * \`\`\`
 *
 * @param props - Component properties
 * @returns React component
 */
export function BadgeList({
  // Required props
  items,
  onAdd,
  onRemove,

  // Optional props with defaults
  onEdit,
  addLabel = "Item",
  maxItems = 10,
  className,
  emptyMessage = "Nenhum item adicionado",
  readOnly = false,
  addButtonVariant = "outline",
  badgeVariant = "secondary",
  sortable = false,
  onReorder,
  confirmRemoval = false,
  removeBadgeAriaLabel,

  // Accessibility props
  id,
  testId,
  ariaLabel,
}) {
  const componentId = id || "badge-list"

  return (
    <div
      className={cn("space-y-3", className)}
      id={componentId}
      data-testid={testId}
      aria-label={ariaLabel || `List of ${addLabel.toLowerCase()}s`}
    >
      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center">
              <div className="px-2 py-1 bg-gray-100 rounded-md text-xs flex items-center">
                <span className="mr-1">{item.label}</span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center"
                    aria-label={`Remover ${item.label}`}
                    data-testid={`${componentId}-remove-${item.id}`}
                  >
                    <X className="h-2.5 w-2.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!readOnly && items.length < maxItems && (
        <Button
          type="button"
          variant={addButtonVariant}
          size="sm"
          onClick={onAdd}
          className="h-8 text-xs bg-white hover:bg-gray-50"
          aria-label={`Adicionar ${addLabel}`}
          data-testid={`${componentId}-add-button`}
        >
          <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Adicionar {addLabel}
        </Button>
      )}
    </div>
  )
}
