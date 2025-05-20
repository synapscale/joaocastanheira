import { Metadata } from "next";

// Componentes simplificados para resolver problemas de importação
const Section = ({ title, description, children }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold mb-1">{title}</h2>
    <p className="text-muted-foreground mb-4">{description}</p>
    {children}
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`border rounded-lg bg-card shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-4 border-b ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>
);

const Tabs = ({ children, defaultValue }) => (
  <div data-default-value={defaultValue}>{children}</div>
);

const TabsList = ({ children, className = "" }) => (
  <div className={`flex space-x-2 ${className}`}>{children}</div>
);

const TabsTrigger = ({ children, value, className = "" }) => (
  <button className={`px-4 py-2 rounded hover:bg-muted ${className}`} data-value={value}>
    {children}
  </button>
);

const TabsContent = ({ children, value }) => (
  <div data-value={value}>{children}</div>
);

export const metadata: Metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <Section title="Configurações" description="Gerencie as configurações do sistema">
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="account">Conta</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    As configurações gerais serão exibidas aqui quando disponíveis.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Conta</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    As configurações de conta serão exibidas aqui quando disponíveis.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de API</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    As configurações de API serão exibidas aqui quando disponíveis.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Avançadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    As configurações avançadas serão exibidas aqui quando disponíveis.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Section>
      </div>
    </div>
  )
}
