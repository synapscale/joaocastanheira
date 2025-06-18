/**
 * API Route do Chat - TEMPORÁRIA
 * 
 * IMPORTANTE: Esta API route deve ser removida em produção.
 * O frontend deve chamar diretamente o backend do usuário:
 * POST /api/v1/conversations/{conversation_id}/messages
 * 
 * A arquitetura correta para um SaaS é:
 * Frontend → Backend (gerencia user variables/API keys) → Provedores LLM
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      message, 
      conversationId, 
      provider, 
      model, 
      temperature, 
      maxTokens,
      personality 
    } = body;

    // Esta implementação está incorreta para um SaaS real
    // O frontend deve chamar diretamente o backend robusto do usuário
    
    return Response.json({
      error: "Implementação temporária - deve usar o backend real",
      message: "O frontend deve chamar diretamente o backend do usuário",
      arquitetura_correta: {
        endpoint: "/api/v1/conversations/{conversation_id}/messages",
        metodo: "POST",
        descricao: "Backend gerencia API keys do usuário e faz chamadas aos LLMs",
        body_exemplo: {
          content: "mensagem do usuário",
          attachments: []
        },
        fluxo: [
          "1. Usuário preenche API keys em /user-variables",
          "2. Keys são salvas criptografadas no backend por usuário",
          "3. Chat chama backend que usa keys do usuário para LLMs",
          "4. Backend retorna resposta do LLM para o frontend"
        ]
      }
    }, { status: 501 });

  } catch (error) {
    console.error('Erro na API route:', error);
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 