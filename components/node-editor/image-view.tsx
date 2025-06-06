"use client"

import { memo, useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Grid2X2, Maximize2 } from "lucide-react"

interface ImageViewProps {
  data: any
  emptyMessage?: string
}

/**
 * ImageView component for visualizing image data
 */
function ImageViewComponent({ data, emptyMessage = "No image data to display" }: ImageViewProps) {
  const [imageField, setImageField] = useState<string>("")
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid")
  const [selectedImage, setSelectedImage] = useState<number>(0)

  // Extract available fields for images
  const fields = useMemo(() => {
    if (typeof data === "string" && (isImageUrl(data) || isBase64Image(data))) {
      return { all: ["url"], images: [data] }
    }

    if (
      Array.isArray(data) &&
      data.every((item) => typeof item === "string" && (isImageUrl(item) || isBase64Image(item)))
    ) {
      return { all: ["url"], images: data }
    }

    if (!Array.isArray(data) && typeof data !== "object") {
      return { all: [], images: [] }
    }

    const sample = Array.isArray(data) ? data[0] : data
    if (!sample || typeof sample !== "object") {
      return { all: [], images: [] }
    }

    const allFields = Object.keys(sample)

    // Identify potential image URL fields
    const imageFields = allFields.filter((key) => {
      const value = sample[key]
      return typeof value === "string" && (isImageUrl(value) || isBase64Image(value))
    })

    return { all: allFields, imageFields }
  }, [data])

  // Set default image field if not set
  useMemo(() => {
    if (fields.imageFields?.length > 0 && !imageField) {
      setImageField(fields.imageFields[0])
    } else if (fields.all?.includes("url") && !imageField) {
      setImageField("url")
    }
  }, [fields, imageField])

  // Prepare image data
  const images = useMemo(() => {
    if (typeof data === "string" && (isImageUrl(data) || isBase64Image(data))) {
      return [{ url: data }]
    }

    if (
      Array.isArray(data) &&
      data.every((item) => typeof item === "string" && (isImageUrl(item) || isBase64Image(item)))
    ) {
      return data.map((url) => ({ url }))
    }

    if (!Array.isArray(data) && typeof data === "object" && data !== null) {
      const imageUrls = Object.values(data).filter(
        (value) => typeof value === "string" && (isImageUrl(value) || isBase64Image(value)),
      )

      if (imageUrls.length > 0) {
        return imageUrls.map((url) => ({ url: url as string }))
      }
    }

    if (!Array.isArray(data) || data.length === 0 || !imageField) {
      return []
    }

    return data
      .filter(
        (item) =>
          typeof item[imageField] === "string" && (isImageUrl(item[imageField]) || isBase64Image(item[imageField])),
      )
      .map((item) => ({
        url: item[imageField],
        data: item,
      }))
  }, [data, imageField])

  // If no images found, show empty message
  if (images.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <div className="p-4 space-y-4">
      {fields.imageFields?.length > 0 && (
        <div>
          <Label htmlFor="image-field">Image Field</Label>
          <Select value={imageField} onValueChange={setImageField}>
            <SelectTrigger id="image-field">
              <SelectValue placeholder="Select image field" />
            </SelectTrigger>
            <SelectContent>
              {fields.imageFields.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "single")}>
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-1.5">
              <Grid2X2 className="h-3.5 w-3.5" />
              <span>Grid</span>
            </TabsTrigger>
            <TabsTrigger value="single" className="flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Single</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="grid" className="m-0 p-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[350px] overflow-auto">
          {images.map((image, index) => (
            <div
              key={index}
              className="border rounded-md overflow-hidden cursor-pointer hover:border-blue-500"
              onClick={() => {
                setSelectedImage(index)
                setViewMode("single")
              }}
            >
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={`Image ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/image-error.png"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="single" className="m-0 p-0">
        {images[selectedImage] && (
          <div className="space-y-4">
            <div className="border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center h-[350px]">
              <img
                src={images[selectedImage].url || "/placeholder.svg"}
                alt={`Image ${selectedImage + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/image-error.png"
                }}
              />
            </div>

            <div className="flex justify-between">
              <button
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                disabled={selectedImage === 0}
                onClick={() => setSelectedImage((prev) => prev - 1)}
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                {selectedImage + 1} of {images.length}
              </span>
              <button
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                disabled={selectedImage === images.length - 1}
                onClick={() => setSelectedImage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </TabsContent>
    </div>
  )
}

// Helper functions
function isImageUrl(str: string): boolean {
  return /\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i.test(str) || (str.startsWith("http") && /\bimage\b/i.test(str))
}

function isBase64Image(str: string): boolean {
  return /^data:image\/(jpeg|png|gif|svg\+xml|webp);base64,/.test(str)
}

export const ImageView = memo(ImageViewComponent)
