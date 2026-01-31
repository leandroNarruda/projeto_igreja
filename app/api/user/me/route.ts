import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { social_name: socialNameRaw } = body

    if (socialNameRaw !== undefined) {
      if (typeof socialNameRaw !== 'string') {
        return NextResponse.json(
          { error: 'social_name deve ser uma string' },
          { status: 400 }
        )
      }
      const trimmed = socialNameRaw.trim()
      if (trimmed === '') {
        return NextResponse.json(
          { error: 'Nome social não pode ser vazio' },
          { status: 400 }
        )
      }

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { social_name: trimmed },
        select: { social_name: true },
      })

      return NextResponse.json(
        { socialName: user.social_name },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Nenhum campo para atualizar' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API] Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}
