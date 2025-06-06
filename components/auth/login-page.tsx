"use client"

/**
 * LoginPage - Página de Login
 * Implementada por José - O melhor Full Stack do mundo
 * Interface moderna e responsiva para autenticação
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export const LoginPage: React.FC = () => {
  const router = useRouter()
  const { login, register, isLoading, error, clearError, isAuthenticated } = useAuth()
  
  // Estados do formulário
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Limpar erro quando mudar de modo
  useEffect(() => {
    clearError()
    setFormErrors({})
  }, [isLoginMode, clearError])

  // Validação do formulário
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Email
    if (!formData.email) {
      errors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }

    // Senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    // Campos específicos do registro
    if (!isLoginMode) {
      if (!formData.name) {
        errors.name = 'Nome é obrigatório'
      } else if (formData.name.length < 2) {
        errors.name = 'Nome deve ter pelo menos 2 caracteres'
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirmação de senha é obrigatória'
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Senhas não coincidem'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manipular mudanças no formulário
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      let success = false

      if (isLoginMode) {
        success = await login({
          email: formData.email,
          password: formData.password
        })
      } else {
        success = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
      }

      if (success) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro na autenticação:', error)
    }
  }

  // Alternar modo login/registro
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e título */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SynapScale</h1>
          </div>
          <p className="text-muted-foreground">
            Plataforma de Automação com IA
          </p>
        </div>

        {/* Formulário */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">
              {isLoginMode ? 'Entrar na sua conta' : 'Criar nova conta'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLoginMode 
                ? 'Digite suas credenciais para acessar a plataforma'
                : 'Preencha os dados para criar sua conta'
              }
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Erro geral */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Nome (apenas no registro) */}
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={cn(formErrors.name && 'border-destructive')}
                    disabled={isLoading}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-destructive">{formErrors.name}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={cn('pl-10', formErrors.email && 'border-destructive')}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={cn('pl-10 pr-10', formErrors.password && 'border-destructive')}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-destructive">{formErrors.password}</p>
                )}
              </div>

              {/* Confirmar senha (apenas no registro) */}
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={cn('pl-10', formErrors.confirmPassword && 'border-destructive')}
                      disabled={isLoading}
                    />
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              {/* Botão de submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>{isLoginMode ? 'Entrando...' : 'Criando conta...'}</span>
                  </div>
                ) : (
                  isLoginMode ? 'Entrar' : 'Criar conta'
                )}
              </Button>

              {/* Link para alternar modo */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {isLoginMode ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                </span>
                {' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  {isLoginMode ? 'Criar conta' : 'Fazer login'}
                </button>
              </div>

              {/* Link para esqueci a senha (apenas no login) */}
              {isLoginMode && (
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                    disabled={isLoading}
                    onClick={() => {
                      // TODO: Implementar recuperação de senha
                      console.log('Recuperar senha')
                    }}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>

        {/* Informações adicionais */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Ao continuar, você concorda com nossos{' '}
            <a href="/terms" className="hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="/privacy" className="hover:underline">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

