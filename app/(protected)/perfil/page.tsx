'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { Camera, LogOut } from 'lucide-react'

function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function PerfilPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

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
      router.push('/login')
      router.refresh()
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Erro ao enviar foto. Tente novamente.')
        return
      }

      await update()
    } catch {
      setError('Erro ao enviar foto. Tente novamente.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (status === 'loading' || !session) {
    return null
  }

  const initials = getInitials(session.user?.name)

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Perfil</h1>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Informações Pessoais
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="Avatar"
                          className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div
                          className="h-24 w-24 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600"
                          aria-hidden
                        >
                          {initials}
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={uploading}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 rounded-full bg-gray-800 text-white p-1.5 shadow hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Alterar foto"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Foto de perfil
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        {uploading ? 'Enviando…' : 'Alterar foto'}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Nome:</span>
                    <p className="text-gray-900 font-medium">
                      {session.user?.name}
                    </p>
                  </div>
                  {session.user?.socialName && (
                    <div>
                      <span className="text-sm text-gray-600">
                        Como quer ser chamado:
                      </span>
                      <p className="text-gray-900 font-medium">
                        {session.user.socialName}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="text-gray-900 font-medium">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Configurações
                </h2>
                <p className="text-gray-600 mb-4">
                  Em breve você poderá gerenciar suas configurações aqui.
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  Sair da conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
