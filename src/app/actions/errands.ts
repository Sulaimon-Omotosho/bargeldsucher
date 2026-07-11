'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import type { Errand } from '@/types/types'

// Fetcher Action
export async function getErrandsAction(): Promise<Errand[]> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const errands = await prisma.errand.findMany({
    where: { userId: session.user.id },
    include: { expenses: true },
    orderBy: { createdAt: 'desc' },
  })

  return errands.map((errand) => ({
    ...errand,
    amountReceived: Number(errand.amountReceived),
    expenses: errand.expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
    })),
  }))
}

export async function getErrandAction(id: string): Promise<Errand | null> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const errand = await prisma.errand.findUnique({
    where: { id, userId: session.user.id },
    include: { expenses: true },
  })

  if (!errand) return null

  return {
    ...errand,
    amountReceived: Number(errand.amountReceived),
    expenses: errand.expenses.map((exp) => ({
      ...exp,
      amount: Number(exp.amount),
    })),
  }
}

// Mutator Action
export async function createErrandAction(data: {
  title: string
  description?: string
  amountReceived: number
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const errand = await prisma.errand.create({
    data: {
      title: data.title,
      description: data.description,
      amountReceived: data.amountReceived,
      userId: session.user.id,
    },
  })

  return {
    ...errand,
    amountReceived: Number(errand.amountReceived),
  }
}
