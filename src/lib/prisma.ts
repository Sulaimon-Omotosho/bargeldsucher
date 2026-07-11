// import { PrismaClient } from '@/generated/prisma/client'

// const globalForPrisma = globalThis as typeof globalThis & {
//   prisma?: PrismaClient
// }

// export const db = globalForPrisma.prisma ?? new PrismaClient()

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = db
// }
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

export const prisma = new PrismaClient({ adapter })
