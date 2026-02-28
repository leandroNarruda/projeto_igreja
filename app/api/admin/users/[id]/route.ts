import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'
import { getServerSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const selectUser = {
  id: true,
  name: true,
  email: true,
  social_name: true,
  igreja: true,
  role: true,
  createdAt: true,
}

function parseId(id: string): number | null {
  const n = parseInt(id, 10)
  return Number.isNaN(n) ? null : n
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        {
          error:
            'Acesso negado. Apenas administradores podem visualizar usuários.',
        },
        { status: 403 }
      )
    }

    const userId = parseId((await params).id)
    if (userId === null) {
      return NextResponse.json(
        { error: 'ID de usuário inválido' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: selectUser,
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('[API] Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        {
          error:
            'Acesso negado. Apenas administradores podem atualizar usuários.',
        },
        { status: 403 }
      )
    }

    const userId = parseId((await params).id)
    if (userId === null) {
      return NextResponse.json(
        { error: 'ID de usuário inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, email, social_name, igreja, password } = body

    const data: {
      name?: string
      email?: string
      social_name?: string | null
      igreja?: string | null
      password?: string
    } = {}

    if (name !== undefined) {
      const trimmed = typeof name === 'string' ? name.trim() : ''
      if (trimmed === '') {
        return NextResponse.json(
          { error: 'Nome não pode ser vazio' },
          { status: 400 }
        )
      }
      data.name = trimmed
    }

    if (email !== undefined) {
      const trimmed = typeof email === 'string' ? email.trim() : ''
      if (trimmed === '') {
        return NextResponse.json(
          { error: 'E-mail não pode ser vazio' },
          { status: 400 }
        )
      }
      const existing = await prisma.user.findFirst({
        where: {
          email: trimmed,
          id: { not: userId },
        },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'E-mail já está em uso' },
          { status: 400 }
        )
      }
      data.email = trimmed
    }

    if (social_name !== undefined) {
      data.social_name =
        social_name === null || social_name === ''
          ? null
          : String(social_name).trim() || null
    }

    if (igreja !== undefined) {
      data.igreja =
        igreja === null || igreja === '' ? null : String(igreja).trim() || null
    }

    if (
      password !== undefined &&
      password !== null &&
      String(password).trim() !== ''
    ) {
      data.password = await bcrypt.hash(String(password).trim(), 10)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: selectUser,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('[API] Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        {
          error:
            'Acesso negado. Apenas administradores podem excluir usuários.',
        },
        { status: 403 }
      )
    }

    const userId = parseId((await params).id)
    if (userId === null) {
      return NextResponse.json(
        { error: 'ID de usuário inválido' },
        { status: 400 }
      )
    }

    const session = await getServerSession()
    const currentUserId =
      session?.user?.id != null ? parseInt(String(session.user.id), 10) : null
    if (currentUserId !== null && currentUserId === userId) {
      return NextResponse.json(
        { error: 'Você não pode excluir sua própria conta.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('[API] Erro ao excluir usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    )
  }
}
