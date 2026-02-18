'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useClassificacaoGeral } from '@/hooks/useQuiz'
import { useRankingGeralRealtime } from '@/hooks/useRankingRealtime'
import { Loading } from '@/components/ui/Loading'
import { PageTransition } from '@/components/layout/PageTransition'
import { Card } from '@/components/ui/Card'

interface ClassificacaoGeralItem {
  posicao: number
  userId: number
  nome: string
  social_name?: string | null
  email: string
  totalAcertos: number
  totalQuizzes: number
  mediaPorcentagem: number
}

export default function EventosPage() {
  const { data, isLoading } = useClassificacaoGeral()
  const classificacao = data?.classificacao || []
  useRankingGeralRealtime()

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.hash === '#classificacao-geral'
    ) {
      const el = document.getElementById('classificacao-geral')
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Seção de Apresentação do Evento */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🎯 Evento de Quizzes Anual
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Um evento especial que vai durar o ano todo! Teste seus
                conhecimentos semana a semana e concorra a prêmios incríveis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card
                bgClassName="bg-gradient-to-br from-blue-50 to-blue-100"
                borderClassName="border-2 border-blue-200"
                index={0}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  Duração
                </h3>
                <p className="text-gray-700 text-center">
                  O evento dura o ano todo, com quizzes semanais baseados na
                  lição da semana.
                </p>
              </Card>

              <Card
                bgClassName="bg-gradient-to-br from-purple-50 to-purple-100"
                borderClassName="border-2 border-purple-200"
                index={1}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  Formato
                </h3>
                <p className="text-gray-700 text-center">
                  Cada quiz possui 14 perguntas, sendo 2 perguntas para cada dia
                  da semana.
                </p>
              </Card>

              <Card
                bgClassName="bg-gradient-to-br from-green-50 to-green-100"
                borderClassName="border-2 border-green-200"
                index={2}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center">🏆</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  Competição
                </h3>
                <p className="text-gray-700 text-center">
                  Participe de todos os quizzes e acumule pontos para subir na
                  classificação geral!
                </p>
              </Card>
            </div>
          </div>

          {/* Seção de Classificação Geral */}
          <div
            id="classificacao-geral"
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Classificação Geral
            </h2>

            {isLoading ? (
              <Loading text="Carregando classificação..." fullScreen={false} />
            ) : classificacao.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  Ainda não há participantes na classificação geral.
                </p>
                <p className="text-gray-500 mt-2">
                  Participe dos quizzes para aparecer aqui!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {classificacao.map(
                  (item: ClassificacaoGeralItem, index: number) => {
                    const medalhas = ['🥇', '🥈', '🥉']
                    const cores = [
                      'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400',
                      'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400',
                      'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-400',
                    ]

                    return (
                      <motion.div
                        key={item.userId}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        whileInView={{
                          opacity: 1,
                          scale: index === 0 ? 1.05 : 1,
                          y: 0,
                        }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{
                          type: 'tween',
                          ease: 'easeOut',
                          duration: 0.4,
                          delay: index * 0.05,
                        }}
                        className={`
                      p-6 rounded-lg border-2 shadow-lg transition-transform hover:scale-105
                      ${
                        index < 3
                          ? cores[index]
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }
                    `}
                      >
                        <div className="text-center">
                          <div
                            className={`text-5xl mb-3 ${
                              index < 3 ? '' : 'text-gray-900 font-bold'
                            }`}
                          >
                            {index < 3 ? medalhas[index] : `${item.posicao}º`}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 truncate">
                            {
                              (item.social_name?.trim() || item.nome).split(
                                ' '
                              )[0]
                            }
                          </h3>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="bg-white/50 rounded p-2">
                              <div className="font-semibold text-gray-900">
                                Total de Acertos
                              </div>
                              <div className="text-2xl font-bold text-blue-600">
                                {item.totalAcertos}
                              </div>
                            </div>
                            <div className="bg-white/50 rounded p-2">
                              <div className="font-semibold text-gray-900">
                                Quizzes Respondidos
                              </div>
                              <div className="text-lg font-bold text-purple-600">
                                {item.totalQuizzes}
                              </div>
                            </div>
                            <div className="bg-white/50 rounded p-2">
                              <div className="font-semibold text-gray-900">
                                Média de Acertos
                              </div>
                              <div className="text-lg font-bold text-green-600">
                                {item.mediaPorcentagem}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
