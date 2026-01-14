import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { userId, igreja } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Converter userId para número
    const userIdNumber =
      typeof userId === 'string' ? parseInt(userId, 10) : userId

    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'ID do usuário inválido' },
        { status: 400 }
      )
    }

    if (!igreja || igreja.trim() === '') {
      return NextResponse.json(
        { error: 'Igreja é obrigatória' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdNumber },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userIdNumber },
      data: {
        igreja: igreja.trim(),
      },
    })

    return NextResponse.json(
      { message: 'Igreja atualizada com sucesso', igreja: updatedUser.igreja },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao atualizar igreja:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar igreja' },
      { status: 500 }
    )
  }
}
