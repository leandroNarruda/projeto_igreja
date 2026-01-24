import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ============================================
// QUERIES (GET)
// ============================================

/**
 * Hook para buscar quiz ativo
 */
export function useQuizAtivo() {
  return useQuery({
    queryKey: ['quiz', 'ativo'],
    queryFn: async () => {
      const response = await fetch('/api/quiz/ativo')
      if (!response.ok) {
        throw new Error('Erro ao buscar quiz ativo')
      }
      return response.json()
    },
  })
}

/**
 * Hook para buscar classificação de um quiz
 */
export function useClassificacaoQuiz(quizId: number | null) {
  return useQuery({
    queryKey: ['quiz', quizId, 'classificacao'],
    queryFn: async () => {
      if (!quizId) return null
      const response = await fetch(`/api/quiz/${quizId}/classificacao?limit=50`)
      if (!response.ok) {
        throw new Error('Erro ao buscar classificação')
      }
      return response.json()
    },
    enabled: !!quizId, // só executa se quizId existir
  })
}

/**
 * Hook para buscar todos os quizzes (admin)
 */
export function useQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const response = await fetch('/api/quiz')
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Acesso negado')
        }
        throw new Error('Erro ao buscar quizzes')
      }
      return response.json()
    },
  })
}

/**
 * Hook para buscar perguntas de um quiz
 */
export function usePerguntas(quizId: number | null, admin = false) {
  return useQuery({
    queryKey: ['quiz', quizId, 'perguntas', { admin }],
    queryFn: async () => {
      if (!quizId) return null
      const response = await fetch(
        `/api/quiz/${quizId}/perguntas${admin ? '?admin=true' : ''}`
      )
      if (!response.ok) {
        throw new Error('Erro ao buscar perguntas')
      }
      return response.json()
    },
    enabled: !!quizId,
  })
}

/**
 * Hook para buscar classificação geral
 */
export function useClassificacaoGeral() {
  return useQuery({
    queryKey: ['quiz', 'classificacao-geral'],
    queryFn: async () => {
      const response = await fetch('/api/quiz/classificacao-geral')
      if (!response.ok) {
        throw new Error('Erro ao buscar classificação geral')
      }
      return response.json()
    },
  })
}

// ============================================
// MUTATIONS (POST/PUT/DELETE)
// ============================================

/**
 * Hook para criar novo quiz
 */
export function useCriarQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tema: string) => {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema }),
      })
      if (!response.ok) {
        throw new Error('Erro ao criar quiz')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalida e refaz a query de quizzes
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      queryClient.invalidateQueries({ queryKey: ['quiz', 'ativo'] })
    },
  })
}

/**
 * Hook para atualizar quiz (tema/ativo)
 */
export function useAtualizarQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: { tema?: string; ativo?: boolean }
    }) => {
      const response = await fetch(`/api/quiz/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Erro ao atualizar quiz')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      queryClient.invalidateQueries({ queryKey: ['quiz', 'ativo'] })
    },
  })
}

/**
 * Hook para deletar quiz
 */
export function useDeletarQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/quiz/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Erro ao deletar quiz')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      queryClient.invalidateQueries({ queryKey: ['quiz', 'ativo'] })
    },
  })
}

/**
 * Hook para criar nova pergunta
 */
export function useCriarPergunta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      quizId,
      data,
    }: {
      quizId: number
      data: {
        enunciado: string
        alternativaA: string
        alternativaB: string
        alternativaC: string
        alternativaD: string
        alternativaE: string
        respostaCorreta: string
        tempoSegundos: number
      }
    }) => {
      const response = await fetch(`/api/quiz/${quizId}/perguntas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Erro ao criar pergunta')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['quiz', variables.quizId, 'perguntas'],
      })
    },
  })
}

/**
 * Hook para enviar respostas do quiz
 */
export function useEnviarRespostas() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      quizId,
      respostas,
    }: {
      quizId: number
      respostas: Array<{
        perguntaId: number
        alternativaEscolhida: string | null
      }>
    }) => {
      const response = await fetch('/api/quiz/resposta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, respostas }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao enviar respostas')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalida quiz ativo e classificação após enviar respostas
      queryClient.invalidateQueries({ queryKey: ['quiz', 'ativo'] })
      queryClient.invalidateQueries({
        queryKey: ['quiz', variables.quizId, 'classificacao'],
      })
      queryClient.invalidateQueries({
        queryKey: ['quiz', 'classificacao-geral'],
      })
    },
  })
}
