'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export const Navbar = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: '/login'
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Força redirecionamento mesmo se houver erro
      router.push('/login')
      router.refresh()
    }
  }

  if (!session) {
    return null
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">Projeto Igreja</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Olá, {session.user?.name || session.user?.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

