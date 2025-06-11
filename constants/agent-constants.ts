import type { PromptTool, SelectOption } from "@/types/agent-types"

/**
 * Default prompt template for new agents
 */
export const DEFAULT_PROMPT = `# Agente Central Multi-Funcional: Coordenador de Fluxos

Você é um assistente avançado capaz de gerenciar múltiplos fluxos de trabalho especializados. Sua função é identificar comandos específicos, coordenar as etapas necessárias e garantir uma experiência fluida para o usuário.

## Capacidades Principais:
- Identificar comandos específicos e iniciar os fluxos correspondentes
- Manter o contexto da conversa durante cada fluxo
- Alternar entre diferentes modos

## Comportamento Padrão:
Quando nenhum fluxo específico está ativo, você deve:
- Responder perguntas gerais de forma útil e informativa
- Oferecer assistência de acordo com suas capacidades normais
- Estar atento a comandos que possam iniciar fluxos específicos`

/**
 * Options for the model selection dropdown
 */
export const MODEL_OPTIONS: SelectOption[] = [
  { value: "gpt-4o", label: "ChatGPT 4o" },
  { value: "gpt-4", label: "ChatGPT 4" },
  { value: "gpt-3.5-turbo", label: "ChatGPT 3.5 Turbo" },
]

/**
 * Options for the agent type dropdown
 */
export const TYPE_OPTIONS: SelectOption[] = [
  { value: "chat", label: "Chat" },
  { value: "imagem", label: "Imagem" },
  { value: "texto", label: "Texto" },
]

/**
 * Options for the agent status dropdown
 */
export const STATUS_OPTIONS: SelectOption[] = [
  { value: "active", label: "Ativo" },
  { value: "draft", label: "Rascunho" },
  { value: "archived", label: "Arquivado" },
]

/**
 * Prompt tools for the prompt editor
 */
export const PROMPT_TOOLS: Omit<PromptTool, 'icon'>[] = [
  { id: "variables", name: "Variáveis" },
  { id: "functions", name: "Funções" },
  { id: "examples", name: "Exemplos" },
  { id: "persona", name: "Persona" },
  { id: "context", name: "Contexto" },
  { id: "instructions", name: "Instruções" },
  { id: "format", name: "Formato" },
  { id: "capabilities", name: "Capacidades" },
  { id: "constraints", name: "Restrições" },
]

/**
 * Prompt tool snippets
 */
export const PROMPT_TOOL_SNIPPETS: Record<string, string> = {
  variables:
    "\n\n## Variáveis\n- ${nome}: Nome do usuário\n- ${empresa}: Empresa do usuário\n- ${contexto}: Contexto da conversa",
  functions:
    "\n\n## Funções\n- buscarDados(query): Busca dados no banco de dados\n- enviarEmail(destinatario, assunto, corpo): Envia um email",
  examples:
    "\n\n## Exemplos\n\nUsuário: Como posso ajustar as configurações?\nAssistente: Você pode ajustar as configurações acessando o menu no canto superior direito e selecionando 'Configurações'.",
  persona:
    "\n\n## Persona\nVocê é um assistente especializado em suporte técnico, com tom profissional mas amigável. Você deve ser paciente e explicar conceitos técnicos de forma simples.",
  context:
    "\n\n## Contexto\nVocê tem acesso às seguintes informações:\n- Documentação técnica do produto\n- Histórico de interações do usuário\n- Base de conhecimento de problemas comuns",
  instructions:
    "\n\n## Instruções\n1. Sempre cumprimente o usuário pelo nome\n2. Identifique o problema antes de sugerir soluções\n3. Ofereça no máximo 3 soluções por vez\n4. Pergunte se a solução funcionou",
  format:
    "\n\n## Formato de Resposta\nSuas respostas devem seguir este formato:\n- **Análise**: Breve análise do problema\n- **Solução**: Passos para resolver\n- **Alternativas**: Outras abordagens possíveis",
  capabilities:
    "\n\n## Capacidades\n- Analisar código e identificar erros\n- Explicar conceitos técnicos em linguagem simples\n- Fornecer exemplos práticos\n- Recomendar melhores práticas",
  constraints:
    "\n\n## Restrições\n- Não forneça informações sobre produtos concorrentes\n- Não execute código malicioso\n- Não compartilhe dados sensíveis\n- Limite respostas a 300 palavras",
}
