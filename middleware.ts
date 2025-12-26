import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Verificar se há token de sessão nos cookies
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  // Rotas protegidas que requerem autenticação
  if (request.nextUrl.pathname.startsWith('/home')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Rotas que requerem permissão de admin
  if (
    request.nextUrl.pathname.startsWith('/admin') ||
    (request.nextUrl.pathname.startsWith('/quiz') &&
      !request.nextUrl.pathname.startsWith('/quiz/responder'))
  ) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar se NEXTAUTH_SECRET está configurado
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('[Middleware] NEXTAUTH_SECRET não está configurado!')
      return NextResponse.redirect(new URL('/home', request.url))
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Log para debug em produção
    console.log('[Middleware] Verificando acesso a:', request.nextUrl.pathname)
    console.log('[Middleware] Token existe?', !!token)
    console.log('[Middleware] Token completo:', JSON.stringify(token, null, 2))
    console.log('[Middleware] Token role:', token?.role)
    console.log('[Middleware] Token role type:', typeof token?.role)
    console.log('[Middleware] É admin?', token?.role === 'ADMIN')
    console.log('[Middleware] Comparação:', `"${token?.role}" === "ADMIN"`)

    // Verificação mais flexível
    const userRole = token?.role?.toString().toUpperCase()
    const isAdmin = userRole === 'ADMIN'

    console.log('[Middleware] userRole após toUpperCase:', userRole)
    console.log('[Middleware] isAdmin calculado:', isAdmin)

    if (!isAdmin) {
      console.log('[Middleware] ❌ Redirecionando para /home (não é admin)')
      console.log('[Middleware] Role recebido:', userRole)
      console.log('[Middleware] Token completo para debug:', token)
      return NextResponse.redirect(new URL('/home', request.url))
    }

    console.log('[Middleware] ✅ Acesso permitido - usuário é admin')
  }

  // Proteger rota de responder quiz (requer autenticação)
  if (request.nextUrl.pathname.startsWith('/quiz/responder')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/home/:path*', '/admin/:path*', '/quiz/:path*'],
}
