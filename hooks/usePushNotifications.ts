'use client'

import { useState, useEffect, useCallback } from 'react'

type PushState =
  | 'loading'
  | 'unsupported'
  | 'denied'
  | 'prompt'
  | 'subscribed'
  | 'unsubscribed'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; ++i) {
    view[i] = rawData.charCodeAt(i)
  }
  return buffer
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>('loading')
  const [error, setError] = useState<string | null>(null)

  const checkCurrentState = useCallback(async () => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      setState('unsupported')
      return
    }

    const permission = Notification.permission
    if (permission === 'denied') {
      setState('denied')
      return
    }

    const applyState = (
      registration: ServiceWorkerRegistration,
      perm: NotificationPermission
    ) => {
      registration.pushManager.getSubscription().then(subscription => {
        setState(
          subscription
            ? 'subscribed'
            : perm === 'granted'
              ? 'unsubscribed'
              : 'prompt'
        )
      }).catch(() => setState('prompt'))
    }

    let readyTimeout: ReturnType<typeof setTimeout> | undefined
    try {
      readyTimeout = setTimeout(() => setState('prompt'), 8000)
      const registration = await navigator.serviceWorker.ready
      clearTimeout(readyTimeout)
      applyState(registration, permission)
    } catch {
      clearTimeout(readyTimeout)
      setState('prompt')
    }
  }, [])

  useEffect(() => {
    checkCurrentState()
  }, [checkCurrentState])

  const subscribe = useCallback(async () => {
    setError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState('denied')
        return false
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        setError('Chave VAPID não configurada')
        return false
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })

      if (!response.ok) {
        throw new Error('Falha ao salvar assinatura no servidor')
      }

      setState('subscribed')
      return true
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao ativar notificações')
      return false
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    setError(null)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        await subscription.unsubscribe()
      }

      setState('unsubscribed')
      return true
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao desativar notificações')
      return false
    }
  }, [])

  return {
    state,
    error,
    isSupported: state !== 'unsupported',
    isSubscribed: state === 'subscribed',
    canSubscribe: state === 'prompt' || state === 'unsubscribed',
    subscribe,
    unsubscribe,
  }
}
