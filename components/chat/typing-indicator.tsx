import React from 'react'

interface TypingIndicatorProps {
  isVisible: boolean
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null
  }

  return (
    <div className="flex items-start gap-3 mb-6 opacity-0 animate-fade-in">
      {/* Avatar minimalista */}
      <div className="flex-shrink-0 w-6 h-6 bg-muted rounded-full flex items-center justify-center mt-1">
        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
      </div>
      
      {/* Indicador de digitação refinado */}
      <div className="bg-muted/50 rounded-2xl px-4 py-2.5 max-w-[80px]">
        <div className="flex items-center justify-center gap-1">
          <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-subtle-pulse [animation-delay:0ms]"></div>
          <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-subtle-pulse [animation-delay:200ms]"></div>
          <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-subtle-pulse [animation-delay:400ms]"></div>
        </div>
      </div>
    </div>
  )
} 