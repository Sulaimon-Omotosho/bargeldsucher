// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { auth } from '@/auth'

// export async function GET() {
//   try {
//     const session = await auth()
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const startOfToday = new Date()
//     startOfToday.setHours(0, 0, 0, 0)

//     const endOfToday = new Date()
//     endOfToday.setHours(23, 59, 59, 999)

//     // Fetch the user's data from DB
//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//       include: {
//         errands: {
//           include: {
//             expenses: true,
//           },
//         },
//       },
//     })

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 })
//     }

//     // 1. Calculate Today's Income (Errands funded today)
//     const todayIncome = user.errands
//       .filter((errand) => {
//         const createdAt = new Date(errand.createdAt)
//         return createdAt >= startOfToday && createdAt <= endOfToday
//       })
//       .reduce((acc, curr) => acc + Number(curr.amountReceived), 0)

//     // 2. Calculate Today's Expenses (Spent today)
//     const todayExpenses = user.errands
//       .flatMap((e) => e.expenses)
//       .filter((expense) => {
//         const expenseDate = new Date(expense.expenseDate)
//         return expenseDate >= startOfToday && expenseDate <= endOfToday
//       })

//     const todaySpent = todayExpenses.reduce(
//       (acc, curr) => acc + Number(curr.amount),
//       0,
//     )
//     const todayTransactionsCount = todayExpenses.length

//     // 3. Current Total Remaining Cash across all active loops
//     const totalAllTimeFunding = user.errands.reduce(
//       (acc, curr) => acc + Number(curr.amountReceived),
//       0,
//     )
//     const totalAllTimeSpent = user.errands
//       .flatMap((e) => e.expenses)
//       .reduce((acc, curr) => acc + Number(curr.amount), 0)
//     const remainingCash = totalAllTimeFunding - totalAllTimeSpent

//     return NextResponse.json({
//       todayIncome,
//       todaySpent,
//       todayTransactionsCount,
//       remainingCash,
//     })

//   } catch (error) {
//     console.error('Dashboard API Error:', error)
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 },
//     )
//   }
// }

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        errands: {
          include: { expenses: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 1. Calculate Today's Income
    const todayIncome = user.errands
      .filter((errand) => {
        const createdAt = new Date(errand.createdAt)
        return createdAt >= startOfToday && createdAt <= endOfToday
      })
      .reduce((acc, curr) => acc + Number(curr.amountReceived), 0)

    // 2. Calculate Today's Expenses
    const todayExpenses = user.errands
      .flatMap((e) => e.expenses)
      .filter((expense) => {
        const expenseDate = new Date(expense.expenseDate)
        return expenseDate >= startOfToday && expenseDate <= endOfToday
      })

    const todaySpent = todayExpenses.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    )
    const todayTransactionsCount = todayExpenses.length

    // 3. Current All-Time Remaining Balance Metrics
    const totalAllTimeFunding = user.errands.reduce(
      (acc, curr) => acc + Number(curr.amountReceived),
      0,
    )
    const totalAllTimeSpent = user.errands
      .flatMap((e) => e.expenses)
      .reduce((acc, curr) => acc + Number(curr.amount), 0)
    const remainingCash = totalAllTimeFunding - totalAllTimeSpent

    // 4. Calculate Structural Daily Spending Budget Metrics
    const dailyLimit = 5000
    const dailyMetrics = {
      dailyLimit,
      todaySpent,
      remaining: dailyLimit - todaySpent,
      percentageSpent: Math.min((todaySpent / dailyLimit) * 100, 100),
    }

    return NextResponse.json({
      todayIncome,
      todaySpent,
      todayTransactionsCount,
      remainingCash,
      dailyMetrics, // Outflow delivery mapped
    })
  } catch (error) {
    console.error('Dashboard Today API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
