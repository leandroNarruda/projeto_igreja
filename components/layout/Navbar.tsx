'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'

export const Navbar = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: '/login',
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
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center h-12">
            <Image
              src="/images/logos/logo_192.png"
              alt="Logo"
              width={120}
              height={48}
              className="h-full w-auto object-contain"
              priority
            />
          </div>
          <span className="text-gray-700">
            Olá, {session.user?.name.split(' ')[0] || session.user?.email}
          </span>
          <IconButton
            icon={LogOut}
            variant="minimal"
            onClick={handleLogout}
            aria-label="Sair"
          />
        </div>
      </div>
    </nav>
  )
}
