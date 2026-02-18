import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { sendPushToUsers, type PushPayload } from '@/lib/push/webPush'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { title, body: messageBody, url, tag, userIds } = body ?? {}

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: 'title e body são obrigatórios' },
        { status: 400 }
      )
    }

    const payload: PushPayload = {
      title,
      body: messageBody,
      url,
      tag,
    }

    const result = await sendPushToUsers(
      payload,
      Array.isArray(userIds) ? userIds : undefined
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[push/send] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar notificações' },
      { status: 500 }
    )
  }
}
