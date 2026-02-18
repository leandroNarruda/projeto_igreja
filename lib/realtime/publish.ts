import Ably from 'ably'
import { prisma } from '@/lib/prisma'

let ablyRest: Ably.Rest | null = null

function getAblyRest(): Ably.Rest {
  if (!ablyRest) {
    const key = process.env.ABLY_API_KEY
    if (!key) throw new Error('ABLY_API_KEY não configurada')
    ablyRest = new Ably.Rest({ key })
  }
  return ablyRest
}

/**
 * Busca classificação do quiz (top 50) - mesma lógica da rota GET.
 */
async function fetchClassificacaoQuiz(quizId: number) {
  const resultados = await prisma.resultadoQuiz.findMany({
    where: { quizId },
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
    orderBy: [{ acertos: 'desc' }, { createdAt: 'asc' }],
    take: 50,
  })

  return resultados.map((resultado, index) => ({
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
}

/**
 * Busca classificação geral (top 10) - mesma lógica da rota GET.
 */
async function fetchClassificacaoGeral() {
  const todosResultados = await prisma.resultadoQuiz.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          social_name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const classificacaoMap = new Map<
    number,
    {
      userId: number
      nome: string
      social_name: string | null
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
        social_name: resultado.user.social_name ?? null,
        email: resultado.user.email,
        totalAcertos: 0,
        totalQuizzes: 0,
        somaPorcentagem: 0,
        primeiroQuiz: resultado.createdAt,
      })
    }
    const item = classificacaoMap.get(userId)!
    item.totalAcertos += resultado.acertos
    item.totalQuizzes += 1
    item.somaPorcentagem += resultado.porcentagem
    if (resultado.createdAt < item.primeiroQuiz) {
      item.primeiroQuiz = resultado.createdAt
    }
  }

  const array = Array.from(classificacaoMap.values()).map(item => ({
    ...item,
    mediaPorcentagem:
      item.totalQuizzes > 0
        ? Math.round(item.somaPorcentagem / item.totalQuizzes)
        : 0,
  }))

  array.sort((a, b) => {
    if (b.totalAcertos !== a.totalAcertos)
      return b.totalAcertos - a.totalAcertos
    return a.primeiroQuiz.getTime() - b.primeiroQuiz.getTime()
  })

  return array.slice(0, 10).map((item, index) => ({
    posicao: index + 1,
    userId: item.userId,
    nome: item.nome,
    social_name: item.social_name,
    email: item.email,
    totalAcertos: item.totalAcertos,
    totalQuizzes: item.totalQuizzes,
    mediaPorcentagem: item.mediaPorcentagem,
  }))
}

/**
 * Publica classificação atualizada nos canais Ably (payload completo).
 * Chamado após POST /api/quiz/resposta bem-sucedido.
 * Falha não bloqueia a resposta ao usuário.
 */
export async function publishRankingUpdated(quizId: number): Promise<void> {
  try {
    const [classificacaoQuiz, classificacaoGeral] = await Promise.all([
      fetchClassificacaoQuiz(quizId),
      fetchClassificacaoGeral(),
    ])

    const client = getAblyRest()
    const channelQuiz = client.channels.get(`quiz:${quizId}:classificacao`)
    const channelGeral = client.channels.get('quiz:classificacao-geral')

    const payloadQuiz = {
      classificacao: classificacaoQuiz,
      updatedAt: new Date().toISOString(),
    }
    const payloadGeral = {
      classificacao: classificacaoGeral,
      updatedAt: new Date().toISOString(),
    }

    await Promise.all([
      channelQuiz.publish('ranking_updated', payloadQuiz),
      channelGeral.publish('ranking_updated', payloadGeral),
    ])
  } catch (err) {
    console.error('[realtime] Erro ao publicar ranking atualizado:', err)
  }
}
