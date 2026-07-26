import NextAuth from 'next-auth'
import authConfig from './auth.config'

import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'jwt',
    maxAge: 3 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  ...authConfig,

  providers: [
    ...authConfig.providers,

    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        })

        if (!user) {
          return null
        }

        if (!user.password) {
          throw new Error(
            'This account uses Google Sign-In. Please continue with Google.',
          )
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        )

        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        })

        if (dbUser && dbUser.name && (!dbUser.firstName || !dbUser.lastName)) {
          const names = dbUser.name.trim().split(/\s+/)

          const firstName = names.shift() ?? ''
          const lastName = names.join(' ')

          await prisma.user.update({
            where: {
              id: dbUser.id,
            },
            data: {
              firstName,
              lastName,
            },
          })
        }
      }

      return true
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        // token.isArchived = user.isArchived
        if (typeof user.isArchived !== 'undefined') {
          token.isArchived = user.isArchived
        } else if (user.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isArchived: true },
          })
          token.isArchived = dbUser?.isArchived ?? false
        }
      }

      if (trigger === 'update' && session) {
        return { ...token, ...session }
      }
      return token
    },

    async session({ session, token }) {
      // if (session.user && token.id) {
      //   ;(session.user as any).id = token.id
      //   // session.user.id = token.id as string
      // }
      // if (session.user && token.id) {
      //   ;(((session.user as any).id = token.id),
      //     ((session.user as any).isArchived = token.isArchived as boolean))
      // }
      if (session.user) {
        session.user.id = token.id as string
        session.user.isArchived = token.isArchived as boolean
      }

      return session
    },
  },
})
