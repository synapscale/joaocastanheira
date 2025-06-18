import { type NextRequest, NextResponse } from "next/server"

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

// Dados simulados para desenvolvimento
const generateMockAnalytics = (): ChatAnalytics => {
  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  return {
    overview: {
      totalMessages: 1247,
      totalConversations: 89,
      successRate: 0.94,
      averageResponseTime: 1850,
      activeUsers: 23
    },
    usage: {
      mostUsedModels: {
        'gpt-4o': 456,
        'gpt-4': 321,
        'claude-3': 287,
        'gpt-3.5-turbo': 183
      },
      mostUsedTools: {
        'tools': 523,
        'internet': 298,
        'deep-analysis': 187,
        'wikipedia': 156,
        'no-tools': 83
      },
      mostUsedPersonalities: {
        'natural': 487,
        'criativa': 298,
        'objetiva': 234,
        'sistematica': 156,
        'imaginativa': 72
      },
      temperatureDistribution: {
        '0.1-0.3': 234,
        '0.4-0.6': 298,
        '0.7-0.9': 487,
        '1.0+': 228
      }
    },
    errors: {
      totalErrors: 78,
      errorsByType: {
        'api_keys': 34,
        'rate_limit': 23,
        'network': 12,
        'invalid_config': 7,
        'unknown': 2
      },
      errorTrends: last7Days.map((date, index) => ({
        date,
        count: Math.floor(Math.random() * 15) + 2
      })),
      mostCommonErrors: [
        { message: 'API keys necessárias não encontradas: openai', count: 23 },
        { message: 'Limite de requisições atingido', count: 18 },
        { message: 'Erro de conexão com o servidor', count: 12 },
        { message: 'Modelo gpt-5 não é suportado', count: 7 }
      ]
    },
    performance: {
      responseTimeByModel: {
        'gpt-4o': 1650,
        'gpt-4': 2100,
        'claude-3': 1890,
        'gpt-3.5-turbo': 1200,
        'gemini-pro': 1750
      },
      tokensUsageByModel: {
        'gpt-4o': 234567,
        'gpt-4': 187654,
        'claude-3': 156789,
        'gpt-3.5-turbo': 298765,
        'gemini-pro': 98765
      },
      successRateByTool: {
        'tools': 0.96,
        'internet': 0.89,
        'deep-analysis': 0.92,
        'wikipedia': 0.98,
        'no-tools': 0.99
      },
      peakUsageHours: {
        '09': 145,
        '10': 167,
        '11': 189,
        '14': 156,
        '15': 178,
        '16': 134,
        '20': 98,
        '21': 87
      }
    },
    presets: {
      totalPresets: 47,
      mostUsedPresets: {
        'Default': 298,
        'Academic': 187,
        'Creative': 156,
        'Research': 134,
        'Custom-1': 89,
        'Custom-2': 67
      },
      presetSuccessRate: {
        'Default': 0.96,
        'Academic': 0.94,
        'Creative': 0.91,
        'Research': 0.97,
        'Custom-1': 0.89,
        'Custom-2': 0.92
      },
      customVsSystemPresets: {
        custom: 234,
        system: 456
      }
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get('timeRange') || '7d'
    const includeDetails = searchParams.get('includeDetails') === 'true'

    // Em produção, isso viria do banco de dados
    const analytics = generateMockAnalytics()

    // Filtrar dados baseado no timeRange se necessário
    if (timeRange === '24h') {
      // Filtrar para últimas 24 horas
      analytics.overview.totalMessages = Math.floor(analytics.overview.totalMessages * 0.1)
      analytics.overview.totalConversations = Math.floor(analytics.overview.totalConversations * 0.1)
    } else if (timeRange === '30d') {
      // Expandir para 30 dias
      analytics.overview.totalMessages = Math.floor(analytics.overview.totalMessages * 4.3)
      analytics.overview.totalConversations = Math.floor(analytics.overview.totalConversations * 4.3)
    }

    // Se não incluir detalhes, remover dados sensíveis
    const responseData = includeDetails ? analytics : {
      ...analytics,
      errors: {
        ...analytics.errors,
        mostCommonErrors: undefined
      },
      performance: {
        ...analytics.performance,
        tokensUsageByModel: undefined
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      timeRange,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Erro ao obter analytics:", error)
    return NextResponse.json({ 
      success: false,
      error: "Erro ao obter analytics" 
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, data, timestamp } = body

    // Em produção, isso salvaria no banco de dados
    console.log('Analytics Event:', {
      event,
      data,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    })

    // Simular diferentes tipos de eventos
    const eventTypes = [
      'message_sent',
      'preset_used',
      'model_changed',
      'tool_selected',
      'personality_changed',
      'error_occurred',
      'configuration_saved'
    ]

    if (!eventTypes.includes(event)) {
      return NextResponse.json({ 
        success: false,
        error: "Tipo de evento não suportado" 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Evento registrado com sucesso",
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })
  } catch (error) {
    console.error("Erro ao registrar evento:", error)
    return NextResponse.json({ 
      success: false,
      error: "Erro ao registrar evento" 
    }, { status: 500 })
  }
} 