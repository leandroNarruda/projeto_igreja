import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const progressos = await prisma.versinhoProgresso.findMany({
      where: { acertos: { gt: 0 } },
      orderBy: [{ acertos: 'desc' }, { updatedAt: 'asc' }],
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            social_name: true,
            avatar_url: true,
          },
        },
      },
    })

    const classificacao = progressos.map((p, index) => ({
      posicao: index + 1,
      userId: p.user.id,
      nome: p.user.name,
      social_name: p.user.social_name ?? null,
      image: p.user.avatar_url ?? null,
      acertos: p.acertos,
    }))

    return NextResponse.json({ classificacao })
  } catch (error: any) {
    console.error('[versinhos/classificacao] erro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar classificação de versinhos' },
      { status: 500 }
    )
  }
}
