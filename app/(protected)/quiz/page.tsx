'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { QuizForm } from '@/components/quiz/QuizForm'
import { QuizList } from '@/components/quiz/QuizList'
import { PerguntaForm } from '@/components/quiz/PerguntaForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Quiz {
  id: string
  tema: string
  ativo: boolean
  createdAt: string
  _count: {
    perguntas: number
  }
}

export default function QuizPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarFormQuiz, setMostrarFormQuiz] = useState(false)
  const [quizSelecionado, setQuizSelecionado] = useState<string | null>(null)
  const [perguntas, setPerguntas] = useState<any[]>([])

  const buscarQuizzes = useCallback(async () => {
    try {
      const response = await fetch('/api/quiz')

      if (!response.ok) {
        if (response.status === 403) {
          alert(
            'Acesso negado. Apenas administradores podem acessar esta página.'
          )
          router.push('/home')
          return
        }
        throw new Error('Erro ao buscar quizzes')
      }
      const data = await response.json()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error('Erro ao buscar quizzes:', error)
      alert('Erro ao carregar quizzes')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    buscarQuizzes()
  }, [buscarQuizzes])

  const handleCriarQuiz = async (tema: string) => {
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tema }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar quiz')
      }

      setMostrarFormQuiz(false)
      buscarQuizzes()
    } catch (error) {
      console.error('Erro ao criar quiz:', error)
      throw error
    }
  }

  const handleAtivar = async (id: string) => {
    try {
      const response = await fetch(`/api/quiz/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: true }),
      })

      if (!response.ok) {
        throw new Error('Erro ao ativar quiz')
      }

      buscarQuizzes()
    } catch (error) {
      console.error('Erro ao ativar quiz:', error)
      alert('Erro ao ativar quiz')
    }
  }

  const handleDesativar = async (id: string) => {
    try {
      const response = await fetch(`/api/quiz/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: false }),
      })

      if (!response.ok) {
        throw new Error('Erro ao desativar quiz')
      }

      buscarQuizzes()
    } catch (error) {
      console.error('Erro ao desativar quiz:', error)
      alert('Erro ao desativar quiz')
    }
  }

  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este quiz?')) {
      return
    }

    try {
      const response = await fetch(`/api/quiz/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar quiz')
      }

      buscarQuizzes()
    } catch (error) {
      console.error('Erro ao deletar quiz:', error)
      alert('Erro ao deletar quiz')
    }
  }

  const handleAdicionarPerguntas = async (id: string) => {
    setQuizSelecionado(id)
    await buscarPerguntas(id)
  }

  const buscarPerguntas = async (quizId: string) => {
    try {
      const response = await fetch(`/api/quiz/${quizId}/perguntas?admin=true`)
      if (!response.ok) {
        throw new Error('Erro ao buscar perguntas')
      }
      const data = await response.json()
      setPerguntas(data.perguntas)
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error)
    }
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
      const response = await fetch(`/api/quiz/${quizSelecionado}/perguntas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar pergunta')
      }

      await buscarPerguntas(quizSelecionado)
    } catch (error) {
      console.error('Erro ao criar pergunta:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (quizSelecionado) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => {
                setQuizSelecionado(null)
                setPerguntas([])
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
              {perguntas.map((pergunta, index) => (
                <Card key={pergunta.id}>
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
                        <span className="font-semibold">Resposta correta:</span>{' '}
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
    )
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
          {!mostrarFormQuiz && (
            <Button variant="primary" onClick={() => setMostrarFormQuiz(true)}>
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
  )
}
