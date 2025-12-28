import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const quizId = parseInt(params.id, 10)
    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'ID do quiz inválido' },
        { status: 400 }
      )
    }

    // Buscar todas as perguntas do quiz
    const todasPerguntas = await prisma.pergunta.findMany({
      where: { quizId },
    })

    // Buscar todas as respostas do usuário para este quiz
    const respostasUsuario = await prisma.respostaUsuario.findMany({
      where: {
        userId: session.user.id,
        quizId,
      },
      include: {
        pergunta: true,
      },
    })

    const totalPerguntas = todasPerguntas.length

    if (totalPerguntas === 0) {
      return NextResponse.json(
        { error: 'Quiz não possui perguntas' },
        { status: 400 }
      )
    }

    // Calcular acertos
    let acertos = 0
    respostasUsuario.forEach(resposta => {
      if (
        resposta.alternativaEscolhida &&
        resposta.alternativaEscolhida === resposta.pergunta.respostaCorreta
      ) {
        acertos++
      }
    })

    const erros = totalPerguntas - acertos
    const porcentagem =
      totalPerguntas > 0 ? Math.round((acertos / totalPerguntas) * 100) : 0

    return NextResponse.json({
      total: totalPerguntas,
      acertos,
      erros,
      porcentagem,
    })
  } catch (error) {
    console.error('Erro ao calcular resultado:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular resultado' },
      { status: 500 }
    )
  }
}
