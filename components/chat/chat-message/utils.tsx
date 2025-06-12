import type { ReactNode } from "react"
import ComponentReferenceMessage from "../component-reference-message"

// Função para processar o conteúdo da mensagem e identificar referências de componentes
export function processMessageContent(content: string): ReactNode {
  // Verifica se há referências de componentes no formato [ComponentReference:{...}]
  const componentRefRegex = /\[ComponentReference:(.*?)\]/g

  if (!componentRefRegex.test(content)) {
    // Se não houver referências, retorna o conteúdo original
    return content
  }

  // Divide o conteúdo em partes, alternando entre texto normal e referências de componentes
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match

  // Reset do regex para começar do início
  componentRefRegex.lastIndex = 0

  while ((match = componentRefRegex.exec(content)) !== null) {
    // Adiciona o texto antes da referência
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index))
    }

    try {
      // Extrai e parseia os dados do componente
      const componentData = JSON.parse(match[1])

      // Adiciona o componente de referência
      parts.push(
        <ComponentReferenceMessage key={componentData.path} componentData={componentData} />,
      )
    } catch (error) {
      // Em caso de erro no parsing, adiciona o texto original
      parts.push(match[0])
    }

    lastIndex = match.index + match[0].length
  }

  // Adiciona o restante do texto após a última referência
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex))
  }

  return <>{parts}</>
}

// Adicionar a função formatTimestamp que está faltando
export function formatTimestamp(timestamp: number): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  return date.toLocaleDateString([], { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit', 
    minute: '2-digit' 
  });
}
