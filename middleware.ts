import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Verificar se há token de sessão nos cookies
  const sessionToken = request.cookies.get("next-auth.session-token")?.value ||
                       request.cookies.get("__Secure-next-auth.session-token")?.value

  // Se não estiver autenticado e tentar acessar rota protegida, redireciona para login
  if (!sessionToken && request.nextUrl.pathname.startsWith("/home")) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/home/:path*"],
}

