import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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

    // Calculate Metrics & Reductions
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

    // DYNAMIC TOP CATEGORY CALCULATION
    const categoryTotals: Record<string, number> = {}
    expenses.forEach((exp) => {
      const cat = exp.category || 'OTHER'
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount)
    })
    let topCategoryName = 'OTHER'
    let topCategoryAmount = 0
    let topCategoryPercentage = 0

    const sortedCategories = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    )
    if (sortedCategories.length > 0) {
      topCategoryName = sortedCategories[0][0]
      topCategoryAmount = sortedCategories[0][1]
      topCategoryPercentage =
        totalExpenses > 0
          ? Math.round((topCategoryAmount / totalExpenses) * 100)
          : 0
    }

    // OVERALL BUDGET & DONUT BREAKDOWN CALCULATIONS
    const overallBudget = {
      allocated: totalFunding,
      spent: totalExpenses,
      remaining: currentBalance,
      percentageSpent: Math.min(spendingRate, 100),
    }

    const breakdown = Object.entries(categoryTotals).map(
      ([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }),
    )

    // --- 3. DYNAMIC SAVINGS OPPORTUNITY REAL-TIME ENGINE ---
    let insightText = 'Your spending parameters remain fully healthy this week.'
    let potentialSavings = 0

    if (topCategoryPercentage > 30 && topCategoryName !== 'OTHER') {
      const displayLabel =
        topCategoryName.charAt(0) + topCategoryName.slice(1).toLowerCase()
      insightText = `${displayLabel} spending is representing ${topCategoryPercentage}% of your active ledger. Cutting back could yield fast recovery.`
      potentialSavings = Math.round(topCategoryAmount * 0.15)
    } else if (spendingRate > 80) {
      insightText =
        'Your active funding pools are nearly 80% drained. Restricting miscellaneous operations is highly advised.'
      potentialSavings = Math.round(currentBalance * 0.25)
    }

    // AND
    const pendingErrandsCount = errands.filter(
      (e) => e.expenses.length === 0,
    ).length
    const activeErrandsCount = errands.filter(
      (e) => e.expenses.length > 0,
    ).length

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

    // Calculate dynamic live daily spending limit telemetry
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
      category: e.category || 'OTHER',
    }))

    const safeBufferPercentage =
      totalFunding > 0
        ? Math.max(0, Math.round((currentBalance / totalFunding) * 100))
        : 0

    // DYNAMIC HISTORICAL MONTH-OVER-MONTH TRENDS ENGINE
    const trendMap: Record<string, number> = {}
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    // Initialize the past 6 months with 0 balances so the line graph never breaks
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const mName = monthNames[d.getMonth()]
      trendMap[mName] = 0
    }

    // Map real database transaction entries directly to their respective month slots
    expenses.forEach((exp) => {
      const expDate = new Date(exp.expenseDate)
      const mName = monthNames[expDate.getMonth()]
      if (trendMap[mName] !== undefined) {
        trendMap[mName] += Number(exp.amount)
      }
    })

    const trend = Object.entries(trendMap).map(([month, amount]) => ({
      month,
      amount,
    }))

    // Return standard JSON envelope payload directly to your client hooks
    return NextResponse.json({
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
        safeBufferPercentage,
        averageFunding,
        averageExpense,
        totalErrands: errands.length,
        totalExpensesLogged: expenses.length,
      },
      topCategory: {
        name: topCategoryName,
        amount: topCategoryAmount,
        percentage: topCategoryPercentage,
      },
      overallBudget,
      savingsOpportunity: {
        text: insightText,
        potentialSavings,
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
      breakdown,
      trend,
    })
  } catch (error) {
    console.error('Dashboard Combined API Route Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
