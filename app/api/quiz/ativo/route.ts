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

    // Verificar se usuário já respondeu este quiz
    const resultadoQuiz = await prisma.resultadoQuiz.findUnique({
      where: {
        userId_quizId: {
          userId: session.user.id,
          quizId: quizAtivo.id,
        },
      },
    })

    const jaRespondeu = !!resultadoQuiz
    const totalPerguntas = quizAtivo.perguntas.length

    let resultado = null
    if (jaRespondeu && resultadoQuiz) {
      resultado = {
        total: resultadoQuiz.total,
        acertos: resultadoQuiz.acertos,
        erros: resultadoQuiz.erros,
        nulos: resultadoQuiz.nulos,
        porcentagem: resultadoQuiz.porcentagem,
      }
    }

    return NextResponse.json({
      quiz: {
        id: quizAtivo.id,
        tema: quizAtivo.tema,
        ativo: quizAtivo.ativo,
        totalPerguntas,
      },
      jaRespondeu,
      resultado,
    })
  } catch (error: any) {
    console.error('Erro ao buscar quiz ativo:', error)

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
        error: 'Erro ao buscar quiz ativo',
        detalhes: error?.message || 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
