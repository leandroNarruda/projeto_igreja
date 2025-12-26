import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Tentar obter token do middleware
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

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
