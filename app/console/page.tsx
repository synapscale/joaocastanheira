"use client"

import { useState } from "react"
import { Terminal, Play, CloudyIcon as Clear, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ConsolePage() {
  const [command, setCommand] = useState("")
  const [history, setHistory] = useState<string[]>([
    "Sistema iniciado",
    "Conectado ao servidor de desenvolvimento",
    "Pronto para receber comandos",
  ])

  const executeCommand = () => {
    if (!command.trim()) return

    const newHistory = [...history, `> ${command}`, `Comando executado: ${command}`]
    setHistory(newHistory)
    setCommand("")
  }

  const clearHistory = () => {
    setHistory(["Console limpo", "Pronto para receber comandos"])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Terminal className="h-8 w-8" />
            Console
          </h1>
          <p className="text-muted-foreground">Console de desenvolvimento e debugging</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={clearHistory}>
            <Clear className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Console */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Terminal
          </CardTitle>
          <CardDescription>Execute comandos e visualize logs do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* History */}
          <ScrollArea className="h-64 w-full rounded border bg-slate-950 text-green-400 p-4">
            <div className="space-y-1 font-mono text-sm">
              {history.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Digite um comando..."
              onKeyDown={(e) => e.key === "Enter" && executeCommand()}
              className="font-mono"
            />
            <Button onClick={executeCommand}>
              <Play className="w-4 h-4 mr-2" />
              Executar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
