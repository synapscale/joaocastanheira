"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, Bell, Globe, Shield, Database, Zap } from "lucide-react"

export function SettingsSidebar() {
  const [activeSection, setActiveSection] = useState("profile")

  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-2 py-4">
        <div className="space-y-1">
          <Button
            variant={activeSection === "profile" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSection("profile")}
          >
            <User className="h-4 w-4 mr-2" />
            Perfil
          </Button>
          <Button
            variant={activeSection === "notifications" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSection("notifications")}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </Button>
          <Button
            variant={activeSection === "appearance" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSection("appearance")}
          >
            <Globe className="h-4 w-4 mr-2" />
            Aparência
          </Button>
          <Button
            variant={activeSection === "security" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSection("security")}
          >
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </Button>
          <Button
            variant={activeSection === "integrations" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSection("integrations")}
          >
            <Database className="h-4 w-4 mr-2" />
            Integrações
          </Button>
          <Button
            variant={activeSection === "api" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSection("api")}
          >
            <Zap className="h-4 w-4 mr-2" />
            API
          </Button>
        </div>
      </div>
    </div>
  )
}
