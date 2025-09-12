import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role?: string
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Verificar contra las credenciales del .env
        if (credentials.email === process.env.LOGIN_EMAIL && 
            credentials.password === process.env.LOGIN_PASSWORD) {
          
          // Buscar o crear el usuario en la base de datos
          let user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: 'Usuario Principal',
                role: 'user'
              }
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || 'Usuario',
            role: user.role,
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}