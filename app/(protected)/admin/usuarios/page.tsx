'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { PageTransition } from '@/components/layout/PageTransition'
import { Modal } from '@/components/ui/Modal'
import {
  useAdminUsersList,
  useDeletarUsuarioAdmin,
  type AdminUser,
} from '@/hooks/useAdminUsers'

const LIMIT = 20

export default function AdminUsuariosPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const { data, isLoading, isError, error } = useAdminUsersList(page, LIMIT)
  const deletarMutation = useDeletarUsuarioAdmin()

  useEffect(() => {
    if (isError) {
      const msg = error instanceof Error ? error.message : 'Erro ao carregar'
      if (msg === 'Acesso negado') {
        alert('Acesso negado. Apenas administradores podem acessar.')
        router.push('/home')
      } else {
        alert(msg)
      }
    }
  }, [isError, error, router])

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    try {
      await deletarMutation.mutateAsync(userToDelete.id)
      setUserToDelete(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir usuário')
    }
  }

  if (isLoading) {
    return <Loading />
  }

  const users = data?.users ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.total ?? 0

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Gerenciar usuários
          </h1>

          {users.length === 0 ? (
            <p className="text-gray-600">Nenhum usuário cadastrado.</p>
          ) : (
            <>
              <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        E-mail
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Igreja
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Perfil
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.name}
                          {user.social_name && (
                            <span className="text-gray-500 block text-xs">
                              {user.social_name}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.igreja ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.role}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/usuarios/${user.id}`}>
                              <Button variant="outline" className="gap-1">
                                <Pencil className="w-4 h-4" />
                                Editar
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => setUserToDelete(user)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Total: {total} usuário(s)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Anterior
                    </Button>
                    <span className="px-2 py-1 text-sm text-gray-700">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          <Modal
            isOpen={userToDelete !== null}
            onClose={() => !deletarMutation.isPending && setUserToDelete(null)}
            onConfirm={handleConfirmDelete}
            title="Excluir usuário"
            message={
              userToDelete
                ? `Tem certeza que deseja excluir o usuário "${userToDelete.name}" (${userToDelete.email})? Esta ação não pode ser desfeita.`
                : ''
            }
            confirmText={deletarMutation.isPending ? 'Excluindo...' : 'Excluir'}
            cancelText="Cancelar"
            confirmDisabled={deletarMutation.isPending}
          />
        </div>
      </div>
    </PageTransition>
  )
}
