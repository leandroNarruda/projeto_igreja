'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Calendar, User, HelpCircle } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

export const Footer = () => {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin } = usePermissions()

  if (!session) {
    return null
  }

  const navigationItems = [
    {
      label: 'Home',
      path: '/home',
      icon: Home,
    },
    isAdmin
      ? {
          label: 'Quiz',
          path: '/quiz',
          icon: HelpCircle,
        }
      : {
          label: 'Eventos',
          path: '/eventos',
          icon: Calendar,
        },
    {
      label: 'Perfil',
      path: '/perfil',
      icon: User,
    },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto">
        <nav className="flex justify-around items-center h-16">
          {navigationItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.path

            return (
              <button
                key={item.path}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Footer - Botão clicado:', item.label, item.path)
                  handleNavigation(item.path)
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
                <Icon
                  size={24}
                  className={isActive ? 'text-blue-600' : 'text-gray-600'}
                />
                <span
                  className={`text-xs mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </footer>
  )
}
