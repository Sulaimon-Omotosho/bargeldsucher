'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import type { CreateExpenseInput, Expense } from '@/types/types'

export async function getAllExpensesAction(): Promise<Expense[]> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const expenses = await prisma.expense.findMany({
    where: { errand: { userId: session.user.id } },
    include: { errand: true },
    orderBy: { expenseDate: 'desc' },
  })

  return expenses.map((exp) => ({
    ...exp,
    amount: Number(exp.amount),
    errand: {
      ...exp.errand,
      amountReceived: Number(exp.errand.amountReceived),
    },
  }))
}

export async function getSelectableErrandsAction(searchTerm?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const now = new Date()
  const cutoffDate = new Date()

  // Set temporal boundary based on active interaction profile
  if (searchTerm && searchTerm.trim()) {
    cutoffDate.setDate(now.getDate() - 30) // Search looks back 1 month
  } else {
    cutoffDate.setDate(now.getDate() - 7) // Default dropdown list looks back 1 week
  }

  const errands = await prisma.errand.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: cutoffDate },
      ...(searchTerm
        ? {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      amountReceived: true,
    },
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
  })

  return errands.map((errand) => ({
    ...errand,
    amountReceived: Number(errand.amountReceived),
  }))
}

export async function createExpenseAction(data: CreateExpenseInput) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const expense = await prisma.expense.create({
    data: {
      description: data.description,
      amount: data.amount,
      category: data.category,
      vendor: data.vendor || null,
      receiptUrl: data.receiptUrl || null,
      expenseDate: new Date(data.expenseDate),
      errandId: data.errandId,
    },
  })

  return {
    ...expense,
    amount: Number(expense.amount),
  }
}
