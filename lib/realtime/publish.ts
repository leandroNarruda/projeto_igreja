import Ably from 'ably'

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
 * Publica apenas um sinal de ranking atualizado.
 * A lista personalizada é buscada pela API autenticada de cada usuário.
 * Chamado após POST /api/quiz/resposta bem-sucedido.
 * Falha não bloqueia a resposta ao usuário.
 */
export async function publishRankingUpdated(quizId: number): Promise<void> {
  try {
    const client = getAblyRest()
    const channelQuiz = client.channels.get(`quiz:${quizId}:classificacao`)
    const channelGeral = client.channels.get('quiz:classificacao-geral')

    const payload = {
      updatedAt: new Date().toISOString(),
    }

    await Promise.all([
      channelQuiz.publish('ranking_updated', payload),
      channelGeral.publish('ranking_updated', payload),
    ])
  } catch (err) {
    console.error('[realtime] Erro ao publicar ranking atualizado:', err)
  }
}
