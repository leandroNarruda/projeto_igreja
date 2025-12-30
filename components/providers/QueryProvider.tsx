'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto - dados considerados "frescos"
            gcTime: 5 * 60 * 1000, // 5 minutos - tempo de cache
            refetchOnWindowFocus: false, // não refetch ao focar na janela
            retry: 1, // tentar novamente apenas 1 vez em caso de erro
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
