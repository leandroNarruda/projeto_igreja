'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QuizResult } from '@/components/quiz/QuizResult'
import { useQuizAtivo, useClassificacaoQuiz } from '@/hooks/useQuiz'
import { Loading } from '@/components/ui/Loading'
import { PageTransition } from '@/components/layout/PageTransition'
import { WelcomeModal } from '@/components/ui/WelcomeModal'

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
  const { data: session } = useSession()
  const { data: quizData, isLoading } = useQuizAtivo()
  const quizId = quizData?.quiz?.id
  const { data: classificacaoData } = useClassificacaoQuiz(quizId || null)

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {classificacao.map(
                    (item: ClassificacaoItem, index: number) => {
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
                            : item.userId === Number(session?.user?.id)
                              ? 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 ring-2 ring-blue-400 ring-offset-2'
                              : 'bg-white border-gray-300 hover:border-gray-400'
                        }
                      `}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-2 text-gray-900">
                              {index < 3 ? medalhas[index] : `${item.posicao}º`}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {classificacao.map((item: ClassificacaoItem, index: number) => {
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
                        ${index < 3 ? cores[index] : 'bg-white border-gray-300 hover:border-gray-400'}
                      `}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {index < 3 ? medalhas[index] : `${item.posicao}º`}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
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
