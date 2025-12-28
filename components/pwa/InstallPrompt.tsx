'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Verifica se foi dispensado recentemente (7 dias)
    const dismissedTime = localStorage.getItem('pwa-install-dismissed')
    if (dismissedTime) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        return
      }
    }

    // Captura o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // Mostra o banner após 3 segundos
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    // Escuta quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      // Mostra o prompt de instalação
      await deferredPrompt.prompt()

      // Aguarda a escolha do usuário
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('Usuário aceitou instalar o app')
      } else {
        console.log('Usuário recusou instalar o app')
      }
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error)
    } finally {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Salva no localStorage para não mostrar novamente por 7 dias
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Não mostra se já está instalado ou se não há prompt disponível
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 animate-slide-up">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white/20 p-2 rounded-lg">
              <Download size={24} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base">
                Instale nosso app!
              </p>
              <p className="text-xs sm:text-sm text-white/90">
                Acesso rápido e melhor experiência
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white p-2 transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
