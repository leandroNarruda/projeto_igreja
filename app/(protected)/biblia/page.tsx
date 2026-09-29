'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { BookOpen, Layers, Trophy } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { BibliaNiveisModal } from '@/components/biblia/BibliaNiveisModal'
import { EscolherModoBibliaModal } from '@/components/biblia/EscolherModoBibliaModal'
import { RankingCard } from '@/components/biblia/RankingCard'
import { useClassificacaoBiblia } from '@/hooks/useBiblia'

export default function BibliaPage() {
  const { data: session } = useSession()
  const { data } = useClassificacaoBiblia()
  const classificacao = data?.classificacao ?? []
  const [niveisOpen, setNiveisOpen] = useState(false)
  const [modoOpen, setModoOpen] = useState(false)

  return (
    <PageTransition>
      <BibliaNiveisModal
        isOpen={niveisOpen}
        onClose={() => setNiveisOpen(false)}
      />
      <EscolherModoBibliaModal
        isOpen={modoOpen}
        onClose={() => setModoOpen(false)}
      />
      <div className="min-h-[calc(100vh-8rem)] bg-bg-base py-8">
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex flex-col items-center justify-center mb-8 p-4 gap-4 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/20 text-primary">
              <BookOpen className="size-8" aria-hidden />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-accent mb-3">Bíblia</h1>
              <p className="text-lavender max-w-2xl">
                Responda perguntas bíblicas em lotes de 10 e acompanhe seu
                progresso no ranking.
              </p>
            </div>
            <button
              onClick={() => setModoOpen(true)}
              className="
                relative overflow-hidden
                inline-flex items-center gap-3
                px-10 py-3
                text-xl md:text-2xl font-bold text-white
                bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600
                rounded-xl shadow-2xl
                transform transition-all duration-300
                hover:scale-105
                focus:outline-none focus:ring-4 focus:ring-teal-300 focus:ring-offset-2
              "
            >
              <Trophy className="size-6" aria-hidden />
              <span className="relative z-10">Responder quiz da Bíblia</span>
            </button>

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
