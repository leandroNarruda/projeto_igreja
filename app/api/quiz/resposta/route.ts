import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyQuizResponded } from '@/lib/push/notifications'
import { publishRankingUpdated } from '@/lib/realtime/publish'

export const dynamic = 'force-dynamic'

type RespostaInput = {
  perguntaId: number
  alternativaEscolhida: string | null
}

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

    const calcularResultado = (respostasRecebidas: RespostaInput[]) => {
      let acertos = 0
      let erros = 0
      let nulos = 0

      for (const resposta of respostasRecebidas) {
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

      return {
        total,
        acertos,
        erros,
        nulos,
        porcentagem,
      }
    }

    const resultado = calcularResultado(respostas)

    // Verificar se o usuário já tem resultado para este quiz.
    // Novas tentativas retornam feedback, mas não alteram pontuação nem ranking.
    const resultadoExistente = await prisma.resultadoQuiz.findUnique({
      where: {
        userId_quizId: {
          userId: session.user.id,
          quizId,
        },
      },
    })

    if (resultadoExistente) {
      return NextResponse.json({
        resultado,
        pontuacaoContabilizada: false,
      })
    }

    try {
      // Salvar respostas em lote mantém a transação curta mesmo em quizzes grandes.
      await prisma.$transaction([
        prisma.respostaUsuario.createMany({
          data: respostas.map((resposta: RespostaInput) => ({
            userId: session.user.id,
            quizId,
            perguntaId: resposta.perguntaId,
            alternativaEscolhida: resposta.alternativaEscolhida || null,
          })),
          skipDuplicates: true,
        }),
        prisma.resultadoQuiz.create({
          data: {
            userId: session.user.id,
            quizId,
            acertos: resultado.acertos,
            erros: resultado.erros,
            nulos: resultado.nulos,
            total: resultado.total,
            porcentagem: resultado.porcentagem,
          },
        }),
      ])
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return NextResponse.json({
          resultado,
          pontuacaoContabilizada: false,
        })
      }

      throw error
    }

    // Realtime: publicar classificação atualizada (não bloqueia resposta em caso de falha)
    publishRankingUpdated(quizId).catch(err =>
      console.error('[quiz/resposta] publishRankingUpdated:', err)
    )

    // Push: notificar outros usuários que fulano respondeu (não bloqueia resposta)
    const respondent = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { social_name: true, avatar_url: true },
    })
    notifyQuizResponded(
      session.user.id,
      respondent?.social_name ?? null,
      respondent?.avatar_url ?? null,
      quizId
    ).catch(() => {})

    return NextResponse.json({
      resultado,
      pontuacaoContabilizada: true,
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
