'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Home, Calendar, BookOpen, User, Settings } from 'lucide-react'
import { useQuizUI } from '@/components/providers/QuizUIProvider'
import { usePermissions } from '@/hooks/usePermissions'

const NAV_ITEMS = [
  { label: 'Home', path: '/home', icon: Home },
  { label: 'Eventos', path: '/eventos', icon: Calendar },
  {
    label: 'Minha ES',
    path: 'https://es.minhaes.org/quizgeral/2/633509E6-457A-4302-9D56-46CC7523CFE5',
    icon: BookOpen,
    external: true,
  },
  { label: 'Perfil', path: '/perfil', icon: User },
]

export const SideDrawer = () => {
  const { data: session, status } = useSession()
  const { drawerAberto, setDrawerAberto, quizEmAndamento } = useQuizUI()
  const { isAdmin } = usePermissions()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setDrawerAberto(false)
  }, [pathname, setDrawerAberto])

  useEffect(() => {
    if (quizEmAndamento) setDrawerAberto(false)
  }, [quizEmAndamento, setDrawerAberto])

  if ((!session && status !== 'loading') || quizEmAndamento) return null

  const items = [
    ...NAV_ITEMS,
    ...(isAdmin && status !== 'loading'
      ? [{ label: 'Admin', path: '/admin', icon: Settings, external: false }]
      : []),
  ]

  const handleNav = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer')
      setDrawerAberto(false)
      return
    }
    router.push(path)
  }

  return (
    <AnimatePresence>
      {drawerAberto && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setDrawerAberto(false)}
            aria-hidden
          />

          {/* Drawer */}
          <motion.aside
            className="fixed top-0 left-0 h-full w-[75vw] max-w-[280px] z-[70] bg-bg-card border-r border-primary/20 shadow-2xl flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-primary/20">
              <span className="text-accent font-semibold text-sm">Menu</span>
              <button
                onClick={() => setDrawerAberto(false)}
                className="text-lavender hover:text-accent transition-colors p-1"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto">
              {items.map(item => {
                const Icon = item.icon
                const isActive = item.external
                  ? false
                  : item.path === '/admin'
                    ? pathname === '/admin' || pathname.startsWith('/admin/')
                    : pathname === item.path

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path, item.external)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors
                      ${isActive ? 'text-accent bg-primary/10' : 'text-lavender hover:text-accent hover:bg-primary/5'}`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {item.external && (
                      <span className="ml-auto text-xs text-lavender/50">↗</span>
                    )}
                    {isActive && (
                      <div className="ml-auto w-1 h-5 bg-accent rounded-full" />
                    )}
                  </button>
                )
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
