'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { QuizInstructions } from '@/components/quiz/QuizInstructions'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'
import { QuizResult } from '@/components/quiz/QuizResult'

interface QuizAtivo {
  id: number
  tema: string
  totalPerguntas: number
}

interface Pergunta {
  id: number
  enunciado: string
  alternativaA: string
  alternativaB: string
  alternativaC: string
  alternativaD: string
  alternativaE: string
  tempoSegundos: number
}

export default function ResponderQuizPage() {
  const router = useRouter()
  const [quizAtivo, setQuizAtivo] = useState<QuizAtivo | null>(null)
  const [loading, setLoading] = useState(true)
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(true)
  const [perguntaAtual, setPerguntaAtual] = useState<Pergunta | null>(null)
  const [resultado, setResultado] = useState<{
    total: number
    acertos: number
    erros: number
    porcentagem: number
  } | null>(null)

  const buscarQuizAtivo = useCallback(async () => {
    try {
      const response = await fetch('/api/quiz/ativo')
      const data = await response.json()

      if (!data.quiz) {
        alert('Não há quiz ativo no momento')
        router.push('/home')
        return
      }

      if (data.jaRespondeu) {
        router.push('/home')
        return
      }

      setQuizAtivo({
        id: data.quiz.id,
        tema: data.quiz.tema,
        totalPerguntas: data.quiz.totalPerguntas,
      })
    } catch (error) {
      console.error('Erro ao buscar quiz ativo:', error)
      alert('Erro ao carregar quiz')
      router.push('/home')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    buscarQuizAtivo()
  }, [buscarQuizAtivo])

  const iniciarQuiz = async () => {
    if (!quizAtivo) return

    setMostrarInstrucoes(false)
    await buscarProximaPergunta()
  }

  const buscarProximaPergunta = async () => {
    if (!quizAtivo) return

    try {
      const response = await fetch(`/api/quiz/${quizAtivo.id}/perguntas`)
      const data = await response.json()

      if (data.fimDoQuiz || !data.pergunta) {
        // Buscar resultado
        await buscarResultado()
      } else {
        setPerguntaAtual(data.pergunta)
      }
    } catch (error) {
      console.error('Erro ao buscar pergunta:', error)
      alert('Erro ao carregar pergunta')
    }
  }

  const handleResposta = async (alternativa: string | null) => {
    if (!quizAtivo || !perguntaAtual) return

    try {
      const response = await fetch('/api/quiz/resposta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quizAtivo.id,
          perguntaId: perguntaAtual.id,
          alternativaEscolhida: alternativa,
        }),
      })

      const data = await response.json()

      if (data.fimDoQuiz && data.resultado) {
        setResultado(data.resultado)
        setPerguntaAtual(null)
      } else if (data.proximaPergunta) {
        setPerguntaAtual(data.proximaPergunta)
      } else {
        // Se não há próxima pergunta na resposta, buscar manualmente
        setTimeout(() => {
          buscarProximaPergunta()
        }, 1000)
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error)
      alert('Erro ao enviar resposta')
    }
  }

  const buscarResultado = async () => {
    if (!quizAtivo) return

    try {
      const response = await fetch(`/api/quiz/${quizAtivo.id}/resultado`)
      const data = await response.json()
      setResultado(data)
    } catch (error) {
      console.error('Erro ao buscar resultado:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (!quizAtivo) {
    return null
  }

  if (resultado) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center py-8">
        <div className="w-full px-4">
          <QuizResult
            total={resultado.total}
            acertos={resultado.acertos}
            erros={resultado.erros}
            porcentagem={resultado.porcentagem}
          />
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/home')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mostrarInstrucoes) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center py-8">
        <div className="w-full px-4">
          <QuizInstructions
            tema={quizAtivo.tema}
            totalPerguntas={quizAtivo.totalPerguntas}
            onStart={iniciarQuiz}
          />
        </div>
      </div>
    )
  }

  if (!perguntaAtual) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando pergunta...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
      <div className="w-full px-4">
        <QuizPlayer
          quizId={quizAtivo.id}
          pergunta={perguntaAtual}
          onAnswer={handleResposta}
        />
      </div>
    </div>
  )
}
