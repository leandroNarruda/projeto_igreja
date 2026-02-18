'use client'

import Ably from 'ably'

let client: Ably.Realtime | null = null

export function getAblyClient(): Ably.Realtime {
  if (!client) {
    client = new Ably.Realtime({
      authUrl: '/api/realtime/token',
      autoConnect: true,
    })
  }
  return client
}
