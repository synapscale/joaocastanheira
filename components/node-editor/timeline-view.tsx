"use client"

import { memo, useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

interface TimelineViewProps {
  data: any
  emptyMessage?: string
}

/**
 * TimelineView component for visualizing time-based data
 */
function TimelineViewComponent({ data, emptyMessage = "No data to display" }: TimelineViewProps) {
  const [dateField, setDateField] = useState<string>("")
  const [titleField, setTitleField] = useState<string>("")

  // Extract available fields for timeline
  const fields = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
      return { all: [], date: [] }
    }

    const sample = data[0]
    const allFields = Object.keys(sample)

    // Identify potential date fields
    const dateFields = allFields.filter((key) => {
      const value = sample[key]
      return (
        (typeof value === "string" && isDateString(value)) ||
        key.toLowerCase().includes("date") ||
        key.toLowerCase().includes("time") ||
        key.toLowerCase().includes("created") ||
        key.toLowerCase().includes("updated")
      )
    })

    return { all: allFields, date: dateFields }
  }, [data])

  // Set default fields if not set
  useMemo(() => {
    if (fields.date.length > 0 && !dateField) {
      setDateField(fields.date[0])
    }

    if (fields.all.length > 0 && !titleField) {
      // Try to find a good title field (name, title, etc.)
      const titleCandidates = ["name", "title", "subject", "description", "label"]
      const foundTitle = fields.all.find((field) => titleCandidates.includes(field.toLowerCase()))

      setTitleField(foundTitle || fields.all[0])
    }
  }, [fields, dateField, titleField])

  // Prepare timeline data
  const timelineItems = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0 || !dateField) {
      return []
    }

    return data
      .filter((item) => item[dateField] && isValidDate(new Date(item[dateField])))
      .map((item) => ({
        date: new Date(item[dateField]),
        title: item[titleField] || "Untitled",
        data: item,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [data, dateField, titleField])

  // If no data or invalid data, show empty message
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
    return <div className="text-center p-4 text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date-field">Date Field</Label>
          <Select value={dateField} onValueChange={setDateField}>
            <SelectTrigger id="date-field">
              <SelectValue placeholder="Select date field" />
            </SelectTrigger>
            <SelectContent>
              {fields.all.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title-field">Title Field</Label>
          <Select value={titleField} onValueChange={setTitleField}>
            <SelectTrigger id="title-field">
              <SelectValue placeholder="Select title field" />
            </SelectTrigger>
            <SelectContent>
              {fields.all.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-auto max-h-[350px] relative border rounded-md">
        {/* Timeline line */}
        <div className="absolute left-[20px] top-0 bottom-0 w-[2px] bg-gray-200" />

        {timelineItems.length > 0 ? (
          <div className="py-4">
            {timelineItems.map((item, index) => (
              <div key={index} className="flex mb-4 pl-4">
                {/* Timeline dot */}
                <div className="relative">
                  <div className="absolute left-[-14px] w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>

                {/* Timeline content */}
                <div className="ml-6 bg-white p-3 rounded-md border shadow-sm w-full">
                  <div className="text-sm text-gray-500 mb-1">{format(item.date, "PPpp")}</div>
                  <div className="font-medium">{item.title}</div>

                  {/* Additional details */}
                  <div className="mt-2 text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                    {Object.entries(item.data)
                      .filter(([key]) => key !== dateField && key !== titleField)
                      .slice(0, 4) // Limit to 4 additional fields
                      .map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-medium text-gray-600 mr-1">{key}:</span>
                          <span className="text-gray-800 truncate">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">No timeline data available</div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function isDateString(str: string): boolean {
  return !isNaN(Date.parse(str))
}

function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime())
}

export const TimelineView = memo(TimelineViewComponent)
