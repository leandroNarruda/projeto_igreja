import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { quizId, perguntaId, alternativaEscolhida } = body

    if (!quizId || !perguntaId) {
      return NextResponse.json(
        { error: 'quizId e perguntaId são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já respondeu esta pergunta específica
    const respostaExistente = await prisma.respostaUsuario.findUnique({
      where: {
        userId_quizId_perguntaId: {
          userId: session.user.id,
          quizId,
          perguntaId,
        },
      },
    })

    if (respostaExistente) {
      return NextResponse.json(
        { error: 'Pergunta já foi respondida' },
        { status: 400 }
      )
    }

    // Validar alternativa escolhida (se fornecida)
    if (
      alternativaEscolhida &&
      !['A', 'B', 'C', 'D', 'E'].includes(alternativaEscolhida)
    ) {
      return NextResponse.json(
        { error: 'Alternativa inválida' },
        { status: 400 }
      )
    }

    // Salvar resposta
    await prisma.respostaUsuario.create({
      data: {
        userId: session.user.id,
        quizId,
        perguntaId,
        alternativaEscolhida: alternativaEscolhida || null,
      },
    })

    // Buscar próxima pergunta aleatória não respondida
    const todasPerguntas = await prisma.pergunta.findMany({
      where: { quizId },
    })

    const respostasUsuario = await prisma.respostaUsuario.findMany({
      where: {
        userId: session.user.id,
        quizId,
      },
      select: {
        perguntaId: true,
      },
    })

    const perguntasRespondidasIds = new Set(
      respostasUsuario.map((r) => r.perguntaId)
    )

    const perguntasNaoRespondidas = todasPerguntas.filter(
      (p) => !perguntasRespondidasIds.has(p.id)
    )

    // Embaralhar aleatoriamente
    const perguntasAleatorias = perguntasNaoRespondidas.sort(
      () => Math.random() - 0.5
    )

    const proximaPergunta = perguntasAleatorias[0] || null

    if (proximaPergunta) {
      return NextResponse.json({
        proximaPergunta: {
          id: proximaPergunta.id,
          enunciado: proximaPergunta.enunciado,
          alternativaA: proximaPergunta.alternativaA,
          alternativaB: proximaPergunta.alternativaB,
          alternativaC: proximaPergunta.alternativaC,
          alternativaD: proximaPergunta.alternativaD,
          alternativaE: proximaPergunta.alternativaE,
          tempoSegundos: proximaPergunta.tempoSegundos,
        },
        fimDoQuiz: false,
      })
    }

    // Se não há mais perguntas, calcular resultado
    const respostasCorretas = await prisma.respostaUsuario.findMany({
      where: {
        userId: session.user.id,
        quizId,
      },
      include: {
        pergunta: true,
      },
    })

    let acertos = 0
    respostasCorretas.forEach((resposta) => {
      if (
        resposta.alternativaEscolhida &&
        resposta.alternativaEscolhida === resposta.pergunta.respostaCorreta
      ) {
        acertos++
      }
    })

    const totalPerguntas = todasPerguntas.length
    const erros = totalPerguntas - acertos
    const porcentagem =
      totalPerguntas > 0 ? Math.round((acertos / totalPerguntas) * 100) : 0

    return NextResponse.json({
      proximaPergunta: null,
      fimDoQuiz: true,
      resultado: {
        total: totalPerguntas,
        acertos,
        erros,
        porcentagem,
      },
    })
  } catch (error) {
    console.error('Erro ao salvar resposta:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar resposta' },
      { status: 500 }
    )
  }
}

