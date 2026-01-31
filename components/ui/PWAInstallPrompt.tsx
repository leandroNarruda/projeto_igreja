'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'

const STORAGE_KEY = 'pwa-install-dismissed'
const DISMISS_DAYS = 7
const isDev = process.env.NODE_ENV === 'development'

function debug(...args: unknown[]) {
  if (isDev) {
    console.log('[PWA Install]', ...args)
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function wasDismissedRecently(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const date = new Date(raw)
    const now = new Date()
    const days = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    return days < DISMISS_DAYS
  } catch {
    return false
  }
}

function setDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
  } catch {}
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true ||
    document.referrer.includes('android-app://')
  )
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installing, setInstalling] = useState(false)

  const checkInstalled = useCallback(async () => {
    const standalone = isStandalone()
    debug('standalone?', standalone)
    if (standalone) {
      setIsInstalled(true)
      debug('considerado instalado (standalone)')
      return
    }
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const nav = navigator as Navigator & {
          getInstalledRelatedApps(): Promise<unknown[]>
        }
        const apps = await nav.getInstalledRelatedApps()
        debug('getInstalledRelatedApps:', apps?.length ?? 0, apps)
        if (apps && apps.length > 0) {
          setIsInstalled(true)
          debug('considerado instalado (getInstalledRelatedApps)')
        }
      } catch (e) {
        debug('getInstalledRelatedApps erro:', e)
      }
    } else {
      debug('getInstalledRelatedApps não disponível')
    }
  }, [])

  useEffect(() => {
    checkInstalled()
  }, [checkInstalled])

  useEffect(() => {
    const dismissed = wasDismissedRecently()
    debug('effect: isInstalled=', isInstalled, 'dismissed recente=', dismissed)
    if (isInstalled) {
      debug('não escutando beforeinstallprompt (já instalado)')
      return
    }
    if (dismissed) {
      debug(
        'não escutando beforeinstallprompt (usuário dispensou nos últimos 7 dias)'
      )
      return
    }

    debug('escutando evento beforeinstallprompt...')
    const handleBeforeInstallPrompt = (e: Event) => {
      debug('beforeinstallprompt recebido!')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
    }
  }, [isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
        setDeferredPrompt(null)
      }
    } catch {
      // usuário cancelou ou erro
    } finally {
      setInstalling(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed()
  }

  const shouldShow = showPrompt && deferredPrompt && !isInstalled
  if (isDev && (showPrompt || deferredPrompt)) {
    debug('shouldShow=', shouldShow, {
      showPrompt,
      hasPrompt: !!deferredPrompt,
      isInstalled,
    })
  }

  useEffect(() => {
    if (shouldShow) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [shouldShow])

  return (
    <AnimatePresence>
      {shouldShow && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={handleDismiss}
            aria-hidden
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-sm w-full p-6 pointer-events-auto border border-gray-200 dark:border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <img
                  src="/images/logos/logo_192.png"
                  alt=""
                  className="w-16 h-16 rounded-2xl"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Instalar aplicativo
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-6">
                Instale o Bom de lição no seu dispositivo para acesso rápido e
                uso offline.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full py-2"
                >
                  {installing ? 'Abrindo...' : 'Instalar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="w-full py-2"
                >
                  Agora não
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
