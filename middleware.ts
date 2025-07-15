/**
 * Middleware de autenticação Next.js
 * Protege rotas que requerem autenticação
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { config as appConfig } from './lib/config'

// Rotas que requerem autenticação
const protectedRoutes = [
  '/', // Página inicial agora requer autenticação
  '/user-variables',
  '/workflows',
  '/chat',
  '/workspaces',
  '/analytics',
  '/monitoring',
  '/profile',
  '/settings',
  '/canvas',
  '/node-creator',
  '/templates',
  '/variables',
  '/agentes',
  '/team', // ✅ Adicionando /team às rotas protegidas
]

// Rotas de autenticação (redirecionam se já autenticado)
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

// Rotas públicas (sempre acessíveis)
const publicRoutes = [
  '/docs',
  '/marketplace',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/api/health',
]

/**
 * Verifica se uma rota está protegida
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(route + '/')
  )
}

/**
 * Verifica se é uma rota de autenticação
 */
function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(route => pathname.startsWith(route))
}

/**
 * Verifica se é uma rota pública
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(route + '/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  )
}

/**
 * Valida um token JWT verificando estrutura e expiração
 */
function validateJWT(token: string): { isValid: boolean; payload?: any; error?: string } {
  try {
    // Verificar estrutura básica do JWT (3 partes separadas por ponto)
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { isValid: false, error: 'Token JWT deve ter 3 partes' }
    }

    // Decodificar payload (segunda parte)
    const base64Payload = parts[1]
    if (!base64Payload) {
      return { isValid: false, error: 'Payload do token está vazio' }
    }

    // Adicionar padding se necessário para base64
    const padding = 4 - (base64Payload.length % 4)
    const paddedPayload = base64Payload + (padding !== 4 ? '='.repeat(padding) : '')

    const payload = JSON.parse(atob(paddedPayload))
    
    // Verificar se tem expiração
    if (!payload.exp) {
      return { isValid: false, error: 'Token não possui campo de expiração' }
    }

    // Verificar expiração
    const currentTime = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp <= currentTime
    
    if (isExpired) {
      return { isValid: false, error: 'Token expirado', payload }
    }

    return { isValid: true, payload }
  } catch (error) {
    return { isValid: false, error: `Erro ao validar token: ${error}` }
  }
}

/**
 * Verifica se o usuário está autenticado baseado no token
 */
function isAuthenticated(request: NextRequest): boolean {
  // Usar as mesmas chaves que o ApiService e AuthService usam
  const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'synapsefrontend_auth_token'
  const refreshTokenKey = process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'synapsefrontend_refresh_token'

  if (appConfig.isDevelopment) {
    console.log('🔍 Middleware - Verificando autenticação:', {
      pathname: request.nextUrl.pathname,
      tokenKey,
      hasCookies: request.cookies.size > 0,
      cookieNames: Array.from(request.cookies.getAll()).map(c => c.name)
    })
  }

  // 1. Primeiro tenta verificar pelo cookie principal
  const tokenFromCookie = request.cookies.get(tokenKey)?.value
  
  if (tokenFromCookie) {
    const validation = validateJWT(tokenFromCookie)
    
    if (appConfig.isDevelopment) {
      console.log('🔍 Middleware - Token do cookie:', {
        hasToken: true,
        isValid: validation.isValid,
        error: validation.error,
        exp: validation.payload?.exp,
        current: Math.floor(Date.now() / 1000),
        timeUntilExp: validation.payload?.exp ? validation.payload.exp - Math.floor(Date.now() / 1000) : null
      })
    }
    
    if (validation.isValid) {
      return true
    }
  }

  // 2. Como fallback, verifica se há token no header Authorization
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const tokenFromHeader = authHeader.substring(7)
    const validation = validateJWT(tokenFromHeader)
    
    if (appConfig.isDevelopment) {
      console.log('🔍 Middleware - Token do header:', {
        hasToken: true,
        isValid: validation.isValid,
        error: validation.error
      })
    }
    
    if (validation.isValid) {
      return true
    }
  }

  // 3. Verificar também no cookie de refresh token como último recurso
  // (alguns setups podem usar o refresh token como token principal)
  const refreshTokenFromCookie = request.cookies.get(refreshTokenKey)?.value
  if (refreshTokenFromCookie) {
    const validation = validateJWT(refreshTokenFromCookie)
    
    if (appConfig.isDevelopment) {
      console.log('🔍 Middleware - Refresh token do cookie:', {
        hasToken: true,
        isValid: validation.isValid,
        error: validation.error
      })
    }
    
    if (validation.isValid) {
      return true
    }
  }

  if (appConfig.isDevelopment) {
    console.log('❌ Middleware - Nenhum token válido encontrado')
  }

  return false
}

/**
 * Middleware principal
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isUserAuthenticated = isAuthenticated(request)

  if (appConfig.isDevelopment) {
    console.log('🔍 Middleware - Processando rota:', {
      pathname,
      isAuthenticated: isUserAuthenticated,
      isProtected: isProtectedRoute(pathname),
      isAuth: isAuthRoute(pathname),
      isPublic: isPublicRoute(pathname)
    })
  }

  // Permitir rotas públicas sempre
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Se usuário está autenticado e tenta acessar rota de auth, redirecionar
  if (isAuthRoute(pathname) && isUserAuthenticated) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/chat'
    
    if (appConfig.isDevelopment) {
      console.log('👤 Middleware - Usuário autenticado tentando acessar rota de auth, redirecionando para:', redirectUrl)
    }
    
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Se usuário não está autenticado e tenta acessar rota protegida, redirecionar para login
  if (isProtectedRoute(pathname) && !isUserAuthenticated) {
    // ❌ EVITAR LOOP: Se já está tentando ir para login, não redirecionar
    if (pathname === '/login' || pathname.startsWith('/login?')) {
      return NextResponse.next()
    }
    
    const loginUrl = new URL('/login', request.url)
    
    // Só adicionar redirect se não for a própria homepage
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    
    if (appConfig.isDevelopment) {
      console.log('🔒 Middleware - Rota protegida sem autenticação, redirecionando para:', loginUrl.toString())
    }
    
    return NextResponse.redirect(loginUrl)
  }

  // Para todas as outras situações, permitir acesso
  const response = NextResponse.next()
  
  // Headers de segurança
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  // CSP para desenvolvimento
  if (appConfig.isDevelopment) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' *; img-src 'self' data: blob: *; media-src 'self' blob: *;"
    )
  }

  return response
}

/**
 * Configuração do matcher
 * Define quais rotas o middleware deve processar
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

