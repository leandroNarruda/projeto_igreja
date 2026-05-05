'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'

const AUTH_ROUTES = ['/login', '/cadastro']
import { motion } from 'framer-motion'
import { Home, User, Settings, BookOpen } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { useQuizUI } from '@/components/providers/QuizUIProvider'

export const Footer = () => {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin } = usePermissions()
  const { quizEmAndamento } = useQuizUI()

  const isSessionLoading = status === 'loading'

  if (AUTH_ROUTES.includes(pathname) || (!session && !isSessionLoading)) {
    return null
  }

  const navigationItems: {
    label: string
    path: string
    icon: typeof Home
    external?: boolean
    badge?: string
  }[] = [
    {
      label: 'Home',
      path: '/home',
      icon: Home,
    },
    {
      label: 'Versinhos',
      path: '/versinhos',
      icon: BookOpen,
      badge: 'Novo',
    },
    {
      label: 'Perfil',
      path: '/perfil',
      icon: User,
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
      className="fixed bottom-0 left-0 right-0 bg-bg-card shadow-lg border-t border-primary/20 z-50"
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
                    isActive ? 'text-accent' : 'text-lavender hover:text-accent'
                  }
                `}
                aria-label={item.label}
                type="button"
              >
                {Icon ? (
                  <>
                    <div className="relative">
                      <Icon
                        size={24}
                        className={isActive ? 'text-accent' : 'text-lavender'}
                      />
                      {item.badge && (
                        <span className="absolute -top-1.5 -right-3 px-1.5 py-0.5 text-[9px] font-bold leading-none rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-white shadow-md ring-1 ring-white/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 font-medium ${isActive ? 'text-accent' : 'text-lavender'}`}
                    >
                      {item.label}
                    </span>
                  </>
                ) : null}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </motion.footer>
  )
}
