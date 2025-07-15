import { CodeTemplateMigration } from "@/components/admin/code-template-migration"

export default function AdminCodeTemplatesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Code Template Management</h1>
          <p className="text-muted-foreground">
            Migrate and manage your code templates from the old localStorage system to the new API-driven approach.
          </p>
        </div>
        
        <CodeTemplateMigration />
      </div>
    </div>
  )
} 