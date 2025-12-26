import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Verificar se há token de sessão nos cookies
  const sessionToken = request.cookies.get("next-auth.session-token")?.value ||
                       request.cookies.get("__Secure-next-auth.session-token")?.value

  // Rotas protegidas que requerem autenticação
  if (request.nextUrl.pathname.startsWith("/home")) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Rotas que requerem permissão de admin
  if (request.nextUrl.pathname.startsWith("/admin") ||
      (request.nextUrl.pathname.startsWith("/quiz") &&
       !request.nextUrl.pathname.startsWith("/quiz/responder"))) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/home", request.url))
    }
  }

  // Proteger rota de responder quiz (requer autenticação)
  if (request.nextUrl.pathname.startsWith("/quiz/responder")) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/home/:path*", "/admin/:path*", "/quiz/:path*"],
}

