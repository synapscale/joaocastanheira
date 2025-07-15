/**
 * Componente de formulário de login
 * Interface para autenticação de usuários
 */

'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLogin } from '../../hooks/useAuth'
import { useAuth } from '../../context/auth-context'
import type { LoginData } from '../../lib/types/auth'
import BrandLogo from '../ui/brand-logo'
import { LoadingButton, GoogleLoginButton, GitHubLoginButton } from '../ui/loading-button'
import { ErrorFeedback, InlineError } from '../ui/error-feedback'
import { SuccessFeedback } from '../ui/success-feedback'
import { LoginSuccessSequence } from '../ui/success-animation'
import { ValidatedInput, emailRules, passwordRules } from '../ui/real-time-validator'
import { PasswordStrengthIndicator } from '../ui/password-strength-indicator'
import { FormAccessibility, useAccessibilityAnnouncements } from '../ui/form-accessibility'
import { mapError, shouldShowRetryButton, shouldShowSupportLink } from '../../lib/utils/error-mapper'
import type { MappedError } from '../../lib/utils/error-mapper'
import { logger } from '@/utils/logger'
import type { ErrorType } from '../ui/error-feedback'

interface LoginFormProps {
    redirectTo?: string
    onSuccess?: () => void
    className?: string
}

interface EnhancedError {
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    message: string
    originalError?: unknown
}

