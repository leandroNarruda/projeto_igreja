import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNivelInfo, isNivelMaximo } from '@/lib/versinhoNiveis'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const aprovado: boolean = body?.aprovado
    const nivelBody: unknown = body?.nivel

    if (typeof aprovado !== 'boolean') {
      return NextResponse.json(
        { error: 'aprovado (boolean) é obrigatório' },
        { status: 400 }
      )
    }

    const progresso = await prisma.versinhoProgresso.findUnique({
      where: { userId },
    })
    if (!progresso) {
      return NextResponse.json(
        { error: 'Progresso não encontrado' },
        { status: 404 }
      )
    }

    let nivelAlvo = progresso.nivel
    if (nivelBody !== undefined) {
      if (
        typeof nivelBody !== 'number' ||
        nivelBody < 1 ||
        nivelBody > progresso.nivel
      ) {
        return NextResponse.json({ error: 'Nível inválido' }, { status: 400 })
      }
      nivelAlvo = nivelBody
    }

    const modoRevisao = nivelAlvo < progresso.nivel

    if (!aprovado) {
      const nivelInfo = getNivelInfo(nivelAlvo)
      return NextResponse.json({
        aprovado: false,
        modoRevisao,
        nivel: nivelAlvo,
        nomeNivel: nivelInfo.titulo,
        emojiNivel: nivelInfo.emoji,
      })
    }

    // Vitória em modo revisão: não altera progresso
    if (modoRevisao) {
      const nivelInfo = getNivelInfo(nivelAlvo)
      return NextResponse.json({
        aprovado: true,
        modoRevisao: true,
        nivel: nivelAlvo,
        nomeNivel: nivelInfo.titulo,
        emojiNivel: nivelInfo.emoji,
        gradient: nivelInfo.gradient,
        jaEraNivelMaximo: false,
      })
    }

    if (isNivelMaximo(progresso.nivel)) {
      const nivelInfo = getNivelInfo(progresso.nivel)
      return NextResponse.json({
        aprovado: true,
        modoRevisao: false,
        nivel: progresso.nivel,
        nomeNivel: nivelInfo.titulo,
        emojiNivel: nivelInfo.emoji,
        jaEraNivelMaximo: true,
      })
    }

    const novoNivel = progresso.nivel + 1
    await prisma.versinhoProgresso.update({
      where: { userId },
      data: { nivel: novoNivel },
    })

    const nivelInfo = getNivelInfo(novoNivel)
    return NextResponse.json({
      aprovado: true,
      modoRevisao: false,
      nivel: novoNivel,
      nomeNivel: nivelInfo.titulo,
      emojiNivel: nivelInfo.emoji,
      gradient: nivelInfo.gradient,
      jaEraNivelMaximo: false,
    })
  } catch (error: any) {
    console.error('[versinhos/chefao/concluir] erro:', error)
    return NextResponse.json(
      { error: 'Erro ao concluir Chefão' },
      { status: 500 }
    )
  }
}
