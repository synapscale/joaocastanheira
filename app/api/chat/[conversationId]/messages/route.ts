import { type NextRequest, NextResponse } from "next/server"

// Simulate message storage for development
const mockMessages = new Map()

export async function GET(req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const size = parseInt(searchParams.get('size') || '50')
    const conversationId = params.conversationId

    // Get messages for this conversation
    const messages = mockMessages.get(conversationId) || []
    
    return NextResponse.json({
      messages,
      total: messages.length,
      page,
      size
    })
  } catch (error) {
    console.error("Erro ao listar mensagens:", error)
    return NextResponse.json({ error: "Erro ao listar mensagens" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const conversationId = params.conversationId
    const body = await req.json()
    const { content, attachments } = body

    if (!content) {
      return NextResponse.json({ error: "Conteúdo da mensagem é obrigatório" }, { status: 400 })
    }

    // Simula um atraso para parecer que está processando
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create user message
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      content: content,
      role: 'user',
      conversation_id: conversationId,
      attachments: attachments || [],
      tokens_used: Math.floor(content.length / 4),
      processing_time_ms: 0,
      status: 'sent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Create assistant message
    const assistantMessage = {
      id: `msg_${Date.now()}_assistant`,
      content: `Esta é uma resposta simulada ao seu pedido: "${content}". Em uma implementação real, isso seria processado pelo backend Python/Flask da Synapscale.`,
      role: 'assistant',
      conversation_id: conversationId,
      attachments: [],
      model_used: 'gpt-4',
      model_provider: 'openai',
      tokens_used: 150,
      processing_time_ms: 1000,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Store messages
    if (!mockMessages.has(conversationId)) {
      mockMessages.set(conversationId, [])
    }
    const messages = mockMessages.get(conversationId)
    messages.push(userMessage, assistantMessage)

    // Return the assistant message (as expected by the frontend)
    return NextResponse.json(assistantMessage)
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 })
  }
} 