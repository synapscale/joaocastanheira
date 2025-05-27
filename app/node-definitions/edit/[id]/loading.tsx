import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-6">
      <Skeleton className="h-10 w-64 mb-6" />

      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full rounded-md" />
      </div>
    </div>
  )
}
