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
  loteAtual: number
  modoRevisao: boolean
  versinhos: VersinhoQuestao[]
  concluido: boolean
}

export interface VersinhoRespostaInput {
  versinhoId: number
  alternativaEscolhida: string | null
}

export interface GabaritoItem {
  versinhoId: number
  verso: string
  respostaCorreta: string
  textoRespostaCorreta: string
  respostaUsuario: string | null
  textoRespostaUsuario: string | null
  acertou: boolean
}

export interface ResponderVersinhosResponse {
  modoRevisao: boolean
  acertosDaRodada: number
  acertosTotais: number
  avancouLote?: boolean
  concluido?: boolean
  gabarito?: GabaritoItem[]
}

export function useVersinhosQuiz(enabled: boolean, loteIndex?: number) {
  return useQuery({
    queryKey: ['versinhos', 'quiz', loteIndex ?? 'atual'],
    queryFn: async (): Promise<VersinhosQuizResponse> => {
      const url =
        loteIndex !== undefined
          ? `/api/versinhos/quiz?lote=${loteIndex}`
          : '/api/versinhos/quiz'
      const res = await fetch(url)
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
    mutationFn: async ({
      respostas,
      loteIndex,
    }: {
      respostas: VersinhoRespostaInput[]
      loteIndex?: number
    }): Promise<ResponderVersinhosResponse> => {
      const res = await fetch('/api/versinhos/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas, loteIndex }),
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
