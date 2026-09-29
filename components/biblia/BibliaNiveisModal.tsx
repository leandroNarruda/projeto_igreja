'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import {
  BIBLIAS_POR_NIVEL,
  getBibliaNivelInfo,
  getTotalBibliaNiveis,
} from '@/lib/bibliaNiveis'

const NIVEIS = Array.from({ length: getTotalBibliaNiveis() }, (_, index) => {
  const nivel = index + 1
  const info = getBibliaNivelInfo(nivel)
  const min = index * BIBLIAS_POR_NIVEL
  const isUltimo = nivel === getTotalBibliaNiveis()

  return {
    nivel,
    ...info,
    min,
    max: isUltimo ? null : min + BIBLIAS_POR_NIVEL - 1,
  }
})

interface BibliaNiveisModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BibliaNiveisModal({ isOpen, onClose }: BibliaNiveisModalProps) {
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
              <div className="flex items-center justify-between px-6 py-4 border-b border-primary/20">
                <div>
                  <h2 className="text-xl font-bold text-accent">
                    Jornada de Níveis
                  </h2>
                  <p className="text-xs text-lavender/70 mt-0.5">
                    Sobe de nível a cada 20 acertos
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
