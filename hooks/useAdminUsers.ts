import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface AdminUser {
  id: number
  name: string
  email: string
  social_name: string | null
  igreja: string | null
  role: string
  createdAt: string
}

export interface AdminUsersListResponse {
  users: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AdminUserUpdatePayload {
  name?: string
  email?: string
  social_name?: string | null
  igreja?: string | null
  password?: string
}

/**
 * Lista usuários (admin) com paginação opcional
 */
export function useAdminUsersList(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin', 'users', page, limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/users?page=${page}&limit=${limit}`
      )
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Acesso negado')
        }
        throw new Error('Erro ao listar usuários')
      }
      return response.json() as Promise<AdminUsersListResponse>
    },
  })
}

/**
 * Busca um usuário por ID (admin)
 */
export function useAdminUser(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      if (id === null) return null
      const response = await fetch(`/api/admin/users/${id}`)
      if (!response.ok) {
        if (response.status === 403) throw new Error('Acesso negado')
        if (response.status === 404) throw new Error('Usuário não encontrado')
        throw new Error('Erro ao buscar usuário')
      }
      return response.json() as Promise<AdminUser>
    },
    enabled: id !== null,
  })
}

/**
 * Atualiza um usuário (admin)
 */
export function useAtualizarUsuarioAdmin(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AdminUserUpdatePayload) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error ?? 'Erro ao atualizar usuário')
      }
      return json as AdminUser
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] })
    },
  })
}

/**
 * Exclui um usuário (admin)
 */
export function useDeletarUsuarioAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error ?? 'Erro ao excluir usuário')
      }
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}
