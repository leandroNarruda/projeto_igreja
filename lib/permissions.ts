import { getServerSession } from "./auth"

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}

export async function getCurrentUserRole() {
  const session = await getServerSession()
  return session?.user?.role || Role.USER
}

export async function isAdmin() {
  const role = await getCurrentUserRole()
  return role === Role.ADMIN
}

export async function hasRole(requiredRole: Role) {
  const role = await getCurrentUserRole()
  return role === requiredRole
}

export async function hasAnyRole(roles: Role[]) {
  const role = await getCurrentUserRole()
  return roles.includes(role as Role)
}

