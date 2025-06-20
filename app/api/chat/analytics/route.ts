import { type NextRequest, NextResponse } from "next/server"
import { ApiService } from "@/lib/api/service"

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

const apiService = new ApiService()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get('timeRange') || '7d'
    const includeDetails = searchParams.get('includeDetails') === 'true'

    // TODO: Implementar chamada real para o backend quando disponível
    // const analytics = await apiService.getChatAnalytics({ timeRange, includeDetails })
    
    // Retornar dados mockados para desenvolvimento
    const mockAnalytics: ChatAnalytics = {
      overview: {
        totalMessages: 1250,
        totalConversations: 89,
        successRate: 95.2,
        averageResponseTime: 1.8,
        activeUsers: 45
      },
      usage: {
        mostUsedModels: {
          "gpt-4": 45,
          "gpt-3.5-turbo": 32,
          "claude-3": 23
        },
        mostUsedTools: {
          "search": 67,
          "calculator": 34,
          "translator": 21
        },
        mostUsedPersonalities: {
          "assistant": 56,
          "expert": 28,
          "creative": 16
        },
        temperatureDistribution: {
          "0.7": 40,
          "0.5": 35,
          "0.9": 25
        }
      },
      errors: {
        totalErrors: 12,
        errorsByType: {
          "timeout": 5,
          "rate_limit": 4,
          "invalid_request": 3
        },
        errorTrends: [
          { date: "2025-06-13", count: 2 },
          { date: "2025-06-14", count: 3 },
          { date: "2025-06-15", count: 1 }
        ],
        mostCommonErrors: [
          { message: "Request timeout", count: 5 },
          { message: "Rate limit exceeded", count: 4 }
        ]
      },
      performance: {
        responseTimeByModel: {
          "gpt-4": 2.1,
          "gpt-3.5-turbo": 1.5,
          "claude-3": 1.9
        },
        tokensUsageByModel: {
          "gpt-4": 15420,
          "gpt-3.5-turbo": 8950,
          "claude-3": 12100
        },
        successRateByTool: {
          "search": 98.5,
          "calculator": 99.1,
          "translator": 96.8
        },
        peakUsageHours: {
          "09:00": 25,
          "14:00": 32,
          "20:00": 28
        }
      },
      presets: {
        totalPresets: 24,
        mostUsedPresets: {
          "General Assistant": 45,
          "Code Helper": 28,
          "Research Assistant": 19
        },
        presetSuccessRate: {
          "General Assistant": 96.2,
          "Code Helper": 94.8,
          "Research Assistant": 97.1
        },
        customVsSystemPresets: {
          custom: 15,
          system: 9
        }
      }
    }
    
    return NextResponse.json(mockAnalytics)
    
  } catch (error) {
    console.error("Erro ao obter analytics:", error)
    return NextResponse.json({ error: "Erro ao obter analytics" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // TODO: Implementar chamada real para criar/atualizar analytics no backend
    const body = await req.json()
    
    // Por enquanto, apenas retornar sucesso
    return NextResponse.json({ 
      success: true, 
      message: "Analytics data received (mock response)" 
    })
    
  } catch (error) {
    console.error("Erro ao atualizar analytics:", error)
    return NextResponse.json({ error: "Erro ao atualizar analytics" }, { status: 500 })
  }
} 