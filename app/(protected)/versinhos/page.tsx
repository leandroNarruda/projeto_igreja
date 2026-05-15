'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Layers, Swords } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { RankingCard } from '@/components/versinhos/RankingCard'
import { NiveisModal } from '@/components/versinhos/NiveisModal'
import { EscolherModoModal } from '@/components/versinhos/EscolherModoModal'
import { useClassificacaoVersinhos, useChefao } from '@/hooks/useVersinhos'

export default function VersinhosPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data } = useClassificacaoVersinhos()
  const { data: chefaoData } = useChefao(true)
  const classificacao = data?.classificacao ?? []
  const prontoParaChefao = chefaoData?.prontoParaChefao ?? false
  const [niveisOpen, setNiveisOpen] = useState(false)
  const [modoOpen, setModoOpen] = useState(false)

  return (
    <PageTransition>
      <NiveisModal isOpen={niveisOpen} onClose={() => setNiveisOpen(false)} />
      <EscolherModoModal
        isOpen={modoOpen}
        onClose={() => setModoOpen(false)}
        prontoParaChefao={prontoParaChefao}
      />
      <div className="min-h-[calc(100vh-8rem)] bg-bg-base py-8">
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex flex-col items-center justify-center mb-8 p-4 gap-4">
            {/* Botão Chefão — aparece quando disponível */}
            {prontoParaChefao && (
              <button
                onClick={() => router.push('/versinhos/responder?modo=chefao')}
                className="
                  flex items-center gap-3
                  px-8 py-3
                  text-xl font-bold text-white
                  bg-gradient-to-r from-red-700 via-red-600 to-orange-600
                  rounded-xl shadow-2xl
                  transform transition-all duration-300
                  hover:scale-105 hover:shadow-red-500/40
                  focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-offset-2
                  cursor-pointer animate-pulse hover:animate-none
                "
              >
                <span>⚔️ Enfrentar o Chefão!</span>
              </button>
            )}

            <button
              onClick={() => setModoOpen(true)}
              className="
                relative overflow-hidden
                px-12 py-3
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
              <span className="relative z-10">
                Responder quizz de versinhos
              </span>
              <div
                className="absolute inset-0 rounded-xl shimmer-effect"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                }}
              />
            </button>

            <p className="mt-2 text-center">
              <button
                onClick={() => setNiveisOpen(true)}
                className="
                  group relative inline-flex items-center gap-2.5
                  px-6 py-3 rounded-full
                  bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500
                  text-white font-semibold tracking-wide
                  shadow-lg shadow-purple-500/30
                  hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-0.5
                  active:translate-y-0
                  transition-all duration-300
                  ring-1 ring-white/30
                "
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.2s_ease-in-out] pointer-events-none" />
                <Layers
                  className="size-5 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] group-hover:scale-110 transition-transform"
                  aria-hidden
                />
                <span className="relative">Ver todos os níveis</span>
              </button>
            </p>
          </div>

          <div className="mt-8 bg-bg-card rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-accent mb-6 text-center">
              Classificação
            </h2>

            {classificacao.length === 0 ? (
              <p className="text-center text-lavender">
                Ninguém respondeu ainda. Seja o primeiro!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {classificacao.map((item, index) => (
                  <RankingCard
                    key={item.userId}
                    item={item}
                    index={index}
                    isMe={item.userId === Number(session?.user?.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
