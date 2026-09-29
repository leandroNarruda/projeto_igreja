'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface BibliaQuestao {
  id: number
  enunciado: string
  alternativaA: string
  alternativaB: string
  alternativaC: string
  alternativaD: string
  alternativaE: string
}

export interface BibliaQuizResponse {
  acertosTotais: number
  loteIndex: number
  loteAtual: number
  modoRevisao: boolean
  perguntas: BibliaQuestao[]
  concluido: boolean
}

export interface BibliaRespostaInput {
  bibliaId: number
  alternativaEscolhida: string | null
}

export interface BibliaGabaritoItem {
  bibliaId: number
  enunciado: string
  respostaCorreta: string
  textoRespostaCorreta: string
  respostaUsuario: string | null
  textoRespostaUsuario: string | null
  acertou: boolean
}

export interface ResponderBibliaResponse {
  modoRevisao: boolean
  acertosDaRodada: number
  acertosTotais: number
  avancouLote?: boolean
  concluido?: boolean
  gabarito?: BibliaGabaritoItem[]
  nivel?: number
}

export function useBibliaQuiz(enabled: boolean, loteIndex?: number) {
  return useQuery({
    queryKey: ['biblia', 'quiz', loteIndex ?? 'atual'],
    queryFn: async (): Promise<BibliaQuizResponse> => {
      const url =
        loteIndex !== undefined
          ? `/api/biblia/quiz?lote=${loteIndex}`
          : '/api/biblia/quiz'
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok)
        throw new Error(data?.error || 'Erro ao carregar quiz da Bíblia')
      return data
    },
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
}

export function useResponderBiblia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      respostas,
      loteIndex,
    }: {
      respostas: BibliaRespostaInput[]
      loteIndex?: number
    }): Promise<ResponderBibliaResponse> => {
      const res = await fetch('/api/biblia/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas, loteIndex }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao salvar respostas')
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['biblia', 'quiz'] })
      qc.invalidateQueries({ queryKey: ['biblia', 'classificacao'] })
    },
  })
}

export interface ClassificacaoBibliaItem {
  posicao: number
  userId: number
  nome: string
  social_name: string | null
  image: string | null
  acertos: number
  nivel: number
}

export function useClassificacaoBiblia() {
  return useQuery({
    queryKey: ['biblia', 'classificacao'],
    queryFn: async (): Promise<{
      classificacao: ClassificacaoBibliaItem[]
    }> => {
      const res = await fetch('/api/biblia/classificacao')
      const data = await res.json()
      if (!res.ok)
        throw new Error(data?.error || 'Erro ao buscar classificação')
      return data
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}
