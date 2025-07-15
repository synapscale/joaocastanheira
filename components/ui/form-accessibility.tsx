'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface FormAccessibilityProps {
  children: React.ReactNode
  formId: string
  className?: string
}

export interface ScreenReaderAnnouncementProps {
  message: string
  priority?: 'polite' | 'assertive'
  delay?: number
  className?: string
}

export interface KeyboardNavigationProps {
  onEscape?: () => void
  onEnter?: () => void
  onTab?: (direction: 'forward' | 'backward') => void
  trapFocus?: boolean
  className?: string
  children: React.ReactNode
}

// Componente para anúncios de tela
export const ScreenReaderAnnouncement: React.FC<ScreenReaderAnnouncementProps> = ({
  message,
  priority = 'polite',
  delay = 100,
  className
}) => {
  const [announcement, setAnnouncement] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (message) {
      // Limpar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Delay para dar tempo ao screen reader processar
      timeoutRef.current = setTimeout(() => {
        setAnnouncement(message)
        
        // Limpar após um tempo para não acumular
        setTimeout(() => {
          setAnnouncement('')
        }, 2000)
      }, delay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [message, delay])

  if (!announcement) return null

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className={cn(
        'sr-only',
        className
      )}
    >
      {announcement}
    </div>
  )
}

// Componente para navegação por teclado
export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  onEscape,
  onEnter,
  onTab,
  trapFocus = false,
  className,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const focusableElementsRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    if (trapFocus && containerRef.current) {
      // Encontrar elementos focalizáveis
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>
      
      focusableElementsRef.current = Array.from(focusableElements)
      
      // Focar no primeiro elemento
      if (focusableElementsRef.current.length > 0) {
        focusableElementsRef.current[0].focus()
      }
    }
  }, [trapFocus])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault()
          onEscape()
        }
        break
        
      case 'Enter':
        if (onEnter && event.target === containerRef.current) {
          event.preventDefault()
          onEnter()
        }
        break
        
      case 'Tab':
        if (trapFocus && focusableElementsRef.current.length > 0) {
          event.preventDefault()
          
          const currentIndex = focusableElementsRef.current.indexOf(
            document.activeElement as HTMLElement
          )
          
          let nextIndex: number
          if (event.shiftKey) {
            nextIndex = currentIndex <= 0 
              ? focusableElementsRef.current.length - 1 
              : currentIndex - 1
            if (onTab) onTab('backward')
          } else {
            nextIndex = currentIndex >= focusableElementsRef.current.length - 1 
              ? 0 
              : currentIndex + 1
            if (onTab) onTab('forward')
          }
          
          focusableElementsRef.current[nextIndex].focus()
        }
        break
    }
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={className}
      tabIndex={trapFocus ? -1 : undefined}
    >
      {children}
    </div>
  )
}

// Componente principal para acessibilidade do formulário
export const FormAccessibility: React.FC<FormAccessibilityProps> = ({
  children,
  formId,
  className
}) => {
  const [announcements, setAnnouncements] = useState<string[]>([])
  const formRef = useRef<HTMLDivElement>(null)

  // Função para adicionar anúncios
  const addAnnouncement = (message: string) => {
    setAnnouncements(prev => [...prev, message])
    
    // Limpar após um tempo
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(msg => msg !== message))
    }, 3000)
  }

  // Detectar mudanças no formulário para anúncios
  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const handleFormChange = (event: Event) => {
      const target = event.target as HTMLInputElement
      
      if (target.type === 'email' && target.validity.typeMismatch) {
        addAnnouncement('Formato de email inválido')
      } else if (target.required && !target.value) {
        addAnnouncement(`${target.name} é obrigatório`)
      } else if (target.validity.valid && target.value) {
        addAnnouncement(`${target.name} válido`)
      }
    }

    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement
      
      if (!form.checkValidity()) {
        addAnnouncement('Formulário contém erros. Verifique os campos.')
        event.preventDefault()
      } else {
        addAnnouncement('Formulário enviado com sucesso')
      }
    }

    form.addEventListener('change', handleFormChange)
    form.addEventListener('submit', handleFormSubmit)

    return () => {
      form.removeEventListener('change', handleFormChange)
      form.removeEventListener('submit', handleFormSubmit)
    }
  }, [])

  return (
    <div
      ref={formRef}
      className={cn('relative', className)}
      role="main"
      aria-labelledby={`${formId}-title`}
      aria-describedby={`${formId}-description`}
    >
      {/* Anúncios de tela */}
      {announcements.map((announcement, index) => (
        <ScreenReaderAnnouncement
          key={index}
          message={announcement}
          priority="polite"
        />
      ))}

      {/* Conteúdo do formulário */}
      <KeyboardNavigation
        onEscape={() => {
          // Limpar campos ou fechar modais
          addAnnouncement('Formulário cancelado')
        }}
        className="w-full"
      >
        {children}
      </KeyboardNavigation>

      {/* Instruções de navegação por teclado */}
      <div
        id={`${formId}-navigation-help`}
        className="sr-only"
        aria-live="polite"
      >
        Use Tab para navegar entre campos, Enter para submeter o formulário, 
        Escape para cancelar. Erros de validação serão anunciados automaticamente.
      </div>
    </div>
  )
}

// Hook para gerenciar anúncios de acessibilidade
export const useAccessibilityAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<string[]>([])

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message])
    
    // Limpar após um tempo
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(msg => msg !== message))
    }, 3000)
  }

  const clearAnnouncements = () => {
    setAnnouncements([])
  }

  return {
    announcements,
    announce,
    clearAnnouncements
  }
}

// Componente para melhorar labels e descrições
export interface AccessibleFieldProps {
  id: string
  label: string
  description?: string
  required?: boolean
  error?: string
  success?: string
  className?: string
  children: React.ReactNode
}

export const AccessibleField: React.FC<AccessibleFieldProps> = ({
  id,
  label,
  description,
  required,
  error,
  success,
  className,
  children
}) => {
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const successId = `${id}-success`

  return (
    <div className={cn('space-y-1', className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="obrigatório">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p
          id={descriptionId}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {description}
        </p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-describedby': [
            description ? descriptionId : '',
            error ? errorId : '',
            success ? successId : ''
          ].filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required ? 'true' : 'false'
        })}
      </div>
      
      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {success && (
        <p
          id={successId}
          className="text-sm text-green-600 dark:text-green-400"
          role="status"
        >
          {success}
        </p>
      )}
    </div>
  )
} 