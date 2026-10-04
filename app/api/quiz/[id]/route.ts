import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { notifyNewQuizAvailable } from '@/lib/push/notifications'

export const dynamic = 'force-dynamic'

const NIVEIS_QUIZ = ['FACIL', 'DIFICIL'] as const
type NivelQuiz = (typeof NIVEIS_QUIZ)[number]

function normalizarNivelQuiz(nivel: unknown): NivelQuiz | null {
  if (nivel === undefined) return null
  return nivel === 'DIFICIL' ? 'DIFICIL' : 'FACIL'
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json(
        {
          error:
            'Acesso negado. Apenas administradores podem atualizar quizzes.',
        },
        { status: 403 }
      )
    }

    const quizId = parseInt(params.id, 10)
    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'ID do quiz inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { tema, ativo } = body
    const nivel = normalizarNivelQuiz(body.nivel)

    const quizAtual = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { nivel: true },
    })

    if (!quizAtual) {
      return NextResponse.json(
        { error: 'Quiz não encontrado' },
        { status: 404 }
      )
    }

    const nivelAlvo = nivel ?? quizAtual.nivel

    // Se estiver ativando este quiz, desativar os outros do mesmo nível
    if (ativo === true) {
      await prisma.quiz.updateMany({
        where: {
          ativo: true,
          nivel: nivelAlvo,
          id: { not: quizId },
        },
        data: {
          ativo: false,
        },
      })
    }

    const updateData: { tema?: string; ativo?: boolean; nivel?: NivelQuiz } = {}
    if (tema !== undefined) {
      updateData.tema = tema.trim()
    }
    if (nivel !== null) {
      updateData.nivel = nivel
    }
    if (ativo !== undefined) {
      updateData.ativo = ativo
    }

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: updateData,
      include: {
        _count: {
          select: {
            perguntas: true,
          },
        },
      },
    })

    if (ativo === true) {
      notifyNewQuizAvailable(quiz.tema, quiz.id).catch(() => {})
    }

    return NextResponse.json({
      message: 'Quiz atualizado com sucesso',
      quiz,
    })
  } catch (error) {
    console.error('Erro ao atualizar quiz:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar quiz' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json(
        {
          error: 'Acesso negado. Apenas administradores podem deletar quizzes.',
        },
        { status: 403 }
      )
    }

    const quizId = parseInt(params.id, 10)
    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'ID do quiz inválido' },
        { status: 400 }
      )
    }

    await prisma.quiz.delete({
      where: { id: quizId },
    })

    return NextResponse.json({
      message: 'Quiz deletado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao deletar quiz:', error)
    return NextResponse.json({ error: 'Erro ao deletar quiz' }, { status: 500 })
  }
}
