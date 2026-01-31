import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { getServerSession as getServerSessionNextAuth } from 'next-auth/next'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // Não usar adapter com CredentialsProvider + JWT strategy
  // adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('[AUTH] Email ou senha não fornecidos')
            return null
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          if (!user) {
            console.error('[AUTH] Usuário não encontrado:', credentials.email)
            return null
          }

          if (!user.password) {
            console.error('[AUTH] Usuário sem senha:', credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.error('[AUTH] Senha inválida para:', credentials.email)
            return null
          }

          console.log('[AUTH] Login bem-sucedido:', {
            userId: user.id,
            email: user.email,
          })

          return {
            id: user.id, // Sempre number do Prisma
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('[AUTH] Erro no authorize:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      try {
        // Quando o usuário faz login, atualizar o token
        if (user) {
          token.id = user.id as number // Sempre number do tipo User
          token.role = user.role
          console.log('[AUTH] JWT: Token atualizado:', {
            id: token.id,
            role: token.role,
          })
        }
        // Se o token não tiver role, buscar do banco (para atualizar tokens antigos)
        if (!token.role && token.id) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id }, // Sempre number
              select: { role: true },
            })
            if (dbUser) {
              token.role = dbUser.role
            }
          } catch (error) {
            console.error('[AUTH] Erro ao buscar role do usuário:', error)
          }
        }
        return token
      } catch (error) {
        console.error('[AUTH] Erro no callback JWT:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token.id) {
          session.user.id = token.id // Sempre number
          session.user.role = (token.role as string) || 'USER'
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { social_name: true },
          })
          session.user.socialName = dbUser?.social_name ?? null
        }
        return session
      } catch (error) {
        console.error('[AUTH] Erro no callback session:', error)
        return session
      }
    },
  },
  events: {
    async signOut() {
      // Limpar sessão ao fazer logout
    },
  },
}

// Helper function para obter sessão no servidor (NextAuth v4)
export async function getServerSession() {
  return await getServerSessionNextAuth(authOptions)
}
