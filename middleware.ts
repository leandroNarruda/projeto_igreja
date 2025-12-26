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

  // Permitir acesso à página de debug sem verificação
  if (request.nextUrl.pathname.startsWith('/debug')) {
    return NextResponse.next()
  }

  // Rotas que requerem autenticação (verificação de admin será feita na API)
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
    // A verificação de admin será feita na API, não no middleware
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
  matcher: ['/home/:path*', '/admin/:path*', '/quiz/:path*', '/debug/:path*'],
}
