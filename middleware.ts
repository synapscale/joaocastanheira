/**
 * Middleware de autenticação Next.js
 * Protege rotas que requerem autenticação
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { config as appConfig } from './lib/config'

// Rotas que requerem autenticação
const protectedRoutes = [
  '/user-variables',
  '/workflows',
  '/chat',
  '/workspaces',
  '/analytics',
  '/monitoring',
  '/profile',
  '/settings',
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
  '/',
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
  return protectedRoutes.some(route => pathname.startsWith(route))
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
  const token = request.cookies.get(appConfig.auth.tokenKey)?.value
  
  if (!token) {
    return false
  }

  try {
    // Verificar se o token não está expirado
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    return payload.exp > currentTime
  } catch (error) {
    // Token inválido
    return false
  }
}

/**
 * Middleware principal
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isUserAuthenticated = isAuthenticated(request)

  // Permitir rotas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Redirecionar usuários autenticados das páginas de auth
  if (isAuthRoute(pathname) && isUserAuthenticated) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Proteger rotas que requerem autenticação
  if (isProtectedRoute(pathname) && !isUserAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Adicionar headers de segurança
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

