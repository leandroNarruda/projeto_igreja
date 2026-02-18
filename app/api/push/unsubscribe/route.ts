import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint } = body ?? {}

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint é obrigatório' },
        { status: 400 }
      )
    }

    await prisma.webPushSubscription.deleteMany({
      where: {
        endpoint,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[push/unsubscribe] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao remover assinatura' },
      { status: 500 }
    )
  }
}
