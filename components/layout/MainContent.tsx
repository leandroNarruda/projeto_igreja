'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'
import { useQuizUI } from '@/components/providers/QuizUIProvider'

interface MainContentProps {
  children: ReactNode
}

export const MainContent = ({ children }: MainContentProps) => {
  const { data: session, status } = useSession()
  const { quizEmAndamento } = useQuizUI()
  const hasSessionLayout = !!session || status === 'loading'

  // Com quiz em andamento: sem padding (conteúdo ocupa tela inteira). Caso contrário, padding para navbar e footer fixos.
  const paddingClass =
    hasSessionLayout && !quizEmAndamento ? 'pt-16 pb-16' : 'pt-0 pb-0'

  return <main className={paddingClass}>{children}</main>
}
