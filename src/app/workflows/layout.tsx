import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Workflows | SynapScale",
  description: "Gerencie seus workflows e automações",
}

export default function WorkflowsLayout({
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
