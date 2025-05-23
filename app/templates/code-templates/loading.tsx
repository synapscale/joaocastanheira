import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-36" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
