import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const quizId = parseInt(params.id, 10)
    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'ID do quiz inválido' },
        { status: 400 }
      )
    }

    // Buscar parâmetro limit (padrão: 3)
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)

    // Buscar top N resultados ordenados por acertos (descendente)
    const resultados = await prisma.resultadoQuiz.findMany({
      where: {
        quizId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            social_name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
      orderBy: [
        { acertos: 'desc' },
        { createdAt: 'asc' }, // Em caso de empate, quem respondeu primeiro fica na frente
      ],
      take: limit,
    })

    const classificacao = resultados.map((resultado, index) => ({
      posicao: index + 1,
      userId: resultado.userId,
      nome: resultado.user.name,
      social_name: resultado.user.social_name ?? null,
      email: resultado.user.email,
      image: resultado.user.avatar_url ?? null,
      acertos: resultado.acertos,
      erros: resultado.erros,
      nulos: resultado.nulos,
      total: resultado.total,
      porcentagem: resultado.porcentagem,
    }))

    return NextResponse.json({
      classificacao,
    })
  } catch (error: any) {
    console.error('Erro ao buscar classificação:', error)

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
        error: 'Erro ao buscar classificação',
        detalhes: error?.message || 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
