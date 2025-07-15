'use client'

import React, { useEffect, useState } from 'react'
import { Check, CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AnimationType = 'checkmark' | 'pulse' | 'slide' | 'bounce' | 'wave'

export interface SuccessAnimationProps {
  type?: AnimationType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'green' | 'blue' | 'purple' | 'teal'
  duration?: number
  onComplete?: () => void
  className?: string
}

const sizeConfig = {
  sm: { container: 'w-8 h-8', icon: 'h-4 w-4' },
  md: { container: 'w-12 h-12', icon: 'h-6 w-6' },
  lg: { container: 'w-16 h-16', icon: 'h-8 w-8' },
  xl: { container: 'w-20 h-20', icon: 'h-10 w-10' }
}

const colorConfig = {
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    ring: 'ring-green-200',
    shadow: 'shadow-green-200/50'
  },
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    ring: 'ring-blue-200',
    shadow: 'shadow-blue-200/50'
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    ring: 'ring-purple-200',
    shadow: 'shadow-purple-200/50'
  },
  teal: {
    bg: 'bg-teal-100',
    icon: 'text-teal-600',
    ring: 'ring-teal-200',
    shadow: 'shadow-teal-200/50'
  }
}

export function SuccessAnimation({
  type = 'checkmark',
  size = 'md',
  color = 'green',
  duration = 1000,
  onComplete,
  className
}: SuccessAnimationProps) {
  const [phase, setPhase] = useState<'hidden' | 'appearing' | 'visible' | 'complete'>('hidden')

  const sizeClasses = sizeConfig[size]
  const colorClasses = colorConfig[color]

  useEffect(() => {
    const phases = [
      { phase: 'appearing', delay: 50 },
      { phase: 'visible', delay: 200 },
      { phase: 'complete', delay: duration }
    ]

    const timers = phases.map(({ phase: nextPhase, delay }) =>
      setTimeout(() => setPhase(nextPhase as any), delay)
    )

    const completeTimer = setTimeout(() => {
      onComplete?.()
    }, duration + 100)

    return () => {
      timers.forEach(timer => clearTimeout(timer))
      clearTimeout(completeTimer)
    }
  }, [duration, onComplete])

  if (type === 'checkmark') {
    return (
      <div className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-300 ease-out",
        sizeClasses.container,
        colorClasses.bg,
        colorClasses.shadow,
        phase === 'hidden' ? 'scale-0 opacity-0' :
        phase === 'appearing' ? 'scale-50 opacity-50' :
        phase === 'visible' ? 'scale-100 opacity-100' : 'scale-110 opacity-100',
        "shadow-lg ring-4",
        colorClasses.ring,
        className
      )}>
        <Check 
          className={cn(
            sizeClasses.icon,
            colorClasses.icon,
            "transition-all duration-500 ease-out",
            phase === 'hidden' || phase === 'appearing' ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
          )} 
        />
        
        {/* Onda de expansão */}
        {phase === 'visible' && (
          <div className={cn(
            "absolute inset-0 rounded-full animate-ping",
            colorClasses.bg,
            "opacity-20"
          )} />
        )}
      </div>
    )
  }

  if (type === 'pulse') {
    return (
      <div className={cn(
        "relative flex items-center justify-center rounded-full",
        sizeClasses.container,
        colorClasses.bg,
        phase === 'hidden' ? 'scale-0' :
        phase === 'appearing' ? 'scale-75' : 'scale-100',
        "transition-transform duration-300 ease-out",
        phase === 'visible' && 'animate-pulse',
        className
      )}>
        <CheckCircle2 
          className={cn(
            sizeClasses.icon,
            colorClasses.icon,
            "transition-all duration-500 ease-out",
            phase === 'complete' && 'scale-125'
          )} 
        />
      </div>
    )
  }

  if (type === 'slide') {
    return (
      <div className={cn(
        "relative flex items-center justify-center rounded-full overflow-hidden",
        sizeClasses.container,
        colorClasses.bg,
        "transition-all duration-300 ease-out",
        phase === 'hidden' ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
        className
      )}>
        {/* Fundo deslizante */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
          "transition-transform duration-700 ease-out",
          phase === 'appearing' ? '-translate-x-full' :
          phase === 'visible' ? 'translate-x-0' : 'translate-x-full'
        )} />
        
        <Check 
          className={cn(
            sizeClasses.icon,
            colorClasses.icon,
            "relative z-10 transition-all duration-300 ease-out",
            phase === 'hidden' ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
          )} 
        />
      </div>
    )
  }

  if (type === 'bounce') {
    return (
      <div className={cn(
        "relative flex items-center justify-center rounded-full",
        sizeClasses.container,
        colorClasses.bg,
        "transition-all duration-300 ease-out",
        phase === 'hidden' ? 'scale-0' :
        phase === 'appearing' ? 'scale-50' :
        phase === 'visible' ? 'scale-100' : 'scale-105',
        phase === 'visible' && 'animate-bounce',
        className
      )}>
        <Check 
          className={cn(
            sizeClasses.icon,
            colorClasses.icon,
            "transition-all duration-200 ease-out",
            phase === 'complete' && 'scale-125 rotate-12'
          )} 
        />

        {/* Partículas de celebração */}
        {phase === 'complete' && (
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-1 h-1 rounded-full animate-ping",
                  colorClasses.icon.replace('text-', 'bg-')
                )}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-${size === 'xl' ? '3rem' : size === 'lg' ? '2.5rem' : size === 'md' ? '2rem' : '1.5rem'})`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '600ms'
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (type === 'wave') {
    return (
      <div className={cn(
        "relative flex items-center justify-center",
        className
      )}>
        {/* Ondas concêntricas */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute rounded-full border-2 transition-all duration-1000 ease-out",
              colorClasses.ring.replace('ring-', 'border-'),
              phase === 'hidden' ? 'scale-0 opacity-0' :
              phase === 'appearing' ? `scale-${50 + i * 25} opacity-50` :
              phase === 'visible' ? `scale-${100 + i * 50} opacity-${100 - i * 30}` :
              `scale-${150 + i * 50} opacity-0`,
              sizeClasses.container
            )}
            style={{
              animationDelay: `${i * 200}ms`
            }}
          />
        ))}
        
        {/* Ícone central */}
        <div className={cn(
          "relative z-10 flex items-center justify-center rounded-full",
          sizeClasses.container,
          colorClasses.bg,
          "transition-all duration-500 ease-out",
          phase === 'hidden' ? 'scale-0' : 'scale-100'
        )}>
          <Check 
            className={cn(
              sizeClasses.icon,
              colorClasses.icon,
              "transition-all duration-300 ease-out",
              phase === 'complete' && 'scale-110'
            )} 
          />
        </div>
      </div>
    )
  }

  return null
}

// Componente para sequência de animações de login
export function LoginSuccessSequence({
  onComplete,
  className
}: {
  onComplete?: () => void
  className?: string
}) {
  const [step, setStep] = useState<'check' | 'message' | 'redirect' | 'complete'>('check')

  useEffect(() => {
    const sequence = [
      { step: 'message', delay: 800 },
      { step: 'redirect', delay: 1800 },
      { step: 'complete', delay: 2800 }
    ]

    const timers = sequence.map(({ step: nextStep, delay }) =>
      setTimeout(() => setStep(nextStep as any), delay)
    )

    const completeTimer = setTimeout(() => {
      onComplete?.()
    }, 3000)

    return () => {
      timers.forEach(timer => clearTimeout(timer))
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className={cn(
      "flex flex-col items-center space-y-4 p-6 text-center",
      className
    )}>
      {/* Animação do check */}
      <SuccessAnimation
        type="checkmark"
        size="xl"
        color="green"
        duration={800}
      />

      {/* Mensagem de sucesso */}
      <div className={cn(
        "transition-all duration-300 ease-out",
        step === 'check' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      )}>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Login realizado com sucesso!
        </h3>
        <p className="text-sm text-gray-600">
          Bem-vindo de volta à plataforma.
        </p>
      </div>

      {/* Indicador de redirecionamento */}
      <div className={cn(
        "flex items-center space-x-2 text-sm text-gray-500 transition-all duration-300 ease-out",
        step === 'redirect' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}>
        <span>Redirecionando para o painel</span>
        <ArrowRight className="h-4 w-4" />
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SuccessAnimation 