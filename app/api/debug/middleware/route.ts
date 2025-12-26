import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Tentar obter token do middleware - testar diferentes formas
    let token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Se null, tentar com cookie name explícito
    if (!token) {
      const cookieName = request.cookies.get('next-auth.session-token')
        ? 'next-auth.session-token'
        : '__Secure-next-auth.session-token'

      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName,
      })
    }

    // Log detalhado do cookie
    const allCookies = request.cookies.getAll()
    const nextAuthCookies = allCookies.filter(c => c.name.includes('next-auth'))

    // Verificar cookies
    const sessionToken =
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value

    return NextResponse.json({
      session: {
        user: session?.user,
        expires: session?.expires,
      },
      token: {
        id: token?.id,
        role: token?.role,
        roleType: typeof token?.role,
        fullToken: token,
      },
      cookies: {
        hasSessionToken: !!sessionToken,
        sessionTokenLength: sessionToken?.length || 0,
        allNextAuthCookies: nextAuthCookies.map(c => ({
          name: c.name,
          value: c.value.substring(0, 50) + '...',
          length: c.value.length,
        })),
      },
      env: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      },
      comparison: {
        sessionRole: session?.user?.role,
        tokenRole: token?.role,
        areEqual: session?.user?.role === token?.role,
        tokenIsAdmin: token?.role === 'ADMIN',
        sessionIsAdmin: session?.user?.role === 'ADMIN',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
