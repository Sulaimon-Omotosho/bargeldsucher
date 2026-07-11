'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function getDashboardDataAction() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const [errands, expenses] = await Promise.all([
    prisma.errand.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        expenses: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),

    prisma.expense.findMany({
      where: {
        errand: {
          userId: session.user.id,
        },
      },
      include: {
        errand: true,
      },
      orderBy: {
        expenseDate: 'desc',
      },
      take: 5,
    }),
  ])

  const totalFunding = errands.reduce(
    (sum, e) => sum + Number(e.amountReceived),
    0,
  )

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const currentBalance = totalFunding - totalExpenses

  const spendingRate =
    totalFunding === 0 ? 0 : (totalExpenses / totalFunding) * 100

  const averageFunding =
    errands.length === 0 ? 0 : totalFunding / errands.length

  const averageExpense =
    expenses.length === 0 ? 0 : totalExpenses / expenses.length

  const pendingErrands = errands.filter(
    (errand) => errand.expenses.length === 0,
  )
  const pendingErrandsCount = pendingErrands.length

  const activeErrands = errands.filter((errand) => errand.expenses.length > 0)
  const activeErrandsCount = activeErrands.length

  const largestExpense =
    expenses.length === 0
      ? null
      : expenses.reduce((largest, current) =>
          Number(current.amount) > Number(largest.amount) ? current : largest,
        )

  const errandTotals = errands.map((errand) => {
    const spent = errand.expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    )

    const remaining = Number(errand.amountReceived) - spent

    const percentageSpent =
      Number(errand.amountReceived) === 0
        ? 0
        : (spent / Number(errand.amountReceived)) * 100

    return {
      id: errand.id,
      title: errand.title,
      allocated: Number(errand.amountReceived),
      spent,
      remaining,
      percentageSpent,
      expenseCount: errand.expenses.length,
    }
  })

  const highestSpendingErrand =
    errandTotals.length === 0
      ? null
      : [...errandTotals].sort((a, b) => b.spent - a.spent)[0]

  const recentErrands = errands.slice(0, 5).map((errand) => ({
    id: errand.id,
    title: errand.title,
    amount: Number(errand.amountReceived),
    createdAt: errand.createdAt,
    expenseCount: errand.expenses.length,
  }))

  const recentActivities = expenses.slice(0, 5).map((expense) => ({
    id: expense.id,
    title: expense.description,
    amount: Number(expense.amount),
    vendor: expense.vendor,
    errandId: expense.errandId,
    errandTitle: expense.errand.title,
    date: expense.expenseDate,
  }))

  return {
    userProfile: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name:
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
        null,
      email: user.email,
      image: user.image,
    },

    stats: {
      currentBalance,
      totalFunding,
      totalExpenses,
      spendingRate,
      averageFunding,
      averageExpense,
      totalErrands: errands.length,
      totalExpensesLogged: expenses.length,
    },

    insights: {
      pendingErrands: pendingErrandsCount,
      activeErrands: activeErrandsCount,
      largestExpense: largestExpense
        ? {
            ...largestExpense,
            amount: Number(largestExpense.amount),
            errand: {
              ...largestExpense.errand,
              amountReceived: Number(largestExpense.errand.amountReceived),
            },
          }
        : null,
      highestSpendingErrand,
    },

    recentErrands,

    recentActivities,

    errandTotals,
  }
}
