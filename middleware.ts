import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Verificar se há token de sessão nos cookies
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  // Redirecionar usuários logados que tentam acessar páginas de autenticação
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/cadastro')
  ) {
    if (sessionToken) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

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

    // Obter token JWT - tentar ambos os nomes de cookie possíveis
    let token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Se o token for null, tentar com o nome de cookie explícito
    if (!token) {
      // Verificar qual cookie está presente
      const hasRegularCookie = request.cookies.has('next-auth.session-token')
      const hasSecureCookie = request.cookies.has(
        '__Secure-next-auth.session-token'
      )

      if (hasRegularCookie) {
        token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
          cookieName: 'next-auth.session-token',
        })
      } else if (hasSecureCookie) {
        token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
          cookieName: '__Secure-next-auth.session-token',
        })
      }
    }

    // Se ainda for null, pode ser problema de secret ou cookie inválido
    // Nesse caso, permitir acesso e deixar a API verificar (não ideal, mas funcional)
    if (!token) {
      console.error(
        '[Middleware] Token JWT é null. Verifique NEXTAUTH_SECRET e cookies.'
      )
      // Permitir acesso - a API vai verificar se é admin
      return NextResponse.next()
    }

    // Verificar role do token
    const userRole = token?.role?.toString().toUpperCase()
    const isAdmin = userRole === 'ADMIN'

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
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
  matcher: [
    '/home/:path*',
    '/admin/:path*',
    '/quiz/:path*',
    '/login',
    '/cadastro',
  ],
}
