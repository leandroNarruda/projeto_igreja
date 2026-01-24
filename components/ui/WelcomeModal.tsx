'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
}) => {
  // Prevenir scroll do body quando modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Converter URL do YouTube Shorts para formato embed
  const getEmbedUrl = (url: string): string => {
    // Se já for um link embed, retornar como está
    if (url.includes('/embed/')) {
      return url
    }

    // Extrair ID do vídeo de diferentes formatos
    let videoId = ''

    // Formato: https://www.youtube.com/shorts/VIDEO_ID
    if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1]?.split('?')[0] || ''
    }
    // Formato: https://www.youtube.com/watch?v=VIDEO_ID
    else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0] || ''
    }
    // Formato: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }

    return url
  }

  const embedUrl = getEmbedUrl(videoUrl)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-[9999]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full relative overflow-hidden max-h-[calc(100vh-2rem)] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Botão de fechar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                aria-label="Fechar modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Conteúdo do modal */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Bem-vindo! 🎉
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                  Assista ao vídeo de boas-vindas
                </p>

                {/* Player de vídeo */}
                <div
                  className="relative w-full"
                  style={{ aspectRatio: '9/16' }}
                >
                  <iframe
                    src={embedUrl}
                    title="Vídeo de boas-vindas"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-lg"
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
