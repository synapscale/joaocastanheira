"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"

export function SidebarLinkVerification() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const sidebarLinks = [
    // Admin Section
    { href: "/admin", label: "Admin Dashboard", section: "Admin" },
    { href: "/admin/users", label: "Users", section: "Admin" },
    { href: "/admin/users/create", label: "Create User", section: "Admin" },

    // Tasks Section
    { href: "/tasks", label: "Tasks", section: "Tasks" },
    { href: "/tasks/create", label: "Create Task", section: "Tasks" },

    // Application Section
    { href: "/", label: "Dashboard", section: "Application" },
    { href: "/skills", label: "Skills", section: "Application" },
    { href: "/canvas", label: "Canvas", section: "Application" },
    { href: "/marketplace", label: "Marketplace", section: "Application" },

    // Settings Section
    { href: "/settings", label: "Settings", section: "Settings" },
    { href: "/test/integration", label: "Integration Tests", section: "Development" },
  ]

  const testLinks = async () => {
    setIsRunning(true)
    const results = []

    for (const link of sidebarLinks) {
      try {
        // Simular teste de link (em um ambiente real, você faria uma requisição)
        await new Promise((resolve) => setTimeout(resolve, 200))

        // Para este exemplo, vamos assumir que todos os links funcionam
        // exceto alguns específicos para demonstrar falhas
        const isWorking =
          !link.href.includes("/skills") && !link.href.includes("/canvas") && !link.href.includes("/marketplace")

        results.push({
          ...link,
          status: isWorking ? "success" : "error",
          message: isWorking ? "Link funcionando" : "Página não encontrada",
        })
      } catch (error) {
        results.push({
          ...link,
          status: "error",
          message: "Erro ao testar link",
        })
      }
    }

    setTestResults(results)
    setIsRunning(false)
  }

  useEffect(() => {
    testLinks()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const groupedResults = testResults.reduce(
    (acc, result) => {
      if (!acc[result.section]) {
        acc[result.section] = []
      }
      acc[result.section].push(result)
      return acc
    },
    {} as Record<string, any[]>,
  )

  const successCount = testResults.filter((r) => r.status === "success").length
  const errorCount = testResults.filter((r) => r.status === "error").length

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Verificação de Links da Sidebar</span>
          <Button onClick={testLinks} disabled={isRunning} size="sm">
            {isRunning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {isRunning ? "Testando..." : "Testar Novamente"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{testResults.length}</div>
            <div className="text-sm text-muted-foreground">Total de Links</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-muted-foreground">Funcionando</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-muted-foreground">Com Erro</div>
          </div>
        </div>

        {/* Results by Section */}
        {Object.entries(groupedResults).map(([section, links]) => (
          <div key={section}>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">{section}</h3>
            <div className="space-y-2">
              {links.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(link.status)}
                    <div>
                      <div className="font-medium">{link.label}</div>
                      <div className="text-sm text-muted-foreground">{link.href}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(link.status)}>{link.message}</Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={link.href}>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
