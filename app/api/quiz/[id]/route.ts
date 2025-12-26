import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

    const quizId = params.id
    const body = await request.json()
    const { tema, ativo } = body

    // Se estiver ativando este quiz, desativar todos os outros
    if (ativo === true) {
      await prisma.quiz.updateMany({
        where: {
          ativo: true,
          id: { not: quizId },
        },
        data: {
          ativo: false,
        },
      })
    }

    const updateData: { tema?: string; ativo?: boolean } = {}
    if (tema !== undefined) {
      updateData.tema = tema.trim()
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

    const quizId = params.id

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
