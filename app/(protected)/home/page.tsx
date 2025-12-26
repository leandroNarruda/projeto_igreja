'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuizResult } from '@/components/quiz/QuizResult'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [quizAtivo, setQuizAtivo] = useState<any>(null)
  const [jaRespondeu, setJaRespondeu] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  useEffect(() => {
    buscarQuizAtivo()
  }, [])

  const buscarQuizAtivo = async () => {
    try {
      const response = await fetch('/api/quiz/ativo')
      const data = await response.json()

      if (data.quiz) {
        setQuizAtivo(data.quiz)
        setJaRespondeu(data.jaRespondeu)
        if (data.jaRespondeu && data.resultado) {
          setResultado(data.resultado)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar quiz ativo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResponderQuiz = () => {
    router.push('/quiz/responder')
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center py-8">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (jaRespondeu && resultado) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <QuizResult
            total={resultado.total}
            acertos={resultado.acertos}
            erros={resultado.erros}
            porcentagem={resultado.porcentagem}
          />
        </div>
      </div>
    )
  }

  if (!quizAtivo) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">
              Não há quiz ativo no momento.
            </p>
            <p className="text-gray-500">
              Aguarde um novo quiz ser disponibilizado.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex justify-center">
        <button
          onClick={handleResponderQuiz}
          className="
            relative overflow-hidden
            px-12 py-6
            text-2xl md:text-3xl font-bold text-white
            bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
            rounded-xl shadow-2xl
            transform transition-all duration-300
            hover:scale-105 hover:shadow-3xl
            animate-pulse
            hover:animate-none
            focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2
            cursor-pointer
          "
        >
          <span className="relative z-10">Responder Quiz da semana</span>
          <div
            className="absolute inset-0 rounded-xl shimmer-effect"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
          />
        </button>
      </div>
    </div>
  )
}
