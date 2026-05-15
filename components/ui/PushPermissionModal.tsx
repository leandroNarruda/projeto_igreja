'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { usePushNotifications } from '@/hooks/usePushNotifications'

const DISMISSED_KEY = 'push-permission-dismissed'

interface PushPermissionModalProps {
  blocked?: boolean
}

export const PushPermissionModal: React.FC<PushPermissionModalProps> = ({
  blocked = false,
}) => {
  const { state, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(true)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDismissed(sessionStorage.getItem(DISMISSED_KEY) === '1')
    }
  }, [])

  const shouldShow =
    !blocked && !dismissed && (state === 'prompt' || state === 'unsubscribed')

  useEffect(() => {
    if (shouldShow) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [shouldShow])

  const handleSubscribe = async () => {
    setSubscribing(true)
    await subscribe()
    setSubscribing(false)
  }

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-[9998]"
            aria-hidden
          />
          <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-bg-card border border-primary/40 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-labelledby="push-modal-title"
              aria-modal="true"
            >
              <div className="p-6 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-primary"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                </div>

                <h2
                  id="push-modal-title"
                  className="text-xl font-bold text-accent text-center"
                >
                  Ativar notificações
                </h2>

                <p className="text-lavender text-center text-sm leading-relaxed">
                  {state === 'unsubscribed'
                    ? 'Sua assinatura de notificações expirou. Reative para continuar recebendo avisos importantes da igreja.'
                    : 'Receba avisos importantes da igreja diretamente no seu celular — novos quizzes, eventos e mais.'}
                </p>

                <div className="flex flex-col gap-3 w-full mt-2">
                  <Button
                    className="w-full py-3"
                    onClick={handleSubscribe}
                    disabled={subscribing}
                  >
                    {subscribing ? 'Ativando...' : 'Ativar notificações'}
                  </Button>
                  <button
                    onClick={handleDismiss}
                    className="text-lavender text-sm text-center hover:text-accent transition-colors py-1"
                  >
                    Agora não
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
