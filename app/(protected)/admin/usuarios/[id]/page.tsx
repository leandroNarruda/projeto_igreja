'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  useAdminUser,
  useAtualizarUsuarioAdmin,
  type AdminUserUpdatePayload,
} from '@/hooks/useAdminUsers'

export default function AdminUsuarioEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null
  const validId = id !== null && !Number.isNaN(id) ? id : null

  const { data: user, isLoading, isError, error } = useAdminUser(validId)
  const updateMutation = useAtualizarUsuarioAdmin(validId ?? 0)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [socialName, setSocialName] = useState('')
  const [igreja, setIgreja] = useState('')
  const [password, setPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setSocialName(user.social_name ?? '')
      setIgreja(user.igreja ?? '')
    }
  }, [user])

  useEffect(() => {
    if (isError) {
      const msg = error instanceof Error ? error.message : 'Erro ao carregar'
      if (msg === 'Acesso negado') {
        alert('Acesso negado.')
        router.push('/home')
      } else if (msg === 'Usuário não encontrado') {
        router.push('/admin/usuarios')
      } else {
        alert(msg)
      }
    }
  }, [isError, error, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (validId === null) return

    const payload: AdminUserUpdatePayload = {
      name: name.trim(),
      email: email.trim(),
      social_name: socialName.trim() || null,
      igreja: igreja.trim() || null,
    }
    if (password.trim()) {
      payload.password = password.trim()
    }

    try {
      await updateMutation.mutateAsync(payload)
      setSuccess(true)
      setPassword('')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  if (validId === null) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8 px-4">
          <p className="text-gray-600">ID inválido.</p>
          <Link
            href="/admin/usuarios"
            className="text-blue-600 underline mt-2 inline-block"
          >
            Voltar à lista
          </Link>
        </div>
      </PageTransition>
    )
  }

  if (isLoading || !user) {
    return <Loading />
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Editar usuário
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white p-6 rounded-lg shadow border border-gray-200"
          >
            {success && (
              <p className="text-green-600 text-sm font-medium">
                Usuário atualizado com sucesso.
              </p>
            )}
            {submitError && (
              <p className="text-red-600 text-sm font-medium">{submitError}</p>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="social_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome social
              </label>
              <input
                id="social_name"
                type="text"
                value={socialName}
                onChange={e => setSocialName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="igreja"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Igreja
              </label>
              <input
                id="igreja"
                type="text"
                value={igreja}
                onChange={e => setIgreja(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nova senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Deixar em branco para não alterar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
              <Link href="/admin/usuarios">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}