export function LoginForm({ redirectTo = '/chat', onSuccess, className = '' }: LoginFormProps) {
    const router = useRouter()
    const { login, isLoading, error, clearError } = useLogin()
    const { isAuthenticated, user } = useAuth()

    const [formData, setFormData] = useState<LoginData>({
        email: '',
        password: '',
        rememberMe: false,
    })

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    const [showPassword, setShowPassword] = useState(false)
    const [socialLoading, setSocialLoading] = useState<{
        google: boolean
        github: boolean
    }>({
        google: false,
        github: false
    })

    // Enhanced error state
    const [mappedError, setMappedError] = useState<EnhancedError | null>(null)
    const [showError, setShowError] = useState(false)

    // Success state
    const [showSuccess, setShowSuccess] = useState(false)
    const [successType, setSuccessType] = useState<'login' | 'social'>('login')
    const [isRedirecting, setIsRedirecting] = useState(false)

    // Real-time validation state
    const [showEmailValidation, setShowEmailValidation] = useState(false)
    const [showPasswordValidation, setShowPasswordValidation] = useState(false)
    const [hasInteracted, setHasInteracted] = useState({
        email: false,
        password: false
    })

    // Accessibility announcements
    const { announce } = useAccessibilityAnnouncements()

    // Validação do formulário
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.email) {
            errors.email = 'Email é obrigatório'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email inválido'
        }

        if (!formData.password) {
            errors.password = 'Senha é obrigatória'
        } else if (formData.password.length < 6) {
            errors.password = 'Senha deve ter pelo menos 6 caracteres'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Manipular mudanças nos campos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))

        // Limpar erro do campo quando usuário começar a digitar
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: '',
            }))
        }

        // Limpar erro geral
        if (error) {
            clearError()
        }
    }

    // Função para mapear erros para mensagens amigáveis
    const getErrorMessage = (error: unknown): string => {
        try {
            // Extrair informações do erro de forma mais robusta
            let errorMsg = 'Erro desconhecido'
            let errorDetails: any = {}

            if (error instanceof Error) {
                errorMsg = error.message
                errorDetails = {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                }
            } else if (typeof error === 'object' && error !== null) {
                // Tentar extrair mensagem de objetos de erro
                errorDetails = error
                if ('message' in error && typeof error.message === 'string') {
                    errorMsg = error.message
                } else if ('error' in error && typeof error.error === 'string') {
                    errorMsg = error.error
                } else {
                    errorMsg = JSON.stringify(error)
                }
            } else if (typeof error === 'string') {
                errorMsg = error
                errorDetails = { message: error }
            } else {
                errorMsg = String(error)
                errorDetails = { value: error }
            }

            logger.error(
                `LoginForm - Erro durante autenticação: ${errorMsg}`,
                'AUTH',
                {
                    formData: { email: formData.email },
                    errorDetails
                }
            )

            // Mapear mensagens de erro para mensagens amigáveis
            if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
                return 'Erro de conexão com o servidor'
            }
            if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
                return 'Email ou senha incorretos'
            }
            if (errorMsg.includes('timeout') || errorMsg.includes('aborted')) {
                return 'Tempo de resposta excedido'
            }
            if (errorMsg.includes('500') || errorMsg.includes('Internal Server')) {
                return 'Erro interno do servidor'
            }

            return errorMsg || 'Erro durante o login'
        } catch (logError) {
            console.error('Falha ao registrar erro:', logError)
            return 'Erro no sistema'
        }
    }

    // Função para lidar com o sucesso do login
    const handleLoginSuccess = useCallback(async (type: 'login' | 'social' = 'login') => {
        console.log(`✅ LoginForm - Login ${type} bem-sucedido, iniciando sequência de sucesso`)
        console.log('🔍 LoginForm - Estado atual:', { isAuthenticated, user })

        // Limpar erros
        setMappedError(null)
        setShowError(false)
        clearError()

        // Mostrar feedback de sucesso
        setSuccessType(type)
        setShowSuccess(true)
        announce(`Login ${type === 'social' ? 'social' : ''} realizado com sucesso! Redirecionando...`, 'assertive')

        // Aguardar feedback ser mostrado
        await new Promise(resolve => setTimeout(resolve, 500))

        // Iniciar processo de redirecionamento
        setIsRedirecting(true)
        console.log('🔄 LoginForm - Iniciando redirecionamento para:', redirectTo)

        if (onSuccess) {
            console.log('🔄 LoginForm - Executando callback onSuccess')
            // Aguardar um pouco para mostrar a animação
            setTimeout(() => {
                console.log('🔄 LoginForm - Chamando onSuccess callback')
                onSuccess()
            }, 1000)
        } else {
            console.log(`🔄 LoginForm - Iniciando redirecionamento para: ${redirectTo}`)

            try {
                // Diagnóstico completo do sistema
                console.log('🔍 LoginForm - Executando diagnóstico completo...')
                await performSystemDiagnostics()

                // Aguardar um pouco para o estado se propagar
                console.log('⏳ LoginForm - Aguardando propagação do estado...')
                await new Promise(resolve => setTimeout(resolve, 300))

                // Verificar autenticação com diagnóstico avançado
                console.log('🔍 LoginForm - Verificando status de autenticação...')
                const isAuthConfirmed = await verifyAuthenticationStatusAdvanced(5, 300)

                if (!isAuthConfirmed) {
                    console.warn('⚠️ LoginForm - Autenticação não confirmada, executando redirecionamento forçado...')
                    // Mesmo sem confirmação, tentar redirecionamento
                    await performRedirectWithRetry(redirectTo, 2)
                } else {
                    console.log('✅ LoginForm - Autenticação confirmada, iniciando redirecionamento...')
                    await performRedirectWithRetry(redirectTo, 3)
                }

            } catch (redirectError) {
                console.error('❌ LoginForm - Erro no redirecionamento:', redirectError)
                console.log('🔧 LoginForm - Tentando fallback de redirecionamento...')
                await handleRedirectFallback(redirectTo)
            }
        }
    }, [onSuccess, redirectTo, clearError, isAuthenticated, user])

    // Função para diagnóstico completo do sistema
    const performSystemDiagnostics = useCallback(async (): Promise<void> => {
        console.log('🔍 LoginForm - === DIAGNÓSTICO COMPLETO ===')

        // 1. Verificar contexto de autenticação
        console.log('🔍 LoginForm - Contexto de autenticação:', {
            isAuthenticated,
            user,
            userType: typeof user,
            hasUser: !!user,
            userId: user?.id,
            userEmail: user?.email,
        })

        // 2. Verificar LocalStorage/SessionStorage
        try {
            const authData = localStorage.getItem('authData')
            const token = localStorage.getItem('token')
            const userData = localStorage.getItem('userData')

            console.log('🔍 LoginForm - Dados no LocalStorage:', {
                authData: authData ? 'presente' : 'ausente',
                token: token ? 'presente' : 'ausente',
                userData: userData ? 'presente' : 'ausente',
            })

            if (authData) {
                try {
                    const parsedAuthData = JSON.parse(authData)
                    console.log('🔍 LoginForm - AuthData parsado:', parsedAuthData)
                } catch (e) {
                    console.error('❌ LoginForm - Erro ao parsear authData:', e)
                }
            }
        } catch (error) {
            console.error('❌ LoginForm - Erro ao verificar storage:', error)
        }

        // 3. Verificar cookies
        try {
            const cookies = document.cookie
            console.log('🔍 LoginForm - Cookies disponíveis:', cookies)
        } catch (error) {
            console.error('❌ LoginForm - Erro ao verificar cookies:', error)
        }

        // 4. Verificar URL atual
        console.log('🔍 LoginForm - URL atual:', window.location.href)
        console.log('🔍 LoginForm - Pathname:', window.location.pathname)
        console.log('🔍 LoginForm - Search:', window.location.search)

        // 5. Verificar router
        console.log('🔍 LoginForm - Router disponível:', !!router)

        console.log('🔍 LoginForm - === FIM DO DIAGNÓSTICO ===')
    }, [isAuthenticated, user, router])

    // Função para verificar se o usuário está realmente autenticado (versão avançada)
    const verifyAuthenticationStatusAdvanced = useCallback(async (maxRetries: number = 5, delay: number = 300): Promise<boolean> => {
        console.log('🔍 LoginForm - Verificando status de autenticação (versão avançada)...')
        console.log('🔍 LoginForm - Estado inicial:', { isAuthenticated, user })

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔍 LoginForm - Tentativa ${attempt}/${maxRetries} de verificação`)
                console.log(`🔍 LoginForm - Estado atual: isAuthenticated=${isAuthenticated}, user=${user ? 'presente' : 'ausente'}`)

                // Verificação expandida
                const hasToken = !!localStorage.getItem('token')
                const hasAuthData = !!localStorage.getItem('authData')
                const contextIsAuthenticated = isAuthenticated
                const contextHasUser = !!user

                console.log(`🔍 LoginForm - Verificação expandida:`, {
                    hasToken,
                    hasAuthData,
                    contextIsAuthenticated,
                    contextHasUser,
                    userId: user?.id,
                    userEmail: user?.email,
                })

                // Critérios para considerar autenticado
                const isFullyAuthenticated = contextIsAuthenticated && contextHasUser && (hasToken || hasAuthData)
                const isPartiallyAuthenticated = (hasToken || hasAuthData) && contextHasUser
                const hasMinimumAuth = hasToken || hasAuthData || contextHasUser

                console.log(`🔍 LoginForm - Critérios de autenticação:`, {
                    isFullyAuthenticated,
                    isPartiallyAuthenticated,
                    hasMinimumAuth,
                })

                // Verificar se o AuthContext reporta que o usuário está autenticado
                if (isFullyAuthenticated) {
                    console.log(`✅ LoginForm - Autenticação COMPLETA confirmada na tentativa ${attempt}`)
                    console.log('✅ LoginForm - Dados do usuário:', { id: user.id, email: user.email })
                    return true
                }

                if (isPartiallyAuthenticated) {
                    console.log(`⚠️ LoginForm - Autenticação PARCIAL na tentativa ${attempt}`)
                    console.log('⚠️ LoginForm - Dados do usuário:', { id: user?.id, email: user?.email })

                    // Se estamos nas últimas tentativas, aceitar autenticação parcial
                    if (attempt >= maxRetries - 1) {
                        console.log('⚠️ LoginForm - Aceitando autenticação parcial (últimas tentativas)')
                        return true
                    }
                }

                if (hasMinimumAuth) {
                    console.log(`⚠️ LoginForm - Autenticação MÍNIMA na tentativa ${attempt}`)

                    // Se estamos na última tentativa, aceitar autenticação mínima
                    if (attempt >= maxRetries) {
                        console.log('⚠️ LoginForm - Aceitando autenticação mínima (última tentativa)')
                        return true
                    }
                }

                // Aguardar antes da próxima tentativa
                if (attempt < maxRetries) {
                    console.log(`⏳ LoginForm - Tentativa ${attempt} não satisfatória, aguardando ${delay}ms...`)
                    await new Promise(resolve => setTimeout(resolve, delay))
                }
            } catch (error) {
                console.error(`❌ LoginForm - Erro na verificação de autenticação (tentativa ${attempt}):`, error)

                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay))
                }
            }
        }

        console.warn('⚠️ LoginForm - Não foi possível confirmar autenticação completa após todas as tentativas')
        console.warn('⚠️ LoginForm - Estado final:', { isAuthenticated, user })

        // Última verificação: se temos pelo menos algum indício de autenticação, prosseguir
        const hasAnyAuth = !!localStorage.getItem('token') || !!localStorage.getItem('authData') || !!user
        if (hasAnyAuth) {
            console.log('⚠️ LoginForm - Encontrado indício de autenticação, prosseguindo...')
            return true
        }

        return false
    }, [isAuthenticated, user])

    // Função para realizar redirecionamento com retry
    const performRedirectWithRetry = useCallback(async (targetUrl: string, maxRetries: number = 3): Promise<void> => {
        console.log('🚀 LoginForm - Iniciando redirecionamento com retry...')
        console.log('🚀 LoginForm - URL de destino:', targetUrl)
        console.log('🚀 LoginForm - Número máximo de tentativas:', maxRetries)

        // Verificar se a URL é válida
        try {
            new URL(targetUrl, window.location.origin)
            console.log('✅ LoginForm - URL de destino é válida')
        } catch (urlError) {
            console.error('❌ LoginForm - URL de destino inválida:', urlError)
            console.log('🔧 LoginForm - Usando URL padrão: /chat')
            targetUrl = '/chat'
        }

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 LoginForm - Tentativa ${attempt}/${maxRetries} de redirecionamento`)
                console.log(`🔄 LoginForm - URL alvo: ${targetUrl}`)

                // Aguardar propagação de cookies e estado
                console.log('⏳ LoginForm - Aguardando propagação de cookies/estado...')
                await new Promise(resolve => setTimeout(resolve, 200))

                // Verificar se o router está disponível
                if (!router) {
                    console.error('❌ LoginForm - Router não disponível')
                    throw new Error('Router não disponível')
                }
                console.log('✅ LoginForm - Router disponível')

                // Verificar se estamos na página correta
                const currentPath = window.location.pathname
                console.log('🔍 LoginForm - Caminho atual:', currentPath)
                console.log('🔍 LoginForm - Caminho de destino:', targetUrl)

                if (currentPath === targetUrl) {
                    console.log('ℹ️ LoginForm - Já estamos na página de destino!')
                    return
                }

                // Método 1: Usar router.push
                console.log('🔄 LoginForm - Tentando redirecionamento via router.push...')
                try {
                    await router.push(targetUrl)
                    console.log(`✅ LoginForm - router.push executado com sucesso na tentativa ${attempt}`)

                    // Aguardar e verificar se o redirecionamento foi bem-sucedido
                    console.log('⏳ LoginForm - Aguardando confirmação do redirecionamento...')
                    await new Promise(resolve => setTimeout(resolve, 500))

                    // Verificar se mudamos de página
                    const newPath = window.location.pathname
                    console.log('🔍 LoginForm - Novo caminho após router.push:', newPath)

                    if (newPath === targetUrl || newPath !== currentPath) {
                        console.log(`✅ LoginForm - Redirecionamento via router.push bem-sucedido na tentativa ${attempt}`)
                        return
                    } else {
                        console.warn('⚠️ LoginForm - router.push executou mas não mudou a página')
                        throw new Error('router.push não resultou em mudança de página')
                    }

                } catch (routerError) {
                    console.error(`❌ LoginForm - Erro no router.push (tentativa ${attempt}):`, routerError)

                    // Se router.push falhou, tentar router.replace
                    if (attempt === 1) {
                        console.log('🔄 LoginForm - Tentando redirecionamento via router.replace...')
                        try {
                            await router.replace(targetUrl)
                            console.log(`✅ LoginForm - router.replace executado na tentativa ${attempt}`)

                            await new Promise(resolve => setTimeout(resolve, 500))
                            const newPath = window.location.pathname
                            console.log('🔍 LoginForm - Novo caminho após router.replace:', newPath)

                            if (newPath === targetUrl || newPath !== currentPath) {
                                console.log(`✅ LoginForm - Redirecionamento via router.replace bem-sucedido na tentativa ${attempt}`)
                                return
                            }
                        } catch (replaceError) {
                            console.error('❌ LoginForm - router.replace também falhou:', replaceError)
                        }
                    }

                    // Se router falhou, tentar window.location.href na segunda tentativa
                    if (attempt === 2) {
                        console.log('🔄 LoginForm - Tentando redirecionamento via window.location.href...')
                        try {
                            window.location.href = targetUrl
                            console.log(`✅ LoginForm - window.location.href executado na tentativa ${attempt}`)

                            // Aguardar o redirecionamento
                            await new Promise(resolve => setTimeout(resolve, 2000))
                            console.log('✅ LoginForm - Redirecionamento via window.location.href concluído')
                            return

                        } catch (locationError) {
                            console.error('❌ LoginForm - window.location.href falhou:', locationError)
                        }
                    }

                    // Se ainda não funcionou, relançar o erro
                    throw routerError
                }

            } catch (error) {
                console.error(`❌ LoginForm - Erro no redirecionamento (tentativa ${attempt}):`, error)

                if (attempt < maxRetries) {
                    console.log(`⏳ LoginForm - Aguardando antes da próxima tentativa de redirecionamento...`)
                    await new Promise(resolve => setTimeout(resolve, 1000))
                } else {
                    // Última tentativa falhou, tentar métodos de emergência
                    console.log('🚨 LoginForm - Todas as tentativas normais falharam, tentando métodos de emergência...')

                    try {
                        // Método de emergência 1: Recarregar página com query parameter
                        console.log('🔄 LoginForm - Tentando redirecionamento de emergência via reload...')
                        const emergencyUrl = `${targetUrl}?redirect=post-login&t=${Date.now()}`
                        window.location.href = emergencyUrl
                        return

                    } catch (emergencyError) {
                        console.error('❌ LoginForm - Método de emergência falhou:', emergencyError)

                        // Método de emergência 2: Mostrar mensagem para o usuário
                        console.log('🔧 LoginForm - Mostrando mensagem de redirecionamento manual...')
                        alert(`Login realizado com sucesso! Por favor, navegue manualmente para: ${targetUrl}`)

                        // Tentar pelo menos abrir nova aba/janela
                        try {
                            window.open(targetUrl, '_self')
                        } catch (openError) {
                            console.error('❌ LoginForm - window.open também falhou:', openError)
                        }
                    }
                }
            }
        }

        console.error('❌ LoginForm - Falha em todas as tentativas de redirecionamento')
        throw new Error('Falha no redirecionamento após todas as tentativas')
    }, [router])

    // Função para fallback em caso de falha de redirecionamento
    const handleRedirectFallback = useCallback(async (targetUrl: string): Promise<void> => {
        console.log('🔧 LoginForm - Iniciando fallback de redirecionamento...')
        console.log('🔧 LoginForm - Tentando window.location.href para:', targetUrl)

        try {
            // Método 1: Usar window.location.href
            console.log('🔄 LoginForm - Tentando redirecionamento via window.location.href...')

            // Aguardar um pouco antes do redirecionamento forçado
            await new Promise(resolve => setTimeout(resolve, 500))

            // Fazer o redirecionamento forçado
            window.location.href = targetUrl

            console.log('✅ LoginForm - window.location.href executado')

            // Aguardar um pouco para ver se funcionou
            await new Promise(resolve => setTimeout(resolve, 2000))

            console.log('ℹ️ LoginForm - Redirecionamento via window.location.href concluído')

        } catch (error) {
            console.error('❌ LoginForm - Falha no fallback de redirecionamento:', error)

            // Método 2: Recarregar a página como último recurso
            console.log('🔄 LoginForm - Tentando recarregar página como último recurso...')
            try {
                window.location.reload()
            } catch (reloadError) {
                console.error('❌ LoginForm - Falha ao recarregar página:', reloadError)
            }
        }
    }, [])

    // Submeter formulário com processo de redirecionamento otimizado
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log('🔄 LoginForm - Iniciando processo de login')

        if (!validateForm()) {
            console.warn('⚠️ LoginForm - Validação do formulário falhou')
            return
        }

        let timeoutId: NodeJS.Timeout | null = null
        let loginAttemptStartTime = Date.now()

        try {
            console.log('🔄 LoginForm - Chamando função de login')

            // Timeout de segurança mais específico
            const loginPromise = login(formData)
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => {
                    console.error('⏰ LoginForm - Timeout atingido após 15 segundos')
                    reject(new Error('TIMEOUT: O login está demorando mais que o esperado. Verifique sua conexão e tente novamente.'))
                }, 15000) // 15s para dar tempo à verificação de tokens
            })

            await Promise.race([loginPromise, timeoutPromise])

            if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
            }

            const loginDuration = Date.now() - loginAttemptStartTime
            console.log(`✅ LoginForm - Login bem-sucedido em ${loginDuration}ms`)

            // Chamar função de sucesso que lida com feedback e redirecionamento
            await handleLoginSuccess('login')

        } catch (error) {
            if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
            }

            const loginDuration = Date.now() - loginAttemptStartTime
            console.error(`❌ LoginForm - Erro no login após ${loginDuration}ms:`, {
                error: error,
                message: error?.message,
                stack: error?.stack,
                name: error?.name,
                code: error?.code,
                status: error?.status,
                response: error?.response,
                formData: {
                    email: formData.email,
                    hasPassword: !!formData.password,
                    rememberMe: formData.rememberMe
                }
            })

            // Clear previous validation errors
            setValidationErrors({})

            // Map error to enhanced error system
            const errorMessage = getErrorMessage(error)
            const newMappedError = {
                type: 'authentication' as const,
                severity: 'high' as const,
                title: 'Erro no login',
                message: errorMessage,
                originalError: error
            }
            setMappedError(newMappedError)
            setShowError(true)
            announce(`Erro de login: ${errorMessage}`, 'assertive')

            // Auto-hide authentication errors after 5 seconds
            setTimeout(() => {
                setShowError(false)
            }, 5000)

            // Fallback: Also ensure legacy error display works
            console.warn('🔄 LoginForm - Mensagem amigável gerada:', errorMessage)
        }
    }

    // Social login handlers with enhanced error feedback
    const handleGoogleLogin = async () => {
        setSocialLoading(prev => ({ ...prev, google: true }))

        // Clear previous errors
        setMappedError(null)
        setShowError(false)

        try {
            // TODO: Implement Google OAuth login
            console.log('🔄 Google login iniciado')

            // Simulate different types of errors for testing
            const randomError = Math.random()
            if (randomError < 0.3) {
                throw new Error('Network Error: Failed to connect to Google')
            } else if (randomError < 0.6) {
                throw { code: 401, message: 'Invalid Google credentials' }
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            console.log('✅ Google login realizado com sucesso!')

            // Chamar função de sucesso
            await handleLoginSuccess('social')

        } catch (error) {
            console.error('❌ Erro no login Google:', error)

            // Map error and display with enhanced feedback
            const mapped = mapError(error)
            mapped.title = `Erro no ${mapped.title.toLowerCase().includes('google') ? mapped.title : 'Google Login'}`

            setMappedError(mapped)
            setShowError(true)
            announce(`Erro no login Google: ${mapped.message}`, 'assertive')

            // Auto-hide after delay
            setTimeout(() => setShowError(false), 4000)

        } finally {
            setSocialLoading(prev => ({ ...prev, google: false }))
        }
    }

    const handleGitHubLogin = async () => {
        setSocialLoading(prev => ({ ...prev, github: true }))

        // Clear previous errors
        setMappedError(null)
        setShowError(false)

        try {
            // TODO: Implement GitHub OAuth login
            console.log('🔄 GitHub login iniciado')

            // Simulate different types of errors for testing
            const randomError = Math.random()
            if (randomError < 0.3) {
                throw { code: 429, message: 'Too many requests to GitHub' }
            } else if (randomError < 0.6) {
                throw new Error('account_disabled: GitHub account is disabled')
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            console.log('✅ GitHub login realizado com sucesso!')

            // Chamar função de sucesso
            await handleLoginSuccess('social')

        } catch (error) {
            console.error('❌ Erro no login GitHub:', error)

            // Map error and display with enhanced feedback
            const mapped = mapError(error)
            mapped.title = `Erro no ${mapped.title.toLowerCase().includes('github') ? mapped.title : 'GitHub Login'}`

            setMappedError(mapped)
            setShowError(true)
            announce(`Erro no login GitHub: ${mapped.message}`, 'assertive')

            // Auto-hide after delay
            setTimeout(() => setShowError(false), 4000)

        } finally {
            setSocialLoading(prev => ({ ...prev, github: false }))
        }
    }

    // 1. Update renderErrorFeedback function with non-null assertions
    const renderErrorFeedback = () => {
        if (!showError || !mappedError) return null;

        return (
            <ErrorFeedback
                type={mappedError!.type as ErrorType}
                severity={mappedError!.severity}
                title={mappedError!.title}
                message={mappedError!.message}
                onDismiss={() => {
                    setShowError(false);
                    setMappedError(null);
                    clearError();
                }}
                dismissible={true}
                className="animate-in slide-in-from-top-2"
            />
        );
    };

    return (
        <FormAccessibility
            formId="login-form"
            className={`w-full max-w-xl mx-auto ${className}`}
        >
            <div className="w-full max-w-md mx-auto">
                {/* Seção de DEBUG removida - estava causando requests automáticos */}

                <div className="bg-gradient-to-br from-brand/40 via-brand-light/10 to-transparent p-[2px] rounded-3xl shadow-xl">
                    <div
                        className={`bg-white/70 dark:bg-neutral-800/70 backdrop-blur-lg border border-white/40 dark:border-neutral-700/60 rounded-[calc(1.5rem-2px)] p-10 ${error ? 'animate-shake' : ''}`}
                    >
                        <div className="text-center mb-6 flex flex-col items-center">
                            <BrandLogo variant="icon" size={48} className="mb-4" />
                            <h2
                                id="login-form-title"
                                className="text-2xl font-bold text-gray-900 dark:text-white"
                            >
                                Entrar na sua conta
                            </h2>
                            <p
                                id="login-form-description"
                                className="text-gray-600 dark:text-gray-400 mt-2"
                            >
                                Bem-vindo de volta! Faça login para continuar.
                            </p>
                        </div>

                        {/* Login social */}
                        <div className="space-y-3 mb-6">
                            <GoogleLoginButton
                                loading={socialLoading.google}
                                loadingText="Conectando com Google..."
                                onClick={handleGoogleLogin}
                                disabled={isLoading || socialLoading.github || showSuccess}
                            />

                            <GitHubLoginButton
                                loading={socialLoading.github}
                                loadingText="Conectando com GitHub..."
                                onClick={handleGitHubLogin}
                                disabled={isLoading || socialLoading.google || showSuccess}
                            />
                        </div>

                        {/* Divider */}
                        <div className="flex items-center my-6" aria-hidden="true">
                            <span className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                            <span className="mx-3 text-xs uppercase text-gray-500 dark:text-gray-400 select-none">ou</span>
                            <span className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                        </div>

                        {/* Success feedback system */}
                        {showSuccess && (
                            <div className="mb-4">
                                {isRedirecting ? (
                                    <LoginSuccessSequence
                                        onComplete={() => {
                                            console.log('🎉 LoginForm - Sequência de sucesso concluída')
                                        }}
                                        className="animate-in fade-in-0 zoom-in-95"
                                    />
                                ) : (
                                    <SuccessFeedback
                                        type="login"
                                        variant="celebration"
                                        message={successType === 'social' ? 'Login social realizado com sucesso!' : undefined}
                                        autoHide={false}
                                        showProgress={false}
                                        className="animate-in slide-in-from-top-2"
                                    />
                                )}
                            </div>
                        )}

                        {/* Enhanced error feedback system */}
                        {renderErrorFeedback()}

                        {/* Fallback for legacy error display */}
                        {error && !showError && !showSuccess && (
                            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                            Erro no login
                                        </h3>
                                        <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                                            {getErrorMessage(error)}
                                        </div>
                                    </div>
                                    <div className="ml-auto pl-3">
                                        <button
                                            type="button"
                                            onClick={clearError}
                                            className="inline-flex rounded-md bg-red-50 dark:bg-red-900/20 p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                                            aria-label="Fechar erro"
                                        >
                                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Campo Email com validação em tempo real */}
                            <div className="relative">
                                <ValidatedInput
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={(e) => {
                                        handleChange(e)
                                        if (!hasInteracted.email) {
                                            setHasInteracted(prev => ({ ...prev, email: true }))
                                            announce('Validação de email ativada')
                                        }
                                        setShowEmailValidation(true)
                                    }}
                                    rules={emailRules}
                                    showValidation={showEmailValidation && hasInteracted.email}
                                    className="peer w-full pt-6 pb-2 pl-10 pr-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-transparent"
                                    placeholder="Email"
                                    disabled={isLoading || showSuccess}
                                    autoComplete="email"
                                />

                                {/* Ícone do email */}
                                <svg className="w-5 h-5 absolute left-3 top-5 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M2 4a2 2 0 012-2h16a2 2 0 012 2v.01L12 13 2 4.01V4z" />
                                    <path d="M22 6.5l-10 7-10-7V20a2 2 0 002 2h16a2 2 0 002-2V6.5z" />
                                </svg>

                                {/* Label flutuante */}
                                <label
                                    htmlFor="email"
                                    className="absolute left-10 top-2 text-xs text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand"
                                >
                                    Email
                                </label>

                                {/* Fallback para erro de validação tradicional */}
                                {validationErrors.email && !showEmailValidation && (
                                    <InlineError message={validationErrors.email} />
                                )}
                            </div>

                            {/* Campo Senha com validação em tempo real */}
                            <div className="relative">
                                <ValidatedInput
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) => {
                                        handleChange(e)
                                        if (!hasInteracted.password) {
                                            setHasInteracted(prev => ({ ...prev, password: true }))
                                            announce('Validação de senha ativada - critérios de força sendo verificados')
                                        }
                                        setShowPasswordValidation(true)
                                    }}
                                    rules={passwordRules}
                                    showValidation={showPasswordValidation && hasInteracted.password}
                                    className="peer w-full pt-6 pb-2 pl-10 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-transparent"
                                    placeholder="Senha"
                                    disabled={isLoading || showSuccess}
                                    autoComplete="current-password"
                                />

                                {/* Ícone da senha */}
                                <svg className="w-5 h-5 absolute left-3 top-5 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2a10 10 0 00-9.33 6.25 1 1 0 000 .5A10.05 10.05 0 0012 22a10.05 10.05 0 009.33-13.25 1 1 0 000-.5A10.05 10.05 0 0012 2zm0 15a5 5 0 110-10 5 5 0 010 10z" clipRule="evenodd" />
                                </svg>

                                {/* Label flutuante */}
                                <label
                                    htmlFor="password"
                                    className="absolute left-10 top-2 text-xs text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand"
                                >
                                    Senha
                                </label>

                                {/* Fallback para erro de validação tradicional */}
                                {validationErrors.password && !showPasswordValidation && (
                                    <InlineError message={validationErrors.password} />
                                )}

                                {/* Indicador de força da senha */}
                                {showPasswordValidation && hasInteracted.password && formData.password && (
                                    <div className="mt-2">
                                        <PasswordStrengthIndicator
                                            password={formData.password}
                                            showCriteria={true}
                                            showStrengthBar={true}
                                            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Lembrar-me e Esqueci a senha */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded"
                                        disabled={isLoading || showSuccess}
                                    />
                                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                        Lembrar-me
                                    </label>
                                </div>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                >
                                    Esqueci a senha
                                </Link>
                            </div>

                            {/* Botão de submit */}
                            <LoadingButton
                                type="submit"
                                variant="primary"
                                loading={isLoading}
                                loadingText="Entrando..."
                                disabled={socialLoading.google || socialLoading.github || showSuccess}
                                className="w-full"
                            >
                                Entrar
                            </LoadingButton>
                        </form>

                        {/* Link para registro */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Não tem uma conta?{' '}
                                <Link
                                    href="/register"
                                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                                >
                                    Criar conta
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </FormAccessibility>
    )
}

export default LoginForm

