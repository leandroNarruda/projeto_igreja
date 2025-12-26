import { useSession } from 'next-auth/react'

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export function usePermissions() {
  const { data: session } = useSession()

  const isAdmin = () => session?.user?.role === Role.ADMIN
  const hasRole = (role: Role) => session?.user?.role === role
  const hasAnyRole = (roles: Role[]) =>
    session?.user?.role && roles.includes(session.user.role as Role)

  return {
    role: session?.user?.role as Role | undefined,
    isAdmin: isAdmin(),
    hasRole,
    hasAnyRole,
  }
}
