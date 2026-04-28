'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trophy } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QuizResult } from '@/components/quiz/QuizResult'
import { useQuizAtivo, useClassificacaoQuiz } from '@/hooks/useQuiz'
import { useRankingRealtime } from '@/hooks/useRankingRealtime'
import { Loading } from '@/components/ui/Loading'
import { PageTransition } from '@/components/layout/PageTransition'
import { WelcomeModal } from '@/components/ui/WelcomeModal'

interface ClassificacaoItem {
  posicao: number
  userId: number
  nome: string
  social_name?: string | null
  email: string
  image?: string | null
  acertos: number
  erros: number
  nulos: number
  total: number
  porcentagem: number
}

function getFirstLetter(name: string): string {
  if (!name || !name.trim()) return '?'
  return name.trim()[0].toUpperCase()
}

export default function HomePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: quizData, isLoading } = useQuizAtivo()
  const quizId = quizData?.quiz?.id
  const { data: classificacaoData } = useClassificacaoQuiz(quizId || null)
  useRankingRealtime(quizId ?? null)

  const quizAtivo = quizData?.quiz
  const jaRespondeu = quizData?.jaRespondeu || false
  const resultado = quizData?.resultado || null
  const classificacao = classificacaoData?.classificacao || []

  // Estado para controlar o modal de boas-vindas
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  // Mostrar modal apenas quando acabou de logar
  useEffect(() => {
    const shouldShowModal =
      sessionStorage.getItem('welcomeModalPending') === 'true'
    if (shouldShowModal) {
      setShowWelcomeModal(true)
      sessionStorage.removeItem('welcomeModalPending')
    }
  }, [])

  // Função para fechar o modal
  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false)
  }

  const handleResponderQuiz = () => {
    router.push('/quiz/responder')
  }

  if (isLoading) {
    return <Loading />
  }

  if (jaRespondeu && resultado) {
    return (
      <PageTransition>
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleCloseWelcomeModal}
          videoUrl="https://www.youtube.com/shorts/ufRpAmkn7Yw"
        />
        <div className="min-h-[calc(100vh-8rem)] bg-bg-base py-8">
          <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="mb-8">
              <QuizResult
                total={resultado.total}
                acertos={resultado.acertos}
                erros={resultado.erros}
                porcentagem={resultado.porcentagem}
              />
            </div>
            <div className="text-center mb-6">
              <Link
                href="/eventos#classificacao-geral"
                className="
                  group relative inline-flex items-center gap-2.5
                  px-6 py-3 rounded-full
                  bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500
                  text-white font-semibold tracking-wide
                  shadow-lg shadow-orange-500/30
                  hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-0.5
                  active:translate-y-0
                  transition-all duration-300
                  ring-1 ring-white/30
                "
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.2s_ease-in-out] pointer-events-none" />
                <Trophy
                  className="size-5 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] group-hover:rotate-[-8deg] group-hover:scale-110 transition-transform"
                  aria-hidden
                />
                <span className="relative">Ver classificação geral</span>
              </Link>
            </div>
            {classificacao.length > 0 && (
              <div className="mt-8 bg-bg-card rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-accent mb-6 text-center">
                  Classificação
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {classificacao.map(
                    (item: ClassificacaoItem, index: number) => {
                      const medalhas = ['🥇', '🥈', '🥉']
                      const podioClass =
                        index < 3
                          ? ['podio-gold', 'podio-silver', 'podio-bronze'][
                              index
                            ]
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
                            podioClass
                              ? podioClass
                              : item.userId === Number(session?.user?.id)
                                ? 'bg-gradient-to-br from-primary/20 to-primary/30 border-primary ring-2 ring-primary ring-offset-2'
                                : 'bg-bg-card border-primary/30 hover:border-primary/60'
                          }`}
                        >
                          <div className="relative text-center">
                            <div
                              className={`text-4xl mb-3 ${!podioClass ? 'text-accent' : 'drop-shadow-md'}`}
                            >
                              {index < 3 ? medalhas[index] : `${item.posicao}º`}
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-3">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt=""
                                  width={40}
                                  height={40}
                                  className={`h-10 w-10 rounded-full object-cover border-2 shrink-0 ${podioClass ? 'podio-avatar' : 'border-primary/30'}`}
                                  unoptimized
                                />
                              ) : (
                                <div
                                  className={`h-10 w-10 rounded-full flex items-center justify-center text-base font-semibold border-2 shrink-0 ${podioClass ? 'podio-avatar' : 'bg-primary/20 text-lavender border-primary/30'}`}
                                >
                                  {getFirstLetter(
                                    item.social_name?.trim() || item.nome
                                  )}
                                </div>
                              )}
                              <h3
                                className={`text-xl font-bold truncate min-w-0 ${podioClass ? 'podio-name' : 'text-accent'}`}
                              >
                                {
                                  (item.social_name?.trim() || item.nome).split(
                                    ' '
                                  )[0]
                                }
                              </h3>
                            </div>
                            <div
                              className={`space-y-1 text-sm ${podioClass ? 'podio-label' : 'text-lavender'}`}
                            >
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
                              <div
                                className={`pt-2 border-t ${podioClass ? 'podio-divider' : 'border-primary/30'}`}
                              >
                                <span
                                  className={`font-semibold text-lg ${podioClass ? 'podio-name' : 'text-accent'}`}
                                >
                                  {item.porcentagem}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!quizAtivo) {
    return (
      <PageTransition>
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleCloseWelcomeModal}
          videoUrl="https://www.youtube.com/shorts/ufRpAmkn7Yw"
        />
        <div className="min-h-[calc(100vh-8rem)] bg-bg-base flex items-center justify-center py-8">
          <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="text-center">
              <p className="text-lavender text-lg mb-4">
                Não há quiz ativo no momento.
              </p>
              <p className="text-lavender/70 mb-4">
                Aguarde um novo quiz ser disponibilizado.
              </p>
              <Link
                href="/eventos#classificacao-geral"
                className="
                  group relative inline-flex items-center gap-2.5
                  px-6 py-3 rounded-full
                  bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500
                  text-white font-semibold tracking-wide
                  shadow-lg shadow-orange-500/30
                  hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-0.5
                  active:translate-y-0
                  transition-all duration-300
                  ring-1 ring-white/30
                "
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.2s_ease-in-out] pointer-events-none" />
                <Trophy
                  className="size-5 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] group-hover:rotate-[-8deg] group-hover:scale-110 transition-transform"
                  aria-hidden
                />
                <span className="relative">Ver classificação geral</span>
              </Link>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
        videoUrl="https://www.youtube.com/shorts/ufRpAmkn7Yw"
      />
      <div className="min-h-[calc(100vh-8rem)] bg-bg-base py-8">
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex flex-col items-center justify-center mb-8">
            <button
              onClick={handleResponderQuiz}
              className="
                relative overflow-hidden
                px-12 py-6
                text-2xl md:text-3xl font-bold text-white
                bg-gradient-to-r from-primary via-primary-hover to-orange
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
            <p className="mt-4 text-center">
              <Link
                href="/eventos#classificacao-geral"
                className="
                  group relative inline-flex items-center gap-2.5
                  px-6 py-3 rounded-full
                  bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500
                  text-white font-semibold tracking-wide
                  shadow-lg shadow-orange-500/30
                  hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-0.5
                  active:translate-y-0
                  transition-all duration-300
                  ring-1 ring-white/30
                "
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.2s_ease-in-out] pointer-events-none" />
                <Trophy
                  className="size-5 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] group-hover:rotate-[-8deg] group-hover:scale-110 transition-transform"
                  aria-hidden
                />
                <span className="relative">Ver classificação geral</span>
              </Link>
            </p>
          </div>
          {classificacao.length > 0 && (
            <div className="mt-8 bg-bg-card rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-accent mb-6 text-center">
                Classificação
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {classificacao.map((item: ClassificacaoItem, index: number) => {
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
                        'bg-bg-card border-primary/30 hover:border-primary/60'
                      }`}
                    >
                      <div className="relative text-center">
                        <div
                          className={`text-4xl mb-3 ${!podioClass ? 'text-accent' : 'drop-shadow-md'}`}
                        >
                          {index < 3 ? medalhas[index] : `${item.posicao}º`}
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt=""
                              width={40}
                              height={40}
                              className={`h-10 w-10 rounded-full object-cover border-2 shrink-0 ${podioClass ? 'podio-avatar' : 'border-primary/30'}`}
                              unoptimized
                            />
                          ) : (
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center text-base font-semibold border-2 shrink-0 ${podioClass ? 'podio-avatar' : 'bg-primary/20 text-lavender border-primary/30'}`}
                            >
                              {getFirstLetter(
                                item.social_name?.trim() || item.nome
                              )}
                            </div>
                          )}
                          <h3
                            className={`text-xl font-bold truncate min-w-0 ${podioClass ? 'podio-name' : 'text-accent'}`}
                          >
                            {
                              (item.social_name?.trim() || item.nome).split(
                                ' '
                              )[0]
                            }
                          </h3>
                        </div>
                        <div
                          className={`space-y-1 text-sm ${podioClass ? 'podio-label' : 'text-lavender'}`}
                        >
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
                          <div
                            className={`pt-2 border-t ${podioClass ? 'podio-divider' : 'border-primary/30'}`}
                          >
                            <span
                              className={`font-semibold text-lg ${podioClass ? 'podio-name' : 'text-accent'}`}
                            >
                              {item.porcentagem}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
