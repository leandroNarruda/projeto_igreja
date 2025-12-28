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
  const [todasPerguntas, setTodasPerguntas] = useState<Pergunta[]>([])
  const [indicePerguntaAtual, setIndicePerguntaAtual] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, string | null>>({})
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{
    total: number
    acertos: number
    erros: number
    nulos: number
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

    try {
      setLoading(true)
      const response = await fetch(`/api/quiz/${quizAtivo.id}/perguntas`)
      const data = await response.json()

      if (data.error) {
        alert(data.error)
        router.push('/home')
        return
      }

      if (data.perguntas && data.perguntas.length > 0) {
        setTodasPerguntas(data.perguntas)
        setIndicePerguntaAtual(0)
        setRespostas({})
        setMostrarInstrucoes(false)
      } else {
        alert('Não há perguntas disponíveis')
        router.push('/home')
      }
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error)
      alert('Erro ao carregar perguntas')
      router.push('/home')
    } finally {
      setLoading(false)
    }
  }

  const handleResposta = (alternativa: string | null) => {
    const perguntaAtual = todasPerguntas[indicePerguntaAtual]
    if (!perguntaAtual) return

    // Salvar resposta no estado
    setRespostas(prev => ({
      ...prev,
      [perguntaAtual.id]: alternativa,
    }))

    // Avançar para próxima pergunta ou finalizar
    if (indicePerguntaAtual < todasPerguntas.length - 1) {
      setIndicePerguntaAtual(prev => prev + 1)
    } else {
      // Última pergunta, finalizar quiz
      finalizarQuiz(alternativa)
    }
  }

  const finalizarQuiz = async (ultimaResposta: string | null) => {
    if (!quizAtivo) return

    // Garantir que a última resposta está salva
    const perguntaAtual = todasPerguntas[indicePerguntaAtual]
    if (perguntaAtual) {
      setRespostas(prev => ({
        ...prev,
        [perguntaAtual.id]: ultimaResposta,
      }))
    }

    // Aguardar um pouco para garantir que o estado foi atualizado
    setTimeout(async () => {
      await enviarTodasRespostas()
    }, 100)
  }

  const enviarTodasRespostas = async () => {
    if (!quizAtivo) return

    try {
      setEnviando(true)

      // Preparar array de respostas
      const respostasArray = todasPerguntas.map(pergunta => ({
        perguntaId: pergunta.id,
        alternativaEscolhida: respostas[pergunta.id] || null,
      }))

      const response = await fetch('/api/quiz/resposta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quizAtivo.id,
          respostas: respostasArray,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        return
      }

      if (data.resultado) {
        setResultado(data.resultado)
      }
    } catch (error) {
      console.error('Erro ao enviar respostas:', error)
      alert('Erro ao enviar respostas')
    } finally {
      setEnviando(false)
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

  const perguntaAtual = todasPerguntas[indicePerguntaAtual]

  if (!perguntaAtual) {
    if (enviando) {
      return (
        <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Enviando respostas...</div>
        </div>
      )
    }
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando pergunta...</div>
      </div>
    )
  }

  const progresso = ((indicePerguntaAtual + 1) / todasPerguntas.length) * 100

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
      <div className="w-full px-4">
        <div className="max-w-3xl mx-auto mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Pergunta {indicePerguntaAtual + 1} de {todasPerguntas.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progresso)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
        <QuizPlayer
          quizId={quizAtivo.id}
          pergunta={perguntaAtual}
          onAnswer={handleResposta}
        />
      </div>
    </div>
  )
}
