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
    const { endpoint, keys } = body ?? {}

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Payload de assinatura inválido' },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') ?? undefined

    await prisma.webPushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: session.user.id,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[push/subscribe] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar assinatura' },
      { status: 500 }
    )
  }
}
