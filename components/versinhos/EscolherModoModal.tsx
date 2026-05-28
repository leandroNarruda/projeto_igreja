'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Trophy,
  BookOpen,
  ChevronRight,
  Star,
  Lock,
  X,
  Swords,
} from 'lucide-react'
import { useVersinhosQuiz } from '@/hooks/useVersinhos'
import { getNivelInfo } from '@/lib/versinhoNiveis'

interface Props {
  isOpen: boolean
  onClose: () => void
  prontoParaChefao?: boolean
  nivelAtual?: number
}

type Tela = 'escolha' | 'lotes' | 'chefoes'

function nomeLote(index: number) {
  const inicio = index * 10 + 1
  const fim = inicio + 9
  return `Lote ${index + 1} — Versinhos ${inicio}–${fim}`
}

export function EscolherModoModal({
  isOpen,
  onClose,
  prontoParaChefao = false,
  nivelAtual = 1,
}: Props) {
  const router = useRouter()
  const [tela, setTela] = useState<Tela>('escolha')
  const { data, isLoading } = useVersinhosQuiz(isOpen)

  const loteAtual = data?.loteAtual ?? 0
  const lotesAnteriores = Array.from({ length: loteAtual }, (_, i) => i)
  const chefoesAnteriores = Array.from(
    { length: Math.max(0, nivelAtual - 1) },
    (_, i) => i + 1
  )

  useEffect(() => {
    if (!isOpen) setTela('escolha')
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const irParaNovoRecorde = () => {
    onClose()
    router.push('/versinhos/responder')
  }

  const irParaRevisao = (loteIndex: number) => {
    onClose()
    router.push(`/versinhos/responder?lote=${loteIndex}`)
  }

  const irParaChefaoRevisao = (nivel: number) => {
    onClose()
    router.push(`/versinhos/responder?modo=chefao&nivel=${nivel}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-sm bg-bg-card rounded-2xl shadow-2xl border border-primary/20 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-lavender hover:text-accent transition-colors"
        >
          <X className="size-5" />
        </button>

        {tela === 'escolha' && (
          <div className="flex flex-col gap-4 pt-1">
            <h2 className="text-xl font-bold text-accent text-center mb-1">
              Como quer jogar?
            </h2>

            {prontoParaChefao && (
              <button
                onClick={() => {
                  onClose()
                  router.push('/versinhos/responder?modo=chefao')
                }}
                className="
                  group flex items-center gap-4 p-5 rounded-xl
                  bg-gradient-to-r from-red-700 via-red-600 to-orange-600
                  text-white font-semibold shadow-lg animate-pulse hover:animate-none
                  hover:shadow-xl hover:scale-[1.02] active:scale-[0.99]
                  transition-all duration-200
                "
              >
                <div className="p-2 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors shrink-0">
                  <Swords className="size-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-bold">⚔️ Enfrentar o Chefão!</p>
                  <p className="text-xs text-white/80">
                    Você está pronto para subir de nível
                  </p>
                </div>
                <ChevronRight className="size-5 text-white/60 group-hover:text-white transition-colors" />
              </button>
            )}

            {!prontoParaChefao && (
              <button
                onClick={irParaNovoRecorde}
                className="
                  group flex items-center gap-4 p-5 rounded-xl
                  bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
                  text-white font-semibold shadow-lg
                  hover:shadow-xl hover:scale-[1.02] active:scale-[0.99]
                  transition-all duration-200
                "
              >
                <div className="p-2 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors shrink-0">
                  <Trophy className="size-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-bold">Tentar novo recorde</p>
                  <p className="text-xs text-white/80">
                    Continue do ponto onde parou
                  </p>
                </div>
                <ChevronRight className="size-5 text-white/60 group-hover:text-white transition-colors" />
              </button>
            )}

            <button
              onClick={() => setTela('lotes')}
              disabled={loteAtual === 0 || isLoading}
              className="
                group flex items-center gap-4 p-5 rounded-xl
                bg-bg-base border border-primary/30
                text-accent font-semibold shadow
                hover:border-primary/70 hover:shadow-md hover:scale-[1.02] active:scale-[0.99]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                transition-all duration-200
              "
            >
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <BookOpen className="size-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-base font-bold">Revisar lotes anteriores</p>
                <p className="text-xs text-lavender">
                  {isLoading
                    ? 'Carregando...'
                    : loteAtual === 0
                      ? 'Complete um lote primeiro'
                      : `${loteAtual} lote${loteAtual !== 1 ? 's' : ''} disponível${loteAtual !== 1 ? 'is' : ''}`}
                </p>
              </div>
              {loteAtual === 0 && !isLoading ? (
                <Lock className="size-5 text-lavender shrink-0" />
              ) : (
                <ChevronRight className="size-5 text-lavender group-hover:text-primary transition-colors shrink-0" />
              )}
            </button>

            <button
              onClick={() => setTela('chefoes')}
              disabled={chefoesAnteriores.length === 0}
              className="
                group flex items-center gap-4 p-5 rounded-xl
                bg-bg-base border border-red-500/30
                text-accent font-semibold shadow
                hover:border-red-500/70 hover:shadow-md hover:scale-[1.02] active:scale-[0.99]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                transition-all duration-200
              "
            >
              <div className="p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors shrink-0">
                <Swords className="size-6 text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-base font-bold">
                  Refazer Chefões anteriores
                </p>
                <p className="text-xs text-lavender">
                  {chefoesAnteriores.length === 0
                    ? 'Vença um Chefão primeiro'
                    : `${chefoesAnteriores.length} Chefão${chefoesAnteriores.length !== 1 ? 'ões' : ''} disponível${chefoesAnteriores.length !== 1 ? 'is' : ''}`}
                </p>
              </div>
              {chefoesAnteriores.length === 0 ? (
                <Lock className="size-5 text-lavender shrink-0" />
              ) : (
                <ChevronRight className="size-5 text-lavender group-hover:text-red-500 transition-colors shrink-0" />
              )}
            </button>
          </div>
        )}

        {tela === 'lotes' && (
          <div className="flex flex-col gap-3 pt-1">
            <button
              onClick={() => setTela('escolha')}
              className="text-lavender hover:text-accent transition-colors text-sm self-start mb-1"
            >
              ← Voltar
            </button>
            <h2 className="text-lg font-bold text-accent">Escolha um lote</h2>

            <div className="max-h-72 overflow-y-auto flex flex-col gap-2 pr-1">
              {lotesAnteriores.map(idx => (
                <button
                  key={idx}
                  onClick={() => irParaRevisao(idx)}
                  className="
                    group flex items-center gap-3 p-4 rounded-xl
                    bg-bg-base border border-primary/20
                    hover:border-primary/60 hover:bg-primary/5
                    transition-all duration-150 text-left
                  "
                >
                  <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-accent text-sm truncate">
                      {nomeLote(idx)}
                    </p>
                    <div className="flex gap-0.5 mt-1">
                      {[0, 1, 2].map(s => (
                        <Star
                          key={s}
                          className="size-3 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-lavender group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {tela === 'chefoes' && (
          <div className="flex flex-col gap-3 pt-1">
            <button
              onClick={() => setTela('escolha')}
              className="text-lavender hover:text-accent transition-colors text-sm self-start mb-1"
            >
              ← Voltar
            </button>
            <h2 className="text-lg font-bold text-accent">Escolha um Chefão</h2>
            <p className="text-xs text-lavender -mt-1 mb-1">
              Refazer não altera seu progresso.
            </p>

            <div className="max-h-72 overflow-y-auto flex flex-col gap-2 pr-1">
              {chefoesAnteriores.map(n => {
                const info = getNivelInfo(n)
                return (
                  <button
                    key={n}
                    onClick={() => irParaChefaoRevisao(n)}
                    className="
                      group flex items-center gap-3 p-4 rounded-xl
                      bg-bg-base border border-red-500/20
                      hover:border-red-500/60 hover:bg-red-500/5
                      transition-all duration-150 text-left
                    "
                  >
                    <div className="flex items-center justify-center size-10 rounded-full bg-red-500/10 text-xl shrink-0">
                      {info.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-accent text-sm truncate">
                        Nível {n} — {info.titulo}
                      </p>
                      <p className="text-xs text-lavender">
                        Versinhos {(n - 1) * 20 + 1}–{n * 20}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-lavender group-hover:text-red-500 transition-colors shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
