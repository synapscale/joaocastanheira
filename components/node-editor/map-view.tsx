"use client"

import { memo, useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface MapViewProps {
  data: any
  emptyMessage?: string
}

/**
 * MapView component for visualizing geographic data
 */
function MapViewComponent({ data, emptyMessage = "No data to display" }: MapViewProps) {
  const [latField, setLatField] = useState<string>("")
  const [lngField, setLngField] = useState<string>("")
  const [titleField, setTitleField] = useState<string>("")

  // Extract available fields for mapping
  const fields = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
      return { all: [], lat: [], lng: [] }
    }

    const sample = data[0]
    const allFields = Object.keys(sample)

    // Identify potential latitude fields
    const latFields = allFields.filter((key) => key.toLowerCase().includes("lat") || key.toLowerCase() === "y")

    // Identify potential longitude fields
    const lngFields = allFields.filter(
      (key) => key.toLowerCase().includes("lng") || key.toLowerCase().includes("lon") || key.toLowerCase() === "x",
    )

    return { all: allFields, lat: latFields, lng: lngFields }
  }, [data])

  // Set default fields if not set
  useMemo(() => {
    if (fields.lat.length > 0 && !latField) {
      setLatField(fields.lat[0])
    }

    if (fields.lng.length > 0 && !lngField) {
      setLngField(fields.lng[0])
    }

    if (fields.all.length > 0 && !titleField) {
      // Try to find a good title field (name, title, etc.)
      const titleCandidates = ["name", "title", "label", "address", "location"]
      const foundTitle = fields.all.find((field) => titleCandidates.includes(field.toLowerCase()))

      setTitleField(foundTitle || fields.all[0])
    }
  }, [fields, latField, lngField, titleField])

  // Prepare map data
  const mapPoints = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0 || !latField || !lngField) {
      return []
    }

    return data
      .filter(
        (item) =>
          item[latField] !== undefined &&
          item[lngField] !== undefined &&
          !isNaN(Number(item[latField])) &&
          !isNaN(Number(item[lngField])),
      )
      .map((item) => ({
        lat: Number(item[latField]),
        lng: Number(item[lngField]),
        title: item[titleField] || "Untitled",
        data: item,
      }))
  }, [data, latField, lngField, titleField])

  // If no data or invalid data, show empty message
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
    return <div className="text-center p-4 text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="lat-field">Latitude Field</Label>
          <Select value={latField} onValueChange={setLatField}>
            <SelectTrigger id="lat-field">
              <SelectValue placeholder="Select latitude field" />
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
          <Label htmlFor="lng-field">Longitude Field</Label>
          <Select value={lngField} onValueChange={setLngField}>
            <SelectTrigger id="lng-field">
              <SelectValue placeholder="Select longitude field" />
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

      <div className="border rounded-md overflow-hidden h-[350px] bg-gray-100 relative">
        {mapPoints.length > 0 ? (
          <div className="p-4 absolute inset-0">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Map visualization requires a map provider integration
              </p>
              <div className="bg-white p-3 rounded-md border shadow-sm">
                <h3 className="font-medium mb-2">Data Preview</h3>
                <div className="text-sm max-h-[250px] overflow-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2">Title</th>
                        <th className="p-2">Latitude</th>
                        <th className="p-2">Longitude</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mapPoints.slice(0, 10).map((point, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{point.title}</td>
                          <td className="p-2">{point.lat}</td>
                          <td className="p-2">{point.lng}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {mapPoints.length > 10 && (
                    <p className="text-center text-muted-foreground mt-2">Showing 10 of {mapPoints.length} points</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No geographic data available or invalid coordinates</p>
          </div>
        )}
      </div>
    </div>
  )
}

export const MapView = memo(MapViewComponent)
