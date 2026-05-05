import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const TAMANHO_LOTE = 10

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    const progresso = await prisma.versinhoProgresso.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    const base = Math.floor(progresso.acertos / TAMANHO_LOTE) * TAMANHO_LOTE

    const versinhos = await prisma.versinho.findMany({
      orderBy: { id: 'asc' },
      skip: base,
      take: TAMANHO_LOTE,
      select: {
        id: true,
        verso: true,
        alternativaA: true,
        alternativaB: true,
        alternativaC: true,
        alternativaD: true,
        alternativaE: true,
      },
    })

    return NextResponse.json({
      acertosTotais: progresso.acertos,
      loteIndex: base / TAMANHO_LOTE,
      versinhos,
      concluido: versinhos.length === 0,
    })
  } catch (error: any) {
    console.error('[versinhos/quiz] erro:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar quiz de versinhos' },
      { status: 500 }
    )
  }
}
