'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ClassificacaoVersinhosItem } from '@/hooks/useVersinhos'

const TAMANHO_LOTE = 20

interface NivelInfo {
  titulo: string
  emoji: string
  gradient: string
}

function getNivelInfo(nivel: number): NivelInfo {
  if (nivel >= 11)
    return {
      titulo: 'Lenda Bíblica',
      emoji: '🏆',
      gradient: 'from-yellow-300 via-amber-400 to-orange-500',
    }
  if (nivel >= 10)
    return {
      titulo: 'Patriarca',
      emoji: '💎',
      gradient: 'from-sky-300 via-blue-500 to-indigo-600',
    }
  if (nivel >= 9)
    return {
      titulo: 'Guardião',
      emoji: '🌿',
      gradient: 'from-red-500 via-rose-600 to-pink-700',
    }
  if (nivel >= 8)
    return {
      titulo: 'Profeta',
      emoji: '🌟',
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
    }
  if (nivel >= 7)
    return {
      titulo: 'Arauto',
      emoji: '📯',
      gradient: 'from-purple-400 via-pink-500 to-rose-500',
    }
  if (nivel >= 6)
    return {
      titulo: 'Intercessor',
      emoji: '🕊️',
      gradient: 'from-cyan-400 via-sky-500 to-blue-600',
    }
  if (nivel >= 5)
    return {
      titulo: 'Proclamador',
      emoji: '🔥',
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
    }
  if (nivel >= 4)
    return {
      titulo: 'Guardador',
      emoji: '🛡️',
      gradient: 'from-teal-400 via-cyan-500 to-sky-600',
    }
  if (nivel >= 3)
    return {
      titulo: 'Estudante',
      emoji: '✨',
      gradient: 'from-blue-400 via-indigo-500 to-purple-500',
    }
  if (nivel >= 2)
    return {
      titulo: 'Discípulo',
      emoji: '📖',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    }
  return {
    titulo: 'Semente',
    emoji: '🌱',
    gradient: 'from-lime-400 via-green-500 to-emerald-500',
  }
}

function getFirstLetter(name: string): string {
  if (!name || !name.trim()) return '?'
  return name.trim()[0].toUpperCase()
}

interface RankingCardProps {
  item: ClassificacaoVersinhosItem
  index: number
  isMe: boolean
}

export function RankingCard({ item, index, isMe }: RankingCardProps) {
  const [flipped, setFlipped] = useState(false)

  const medalhas = ['🥇', '🥈', '🥉']
  const podioClass =
    index < 3 ? ['podio-gold', 'podio-silver', 'podio-bronze'][index] : null

  const nivel = Math.floor(item.acertos / TAMANHO_LOTE) + 1
  const acertosNoLote = item.acertos % TAMANHO_LOTE
  const progressoLote = (acertosNoLote / TAMANHO_LOTE) * 100
  const nivelInfo = getNivelInfo(nivel)
  const nomeExibido = (item.social_name?.trim() || item.nome).split(' ')[0]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        type: 'tween',
        ease: 'easeOut',
        duration: 0.4,
        delay: index * 0.05,
      }}
      className="[perspective:1000px]"
    >
      <button
        type="button"
        onClick={() => setFlipped(f => !f)}
        className="relative w-full text-left [transform-style:preserve-3d] transition-transform duration-700"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        aria-label={flipped ? 'Voltar' : 'Ver conquistas'}
      >
        {/* FRENTE */}
        <div
          className={`[backface-visibility:hidden] [-webkit-backface-visibility:hidden] relative overflow-hidden p-6 rounded-lg border-2 shadow-lg transition-transform hover:scale-[1.02] ${
            podioClass
              ? podioClass
              : isMe
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
                  {getFirstLetter(item.social_name?.trim() || item.nome)}
                </div>
              )}
              <h3
                className={`text-xl font-bold truncate min-w-0 ${podioClass ? 'podio-name' : 'text-accent'}`}
              >
                {nomeExibido}
              </h3>
            </div>
            <div
              className={`space-y-1 text-sm ${podioClass ? 'podio-label' : 'text-lavender'}`}
            >
              <div
                className={`pt-2 border-t ${podioClass ? 'podio-divider' : 'border-primary/30'}`}
              >
                <span
                  className={`font-semibold text-lg ${podioClass ? 'podio-name' : 'text-accent'}`}
                >
                  {item.acertos} versos aprendidos
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${nivelInfo.gradient} text-white shadow-md ring-1 ring-white/30`}
              >
                <span className="text-base leading-none">
                  {nivelInfo.emoji}
                </span>
                <span className="text-[11px] font-bold tracking-wide uppercase">
                  Nível {nivel} · {nivelInfo.titulo}
                </span>
              </div>
            </div>

            <p
              className={`mt-3 text-[10px] uppercase tracking-wider ${podioClass ? 'podio-label' : 'text-lavender/70'}`}
            >
              Toque para ver conquistas
            </p>
          </div>
        </div>

        {/* VERSO */}
        <div
          className={`absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] p-6 rounded-lg border-2 border-white/20 shadow-lg overflow-hidden bg-gradient-to-br ${nivelInfo.gradient} text-white`}
        >
          <div className="relative h-full flex flex-col items-center justify-center text-center gap-1">
            <div className="text-5xl drop-shadow-lg leading-none">
              {nivelInfo.emoji}
            </div>
            <div className="text-[10px] uppercase tracking-widest opacity-90 mt-1">
              {nomeExibido}
            </div>
            <div className="text-3xl font-extrabold drop-shadow leading-tight">
              Nível {nivel}
            </div>
            <div className="text-sm font-semibold opacity-95 mb-2">
              {nivelInfo.titulo}
            </div>

            <div className="w-full mt-1">
              <div className="flex justify-between text-[11px] font-semibold opacity-95 mb-1">
                <span>Próximo nível</span>
                <span>
                  {acertosNoLote}/{TAMANHO_LOTE}
                </span>
              </div>
              <div className="w-full h-2 bg-white/25 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressoLote}%` }}
                />
              </div>
            </div>

            <div className="mt-3 text-xs opacity-95">
              <span className="font-extrabold text-lg">{item.acertos}</span>{' '}
              versos no total
            </div>

            <p className="mt-2 text-[10px] uppercase tracking-wider opacity-80">
              Toque para voltar
            </p>
          </div>
        </div>
      </button>
    </motion.div>
  )
}
