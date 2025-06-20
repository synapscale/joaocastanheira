import { type NextRequest, NextResponse } from "next/server"
import { ApiService } from "@/lib/api/service"

const apiService = new ApiService()

export async function GET(req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const size = parseInt(searchParams.get('size') || '50')
    const conversationId = params.conversationId

    // Chamada real para a API do backend
    const response = await apiService.getMessages(conversationId, { page, size })
    
    return NextResponse.json(response)
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

    // Chamada real para a API do backend
    const message = await apiService.sendMessage(conversationId, {
      content,
      attachments: attachments || []
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 })
  }
} 