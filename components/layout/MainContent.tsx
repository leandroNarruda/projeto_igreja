'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

interface MainContentProps {
  children: ReactNode
}

export const MainContent = ({ children }: MainContentProps) => {
  const { data: session } = useSession()
  // Aplica padding bottom apenas se houver sessão (Footer visível)
  const paddingClass = session ? 'pb-16' : 'pb-0'

  return <main className={paddingClass}>{children}</main>
}
