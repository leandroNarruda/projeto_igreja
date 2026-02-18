import { NextResponse } from 'next/server'
import Ably from 'ably'
import { getServerSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000 // 12h

export async function GET() {
  const session = await getServerSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const key = process.env.ABLY_API_KEY
  if (!key) {
    return NextResponse.json(
      { error: 'ABLY_API_KEY não configurada' },
      { status: 500 }
    )
  }

  const rest = new Ably.Rest({ key })
  const tokenRequest = await rest.auth.createTokenRequest({
    clientId: `user-${session.user.id}`,
    ttl: TOKEN_TTL_MS,
    capability: {
      'quiz:*:classificacao': ['subscribe'],
      'quiz:classificacao-geral': ['subscribe'],
    },
  })

  return NextResponse.json(tokenRequest)
}
