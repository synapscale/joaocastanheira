import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Variáveis do Usuário | SynapScale",
  description: "Gerencie suas chaves de API e conexões com serviços externos",
}

export default function UserVariablesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {children}
    </div>
  )
}
