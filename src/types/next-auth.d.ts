import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id?: string
    isArchived?: boolean
  }

  interface Session {
    user: {
      id: string
      isArchived?: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    isArchived?: boolean
  }
}
