"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './loading-spinner'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'social-google' | 'social-github' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const variantClasses = {
  primary: 'bg-brand hover:bg-brand-dark text-white border-transparent focus:ring-brand',
  secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-gray-500',
  'social-google': 'bg-white dark:bg-neutral-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 focus:ring-blue-500',
  'social-github': 'bg-gray-900 hover:bg-gray-800 text-white border-transparent focus:ring-gray-800',
  outline: 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-brand'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base'
}

const disabledClasses = {
  primary: 'disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
  secondary: 'disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600',
  'social-google': 'disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:bg-gray-900 dark:disabled:text-gray-600',
  'social-github': 'disabled:bg-gray-600 disabled:text-gray-400',
  outline: 'disabled:bg-transparent disabled:text-gray-400 disabled:border-gray-200 dark:disabled:border-gray-700'
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  icon,
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  children,
  ...props
}) => {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 border rounded-md font-medium transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
        'transform hover:scale-[1.02] active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100',
        
        // Size classes
        sizeClasses[size],
        
        // Variant classes
        variantClasses[variant],
        
        // Disabled classes
        disabledClasses[variant],
        
        // Loading animation
        loading && 'animate-pulse',
        
        className
      )}
    >
      {/* Loading spinner */}
      {loading && (
        <LoadingSpinner 
          size={size === 'lg' ? 'md' : 'sm'} 
          color={variant === 'primary' || variant === 'social-github' ? 'secondary' : 'primary'}
        />
      )}
      
      {/* Icon (only show if not loading or if loading but no loading text) */}
      {icon && (!loading || !loadingText) && (
        <span className={cn(
          'transition-opacity duration-200',
          loading && 'opacity-50'
        )}>
          {icon}
        </span>
      )}
      
      {/* Button text */}
      <span className={cn(
        'transition-opacity duration-200',
        loading && !loadingText && 'opacity-70'
      )}>
        {loading && loadingText ? loadingText : children}
      </span>
    </button>
  )
}

// Specific social login button components
export const GoogleLoginButton: React.FC<{
  loading?: boolean
  loadingText?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}> = ({ loading, loadingText = "Conectando...", onClick, disabled, className }) => {
  const googleIcon = (
    <svg className="h-5 w-5" viewBox="0 0 488 512" fill="currentColor" aria-hidden="true">
      <path d="M488 261.8c0-17.8-1.5-35-4.3-51.8H249v98h134.5c-5.8 32-23 59.1-49 77.1l-.4 2.8 71.3 55.5 4.9.5c45.1-41.6 71.7-103 71.7-181.1z" fill="#4285F4"/>
      <path d="M249 492c66.1 0 121.6-21.9 162.1-59.6l-77.3-60c-21.4 14.6-48.9 23.4-84.8 23.4-64.9 0-120-43.8-139.7-102.9l-2.9.2-75.6 58.6-1 2.8C52.8 424.3 144.1 492 249 492z" fill="#34A853"/>
      <path d="M109.3 296.9c-4.8-14.6-7.5-30.2-7.5-46.9s2.7-32.3 7.5-46.9l-1-3-76.8-59.5-2.5 1.2C13.3 177.7 0 212.3 0 250s13.3 72.3 36.5 101.3l73.8-54.4z" fill="#FBBC05"/>
      <path d="M249 97.9c36.3 0 64.3 15.7 79.1 29l58-56.4C356.5 29.8 315.1 12 249 12 144.1 12 52.8 79.7 36.5 148.7l73.8 54.4C129 141.7 184.1 97.9 249 97.9z" fill="#EA4335"/>
    </svg>
  )

  return (
    <LoadingButton
      type="button"
      variant="social-google"
      loading={loading}
      loadingText={loadingText}
      icon={googleIcon}
      onClick={onClick}
      disabled={disabled}
      className={cn("w-full shadow-sm", className)}
    >
      Entrar com Google
    </LoadingButton>
  )
}

export const GitHubLoginButton: React.FC<{
  loading?: boolean
  loadingText?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}> = ({ loading, loadingText = "Conectando...", onClick, disabled, className }) => {
  const githubIcon = (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M12 0C5.371 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.111.793-.261.793-.577 0-.285-.011-1.042-.016-2.047-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.087-.745.083-.729.083-.729 1.205.085 1.838 1.236 1.838 1.236 1.07 1.834 2.809 1.304 3.495.997.109-.775.418-1.304.762-1.604-2.665-.305-5.466-1.335-5.466-5.93 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.522.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.019.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.654.242 2.873.119 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.623-5.479 5.921.431.371.814 1.103.814 2.222 0 1.604-.015 2.898-.015 3.291 0 .319.192.694.801.576C20.565 21.795 24 17.299 24 12c0-6.627-5.373-12-12-12z" clipRule="evenodd" />
    </svg>
  )

  return (
    <LoadingButton
      type="button"
      variant="social-github"
      loading={loading}
      loadingText={loadingText}
      icon={githubIcon}
      onClick={onClick}
      disabled={disabled}
      className={cn("w-full shadow-sm", className)}
    >
      Entrar com GitHub
    </LoadingButton>
  )
}

export default LoadingButton 