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
      <div className="min-h-[calc(100vh-8rem)] bg-bg-base py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Seção de Apresentação do Evento */}
          <div className="bg-bg-card rounded-lg shadow-md p-6 mb-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-accent mb-4">
                🎯 Evento de Quizzes Anual
              </h1>
              <p className="text-xl text-lavender max-w-3xl mx-auto">
                Um evento especial que vai durar o ano todo! Teste seus
                conhecimentos semana a semana e concorra a prêmios incríveis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card
                bgClassName="bg-gradient-to-br from-violet-900/60 via-purple-800/40 to-primary/30"
                borderClassName="border border-violet-500/40 shadow-[0_0_24px_rgba(126,86,134,0.35)]"
                index={0}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center drop-shadow-lg">
                  📅
                </div>
                <h3 className="text-xl font-bold text-accent mb-2 text-center tracking-wide">
                  Duração
                </h3>
                <p className="text-lavender/90 text-center text-sm leading-relaxed">
                  O evento dura o ano todo, com quizzes semanais baseados na
                  lição da semana.
                </p>
              </Card>

              <Card
                bgClassName="bg-gradient-to-br from-indigo-900/60 via-blue-800/40 to-cyan-900/30"
                borderClassName="border border-cyan-500/40 shadow-[0_0_24px_rgba(6,182,212,0.25)]"
                index={1}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center drop-shadow-lg">
                  📝
                </div>
                <h3 className="text-xl font-bold text-accent mb-2 text-center tracking-wide">
                  Formato
                </h3>
                <p className="text-lavender/90 text-center text-sm leading-relaxed">
                  Cada quiz possui 14 perguntas, sendo 2 perguntas para cada dia
                  da semana.
                </p>
              </Card>

              <Card
                bgClassName="bg-gradient-to-br from-emerald-900/60 via-teal-800/40 to-green-900/30"
                borderClassName="border border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                index={2}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center drop-shadow-lg">
                  🏆
                </div>
                <h3 className="text-xl font-bold text-accent mb-2 text-center tracking-wide">
                  Competição
                </h3>
                <p className="text-lavender/90 text-center text-sm leading-relaxed">
                  Participe de todos os quizzes e acumule pontos para subir na
                  classificação geral!
                </p>
              </Card>
            </div>
          </div>

          {/* Seção de Classificação Geral */}
          <div
            id="classificacao-geral"
            className="bg-bg-card rounded-lg shadow-md p-6"
          >
            <h2 className="text-3xl font-bold text-accent mb-6 text-center">
              Classificação Geral
            </h2>

            {isLoading ? (
              <Loading text="Carregando classificação..." fullScreen={false} />
            ) : classificacao.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lavender">
                  Ainda não há participantes na classificação geral.
                </p>
                <p className="text-lavender/50 mt-2">
                  Participe dos quizzes para aparecer aqui!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {classificacao.map(
                  (item: ClassificacaoGeralItem, index: number) => {
                    const medalhas = ['🥇', '🥈', '🥉']
                    const podioClass =
                      index < 3
                        ? ['podio-gold', 'podio-silver', 'podio-bronze'][index]
                        : null

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
                        className={`relative overflow-hidden p-6 rounded-lg border-2 shadow-lg transition-transform hover:scale-105 ${
                          podioClass ??
                          'bg-bg-card border-primary/30 hover:border-gray-400'
                        }`}
                      >
                        <div className="relative text-center">
                          <div
                            className={`text-5xl mb-3 ${!podioClass ? 'text-accent font-bold' : 'drop-shadow-md'}`}
                          >
                            {index < 3 ? medalhas[index] : `${item.posicao}º`}
                          </div>
                          <h3
                            className={`text-xl font-bold mb-3 truncate ${podioClass ? 'podio-name' : 'text-accent'}`}
                          >
                            {
                              (item.social_name?.trim() || item.nome).split(
                                ' '
                              )[0]
                            }
                          </h3>
                          <div
                            className={`space-y-2 text-sm ${podioClass ? 'podio-label' : 'text-lavender'}`}
                          >
                            <div className="bg-black/10 rounded p-2">
                              <div
                                className={`font-semibold ${podioClass ? 'podio-name' : 'text-accent'}`}
                              >
                                Total de Acertos
                              </div>
                              <div
                                className={`text-2xl font-bold ${podioClass ? 'podio-name' : 'text-primary'}`}
                              >
                                {item.totalAcertos}
                              </div>
                            </div>
                            <div className="bg-black/10 rounded p-2">
                              <div
                                className={`font-semibold ${podioClass ? 'podio-name' : 'text-accent'}`}
                              >
                                Quizzes Respondidos
                              </div>
                              <div
                                className={`text-lg font-bold ${podioClass ? 'podio-name' : 'text-purple-600'}`}
                              >
                                {item.totalQuizzes}
                              </div>
                            </div>
                            <div className="bg-black/10 rounded p-2">
                              <div
                                className={`font-semibold ${podioClass ? 'podio-name' : 'text-accent'}`}
                              >
                                Média de Acertos
                              </div>
                              <div
                                className={`text-lg font-bold ${podioClass ? 'podio-name' : 'text-green-600'}`}
                              >
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
