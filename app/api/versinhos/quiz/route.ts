import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const TAMANHO_LOTE = 10

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const loteParam = searchParams.get('lote')

    const progresso = await prisma.versinhoProgresso.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    const loteAtual = Math.floor(progresso.acertos / TAMANHO_LOTE)

    let loteIndex: number
    let modoRevisao = false

    if (loteParam !== null) {
      const loteRequisitado = parseInt(loteParam, 10)
      if (
        isNaN(loteRequisitado) ||
        loteRequisitado < 0 ||
        loteRequisitado >= loteAtual
      ) {
        return NextResponse.json(
          { error: 'Lote de revisão inválido' },
          { status: 400 }
        )
      }
      loteIndex = loteRequisitado
      modoRevisao = true
    } else {
      loteIndex = loteAtual
    }

    const base = loteIndex * TAMANHO_LOTE

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
      loteIndex,
      loteAtual,
      modoRevisao,
      versinhos,
      concluido: !modoRevisao && versinhos.length === 0,
    })
  } catch (error: any) {
    console.error('[versinhos/quiz] erro:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar quiz de versinhos' },
      { status: 500 }
    )
  }
}
