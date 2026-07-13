'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function getDashboardDataAction() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  // Set time limits for today's calculations
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const [errands, expenses] = await Promise.all([
    prisma.errand.findMany({
      where: { userId: session.user.id },
      include: { expenses: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.expense.findMany({
      where: { errand: { userId: session.user.id } },
      include: { errand: true },
      orderBy: { expenseDate: 'desc' },
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

  const pendingErrandsCount = errands.filter(
    (e) => e.expenses.length === 0,
  ).length
  const activeErrandsCount = errands.filter((e) => e.expenses.length > 0).length

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
    return {
      id: errand.id,
      title: errand.title,
      allocated: Number(errand.amountReceived),
      spent,
      remaining: Number(errand.amountReceived) - spent,
      percentageSpent:
        Number(errand.amountReceived) === 0
          ? 0
          : (spent / Number(errand.amountReceived)) * 100,
      expenseCount: errand.expenses.length,
    }
  })

  // Calculate today's spent metrics safely inside the action
  const todaySpent = expenses
    .filter((e) => {
      const d = new Date(e.expenseDate)
      return d >= startOfToday && d <= endOfToday
    })
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const dailyLimit = 50000
  const dailyMetrics = {
    dailyLimit,
    todaySpent,
    remaining: dailyLimit - todaySpent,
    percentageSpent: Math.min((todaySpent / dailyLimit) * 100, 100),
  }

  const highestSpendingErrand =
    errandTotals.length === 0
      ? null
      : [...errandTotals].sort((a, b) => b.spent - a.spent)[0]

  const recentErrands = errands.slice(0, 5).map((e) => ({
    id: e.id,
    title: e.title,
    amount: Number(e.amountReceived),
    createdAt: e.createdAt,
    expenseCount: e.expenses.length,
  }))

  const recentActivities = expenses.slice(0, 5).map((e) => ({
    id: e.id,
    title: e.description,
    amount: Number(e.amount),
    vendor: e.vendor,
    errandId: e.errandId,
    errandTitle: e.errand.title,
    date: e.expenseDate,
    category: e.category,
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
    dailyMetrics,
    recentErrands,
    recentActivities,
    errandTotals,
  }
}
