'use client'

import { useRouter } from 'next/navigation'
import { QuizResult } from '@/components/quiz/QuizResult'
import { useQuizAtivo, useClassificacaoQuiz } from '@/hooks/useQuiz'
import { Loading } from '@/components/ui/Loading'

interface ClassificacaoItem {
  posicao: number
  userId: number
  nome: string
  email: string
  acertos: number
  erros: number
  nulos: number
  total: number
  porcentagem: number
}

export default function HomePage() {
  const router = useRouter()
  const { data: quizData, isLoading } = useQuizAtivo()
  const quizId = quizData?.quiz?.id
  const { data: classificacaoData } = useClassificacaoQuiz(quizId || null)

  const quizAtivo = quizData?.quiz
  const jaRespondeu = quizData?.jaRespondeu || false
  const resultado = quizData?.resultado || null
  const classificacao = classificacaoData?.classificacao || []

  const handleResponderQuiz = () => {
    router.push('/quiz/responder')
  }

  if (isLoading) {
    return <Loading />
  }

  if (jaRespondeu && resultado) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="mb-8">
            <QuizResult
              total={resultado.total}
              acertos={resultado.acertos}
              erros={resultado.erros}
              porcentagem={resultado.porcentagem}
            />
          </div>
          {classificacao.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Classificação
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {classificacao.map((item: ClassificacaoItem, index: number) => {
                  const medalhas = ['🥇', '🥈', '🥉']
                  const cores = [
                    'bg-yellow-100 border-yellow-400',
                    'bg-gray-100 border-gray-400',
                    'bg-orange-100 border-orange-400',
                  ]
                  return (
                    <div
                      key={item.userId}
                      className={`
                        p-6 rounded-lg border-2 shadow-lg
                        ${index < 3 ? cores[index] : 'bg-white border-gray-300'}
                        ${index === 0 ? 'transform scale-105' : ''}
                      `}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {index < 3 ? medalhas[index] : `${item.posicao}º`}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {item.nome.split(' ')[0]}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-semibold">Acertos:</span>{' '}
                            {item.acertos}
                          </div>
                          <div>
                            <span className="font-semibold">Erros:</span>{' '}
                            {item.erros}
                          </div>
                          {item.nulos > 0 && (
                            <div>
                              <span className="font-semibold">Nulos:</span>{' '}
                              {item.nulos}
                            </div>
                          )}
                          <div className="pt-2 border-t border-gray-300">
                            <span className="font-semibold text-lg text-gray-900">
                              {item.porcentagem}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex flex-col items-center justify-center mb-8">
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
        {classificacao.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Classificação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {classificacao.map((item: ClassificacaoItem, index: number) => {
                const medalhas = ['🥇', '🥈', '🥉']
                const cores = [
                  'bg-yellow-100 border-yellow-400',
                  'bg-gray-100 border-gray-400',
                  'bg-orange-100 border-orange-400',
                ]
                return (
                  <div
                    key={item.userId}
                    className={`
                      p-6 rounded-lg border-2 shadow-lg
                      ${index < 3 ? cores[index] : 'bg-white border-gray-300'}
                      ${index === 0 ? 'transform scale-105' : ''}
                    `}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {index < 3 ? medalhas[index] : `${item.posicao}º`}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {item.nome.split(' ')[0]}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">Acertos:</span>{' '}
                          {item.acertos}
                        </div>
                        <div>
                          <span className="font-semibold">Erros:</span>{' '}
                          {item.erros}
                        </div>
                        {item.nulos > 0 && (
                          <div>
                            <span className="font-semibold">Nulos:</span>{' '}
                            {item.nulos}
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-300">
                          <span className="font-semibold text-lg text-gray-900">
                            {item.porcentagem}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
