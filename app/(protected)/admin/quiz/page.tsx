'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QuizForm } from '@/components/quiz/QuizForm'
import { QuizList } from '@/components/quiz/QuizList'
import { PerguntaForm } from '@/components/quiz/PerguntaForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  useQuizzes,
  usePerguntas,
  useCriarQuiz,
  useAtualizarQuiz,
  useDeletarQuiz,
  useCriarPergunta,
} from '@/hooks/useQuiz'

interface Quiz {
  id: number
  tema: string
  ativo: boolean
  createdAt: string
  _count: {
    perguntas: number
  }
}

interface Pergunta {
  id: number
  enunciado: string
  alternativaA: string
  alternativaB: string
  alternativaC: string
  alternativaD: string
  alternativaE: string
  respostaCorreta: string
  tempoSegundos: number
}

export default function AdminQuizPage() {
  const router = useRouter()
  const [mostrarFormQuiz, setMostrarFormQuiz] = useState(false)
  const [quizSelecionado, setQuizSelecionado] = useState<number | null>(null)

  const { data: quizzesData, isLoading, isError, error } = useQuizzes()
  const { data: perguntasData } = usePerguntas(quizSelecionado, true)

  const quizzes = quizzesData?.quizzes || []
  const perguntas = perguntasData?.perguntas || []

  const criarQuizMutation = useCriarQuiz()
  const atualizarQuizMutation = useAtualizarQuiz()
  const deletarQuizMutation = useDeletarQuiz()
  const criarPerguntaMutation = useCriarPergunta()

  useEffect(() => {
    if (isError) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido'
      if (errorMessage === 'Acesso negado') {
        alert(
          'Acesso negado. Apenas administradores podem acessar esta página.'
        )
        router.push('/home')
      } else {
        alert(`Erro ao carregar quizzes: ${errorMessage}`)
      }
    }
  }, [isError, error, router])

  const handleCriarQuiz = async (tema: string) => {
    try {
      await criarQuizMutation.mutateAsync(tema)
      setMostrarFormQuiz(false)
    } catch (error) {
      console.error('Erro ao criar quiz:', error)
      throw error
    }
  }

  const handleAtivar = async (id: number) => {
    try {
      await atualizarQuizMutation.mutateAsync({
        id,
        data: { ativo: true },
      })
    } catch (error) {
      console.error('Erro ao ativar quiz:', error)
      alert('Erro ao ativar quiz')
    }
  }

  const handleDesativar = async (id: number) => {
    try {
      await atualizarQuizMutation.mutateAsync({
        id,
        data: { ativo: false },
      })
    } catch (error) {
      console.error('Erro ao desativar quiz:', error)
      alert('Erro ao desativar quiz')
    }
  }

  const handleDeletar = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este quiz?')) {
      return
    }

    try {
      await deletarQuizMutation.mutateAsync(id)
    } catch (error) {
      console.error('Erro ao deletar quiz:', error)
      alert('Erro ao deletar quiz')
    }
  }

  const handleAdicionarPerguntas = (id: number) => {
    setQuizSelecionado(id)
  }

  const handleCriarPergunta = async (data: {
    enunciado: string
    alternativaA: string
    alternativaB: string
    alternativaC: string
    alternativaD: string
    alternativaE: string
    respostaCorreta: string
    tempoSegundos: number
  }) => {
    if (!quizSelecionado) return

    try {
      await criarPerguntaMutation.mutateAsync({
        quizId: quizSelecionado,
        data,
      })
    } catch (error) {
      console.error('Erro ao criar pergunta:', error)
      throw error
    }
  }

  if (isLoading) {
    return <Loading />
  }

  if (quizSelecionado) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  setQuizSelecionado(null)
                }}
              >
                ← Voltar
              </Button>
            </div>

            <div className="mb-6">
              <PerguntaForm
                quizId={quizSelecionado}
                onSubmit={handleCriarPergunta}
              />
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Perguntas Cadastradas ({perguntas.length})
              </h2>
              <div className="space-y-4">
                {perguntas.map((pergunta: Pergunta, index: number) => (
                  <Card key={pergunta.id} index={index}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {index + 1}. {pergunta.enunciado}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p>
                            <span className="font-semibold">A)</span>{' '}
                            {pergunta.alternativaA}
                          </p>
                          <p>
                            <span className="font-semibold">B)</span>{' '}
                            {pergunta.alternativaB}
                          </p>
                          <p>
                            <span className="font-semibold">C)</span>{' '}
                            {pergunta.alternativaC}
                          </p>
                          <p>
                            <span className="font-semibold">D)</span>{' '}
                            {pergunta.alternativaD}
                          </p>
                          <p>
                            <span className="font-semibold">E)</span>{' '}
                            {pergunta.alternativaE}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-semibold">
                            Resposta correta:
                          </span>{' '}
                          {pergunta.respostaCorreta} |{' '}
                          <span className="font-semibold">Tempo:</span>{' '}
                          {pergunta.tempoSegundos}s
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
            {!mostrarFormQuiz && (
              <Button
                variant="primary"
                onClick={() => setMostrarFormQuiz(true)}
              >
                + Novo
              </Button>
            )}
          </div>

          {mostrarFormQuiz && (
            <div className="mb-6">
              <QuizForm
                onSubmit={handleCriarQuiz}
                onCancel={() => setMostrarFormQuiz(false)}
              />
            </div>
          )}

          <QuizList
            quizzes={quizzes}
            onAtivar={handleAtivar}
            onDesativar={handleDesativar}
            onDeletar={handleDeletar}
            onAdicionarPerguntas={handleAdicionarPerguntas}
          />
        </div>
      </div>
    </PageTransition>
  )
}
