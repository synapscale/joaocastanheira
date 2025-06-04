/**
 * Hooks personalizados para autenticação
 * Fornece funcionalidades específicas de auth com estado local
 */

'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '../context/auth-context'
import type {
  LoginData,
  RegisterData,
  AuthError,
  UseLoginReturn,
  UseRegisterReturn,
  UseAuthReturn,
} from '../lib/types/auth'

/**
 * Hook para login com estado local
 */
export function useLogin(): UseLoginReturn {
  const { login: authLogin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  const login = useCallback(async (data: LoginData): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await authLogin(data)
    } catch (err) {
      const authError: AuthError = {
        code: 'LOGIN_FAILED',
        message: err instanceof Error ? err.message : 'Erro ao fazer login',
      }
      setError(authError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [authLogin])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    login,
    isLoading,
    error,
    clearError,
  }
}

/**
 * Hook para registro com estado local
 */
export function useRegister(): UseRegisterReturn {
  const { register: authRegister } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await authRegister(data)
    } catch (err) {
      const authError: AuthError = {
        code: 'REGISTER_FAILED',
        message: err instanceof Error ? err.message : 'Erro ao criar conta',
      }
      setError(authError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [authRegister])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    register,
    isLoading,
    error,
    clearError,
  }
}

/**
 * Hook para logout com confirmação
 */
export function useLogout() {
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const logoutWithConfirmation = useCallback(async (skipConfirmation = false): Promise<void> => {
    if (!skipConfirmation) {
      const confirmed = window.confirm('Tem certeza que deseja sair?')
      if (!confirmed) return
    }

    setIsLoading(true)
    try {
      await logout()
    } finally {
      setIsLoading(false)
    }
  }, [logout])

  return {
    logout: logoutWithConfirmation,
    isLoading,
  }
}

/**
 * Hook para verificação de email
 */
export function useEmailVerification() {
  const { verifyEmail, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  const verify = useCallback(async (token: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await verifyEmail(token)
      setIsVerified(true)
    } catch (err) {
      const authError: AuthError = {
        code: 'EMAIL_VERIFICATION_FAILED',
        message: err instanceof Error ? err.message : 'Erro ao verificar email',
      }
      setError(authError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [verifyEmail])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    verify,
    isLoading,
    error,
    isVerified,
    needsVerification: user && !user.isEmailVerified,
    clearError,
  }
}

/**
 * Hook para reset de senha
 */
export function usePasswordReset() {
  const { requestPasswordReset, resetPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [isRequestSent, setIsRequestSent] = useState(false)
  const [isResetComplete, setIsResetComplete] = useState(false)

  const requestReset = useCallback(async (email: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await requestPasswordReset(email)
      setIsRequestSent(true)
    } catch (err) {
      const authError: AuthError = {
        code: 'PASSWORD_RESET_REQUEST_FAILED',
        message: err instanceof Error ? err.message : 'Erro ao solicitar reset de senha',
      }
      setError(authError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [requestPasswordReset])

  const resetPasswordWithToken = useCallback(async (token: string, newPassword: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await resetPassword(token, newPassword)
      setIsResetComplete(true)
    } catch (err) {
      const authError: AuthError = {
        code: 'PASSWORD_RESET_FAILED',
        message: err instanceof Error ? err.message : 'Erro ao resetar senha',
      }
      setError(authError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [resetPassword])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setIsRequestSent(false)
    setIsResetComplete(false)
    setError(null)
  }, [])

  return {
    requestReset,
    resetPasswordWithToken,
    isLoading,
    error,
    isRequestSent,
    isResetComplete,
    clearError,
    reset,
  }
}

/**
 * Hook para alteração de senha
 */
export function useChangePassword() {
  const { changePassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const change = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      await changePassword(currentPassword, newPassword)
      setIsSuccess(true)
    } catch (err) {
      const authError: AuthError = {
        code: 'CHANGE_PASSWORD_FAILED',
        message: err instanceof Error ? err.message : 'Erro ao alterar senha',
      }
      setError(authError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [changePassword])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setIsSuccess(false)
    setError(null)
  }, [])

  return {
    changePassword: change,
    isLoading,
    error,
    isSuccess,
    clearError,
    reset,
  }
}

/**
 * Hook para atualização de perfil
 */
export function useUpdateProfile() {
  const { updateUser, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const update = useCallback(async (data: Partial<typeof user>): Promise<void> => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      await updateUser(data)
      setIsSuccess(true)
    } catch (err) {
      const authError: AuthError = {
        code: 'UPDATE_PROFILE_FAILED',
        message: err instanceof Error ? err.message : 'Erro ao atualizar perfil',
      }
      setError(authError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [updateUser, user])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setIsSuccess(false)
    setError(null)
  }, [])

  return {
    updateProfile: update,
    isLoading,
    error,
    isSuccess,
    clearError,
    reset,
  }
}

/**
 * Hook principal que combina todas as funcionalidades
 */
export function useAuthComplete(): UseAuthReturn {
  const authContext = useAuth()
  const [error, setError] = useState<AuthError | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    ...authContext,
    error,
    clearError,
  }
}

/**
 * Hook para verificar permissões
 */
export function usePermissions() {
  const { user } = useAuth()

  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role
  }, [user])

  const isAdmin = useCallback((): boolean => {
    return user?.role === 'admin'
  }, [user])

  const isPremium = useCallback((): boolean => {
    return user?.role === 'premium' || user?.role === 'admin'
  }, [user])

  const canAccess = useCallback((requiredRole?: string): boolean => {
    if (!requiredRole) return true
    if (!user) return false
    
    const roleHierarchy = { user: 1, premium: 2, admin: 3 }
    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
    
    return userLevel >= requiredLevel
  }, [user])

  return {
    user,
    hasRole,
    isAdmin,
    isPremium,
    canAccess,
  }
}

export default {
  useLogin,
  useRegister,
  useLogout,
  useEmailVerification,
  usePasswordReset,
  useChangePassword,
  useUpdateProfile,
  useAuthComplete,
  usePermissions,
}

