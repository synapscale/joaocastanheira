import { Skeleton } from "@/components/ui/skeleton"

export default function CanvasLoading() {
  return (
    <div className="h-full w-full p-6">
      <div className="h-[calc(100vh-2rem)] w-full rounded-lg bg-muted/40 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  )
}
