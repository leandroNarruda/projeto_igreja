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

    // Buscar todos os resultados de todos os quizzes
    const todosResultados = await prisma.resultadoQuiz.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Para desempate: quem respondeu primeiro
      },
    })

    // Agrupar por userId e calcular estatísticas
    const classificacaoMap = new Map<
      number,
      {
        userId: number
        nome: string
        email: string
        totalAcertos: number
        totalQuizzes: number
        somaPorcentagem: number
        primeiroQuiz: Date
      }
    >()

    for (const resultado of todosResultados) {
      const userId = resultado.userId

      if (!classificacaoMap.has(userId)) {
        classificacaoMap.set(userId, {
          userId,
          nome: resultado.user.name,
          email: resultado.user.email,
          totalAcertos: 0,
          totalQuizzes: 0,
          somaPorcentagem: 0,
          primeiroQuiz: resultado.createdAt,
        })
      }

      const classificacao = classificacaoMap.get(userId)!
      classificacao.totalAcertos += resultado.acertos
      classificacao.totalQuizzes += 1
      classificacao.somaPorcentagem += resultado.porcentagem

      // Atualizar data do primeiro quiz se este for mais antigo
      if (resultado.createdAt < classificacao.primeiroQuiz) {
        classificacao.primeiroQuiz = resultado.createdAt
      }
    }

    // Converter para array e calcular média de porcentagem
    const classificacaoArray = Array.from(classificacaoMap.values()).map(
      item => ({
        ...item,
        mediaPorcentagem:
          item.totalQuizzes > 0
            ? Math.round(item.somaPorcentagem / item.totalQuizzes)
            : 0,
      })
    )

    // Ordenar por total de acertos (descendente), depois por data do primeiro quiz (ascendente)
    classificacaoArray.sort((a, b) => {
      if (b.totalAcertos !== a.totalAcertos) {
        return b.totalAcertos - a.totalAcertos
      }
      // Em caso de empate, quem respondeu primeiro fica na frente
      return a.primeiroQuiz.getTime() - b.primeiroQuiz.getTime()
    })

    // Pegar top 10 e adicionar posição
    const top10 = classificacaoArray.slice(0, 10).map((item, index) => ({
      posicao: index + 1,
      userId: item.userId,
      nome: item.nome,
      email: item.email,
      totalAcertos: item.totalAcertos,
      totalQuizzes: item.totalQuizzes,
      mediaPorcentagem: item.mediaPorcentagem,
    }))

    return NextResponse.json({
      classificacao: top10,
    })
  } catch (error: any) {
    console.error('Erro ao buscar classificação geral:', error)

    return NextResponse.json(
      {
        error: 'Erro ao buscar classificação geral',
        detalhes: error?.message || 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
