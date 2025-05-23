import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { message, model, personality, tools } = await req.json()

    // Simula um atraso para parecer que está processando
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Resposta simulada - em produção, isso chamaria o backend Python/Flask
    const response = {
      id: Date.now().toString(),
      role: "assistant",
      content: `Esta é uma resposta simulada ao seu pedido: "${message}". 
      \nModelo: ${model}
      \nPersonalidade: ${personality}
      \nFerramentas: ${tools}
      \n\nEm uma implementação real, isso seria processado pelo backend Python/Flask.`,
      model: model,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erro na API de chat:", error)
    return NextResponse.json({ error: "Erro ao processar a mensagem" }, { status: 500 })
  }
}
