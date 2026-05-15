import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  VERSINOS_POR_NIVEL,
  getNivelInfo,
  isNivelMaximo,
} from '@/lib/versinhoNiveis'

export const dynamic = 'force-dynamic'

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

    const { nivel, acertos } = progresso
    const acertosNecessarios = nivel * VERSINOS_POR_NIVEL
    const prontoParaChefao =
      acertos >= acertosNecessarios && !isNivelMaximo(nivel)

    if (!prontoParaChefao) {
      return NextResponse.json({
        prontoParaChefao: false,
        nivel,
        acertos,
        acertosNecessarios,
      })
    }

    const skip = (nivel - 1) * VERSINOS_POR_NIVEL

    const versinhos = await prisma.versinho.findMany({
      orderBy: { id: 'asc' },
      skip,
      take: VERSINOS_POR_NIVEL,
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

    const proximoNivel = nivel + 1
    const nomeProximoNivel = getNivelInfo(proximoNivel)

    return NextResponse.json({
      prontoParaChefao: true,
      nivel,
      versinhos,
      proximoNivel,
      nomeProximoNivel: nomeProximoNivel.titulo,
      emojiProximoNivel: nomeProximoNivel.emoji,
      gradientProximoNivel: nomeProximoNivel.gradient,
    })
  } catch (error: any) {
    console.error('[versinhos/chefao] erro:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar Chefão' },
      { status: 500 }
    )
  }
}
