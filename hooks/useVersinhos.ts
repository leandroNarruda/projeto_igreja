'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface VersinhoQuestao {
  id: number
  verso: string
  alternativaA: string
  alternativaB: string
  alternativaC: string
  alternativaD: string
  alternativaE: string
}

export interface VersinhosQuizResponse {
  acertosTotais: number
  loteIndex: number
  versinhos: VersinhoQuestao[]
  concluido: boolean
}

export interface VersinhoRespostaInput {
  versinhoId: number
  alternativaEscolhida: string | null
}

export interface ResponderVersinhosResponse {
  acertosDaRodada: number
  acertosTotais: number
  avancouLote: boolean
  concluido: boolean
}

export function useVersinhosQuiz(enabled: boolean) {
  return useQuery({
    queryKey: ['versinhos', 'quiz'],
    queryFn: async (): Promise<VersinhosQuizResponse> => {
      const res = await fetch('/api/versinhos/quiz')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao carregar quiz')
      return data
    },
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
}

export function useResponderVersinhos() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      respostas: VersinhoRespostaInput[]
    ): Promise<ResponderVersinhosResponse> => {
      const res = await fetch('/api/versinhos/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao salvar respostas')
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['versinhos', 'quiz'] })
      qc.invalidateQueries({ queryKey: ['versinhos', 'classificacao'] })
    },
  })
}

export interface ClassificacaoVersinhosItem {
  posicao: number
  userId: number
  nome: string
  social_name: string | null
  image: string | null
  acertos: number
}

export function useClassificacaoVersinhos() {
  return useQuery({
    queryKey: ['versinhos', 'classificacao'],
    queryFn: async (): Promise<{
      classificacao: ClassificacaoVersinhosItem[]
    }> => {
      const res = await fetch('/api/versinhos/classificacao')
      const data = await res.json()
      if (!res.ok)
        throw new Error(data?.error || 'Erro ao buscar classificação')
      return data
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}
