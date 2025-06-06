"use client"

import React from 'react'
import { useAnalytics } from '@/lib/analytics-hooks'

interface AnalyticsProviderProps {
  children: React.ReactNode
  pageId: string
}

export function AnalyticsProvider({ children, pageId }: AnalyticsProviderProps) {
  const { trackPageView, trackEvent } = useAnalytics()
  
  // Rastrear visualização de página no carregamento
  React.useEffect(() => {
    trackPageView(pageId)
    
    // Registrar tempo de permanência na página
    const startTime = Date.now()
    
    return () => {
      const endTime = Date.now()
      const timeSpent = endTime - startTime
      
      // Rastrear tempo de permanência ao sair da página
      trackEvent('page_exit', {
        pageId,
        timeSpent,
        timeSpentFormatted: `${Math.round(timeSpent / 1000)}s`
      })
    }
  }, [pageId, trackPageView, trackEvent])
  
  return <>{children}</>
}

export default AnalyticsProvider
