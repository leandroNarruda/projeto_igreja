'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getAblyClient } from '@/lib/realtime/ablyClient'

/**
 * Assina canais de classificação e atualiza o cache do React Query via setQueryData
 * (sem refetch). Payload vem no evento (mínimas requisições).
 */
export function useRankingRealtime(quizId: number | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!quizId) return

    const ably = getAblyClient()
    const channelQuiz = ably.channels.get(`quiz:${quizId}:classificacao`)
    const channelGeral = ably.channels.get('quiz:classificacao-geral')

    const onQuizUpdate = (message: { data?: unknown }) => {
      const data = message.data as { classificacao?: unknown[] } | undefined
      if (data?.classificacao) {
        queryClient.setQueryData(
          ['quiz', quizId, 'classificacao'],
          () => ({ classificacao: data.classificacao })
        )
      }
    }

    const onGeralUpdate = (message: { data?: unknown }) => {
      const data = message.data as { classificacao?: unknown[] } | undefined
      if (data?.classificacao) {
        queryClient.setQueryData(
          ['quiz', 'classificacao-geral'],
          () => ({ classificacao: data.classificacao })
        )
      }
    }

    channelQuiz.subscribe('ranking_updated', onQuizUpdate)
    channelGeral.subscribe('ranking_updated', onGeralUpdate)

    return () => {
      channelQuiz.unsubscribe('ranking_updated', onQuizUpdate)
      channelGeral.unsubscribe('ranking_updated', onGeralUpdate)
    }
  }, [quizId, queryClient])
}

/**
 * Assina apenas o canal de classificação geral (ex.: página Eventos).
 */
export function useRankingGeralRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const ably = getAblyClient()
    const channelGeral = ably.channels.get('quiz:classificacao-geral')

    const onGeralUpdate = (message: { data?: unknown }) => {
      const data = message.data as { classificacao?: unknown[] } | undefined
      if (data?.classificacao) {
        queryClient.setQueryData(
          ['quiz', 'classificacao-geral'],
          () => ({ classificacao: data.classificacao })
        )
      }
    }

    channelGeral.subscribe('ranking_updated', onGeralUpdate)

    return () => {
      channelGeral.unsubscribe('ranking_updated', onGeralUpdate)
    }
  }, [queryClient])
}
