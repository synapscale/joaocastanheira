"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

/**
 * Component for the not found state of the agent form
 */
export function AgentNotFound() {
  const router = useRouter()

  return (
    <div className="flex flex-col w-full h-full bg-gray-50/50">
      <header className="flex items-center justify-between p-3 sm:p-4 md:p-6 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/agentes")}
            className="flex items-center text-gray-500 hover:text-gray-900"
          >
            <span className="sr-only sm:not-sr-only">Voltar</span>
          </Button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Agente não encontrado</h1>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground mb-4">O agente solicitado não foi encontrado.</p>
            <Button onClick={() => router.push("/agentes")} className="bg-purple-600 hover:bg-purple-700 text-white">
              Voltar para a lista de agentes
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
