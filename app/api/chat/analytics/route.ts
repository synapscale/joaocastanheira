import { type NextRequest, NextResponse } from "next/server"
import { apiService } from "@/lib/api/service"

// Interface para métricas de analytics
interface ChatAnalytics {
  overview: {
    totalMessages: number
    totalConversations: number
    successRate: number
    averageResponseTime: number
    activeUsers: number
  }
  usage: {
    mostUsedModels: Record<string, number>
    mostUsedTools: Record<string, number>
    mostUsedPersonalities: Record<string, number>
    temperatureDistribution: Record<string, number>
  }
  errors: {
    totalErrors: number
    errorsByType: Record<string, number>
    errorTrends: Array<{ date: string; count: number }>
    mostCommonErrors: Array<{ message: string; count: number }>
  }
  performance: {
    responseTimeByModel: Record<string, number>
    tokensUsageByModel: Record<string, number>
    successRateByTool: Record<string, number>
    peakUsageHours: Record<string, number>
  }
  presets: {
    totalPresets: number
    mostUsedPresets: Record<string, number>
    presetSuccessRate: Record<string, number>
    customVsSystemPresets: { custom: number; system: number }
  }
}



export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get('timeRange') || '7d'
    const includeDetails = searchParams.get('includeDetails') === 'true'

    // TODO: Implementar chamada real para o backend quando disponível
    // Real API call
    const analytics = await apiService.getChatAnalytics({ timeRange, includeDetails })
    
    // Return real analytics data
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching chat analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch chat analytics' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Real API call to create/update analytics
    const result = await apiService.createChatAnalytics(body)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error("Erro ao atualizar analytics:", error)
    return NextResponse.json({ error: "Erro ao atualizar analytics" }, { status: 500 })
  }
} 