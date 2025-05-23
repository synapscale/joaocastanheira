import { Skeleton } from "@/components/ui/skeleton"

/**
 * Component for the loading state of the agent form
 */
export function AgentFormLoading() {
  return (
    <div className="flex flex-col w-full h-full bg-gray-50/50">
      <header className="flex flex-wrap items-center justify-between p-3 sm:p-4 md:p-6 bg-white border-b sticky top-0 z-10 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto mb-2 sm:mb-0">
          <Skeleton className="h-8 w-24" />
          <div className="w-px h-5 sm:h-6 bg-gray-200" aria-hidden="true"></div>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Skeleton className="h-9 w-32" />
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-full sm:w-1/2">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="w-full sm:w-1/2 flex gap-3 sm:gap-4">
                <div className="w-1/2">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="w-1/2">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            <Skeleton className="h-10 w-full" />

            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-64 w-full" />
            </div>

            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>

            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
