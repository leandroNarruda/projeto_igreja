import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem criar quizzes.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tema } = body

    if (!tema || tema.trim() === '') {
      return NextResponse.json({ error: 'Tema é obrigatório' }, { status: 400 })
    }

    const quiz = await prisma.quiz.create({
      data: {
        tema: tema.trim(),
        ativo: false,
      },
    })

    return NextResponse.json(
      { message: 'Quiz criado com sucesso', quiz },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar quiz:', error)
    return NextResponse.json({ error: 'Erro ao criar quiz' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json(
        {
          error: 'Acesso negado. Apenas administradores podem listar quizzes.',
        },
        { status: 403 }
      )
    }

    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: {
          select: {
            perguntas: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ quizzes })
  } catch (error) {
    console.error('Erro ao listar quizzes:', error)
    return NextResponse.json(
      { error: 'Erro ao listar quizzes' },
      { status: 500 }
    )
  }
}
