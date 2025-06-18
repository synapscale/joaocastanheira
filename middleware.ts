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
 * Verifica se o usuário está autenticado baseado no token
 */
function isAuthenticated(request: NextRequest): boolean {
  // Primeiro tenta verificar pelo cookie
  const tokenFromCookie = request.cookies.get(appConfig.auth.tokenKey)?.value
  
  if (tokenFromCookie) {
    try {
      // Verificar se o token não está expirado
      const payload = JSON.parse(atob(tokenFromCookie.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      const isValid = payload.exp > currentTime
      
      if (appConfig.isDevelopment) {
        console.log('Middleware - Token do cookie:', { 
          hasToken: true, 
          isExpired: !isValid,
          exp: payload.exp,
          current: currentTime
        })
      }
      
      return isValid
    } catch (error) {
      if (appConfig.isDevelopment) {
        console.warn('Middleware - Token do cookie inválido:', error)
      }
      // Token inválido no cookie, continua para verificar outras fontes
    }
  }

  // Como fallback, verificamos se há token no header Authorization
  // (para casos onde o frontend define o header mas não o cookie)
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const tokenFromHeader = authHeader.substring(7)
    try {
      const payload = JSON.parse(atob(tokenFromHeader.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      const isValid = payload.exp > currentTime
      
      if (appConfig.isDevelopment) {
        console.log('Middleware - Token do header:', { 
          hasToken: true, 
          isExpired: !isValid
        })
      }
      
      return isValid
    } catch (error) {
      if (appConfig.isDevelopment) {
        console.warn('Middleware - Token do header inválido:', error)
      }
    }
  }

  if (appConfig.isDevelopment) {
    console.log('Middleware - Nenhum token válido encontrado')
  }

  // Se chegou até aqui, não conseguiu verificar autenticação
  return false
}

/**
 * Middleware principal
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isUserAuthenticated = isAuthenticated(request)

  // Permitir rotas públicas sempre
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Se usuário está autenticado e tenta acessar rota de auth, redirecionar
  if (isAuthRoute(pathname) && isUserAuthenticated) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/chat'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Se usuário não está autenticado e tenta acessar rota protegida, redirecionar para login
  if (isProtectedRoute(pathname) && !isUserAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    // Só adicionar redirect se não for a própria homepage
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // Para todas as outras situações (incluindo rotas de auth para usuários não autenticados), permitir acesso
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

