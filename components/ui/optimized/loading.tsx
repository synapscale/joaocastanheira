/**
 * Componente de Loading Otimizado
 * 
 * Sistema avançado de loading com skeleton screens, animações suaves
 * e estados adaptativos para melhor experiência do usuário.
 */

import React, { memo, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots' | 'bars'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'accent' | 'muted'
  className?: string
  children?: React.ReactNode
  text?: string
  fullScreen?: boolean
  overlay?: boolean
  transparent?: boolean
}

interface SkeletonProps {
  type?: 'text' | 'avatar' | 'card' | 'button' | 'image' | 'table' | 'list'
  lines?: number
  width?: string | number
  height?: string | number
  className?: string
  animate?: boolean
}

/**
 * Componente principal de Loading
 */
export const Loading = memo<LoadingProps>(({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  className,
  children,
  text,
  fullScreen = false,
  overlay = false,
  transparent = false
}) => {
  const sizeClasses = useMemo(() => ({
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }), [])

  const colorClasses = useMemo(() => ({
    primary: 'text-blue-600 border-blue-600',
    secondary: 'text-gray-600 border-gray-600',
    accent: 'text-purple-600 border-purple-600',
    muted: 'text-gray-400 border-gray-400'
  }), [])

  const baseClasses = cn(
    sizeClasses[size],
    colorClasses[color],
    className
  )

  const containerClasses = cn(
    'flex items-center justify-center',
    {
      'fixed inset-0 z-50': fullScreen,
      'absolute inset-0 z-40': overlay && !fullScreen,
      'bg-white/80 backdrop-blur-sm': overlay && !transparent,
      'bg-transparent': transparent
    }
  )

  const renderSpinner = () => (
    <div className={cn('animate-spin rounded-full border-2 border-t-transparent', baseClasses)} />
  )

  const renderPulse = () => (
    <div className={cn('animate-pulse rounded-full bg-current', baseClasses)} />
  )

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-current animate-bounce',
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  )

  const renderBars = () => (
    <div className="flex space-x-1 items-end">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-current animate-pulse',
            {
              'w-1 h-2': size === 'sm',
              'w-1.5 h-3': size === 'md',
              'w-2 h-4': size === 'lg',
              'w-3 h-6': size === 'xl'
            }
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )

  const renderVariant = () => {
    switch (variant) {
      case 'spinner':
        return renderSpinner()
      case 'pulse':
        return renderPulse()
      case 'dots':
        return renderDots()
      case 'bars':
        return renderBars()
      case 'skeleton':
        return <Skeleton />
      default:
        return renderSpinner()
    }
  }

  const content = (
    <div className="flex flex-col items-center space-y-2">
      {renderVariant()}
      {text && (
        <p className={cn('text-sm font-medium', colorClasses[color])}>
          {text}
        </p>
      )}
      {children}
    </div>
  )

  if (fullScreen || overlay) {
    return (
      <div className={containerClasses}>
        {content}
      </div>
    )
  }

  return content
})

Loading.displayName = 'Loading'

/**
 * Componente Skeleton para loading states
 */
export const Skeleton = memo<SkeletonProps>(({
  type = 'text',
  lines = 3,
  width = '100%',
  height,
  className,
  animate = true
}) => {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700 rounded',
    {
      'animate-pulse': animate
    },
    className
  )

  const renderText = () => (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(baseClasses, 'h-4')}
          style={{
            width: i === lines - 1 ? '75%' : width
          }}
        />
      ))}
    </div>
  )

  const renderAvatar = () => (
    <div className={cn(baseClasses, 'rounded-full w-10 h-10')} />
  )

  const renderCard = () => (
    <div className={cn(baseClasses, 'p-4 space-y-3')}>
      <div className="flex items-center space-x-3">
        <Skeleton type="avatar" animate={animate} />
        <div className="flex-1 space-y-2">
          <Skeleton type="text" lines={1} animate={animate} />
          <Skeleton type="text" lines={1} width="60%" animate={animate} />
        </div>
      </div>
      <Skeleton type="text" lines={3} animate={animate} />
    </div>
  )

  const renderButton = () => (
    <div className={cn(baseClasses, 'h-10 w-24')} />
  )

  const renderImage = () => (
    <div 
      className={cn(baseClasses)}
      style={{ 
        width: width || '100%', 
        height: height || '200px' 
      }}
    />
  )

  const renderTable = () => (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn(baseClasses, 'h-6 flex-1')} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className={cn(baseClasses, 'h-4 flex-1')} />
          ))}
        </div>
      ))}
    </div>
  )

  const renderList = () => (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className={cn(baseClasses, 'w-8 h-8 rounded-full')} />
          <div className="flex-1 space-y-2">
            <div className={cn(baseClasses, 'h-4 w-3/4')} />
            <div className={cn(baseClasses, 'h-3 w-1/2')} />
          </div>
        </div>
      ))}
    </div>
  )

  switch (type) {
    case 'text':
      return renderText()
    case 'avatar':
      return renderAvatar()
    case 'card':
      return renderCard()
    case 'button':
      return renderButton()
    case 'image':
      return renderImage()
    case 'table':
      return renderTable()
    case 'list':
      return renderList()
    default:
      return renderText()
  }
})

