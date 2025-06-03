"use client"

/**
 * Contexto de Autenticação - SynapScale Frontend
 * Implementado por José - O melhor Full Stack do mundo
 * Sistema robusto de autenticação com JWT, refresh tokens e gestão de estado
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"

// Tipos para autenticação
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    workflow: boolean
  }
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  // Métodos de autenticação
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  refreshAuth: () => Promise<boolean>
  
  // Métodos de usuário
  updateUser: (userData: Partial<User>) => Promise<boolean>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>
  
  // Métodos utilitários
  clearError: () => void
  checkAuthStatus: () => Promise<boolean>
}

// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

// Chaves para localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: "synapscale_access_token",
  REFRESH_TOKEN: "synapscale_refresh_token",
  USER_DATA: "synapscale_user_data",
  EXPIRES_AT: "synapscale_expires_at"
} as const

// Contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook para usar o contexto de autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}

// Utilitários para localStorage
const storage = {
  get: (key: string): string | null => {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  
  set: (key: string, value: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error)
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Erro ao remover do localStorage:", error)
    }
  },
  
  clear: (): void => {
    if (typeof window === "undefined") return
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error("Erro ao limpar localStorage:", error)
    }
  }
}

// Utilitários para API
const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultHeaders = {
      "Content-Type": "application/json",
    }
    
    // Adicionar token de autorização se disponível
    const accessToken = storage.get(STORAGE_KEYS.ACCESS_TOKEN)
    if (accessToken) {
      defaultHeaders["Authorization"] = `Bearer ${accessToken}`
    }
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }
    
    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Erro na requisição para ${endpoint}:`, error)
      throw error
    }
  },
  
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  },
  
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  },
  
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

// Provider de autenticação
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  
  // Estado da autenticação
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })
  
  // Carregar dados do localStorage
  const loadStoredAuth = useCallback((): AuthTokens | null => {
    const accessToken = storage.get(STORAGE_KEYS.ACCESS_TOKEN)
    const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN)
    const expiresAt = storage.get(STORAGE_KEYS.EXPIRES_AT)
    
    if (!accessToken || !refreshToken || !expiresAt) {
      return null
    }
    
    return {
      accessToken,
      refreshToken,
      expiresAt: parseInt(expiresAt, 10),
    }
  }, [])
  
  // Salvar tokens no localStorage
  const saveTokens = useCallback((tokens: AuthTokens): void => {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken)
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
    storage.set(STORAGE_KEYS.EXPIRES_AT, tokens.expiresAt.toString())
  }, [])
  
  // Salvar dados do usuário
  const saveUser = useCallback((user: User): void => {
    storage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(user))
  }, [])
  
  // Carregar dados do usuário
  const loadUser = useCallback((): User | null => {
    const userData = storage.get(STORAGE_KEYS.USER_DATA)
    if (!userData) return null
    
    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  }, [])
  
  // Limpar dados de autenticação
  const clearAuth = useCallback((): void => {
    storage.clear()
    setAuthState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  }, [])
  
  // Verificar se o token está expirado
  const isTokenExpired = useCallback((tokens: AuthTokens): boolean => {
    return Date.now() >= tokens.expiresAt
  }, [])
  
  // Refresh do token
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const storedTokens = loadStoredAuth()
      if (!storedTokens?.refreshToken) {
        return false
      }
      
      const response = await apiClient.post<{
        access_token: string
        refresh_token: string
        expires_in: number
        user: User
      }>("/auth/refresh", {
        refresh_token: storedTokens.refreshToken
      })
      
      const newTokens: AuthTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: Date.now() + (response.expires_in * 1000),
      }
      
      saveTokens(newTokens)
      saveUser(response.user)
      
      setAuthState(prev => ({
        ...prev,
        user: response.user,
        tokens: newTokens,
        isAuthenticated: true,
        error: null,
      }))
      
      return true
    } catch (error) {
      console.error("Erro ao renovar token:", error)
      clearAuth()
      return false
    }
  }, [loadStoredAuth, saveTokens, saveUser, clearAuth])
  
  // Login
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await apiClient.post<{
        access_token: string
        refresh_token: string
        expires_in: number
        user: User
      }>("/auth/login", credentials)
      
      const tokens: AuthTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: Date.now() + (response.expires_in * 1000),
      }
      
      saveTokens(tokens)
      saveUser(response.user)
      
      setAuthState({
        user: response.user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer login"
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      return false
    }
  }, [saveTokens, saveUser])
  
  // Registro
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await apiClient.post<{
        access_token: string
        refresh_token: string
        expires_in: number
        user: User
      }>("/auth/register", data)
      
      const tokens: AuthTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: Date.now() + (response.expires_in * 1000),
      }
      
      saveTokens(tokens)
      saveUser(response.user)
      
      setAuthState({
        user: response.user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar conta"
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      return false
    }
  }, [saveTokens, saveUser])
  
  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Tentar invalidar token no servidor
      await apiClient.post("/auth/logout")
    } catch (error) {
      console.error("Erro ao fazer logout no servidor:", error)
    } finally {
      clearAuth()
      router.push("/login")
    }
  }, [clearAuth, router])
  
  // Atualizar usuário
  const updateUser = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await apiClient.put<{ user: User }>("/auth/profile", userData)
      
      const updatedUser = response.user
      saveUser(updatedUser)
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }))
      
      return true
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      return false
    }
  }, [saveUser])
  
  // Atualizar preferências
  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>): Promise<boolean> => {
    try {
      const response = await apiClient.put<{ user: User }>("/auth/preferences", preferences)
      
      const updatedUser = response.user
      saveUser(updatedUser)
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }))
      
      return true
    } catch (error) {
      console.error("Erro ao atualizar preferências:", error)
      return false
    }
  }, [saveUser])
  
  // Verificar status de autenticação
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      const storedTokens = loadStoredAuth()
      const storedUser = loadUser()
      
      if (!storedTokens || !storedUser) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return false
      }
      
      // Verificar se o token está expirado
      if (isTokenExpired(storedTokens)) {
        // Tentar renovar o token
        const refreshed = await refreshAuth()
        if (!refreshed) {
          setAuthState(prev => ({ ...prev, isLoading: false }))
          return false
        }
        return true
      }
      
      // Token válido, restaurar estado
      setAuthState({
        user: storedUser,
        tokens: storedTokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      return true
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
      clearAuth()
      return false
    }
  }, [loadStoredAuth, loadUser, isTokenExpired, refreshAuth, clearAuth])
  
  // Limpar erro
  const clearError = useCallback((): void => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])
  
  // Verificar autenticação na inicialização
  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])
  
  // Auto-refresh do token
  useEffect(() => {
    if (!authState.tokens || !authState.isAuthenticated) return
    
    const timeUntilExpiry = authState.tokens.expiresAt - Date.now()
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000) // 5 min antes ou 1 min mínimo
    
    const timer = setTimeout(() => {
      refreshAuth()
    }, refreshTime)
    
    return () => clearTimeout(timer)
  }, [authState.tokens, authState.isAuthenticated, refreshAuth])
  
  // Valor do contexto
  const contextValue = useMemo<AuthContextType>(() => ({
    ...authState,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
    updatePreferences,
    clearError,
    checkAuthStatus,
  }), [
    authState,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
    updatePreferences,
    clearError,
    checkAuthStatus,
  ])
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para verificar se o usuário está autenticado
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])
  
  return { isAuthenticated, isLoading }
}

// Hook para dados do usuário
export const useUser = () => {
  const { user, updateUser, updatePreferences } = useAuth()
  return { user, updateUser, updatePreferences }
}

export default AuthProvider

