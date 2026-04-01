'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useQuizUI } from '@/components/providers/QuizUIProvider'

function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export const Navbar = () => {
  const { data: session, status } = useSession()
  const { quizEmAndamento } = useQuizUI()
  const isSessionLoading = status === 'loading'

  if (!session && !isSessionLoading) {
    return null
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md"
      initial={false}
      animate={{ y: quizEmAndamento ? '-100%' : 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center h-16">
            <Image
              src="/images/logos/logo_192.png"
              alt="Logo"
              width={160}
              height={56}
              className="h-full w-auto object-contain"
              priority
            />
          </div>
          {isSessionLoading ? (
            <div className="flex items-center gap-3" aria-hidden>
              <span className="text-gray-700 flex items-center gap-2">
                <span>Olá,</span>
                <span className="h-5 w-24 rounded bg-gray-200 animate-pulse inline-block" />
              </span>
              <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
            </div>
          ) : (
            <>
              <span className="text-gray-700">
                Olá,{' '}
                {session?.user?.name?.split(' ')[0] || session?.user?.email}
              </span>
              <Link
                href="/perfil"
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                aria-label="Ir para perfil"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover border border-gray-200"
                    unoptimized
                  />
                ) : (
                  <div
                    className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                    aria-hidden
                  >
                    {getInitials(session?.user?.name)}
                  </div>
                )}
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