Skeleton.displayName = 'Skeleton'

/**
 * Hook para gerenciar estados de loading
 */
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState)
  const [loadingText, setLoadingText] = React.useState<string>()

  const startLoading = React.useCallback((text?: string) => {
    setIsLoading(true)
    setLoadingText(text)
  }, [])

  const stopLoading = React.useCallback(() => {
    setIsLoading(false)
    setLoadingText(undefined)
  }, [])

  const withLoading = React.useCallback(<T,>(
    operation: () => Promise<T>,
    text?: string
  ) => {
    startLoading(text)
    return operation().finally(() => {
      stopLoading()
    })
  }, [startLoading, stopLoading])

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    withLoading
  }
}

/**
 * Componente de Loading para páginas inteiras
 */
export const PageLoading = memo<{
  title?: string
  description?: string
  variant?: LoadingProps['variant']
}>(({ title = 'Carregando...', description, variant = 'spinner' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center space-y-4">
      <Loading variant={variant} size="xl" />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {description && (
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
))

PageLoading.displayName = 'PageLoading'

/**
 * Componente de Loading para botões
 */
export const ButtonLoading = memo<{
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  variant?: 'spinner' | 'dots'
  size?: 'sm' | 'md'
}>(({ isLoading, children, loadingText, variant = 'spinner', size = 'sm' }) => {
  if (!isLoading) return <>{children}</>

  return (
    <div className="flex items-center space-x-2">
      <Loading variant={variant} size={size} />
      <span>{loadingText || 'Carregando...'}</span>
    </div>
  )
})

ButtonLoading.displayName = 'ButtonLoading'

/**
 * Componente de Loading para listas
 */
export const ListLoading = memo<{
  items?: number
  showAvatar?: boolean
}>(({ items = 5, showAvatar = true }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3">
        {showAvatar && <Skeleton type="avatar" />}
        <div className="flex-1 space-y-2">
          <Skeleton type="text" lines={1} width="80%" />
          <Skeleton type="text" lines={1} width="60%" />
        </div>
      </div>
    ))}
  </div>
))

ListLoading.displayName = 'ListLoading'

/**
 * Componente de Loading para cards
 */
export const CardLoading = memo<{
  cards?: number
  showImage?: boolean
}>(({ cards = 3, showImage = true }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: cards }).map((_, i) => (
      <div key={i} className="border rounded-lg p-4 space-y-4">
        {showImage && <Skeleton type="image" height="200px" />}
        <div className="space-y-2">
          <Skeleton type="text" lines={1} width="80%" />
          <Skeleton type="text" lines={2} />
          <div className="flex justify-between items-center">
            <Skeleton type="button" />
            <Skeleton type="text" lines={1} width="60px" />
          </div>
        </div>
      </div>
    ))}
  </div>
))

CardLoading.displayName = 'CardLoading'

/**
 * Componente de Loading para tabelas
 */
export const TableLoading = memo<{
  rows?: number
  columns?: number
}>(({ rows = 5, columns = 4 }) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex space-x-4 p-4 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1">
          <Skeleton type="text" lines={1} height="20px" />
        </div>
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4 p-4 border-b">
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className="flex-1">
            <Skeleton type="text" lines={1} height="16px" />
          </div>
        ))}
      </div>
    ))}
  </div>
))

TableLoading.displayName = 'TableLoading'

/**
 * HOC para adicionar loading state a componentes
 */
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent: React.ComponentType = () => <Loading />
) => {
  return memo<P & { isLoading?: boolean }>((props) => {
    const { isLoading, ...componentProps } = props

    if (isLoading) {
      return <LoadingComponent />
    }

    return <Component {...(componentProps as P)} />
  })
}

/**
 * Componente de Loading com timeout
 */
export const LoadingWithTimeout = memo<LoadingProps & {
  timeout?: number
  onTimeout?: () => void
}>(({ timeout = 30000, onTimeout, ...props }) => {
  React.useEffect(() => {
    if (timeout && onTimeout) {
      const timer = setTimeout(onTimeout, timeout)
      return () => clearTimeout(timer)
    }
  }, [timeout, onTimeout])

  return <Loading {...props} />
})

LoadingWithTimeout.displayName = 'LoadingWithTimeout'

export default Loading

