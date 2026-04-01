'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Home, Calendar, User, Settings } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { useQuizUI } from '@/components/providers/QuizUIProvider'

export const Footer = () => {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin } = usePermissions()
  const { quizEmAndamento } = useQuizUI()

  const isSessionLoading = status === 'loading'

  if (!session && !isSessionLoading) {
    return null
  }

  const navigationItems = [
    {
      label: 'Home',
      path: '/home',
      icon: Home,
    },
    {
      label: 'Eventos',
      path: '/eventos',
      icon: Calendar,
    },
    {
      label: 'Perfil',
      path: '/perfil',
      icon: User,
    },
    {
      label: 'Minha ES',
      path: 'https://es.minhaes.org/quizgeral/2/633509E6-457A-4302-9D56-46CC7523CFE5',
      external: true,
      imageSrc: '/images/logo-minha-es.png',
    },
    ...(isAdmin && !isSessionLoading
      ? [
          {
            label: 'Admin',
            path: '/admin',
            icon: Settings,
          },
        ]
      : []),
  ]

  const handleNavigation = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer')
      return
    }

    router.push(path)
  }

  return (
    <motion.footer
      className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50"
      initial={false}
      animate={{ y: quizEmAndamento ? '100%' : 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="max-w-7xl mx-auto">
        <nav className="flex justify-around items-center h-16">
          {navigationItems.map(item => {
            const Icon = item.icon
            const isActive = item.external
              ? false
              : item.path === '/admin'
                ? pathname === '/admin' || pathname.startsWith('/admin/')
                : pathname === item.path

            return (
              <button
                key={item.path}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleNavigation(item.path, item.external)
                }}
                className={`
                  relative flex flex-col items-center justify-center
                  flex-1 h-full
                  transition-all duration-200
                  ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
                aria-label={item.label}
                type="button"
              >
                {item.imageSrc ? (
                  <Image
                    src={item.imageSrc}
                    alt=""
                    width={110}
                    height={30}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <>
                    <Icon
                      size={24}
                      className={isActive ? 'text-blue-600' : 'text-gray-600'}
                    />
                    <span
                      className={`text-xs mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </motion.footer>
  )
}
