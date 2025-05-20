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

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

export const metadata: Metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function CanvasPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Section title="Canvas" description="Ferramenta visual para criação de fluxos">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h3 className="text-lg font-medium mb-2">Página em Desenvolvimento</h3>
                <p className="text-muted-foreground mb-4">
                  A ferramenta Canvas está sendo desenvolvida e estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </Section>
      </div>
    </div>
  )
}
