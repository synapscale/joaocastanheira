'use client'

import React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordCriterion {
  label: string
  test: (password: string) => boolean
  weight: number
}

export interface PasswordStrengthIndicatorProps {
  password: string
  criteria?: PasswordCriterion[]
  showCriteria?: boolean
  showStrengthBar?: boolean
  className?: string
}

const defaultCriteria: PasswordCriterion[] = [
  {
    label: 'Pelo menos 8 caracteres',
    test: (password: string) => password.length >= 8,
    weight: 2
  },
  {
    label: 'Uma letra maiúscula',
    test: (password: string) => /[A-Z]/.test(password),
    weight: 1
  },
  {
    label: 'Uma letra minúscula',
    test: (password: string) => /[a-z]/.test(password),
    weight: 1
  },
  {
    label: 'Um número',
    test: (password: string) => /[0-9]/.test(password),
    weight: 1
  },
  {
    label: 'Um caractere especial',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
    weight: 1
  }
]

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  criteria = defaultCriteria,
  showCriteria = true,
  showStrengthBar = true,
  className
}) => {
  // Calcular score e força
  const calculateStrength = () => {
    let score = 0
    let maxScore = 0
    
    criteria.forEach(criterion => {
      maxScore += criterion.weight
      if (criterion.test(password)) {
        score += criterion.weight
      }
    })
    
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
    
    let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
    let label = 'Fraca'
    let color = 'red'
    
    if (percentage >= 80) {
      level = 'strong'
      label = 'Forte'
      color = 'green'
    } else if (percentage >= 60) {
      level = 'good'
      label = 'Boa'
      color = 'blue'
    } else if (percentage >= 40) {
      level = 'fair'
      label = 'Regular'
      color = 'yellow'
    }
    
    return { score, maxScore, percentage, level, label, color }
  }
  
  const strength = calculateStrength()
  
  if (!password) {
    return null
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* Barra de força */}
      {showStrengthBar && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Força da senha
            </span>
            <span className={cn(
              'text-sm font-medium',
              strength.color === 'red' && 'text-red-600',
              strength.color === 'yellow' && 'text-yellow-600',
              strength.color === 'blue' && 'text-blue-600',
              strength.color === 'green' && 'text-green-600'
            )}>
              {strength.label}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300 ease-in-out',
                strength.color === 'red' && 'bg-red-500',
                strength.color === 'yellow' && 'bg-yellow-500',
                strength.color === 'blue' && 'bg-blue-500',
                strength.color === 'green' && 'bg-green-500'
              )}
              style={{ width: `${strength.percentage}%` }}
            />
          </div>
          
          {/* Indicadores de nível */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className={strength.percentage >= 25 ? 'text-red-500' : ''}>
              Fraca
            </span>
            <span className={strength.percentage >= 50 ? 'text-yellow-500' : ''}>
              Regular
            </span>
            <span className={strength.percentage >= 75 ? 'text-blue-500' : ''}>
              Boa
            </span>
            <span className={strength.percentage >= 90 ? 'text-green-500' : ''}>
              Forte
            </span>
          </div>
        </div>
      )}
      
      {/* Lista de critérios */}
      {showCriteria && (
        <div className="space-y-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Requisitos:
          </span>
          <div className="space-y-1">
            {criteria.map((criterion, index) => {
              const isPassing = criterion.test(password)
              
              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-2 text-sm transition-colors duration-200',
                    isPassing 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {isPassing ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-gray-400" />
                  )}
                  <span className={isPassing ? 'line-through' : ''}>
                    {criterion.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Score detalhado (apenas para desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
          Score: {strength.score}/{strength.maxScore} ({strength.percentage.toFixed(1)}%)
        </div>
      )}
    </div>
  )
}

// Hook para usar indicador de força
export const usePasswordStrength = (password: string, criteria?: PasswordCriterion[]) => {
  const usedCriteria = criteria || defaultCriteria
  
  const calculateStrength = () => {
    let score = 0
    let maxScore = 0
    
    usedCriteria.forEach(criterion => {
      maxScore += criterion.weight
      if (criterion.test(password)) {
        score += criterion.weight
      }
    })
    
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
    
    let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
    let label = 'Fraca'
    let color = 'red'
    
    if (percentage >= 80) {
      level = 'strong'
      label = 'Forte'
      color = 'green'
    } else if (percentage >= 60) {
      level = 'good'
      label = 'Boa'
      color = 'blue'
    } else if (percentage >= 40) {
      level = 'fair'
      label = 'Regular'
      color = 'yellow'
    }
    
    return { score, maxScore, percentage, level, label, color }
  }
  
  return calculateStrength()
} 