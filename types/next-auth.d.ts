import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: number
      email: string
      name: string
      role: string
      socialName?: string | null
    }
  }

  interface User {
    id: number
    email: string
    name: string
    role: string
    socialName?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number
    role: string
  }
}
