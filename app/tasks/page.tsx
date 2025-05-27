"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ListChecks, Search, Plus, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react"
import Link from "next/link"

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const tasks = [
    {
      id: 1,
      title: "Implementar autenticação",
      description: "Adicionar sistema de login e registro",
      status: "in-progress",
      priority: "high",
      dueDate: "2024-01-15",
      assignee: "João Silva",
    },
    {
      id: 2,
      title: "Otimizar performance",
      description: "Melhorar velocidade de carregamento",
      status: "pending",
      priority: "medium",
      dueDate: "2024-01-20",
      assignee: "Maria Santos",
    },
    {
      id: 3,
      title: "Documentação da API",
      description: "Criar documentação completa da API",
      status: "completed",
      priority: "low",
      dueDate: "2024-01-10",
      assignee: "Pedro Costa",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">Gerencie e acompanhe o progresso das tarefas.</p>
        </div>
        <Button asChild>
          <Link href="/tasks/create">
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Lista de Tarefas
          </CardTitle>
          <CardDescription>Total de {tasks.length} tarefas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="font-semibold">{task.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                      </div>
                      <span>Responsável: {task.assignee}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status === "completed" && "Concluída"}
                      {task.status === "in-progress" && "Em Progresso"}
                      {task.status === "pending" && "Pendente"}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority === "high" && "Alta"}
                      {task.priority === "medium" && "Média"}
                      {task.priority === "low" && "Baixa"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
