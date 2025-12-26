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

    // Buscar quiz ativo
    const quizAtivo = await prisma.quiz.findFirst({
      where: { ativo: true },
      include: {
        perguntas: true,
      },
    })

    if (!quizAtivo) {
      return NextResponse.json(
        { quiz: null, jaRespondeu: false, resultado: null },
        { status: 200 }
      )
    }

    // Verificar se usuário já respondeu todas as perguntas deste quiz
    const respostasUsuario = await prisma.respostaUsuario.findMany({
      where: {
        userId: session.user.id,
        quizId: quizAtivo.id,
      },
    })

    const perguntasRespondidas = respostasUsuario.length
    const totalPerguntas = quizAtivo.perguntas.length
    const jaRespondeu =
      perguntasRespondidas === totalPerguntas && totalPerguntas > 0

    let resultado = null
    if (jaRespondeu) {
      // Calcular resultado
      const respostasCorretas = await prisma.respostaUsuario.findMany({
        where: {
          userId: session.user.id,
          quizId: quizAtivo.id,
        },
        include: {
          pergunta: true,
        },
      })

      let acertos = 0
      respostasCorretas.forEach(resposta => {
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

      resultado = {
        total: totalPerguntas,
        acertos,
        erros,
        porcentagem,
      }
    }

    return NextResponse.json({
      quiz: {
        id: quizAtivo.id,
        tema: quizAtivo.tema,
        ativo: quizAtivo.ativo,
        totalPerguntas,
        perguntasRespondidas,
      },
      jaRespondeu,
      resultado,
    })
  } catch (error) {
    console.error('Erro ao buscar quiz ativo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar quiz ativo' },
      { status: 500 }
    )
  }
}
