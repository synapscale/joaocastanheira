"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function WorkflowsLoading() {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
          <Skeleton className="h-5 w-[350px]" />
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-1">
                  <Skeleton className="h-4 w-[100px] mb-1" />
                  <Skeleton className="h-4 w-[80px] mb-1" />
                  <Skeleton className="h-6 w-[60px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Abas */}
        <div className="space-y-4">
          <div className="flex border-b">
            <Skeleton className="h-10 w-[100px] mr-2" />
            <Skeleton className="h-10 w-[100px] mr-2" />
            <Skeleton className="h-10 w-[100px]" />
          </div>

          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <Skeleton className="h-10 w-full md:w-96" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </div>

          {/* Lista de workflows */}
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex flex-col space-y-2">
                      <Skeleton className="h-6 w-[200px]" />
                      <div className="flex flex-wrap items-center">
                        <Skeleton className="h-4 w-[120px] mr-2" />
                        <Skeleton className="h-4 w-[100px] mr-2" />
                        <Skeleton className="h-6 w-[80px] mr-1 mt-1" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-6 w-[80px]" />
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-6 w-[40px]" />
                          <Skeleton className="h-4 w-[60px]" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
