"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, List, Table2, FileJson, ImageIcon, FileText } from "lucide-react"

interface DataViewerProps {
  data: any
  onCopy?: (text: string) => void
  height?: string
}

/**
 * DataViewer component.
 *
 * Displays data in various formats (JSON, table, etc.).
 */
export function DataViewer({ data, onCopy, height = "auto" }: DataViewerProps) {
  const [activeView, setActiveView] = useState<string>("json")

  // Format JSON for display
  const formatJson = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2)
    } catch (error) {
      return `Error formatting JSON: ${error}`
    }
  }

  // Handle copy button click
  const handleCopy = () => {
    if (onCopy) {
      onCopy(formatJson(data))
    }
  }

  // Determine if data is an array of objects with consistent keys
  const isTableData = Array.isArray(data) && data.length > 0 && typeof data[0] === "object"

  // Determine if data contains image URLs
  const hasImageUrls =
    Array.isArray(data) &&
    data.some((item) => {
      return (
        typeof item === "string" &&
        (item.endsWith(".jpg") ||
          item.endsWith(".png") ||
          item.endsWith(".gif") ||
          item.startsWith("data:image/") ||
          item.includes("image"))
      )
    })

  // Determine if data contains text content
  const hasTextContent =
    typeof data === "string" || (Array.isArray(data) && data.every((item) => typeof item === "string"))

  // Get table headers if data is table-like
  const tableHeaders = isTableData ? Object.keys(data[0]) : []

  return (
    <div className="border rounded-md overflow-hidden" style={{ height }}>
      <div className="bg-muted px-3 py-1.5 text-xs font-medium flex items-center justify-between">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid grid-cols-5 h-7">
            <TabsTrigger value="json" className="text-xs h-6 px-2">
              <FileJson className="h-3 w-3 mr-1" />
              JSON
            </TabsTrigger>
            {isTableData && (
              <TabsTrigger value="table" className="text-xs h-6 px-2">
                <Table2 className="h-3 w-3 mr-1" />
                Table
              </TabsTrigger>
            )}
            <TabsTrigger value="list" className="text-xs h-6 px-2">
              <List className="h-3 w-3 mr-1" />
              List
            </TabsTrigger>
            {hasImageUrls && (
              <TabsTrigger value="image" className="text-xs h-6 px-2">
                <ImageIcon className="h-3 w-3 mr-1" />
                Images
              </TabsTrigger>
            )}
            {hasTextContent && (
              <TabsTrigger value="text" className="text-xs h-6 px-2">
                <FileText className="h-3 w-3 mr-1" />
                Text
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCopy}>
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <div className="overflow-auto" style={{ maxHeight: "calc(100% - 30px)" }}>
        <TabsContent value="json" className="m-0">
          <pre className="p-3 text-sm font-mono whitespace-pre-wrap bg-black text-white">{formatJson(data)}</pre>
        </TabsContent>

        {isTableData && (
          <TabsContent value="table" className="m-0">
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row: any) => (
                    <tr key={JSON.stringify(row)}>
                      {tableHeaders.map((header) => (
                        <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {typeof row[header] === "object" ? JSON.stringify(row[header]) : String(row[header])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        )}

        <TabsContent value="list" className="m-0">
          <ul className="divide-y divide-gray-200">
            {Array.isArray(data)
              ? data.map((item) => (
                  <li
                    key={typeof item === "object" ? JSON.stringify(item) : String(item)}
                    className="px-4 py-3 text-sm"
                  >
                    {typeof item === "object" ? JSON.stringify(item) : String(item)}
                  </li>
                ))
              : Object.entries(data).map(([key, value]) => (
                  <li key={key} className="px-4 py-3 text-sm">
                    <span className="font-medium">{key}: </span>
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </li>
                ))}
          </ul>
        </TabsContent>

        {hasImageUrls && (
          <TabsContent value="image" className="m-0 p-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.isArray(data) &&
                data
                  .filter(
                    (item) =>
                      typeof item === "string" &&
                      (item.endsWith(".jpg") ||
                        item.endsWith(".png") ||
                        item.endsWith(".gif") ||
                        item.startsWith("data:image/") ||
                        item.includes("image")),
                  )
                  .map((url) => (
                    <div key={url} className="border rounded overflow-hidden">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Image ${url}`}
                        className="w-full h-auto object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/image-error.png"
                          target.alt = "Failed to load image"
                        }}
                      />
                      <div className="p-2 text-xs truncate">{url}</div>
                    </div>
                  ))}
            </div>
          </TabsContent>
        )}

        {hasTextContent && (
          <TabsContent value="text" className="m-0">
            <div className="p-4 text-sm whitespace-pre-wrap">
              {typeof data === "string" ? data : Array.isArray(data) ? data.join("\n") : JSON.stringify(data, null, 2)}
            </div>
          </TabsContent>
        )}
      </div>
    </div>
  )
}
