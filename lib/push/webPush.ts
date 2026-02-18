import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT

if (publicKey && privateKey && subject) {
  webpush.setVapidDetails(subject, publicKey, privateKey)
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
  icon?: string
  badge?: string
  data?: Record<string, unknown>
}

function buildPayload(payload: PushPayload): string {
  return JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? '/',
    tag: payload.tag,
    icon: payload.icon ?? '/images/logos/logo_192.png',
    badge: payload.badge ?? '/images/logos/logo_96.png',
    data: payload.data,
  })
}

/**
 * Envia push para uma assinatura individual.
 * Retorna true se enviou, false se a assinatura era inválida (e foi removida).
 */
export async function sendToSubscription(
  subscriptionId: number,
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: PushPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      { endpoint, keys: { p256dh, auth } },
      buildPayload(payload)
    )
    return true
  } catch (error: any) {
    const statusCode = error?.statusCode
    if (statusCode === 404 || statusCode === 410) {
      console.log(
        `[push] Assinatura inválida (${statusCode}), removendo id=${subscriptionId}`
      )
      await prisma.webPushSubscription
        .delete({ where: { id: subscriptionId } })
        .catch(() => {})
      return false
    }
    console.error(
      `[push] Erro ao enviar para id=${subscriptionId}:`,
      error?.message ?? error
    )
    return false
  }
}

/**
 * Envia push para todos os inscritos (ou filtrados por userIds).
 */
export async function sendPushToUsers(
  payload: PushPayload,
  userIds?: number[]
): Promise<{ sent: number; failed: number; removed: number }> {
  const where = userIds?.length ? { userId: { in: userIds } } : {}

  const subscriptions = await prisma.webPushSubscription.findMany({ where })

  let sent = 0
  let failed = 0
  let removed = 0

  const results = await Promise.allSettled(
    subscriptions.map(async sub => {
      const ok = await sendToSubscription(
        sub.id,
        sub.endpoint,
        sub.p256dh,
        sub.auth,
        payload
      )
      if (ok) {
        sent++
      } else {
        const exists = await prisma.webPushSubscription
          .findUnique({ where: { id: sub.id } })
          .catch(() => null)
        if (!exists) removed++
        else failed++
      }
    })
  )

  console.log(
    `[push] Campanha enviada: ${sent} enviados, ${failed} erros, ${removed} removidos (total ${results.length})`
  )

  return { sent, failed, removed }
}
