import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { quizId, respostas } = body

    if (!quizId || !respostas || !Array.isArray(respostas)) {
      return NextResponse.json(
        { error: 'quizId e respostas (array) são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já tem resultado para este quiz
    const resultadoExistente = await prisma.resultadoQuiz.findUnique({
      where: {
        userId_quizId: {
          userId: session.user.id,
          quizId,
        },
      },
    })

    if (resultadoExistente) {
      return NextResponse.json(
        { error: 'Você já respondeu este quiz' },
        { status: 400 }
      )
    }

    // Buscar todas as perguntas do quiz para validação
    const todasPerguntas = await prisma.pergunta.findMany({
      where: { quizId },
    })

    if (todasPerguntas.length === 0) {
      return NextResponse.json(
        { error: 'Quiz não possui perguntas' },
        { status: 400 }
      )
    }

    // Validar que todas as perguntas foram respondidas
    const perguntasIds = new Set(todasPerguntas.map(p => p.id))
    const respostasIds = new Set(respostas.map((r: any) => r.perguntaId))

    if (perguntasIds.size !== respostasIds.size) {
      return NextResponse.json(
        { error: 'Todas as perguntas devem ser respondidas' },
        { status: 400 }
      )
    }

    // Validar alternativas escolhidas
    for (const resposta of respostas) {
      if (!resposta.perguntaId) {
        return NextResponse.json(
          { error: 'perguntaId é obrigatório em cada resposta' },
          { status: 400 }
        )
      }

      if (
        resposta.alternativaEscolhida &&
        !['A', 'B', 'C', 'D', 'E'].includes(resposta.alternativaEscolhida)
      ) {
        return NextResponse.json(
          { error: 'Alternativa inválida' },
          { status: 400 }
        )
      }

      if (!perguntasIds.has(resposta.perguntaId)) {
        return NextResponse.json(
          { error: 'Pergunta não pertence a este quiz' },
          { status: 400 }
        )
      }
    }

    // Buscar todas as perguntas com suas respostas corretas para cálculo
    const perguntasMap = new Map(todasPerguntas.map(p => [p.id, p]))

    // Calcular acertos, erros e nulos
    let acertos = 0
    let erros = 0
    let nulos = 0

    // Salvar todas as respostas e calcular resultado em uma transação
    const resultado = await prisma.$transaction(async tx => {
      // Salvar todas as respostas
      await Promise.all(
        respostas.map((resposta: any) =>
          tx.respostaUsuario.create({
            data: {
              userId: session.user.id,
              quizId,
              perguntaId: resposta.perguntaId,
              alternativaEscolhida: resposta.alternativaEscolhida || null,
            },
          })
        )
      )

      // Calcular resultado
      for (const resposta of respostas) {
        const pergunta = perguntasMap.get(resposta.perguntaId)
        if (!pergunta) continue

        if (!resposta.alternativaEscolhida) {
          nulos++
        } else if (resposta.alternativaEscolhida === pergunta.respostaCorreta) {
          acertos++
        } else {
          erros++
        }
      }

      const total = todasPerguntas.length
      const porcentagem = total > 0 ? Math.round((acertos / total) * 100) : 0

      // Criar registro de resultado
      const resultadoQuiz = await tx.resultadoQuiz.create({
        data: {
          userId: session.user.id,
          quizId,
          acertos,
          erros,
          nulos,
          total,
          porcentagem,
        },
      })

      return {
        total,
        acertos,
        erros,
        nulos,
        porcentagem,
      }
    })

    return NextResponse.json({
      resultado,
    })
  } catch (error: any) {
    console.error('Erro ao salvar respostas:', error)

    // Se o erro for relacionado ao Prisma Client não ter o modelo ResultadoQuiz
    if (error?.message?.includes('resultadoQuiz') || error?.code === 'P2001') {
      return NextResponse.json(
        {
          error:
            'Prisma Client precisa ser regenerado. Execute: npx prisma generate',
          detalhes: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Erro ao salvar respostas',
        detalhes: error?.message || 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
