'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const NIVEIS = [
  {
    nivel: 1,
    titulo: 'Semente',
    emoji: '🌱',
    gradient: 'from-lime-400 via-green-500 to-emerald-500',
    min: 0,
    max: 19,
  },
  {
    nivel: 2,
    titulo: 'Discípulo',
    emoji: '📖',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    min: 20,
    max: 39,
  },
  {
    nivel: 3,
    titulo: 'Estudante',
    emoji: '✨',
    gradient: 'from-blue-400 via-indigo-500 to-purple-500',
    min: 40,
    max: 59,
  },
  {
    nivel: 4,
    titulo: 'Guardador',
    emoji: '🛡️',
    gradient: 'from-teal-400 via-cyan-500 to-sky-600',
    min: 60,
    max: 79,
  },
  {
    nivel: 5,
    titulo: 'Proclamador',
    emoji: '🔥',
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    min: 80,
    max: 99,
  },
  {
    nivel: 6,
    titulo: 'Intercessor',
    emoji: '🕊️',
    gradient: 'from-cyan-400 via-sky-500 to-blue-600',
    min: 100,
    max: 119,
  },
  {
    nivel: 7,
    titulo: 'Arauto',
    emoji: '📯',
    gradient: 'from-purple-400 via-pink-500 to-rose-500',
    min: 120,
    max: 139,
  },
  {
    nivel: 8,
    titulo: 'Profeta',
    emoji: '🌟',
    gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
    min: 140,
    max: 159,
  },
  {
    nivel: 9,
    titulo: 'Guardião',
    emoji: '🌿',
    gradient: 'from-red-500 via-rose-600 to-pink-700',
    min: 160,
    max: 179,
  },
  {
    nivel: 10,
    titulo: 'Patriarca',
    emoji: '💎',
    gradient: 'from-sky-300 via-blue-500 to-indigo-600',
    min: 180,
    max: 199,
  },
  {
    nivel: 11,
    titulo: 'Lenda Bíblica',
    emoji: '🏆',
    gradient: 'from-yellow-300 via-amber-400 to-orange-500',
    min: 200,
    max: null,
  },
]

interface NiveisModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NiveisModal({ isOpen, onClose }: NiveisModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-bg-card border border-primary/30 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-primary/20">
                <div>
                  <h2 className="text-xl font-bold text-accent">
                    Jornada de Níveis
                  </h2>
                  <p className="text-xs text-lavender/70 mt-0.5">
                    Sobe de nível a cada 20 versos aprendidos
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-lavender hover:text-accent hover:bg-primary/10 transition-colors"
                  aria-label="Fechar"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* List */}
              <div className="overflow-y-auto px-4 py-4 space-y-2.5 flex-1">
                {NIVEIS.map((n, i) => (
                  <motion.div
                    key={n.nivel}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${n.gradient} flex items-center justify-center shadow-md ring-2 ring-white/20`}
                    >
                      <span className="text-lg leading-none">{n.emoji}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[11px] font-semibold text-lavender/60 uppercase tracking-widest">
                          Nível {n.nivel}
                        </span>
                        <span className="text-sm font-bold text-accent truncate">
                          {n.titulo}
                        </span>
                      </div>
                      <div
                        className={`mt-1 h-1.5 w-full rounded-full bg-gradient-to-r ${n.gradient} opacity-70`}
                      />
                    </div>

                    <span className="flex-shrink-0 text-xs text-lavender/60 tabular-nums">
                      {n.max !== null ? `${n.min}–${n.max}` : `${n.min}+`}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-primary/20 text-center">
                <p className="text-[11px] text-lavender/50">
                  Continue respondendo para subir de nível!
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
